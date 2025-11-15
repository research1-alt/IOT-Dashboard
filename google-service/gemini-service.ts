

// FIX: Add GoogleGenAI to imports to allow for API calls.
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

export const modelName = "gemini-2.5-flash";

export const canDataQueryTool: FunctionDeclaration = {
  name: 'query_can_data',
  description: 'Queries the loaded CAN log data for specific signal values or statistics within a given time range. Use this tool to answer any user questions about the data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      signal_name: {
        type: Type.STRING,
        description: 'The exact name of the signal to query. Must be one of the available signals provided.',
      },
      statistic: {
        type: Type.STRING,
        description: 'The statistical calculation to perform. If omitted, returns a brief summary of the data points.',
        enum: ["MIN", "MAX", "AVERAGE", "COUNT", "EVENTS"],
      },
      start_timestamp: {
        type: Type.NUMBER,
        description: 'The start of the time range for the query, in seconds.',
      },
      end_timestamp: {
        type: Type.NUMBER,
        description: 'The end of the time range for the query, in seconds.',
      },
    },
    required: ['signal_name'],
  },
};

export const getSystemInstruction = (
    availableSignals: string[],
    generatedFaults: string[],
    timeRange: { start: number | string, end: number | string },
    totalMessages: number
): string => {
    const signalList = availableSignals.length > 0 ? `The following signals are available for querying: ${availableSignals.join(', ')}.` : 'No signals have been decoded from the data.';
    
    let faultSummary = 'No faults were generated during this drive.';
    if (generatedFaults.length > 0) {
        faultSummary = `The following faults were detected: ${generatedFaults.join(', ')}.`;
    }

    const dataSummary = `
        Here is a summary of the loaded data for your context (do not repeat this to the user):
        - Total Decoded Messages: ${totalMessages}
        - Time Range: ${Number(timeRange.start).toFixed(2)}s to ${Number(timeRange.end).toFixed(2)}s
        - Available Signals: ${availableSignals.length} signals.
        - Fault Analysis: ${faultSummary}
    `;

    return `You are an expert in automotive Controller Area Network (CAN) bus diagnostics. 
          You have access to a complete CAN log file. Your goal is to analyze the data, identify potential issues, and answer user questions.
          
          ${dataSummary}

          IMPORTANT: For any signal name that includes the word "Fault", its value should be interpreted as follows: 0 means 'No Fault', and 1 means 'Fault Triggered'.

          To do this, you MUST use the 'query_can_data' tool to get specific data points, statistics, and event timelines. 
          Do not guess or hallucinate values; always use the tool to get precise information.
          Your analysis should focus on:
          1.  Understanding the overall vehicle behavior by examining key signals (e.g., Speed, StateOfCharge, temperatures).
          2.  Investigating any faults that were detected. Use the tool to check the values of other signals around the time a fault occurred to find correlations.
          3.  Identifying any unusual behavior or anomalies in the signal data, even if they didn't trigger a specific fault.
          ${signalList}
          When a user asks a question, use the tool to gather the necessary data before providing a concise and helpful response. Do not use markdown.`;
}

export const getInitialAnalysisPrompt = (): string => {
    return `Please provide a brief, friendly welcome message. Greet the user and let them know you're ready to analyze their CAN log data. Do not summarize the data. Keep it to one or two sentences.`;
};

// FIX: Add missing 'analyzeWithGemini' function to analyze CSV data with Gemini API.
export const analyzeWithGemini = async (csvData: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Sample the data to prevent token limit errors with large files
    const MAX_LINES_FOR_ANALYSIS = 1000;
    const lines = csvData.trim().split('\n');
    let sampledCsvData = csvData;

    if (lines.length > MAX_LINES_FOR_ANALYSIS) {
        const header = lines[0];
        const dataRows = lines.slice(1);
        // Subtract 1 for the header, 1 for the '...'
        const half = Math.floor((MAX_LINES_FOR_ANALYSIS - 2) / 2);
        
        const firstHalf = dataRows.slice(0, half);
        const lastHalf = dataRows.slice(dataRows.length - half);

        sampledCsvData = [header, ...firstHalf, '...', ...lastHalf].join('\n');
        
        console.log(`Original CSV has ${lines.length} lines. Sampling to ${firstHalf.length + lastHalf.length + 2} lines for Gemini analysis.`);
    }

    const prompt = `You are an expert in automotive Controller Area Network (CAN) bus diagnostics.
Analyze the following CSV data which represents decoded CAN messages from a vehicle.
The data may have been sampled for brevity, indicated by a "..." line between data sections.
Provide a summary of the vehicle's behavior, highlighting any anomalies, potential issues, fault signals, or interesting patterns you observe.
Focus on signals like speed, battery state of charge, temperatures, and any signals with "Fault" in their name.
A fault signal with a value of 1 indicates a fault is active. A value of 0 means no fault.
Be concise and clear in your analysis. Do not use markdown.

Here is the data:
${sampledCsvData}`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        if (error instanceof Error) {
             if (error.message.includes('token count exceeds') || error.message.includes('400')) {
                 throw new Error(`The decoded data is too large for analysis, even after sampling. Please use a smaller log file.`);
            }
            throw new Error(`Gemini API error: ${error.message}`);
        }
        throw new Error('An unknown error occurred while contacting the Gemini API.');
    }
};