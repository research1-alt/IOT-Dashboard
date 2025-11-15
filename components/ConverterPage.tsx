import React, { useState } from 'react';
import { FileUploadIcon, DownloadIcon } from './Icons';
import { parsePcanLog } from '../google-service/can-parser';
import { decodeCanData } from '../google-service/decoder';
import { parseDbc } from '../google-service/matrix-parser';
import { defaultDbcContent } from '../google-service/default-matrix';

export const ConverterPage: React.FC = () => {
    const [logFile, setLogFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [decodedCsv, setDecodedCsv] = useState<string | null>(null);
    const [decodedLines, setDecodedLines] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setDecodedCsv(null);
        setDecodedLines(0);
        setError('');

        const isLog = ['.log', '.txt', '.trc'].some(ext => file.name.toLowerCase().endsWith(ext));

        if (!isLog) {
            setError('Please upload a valid .log, .txt, or .trc file.');
            setLogFile(null);
        } else {
            setLogFile(file);
        }
    };

    const handleDecode = async () => {
        if (!logFile) {
            setError('Please upload a Log file.');
            return;
        }

        setIsLoading(true);
        setError('');
        setDecodedCsv(null);
        setDecodedLines(0);

        setTimeout(async () => {
            try {
                const logContent = await logFile.text();
                const parsedLogData = parsePcanLog(logContent);

                if (parsedLogData.length === 0) {
                    setError('Could not parse any valid data lines from the log file. Please check the file format.');
                    setIsLoading(false);
                    return;
                }
                
                const matrix = parseDbc(defaultDbcContent);
                const csvContent = decodeCanData(parsedLogData, matrix);
                const lines = csvContent.split('\n');

                if (!csvContent || lines.length <= 1) {
                    setError('Decoding complete, but no matching messages were found in the selected library to decode.');
                    setIsLoading(false);
                    return;
                }

                setDecodedCsv(csvContent);
                setDecodedLines(lines.length - 1);

            } catch (err) {
                console.error("Error decoding files:", err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(`An error occurred during decoding. Please check the console. Error: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        }, 50);
    };
    
    const handleDownload = () => {
        if (!decodedCsv) return;
        const blob = new Blob([decodedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${logFile?.name.split('.')[0]}_decoded.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="bg-card p-8 rounded-lg shadow-sm space-y-8">
                    <div className="text-center">
                        <p className="text-gray-600">Upload a raw PCAN log file (.trc, .log, .txt) to decode it into a CSV using the internal CAN matrix.</p>
                    </div>
                    
                    <div className="grid grid-cols-1">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center h-full flex flex-col justify-center items-center">
                            <label htmlFor="log-upload" className="cursor-pointer w-full">
                                <FileUploadIcon className="mx-auto h-10 w-10 text-gray-400" />
                                <h4 className="mt-2 text-md font-semibold text-gray-700">1. Upload CAN Log</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    {logFile ? `Selected: ${logFile.name}` : 'Click to upload (.log, .txt, .trc)'}
                                </p>
                                <input id="log-upload" type="file" className="sr-only" accept=".log,.txt,.trc" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {decodedCsv && !isLoading && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">Decoding Successful</p>
                                    <p className="mt-1 text-sm text-green-700">
                                        Decoded {decodedLines} data entries. You can now download the CSV.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                   
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={handleDecode}
                            disabled={!logFile || isLoading}
                            className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Decoding...' : (decodedCsv ? 'Re-decode Log File' : 'Decode Log File')}
                        </button>
                        
                        {decodedCsv && !isLoading && (
                            <button
                                onClick={handleDownload}
                                className="w-full sm:w-auto px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center"
                            >
                                <DownloadIcon className="w-5 h-5 mr-2 -ml-1" />
                                Download CSV
                            </button>
                        )}
                    </div>

                    {decodedCsv && !isLoading && (
                         <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Decoded Data Preview</h3>
                            <textarea
                                readOnly
                                value={decodedCsv}
                                className="w-full h-64 p-2 border border-gray-300 rounded-md font-mono text-xs bg-white"
                                placeholder="Decoded CSV data will appear here..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};