import React, { useState, useMemo } from 'react';
import { Device } from '../types';
import { SparklesIcon, DownloadIcon } from './Icons';
import { parsePcanLog } from '../google-service/can-parser';
import { decodeCanData } from '../google-service/decoder';
import { parseDbc } from '../google-service/matrix-parser';
import { defaultDbcContent } from '../google-service/default-matrix';
import { analyzeWithGemini } from '../google-service/gemini-service';

interface ReportsPageProps {
    devices: Device[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ devices }) => {
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [decodedCsv, setDecodedCsv] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const selectedDevice = useMemo(() => {
        return devices.find(d => d.id === selectedDeviceId);
    }, [selectedDeviceId, devices]);

    const handleGenerateReport = async () => {
        if (!selectedDevice || !selectedDevice.logFileContent) {
            setError('This device does not have a log file attached.');
            return;
        }

        setIsLoading(true);
        setError('');
        setDecodedCsv(null);
        setAnalysisResult(null);

        // Use setTimeout to allow the UI to update to the loading state
        setTimeout(async () => {
            try {
                // 1. Decode the log file
                const matrix = parseDbc(defaultDbcContent);
                const parsedLogData = parsePcanLog(selectedDevice.logFileContent!);
                
                if (parsedLogData.length === 0) {
                    throw new Error('Could not parse any valid CAN messages from the log file.');
                }
                
                const csvContent = decodeCanData(parsedLogData, matrix);
                if (!csvContent || csvContent.split('\n').length <= 1) {
                    throw new Error('Decoding complete, but no matching messages were found in the CAN matrix.');
                }
                setDecodedCsv(csvContent);

                // 2. Analyze with Gemini
                const analysisText = await analyzeWithGemini(csvContent);
                setAnalysisResult(analysisText);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(`Report generation failed: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        }, 50);
    };

    const handleDownload = () => {
        if (!decodedCsv || !selectedDevice) return;
        const blob = new Blob([decodedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${selectedDevice.id}_report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* --- Control Panel --- */}
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">Generate & Download Device Report</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div>
                            <label htmlFor="device-select" className="block text-sm font-medium text-gray-700 mb-1">
                                1. Select Device
                            </label>
                            <select
                                id="device-select"
                                value={selectedDeviceId}
                                onChange={(e) => {
                                    setSelectedDeviceId(e.target.value);
                                    setError('');
                                    setDecodedCsv(null);
                                    setAnalysisResult(null);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                                <option value="" disabled>Select a Device ID</option>
                                {devices.map(device => (
                                    <option key={device.id} value={device.id}>
                                        {device.id} {device.logFileContent ? ' (Log available)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">2. Actions</label>
                            <button
                                onClick={handleGenerateReport}
                                disabled={!selectedDevice || !selectedDevice.logFileContent || isLoading}
                                className="w-full px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Generating...' : (analysisResult ? 'Regenerate' : 'Generate')}
                            </button>
                             <button
                                onClick={handleDownload}
                                disabled={!decodedCsv || isLoading}
                                className="w-full flex items-center justify-center px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2" />
                                Download
                            </button>
                        </div>
                    </div>
                     {!selectedDevice?.logFileContent && selectedDeviceId && (
                        <p className="text-yellow-700 text-sm mt-3 bg-yellow-50 p-3 rounded-md">
                            No log file is attached to this device. Please go to the <b>Manage</b> page to upload a <b>.trc</b> file.
                        </p>
                    )}
                </div>

                {/* --- Results Section --- */}
                {isLoading && (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-600 animate-pulse">Decoding log and analyzing with Gemini...</p>
                    </div>
                )}
                
                {error && (
                    <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                        <p className="font-semibold text-red-800">Error</p>
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {analysisResult && decodedCsv && !isLoading && (
                    <div className="mt-8 space-y-8">
                        {/* Gemini Analysis */}
                        <div className="bg-card p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <SparklesIcon className="w-6 h-6 text-purple-500"/>
                                Gemini Analysis
                            </h3>
                            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                                {analysisResult}
                            </div>
                        </div>

                        {/* Decoded Data */}
                        <div className="bg-card p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Decoded Data Preview</h3>
                            </div>
                             <textarea
                                readOnly
                                value={decodedCsv}
                                className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                                placeholder="Decoded CSV data will appear here..."
                            />
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
};

export default ReportsPage;
