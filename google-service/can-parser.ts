import type { CANMessage } from '../types';

// Regex for the original format: e.g., "1) 2793828.2 Rx 0092 8 ..."
const PCAN_LINE_REGEX_V1 = new RegExp(
    /^\s*\d+\)\s+([\d\.]+)\s+(Rx|Tx)\s+([0-9A-Fa-fx]+)\s+(\d+)\s+((?:[0-9A-Fa-f]{2}\s*)*)$/
);

// Regex for the new format: e.g., "1 3.501 DT 10B000F2 Rx 8 ..."
const PCAN_LINE_REGEX_V2 = new RegExp(
    /^\s*\d+\s+([\d\.]+)\s+\w+\s+([0-9A-Fa-f]+)\s+(Rx|Tx)\s+(\d+)\s+((?:[0-9A-Fa-f]{2}\s*)*)$/
);

// Regex for the user's specific .trc format: e.g., "1) 1234.567 2026-04-06 09:55:12.488 18FF0E5A  8 FE 0C FC 0C FD 0C FD 0C   1059  28.326712018524177   77.3601420198636"
const PCAN_LINE_REGEX_V3 = new RegExp(
    /^\s*\d+\)\s+([\d\.]+)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s+([0-9A-Fa-f]+)\s+(\d+)\s+((?:[0-9A-Fa-f]{2}\s*)+)\s+(\d+)\s+([\d\.-]+)\s+([\d\.-]+)$/
);

// Regex for the user's specific .trc format WITHOUT relative timestamp: e.g., "1) 2026-04-06 09:55:12.488 18FF0E5A  8 FE 0C FC 0C FD 0C FD 0C   1059  28.326712018524177   77.3601420198636"
const PCAN_LINE_REGEX_V4 = new RegExp(
    /^\s*\d+\)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2}\.\d{3})\s+([0-9A-Fa-f]+)\s+(\d+)\s+((?:[0-9A-Fa-f]{2}\s*)+)\s+(\d+)\s+([\d\.-]+)\s+([\d\.-]+)$/
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

        if (!match) {
            match = trimmedLine.match(PCAN_LINE_REGEX_V3);
            formatVersion = 3;
        }

        if (!match) {
            match = trimmedLine.match(PCAN_LINE_REGEX_V4);
            formatVersion = 4;
        }

        if (match) {
            try {
                let timestampStr, direction, rawId, dlcStr, dataStr;

                if (formatVersion === 1) {
                    // Groups for V1: 1:timestamp, 2:direction, 3:rawId, 4:dlc, 5:data
                    [, timestampStr, direction, rawId, dlcStr, dataStr] = match;
                } else if (formatVersion === 2) {
                    // Groups for V2: 1:timestamp, 2:rawId, 3:direction, 4:dlc, 5:data
                    [, timestampStr, rawId, direction, dlcStr, dataStr] = match;
                } else if (formatVersion === 3) {
                    // Groups for V3: 1:relativeMs, 2:date, 3:time, 4:rawId, 5:dlc, 6:data, 7:cycle, 8:lat, 9:lng
                    const [, , date, time, id, dlc, data] = match;
                    timestampStr = new Date(`${date}T${time}`).getTime().toString();
                    rawId = id;
                    direction = 'Rx'; // Default for V3
                    dlcStr = dlc;
                    dataStr = data;
                } else { // formatVersion === 4
                    // Groups for V4: 1:date, 2:time, 3:rawId, 4:dlc, 5:data, 6:cycle, 7:lat, 8:lng
                    const [, date, time, id, dlc, data] = match;
                    timestampStr = new Date(`${date}T${time}`).getTime().toString();
                    rawId = id;
                    direction = 'Rx'; // Default for V4
                    dlcStr = dlc;
                    dataStr = data;
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
                    timestamp: formatVersion === 3 ? parseFloat(timestampStr) / 1000 : parseFloat(timestampStr) / 1000, 
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
