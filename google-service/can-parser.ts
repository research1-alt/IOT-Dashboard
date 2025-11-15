import type { CANMessage } from '../types';

// Regex for the original format: e.g., "1) 2793828.2 Rx 0092 8 ..."
const PCAN_LINE_REGEX_V1 = new RegExp(
    /^\s*\d+\)\s+([\d\.]+)\s+(Rx|Tx)\s+([0-9A-Fa-fx]+)\s+(\d+)\s+((?:[0-9A-Fa-f]{2}\s*)*)$/
);

// Regex for the new format: e.g., "1 3.501 DT 10B000F2 Rx 8 ..."
const PCAN_LINE_REGEX_V2 = new RegExp(
    /^\s*\d+\s+([\d\.]+)\s+\w+\s+([0-9A-Fa-f]+)\s+(Rx|Tx)\s+(\d+)\s+((?:[0-9A-Fa-f]{2}\s*)*)$/
);

/**
 * Parses the entire content of a CAN log file using a robust regex approach.
 * It intelligently skips headers and attempts to parse each valid data line,
 * supporting multiple PCAN-View log formats.
 *
 * @param content - The string content of the log file.
 * @returns An array of parsed CANMessage objects.
 */
export const parsePcanLog = (content: string): CANMessage[] => {
    const lines = content.split(/\r?\n/);
    const messages: CANMessage[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Skip empty lines, comment lines, and decorative header separators
        if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('---')) {
            continue;
        }

        let match = trimmedLine.match(PCAN_LINE_REGEX_V1);
        let formatVersion = 1;

        if (!match) {
            match = trimmedLine.match(PCAN_LINE_REGEX_V2);
            formatVersion = 2;
        }

        if (match) {
            try {
                let timestampStr, direction, rawId, dlcStr, dataStr;

                if (formatVersion === 1) {
                    // Groups for V1: 1:timestamp, 2:direction, 3:rawId, 4:dlc, 5:data
                    [, timestampStr, direction, rawId, dlcStr, dataStr] = match;
                } else { // formatVersion === 2
                    // Groups for V2: 1:timestamp, 2:rawId, 3:direction, 4:dlc, 5:data
                    [, timestampStr, rawId, direction, dlcStr, dataStr] = match;
                }

                const dlc = parseInt(dlcStr, 10);
                
                // Split the captured data string into bytes and filter out any empty strings
                const dataBytes = dataStr.trim().split(/\s+/).filter(Boolean);
                
                // Final validation: Does the number of data bytes match the DLC?
                if (dataBytes.length !== dlc) {
                    console.warn(`Skipping line due to DLC mismatch: "${trimmedLine}"`);
                    continue;
                }

                const id = rawId.replace(/x/i, '');
                
                messages.push({
                    timestamp: parseFloat(timestampStr) / 1000, // Timestamps from file are in ms
                    id: `0x${id.toUpperCase()}`,
                    dlc: dlc,
                    data: dataBytes.map(byte => byte.toUpperCase()),
                    isTx: direction.toLowerCase() === 'tx',
                });

            } catch (e) {
                console.error(`Error processing matched line: "${trimmedLine}"`, e);
            }
        } else {
             // This log is helpful for debugging files that might have non-standard lines.
             console.warn(`Line did not match any expected PCAN format: "${trimmedLine}"`);
        }
    }

    return messages;
};
