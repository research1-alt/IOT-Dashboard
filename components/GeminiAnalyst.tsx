
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CANMessage } from '../types';
import { canDataQueryTool, getSystemInstruction, modelName } from '../google-service/gemini-service';
import { SendIcon, BotIcon, UserIcon, RefreshIcon, AlertCircleIcon } from './Icons';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface GeminiAnalystProps {
    decodedMessages: CANMessage[];
}

const GeminiAnalyst: React.FC<GeminiAnalystProps> = ({ decodedMessages }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);
        setError(null);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Gemini API Key is missing. Please check your environment variables.");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Prepare context for Gemini
            const availableSignals: string[] = Array.from(new Set(
                decodedMessages.flatMap(m => m.decoded ? Object.keys(m.decoded) : [])
            ));

            const faults: string[] = Array.from(new Set(
                decodedMessages.flatMap(m => {
                    if (!m.decoded) return [];
                    return Object.entries(m.decoded)
                        .filter(([name, val]) => name.toLowerCase().includes('fault') && val === 1)
                        .map(([name]) => name);
                })
            ));

            const timeRange = {
                start: decodedMessages[0]?.timestamp || 0,
                end: decodedMessages[decodedMessages.length - 1]?.timestamp || 0
            };

            const systemInstruction = getSystemInstruction(
                availableSignals,
                faults,
                timeRange,
                decodedMessages.length
            );

            const response = await ai.models.generateContent({
                model: modelName,
                contents: [
                    { role: 'user', parts: [{ text: userMsg }] }
                ],
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: [canDataQueryTool] }],
                }
            });

            // Handle tool calls
            let finalResponse = response.text;
            
            if (response.functionCalls) {
                for (const call of response.functionCalls) {
                    if (call.name === 'query_can_data') {
                        const { signal_name, statistic, start_timestamp, end_timestamp } = call.args as any;
                        
                        // Execute local query on decoded messages
                        const result = executeLocalQuery(signal_name, statistic, start_timestamp, end_timestamp);
                        
                        // Send tool result back to Gemini
                        const secondResponse = await ai.models.generateContent({
                            model: modelName,
                            contents: [
                                { role: 'user', parts: [{ text: userMsg }] },
                                { role: 'model', parts: (response.candidates?.[0]?.content?.parts || []) as any[] },
                                {
                                    role: 'user',
                                    parts: [{
                                        functionResponse: {
                                            name: 'query_can_data',
                                            response: { result }
                                        }
                                    }]
                                }
                            ],
                            config: { systemInstruction }
                        });
                        finalResponse = secondResponse.text;
                    }
                }
            }

            setMessages(prev => [...prev, { role: 'model', text: finalResponse || "I couldn't generate a response." }]);
        } catch (err: any) {
            console.error("Gemini Error:", err);
            setError(err.message || "An error occurred while communicating with Gemini.");
        } finally {
            setIsTyping(false);
        }
    };

    const executeLocalQuery = (signalName: string, statistic?: string, start?: number, end?: number) => {
        const filtered = decodedMessages.filter(m => {
            if (!m.decoded || m.decoded[signalName] === undefined) return false;
            if (start !== undefined && m.timestamp < start) return false;
            if (end !== undefined && m.timestamp > end) return false;
            return true;
        });

        if (filtered.length === 0) return "No data found for this signal in the specified range.";

        const values = filtered.map(m => m.decoded![signalName] as number);

        switch (statistic) {
            case 'MIN': return Math.min(...values);
            case 'MAX': return Math.max(...values);
            case 'AVERAGE': return values.reduce((a, b) => a + b, 0) / values.length;
            case 'COUNT': return values.length;
            case 'EVENTS': return filtered.map(m => ({ t: m.timestamp, v: m.decoded![signalName] }));
            default: return `Found ${values.length} data points. Average: ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)}`;
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
            <div className="bg-primary-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                    <BotIcon className="w-6 h-6" />
                    <div>
                        <h3 className="font-bold text-sm">Gemini AI Fleet Analyst</h3>
                        <p className="text-[10px] text-primary-100">Analyzing real-time CAN data</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-white font-medium uppercase tracking-wider">Online</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <div className="bg-primary-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BotIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 mb-1">How can I help you today?</h4>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Ask me about vehicle performance, battery health, or any detected faults.</p>
                        <div className="mt-6 grid grid-cols-1 gap-2 max-w-[250px] mx-auto">
                            <button onClick={() => setInput("Are there any battery faults?")} className="text-[10px] text-left p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">"Are there any battery faults?"</button>
                            <button onClick={() => setInput("What is the average speed?")} className="text-[10px] text-left p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">"What is the average speed?"</button>
                            <button onClick={() => setInput("Check battery temperature status")} className="text-[10px] text-left p-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">"Check battery temperature status"</button>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'}`}>
                                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <BotIcon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs">
                        <AlertCircleIcon className="w-4 h-4" />
                        <span>{error}</span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleQuery} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Gemini about the vehicle data..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    disabled={isTyping}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="bg-primary-600 text-white p-2 rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default GeminiAnalyst;
