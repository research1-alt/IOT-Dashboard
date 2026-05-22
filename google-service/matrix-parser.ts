
import type { CanMatrix, Message, Signal } from '../types';

// Regex to capture message definitions (BO_)
const MESSAGE_REGEX = /^BO_\s+(\d+)\s+(\w+)\s*:\s*(\d+)\s+(.+)/;

// Regex to capture signal definitions (SG_)
const SIGNAL_REGEX = /^\s*SG_\s+(\w+)\s*:\s*(\d+)\|(\d+)@(\d+)([+-])\s+\(([\d.-]+),([\d.-]+)\)(?:\s+\[([\d.-]+)\|([\d.-]+)\])?\s+"([^"]*)"/;

// Regex to capture value table definitions (VAL_)
const VALUE_TABLE_REGEX = /^VAL_\s+(\d+)\s+(\w+)\s+(.+);/;

export const parseDbc = (content: string): CanMatrix => {
    const lines = content.split('\n');
    const matrix: CanMatrix = {};
    let currentMessage: Message | null = null;
    let currentMessageId: string | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        const messageMatch = trimmedLine.match(MESSAGE_REGEX);
        const signalMatch = trimmedLine.match(SIGNAL_REGEX);
        const valueTableMatch = trimmedLine.match(VALUE_TABLE_REGEX);

        if (messageMatch) {
            const [, id, name, dlc] = messageMatch;
            currentMessageId = id;
            currentMessage = {
                name,
                dlc: parseInt(dlc, 10),
                signals: {},
            };
            matrix[currentMessageId] = currentMessage;
        } else if (signalMatch && currentMessage && currentMessageId) {
            const [
                ,
                name,
                startBit,
                length,
                byteOrder,
                sign,
                scale,
                offset,
                min,
                max,
                unit,
            ] = signalMatch;

            const signal: Signal = {
                name,
                startBit: parseInt(startBit, 10),
                length: parseInt(length, 10),
                isLittleEndian: parseInt(byteOrder, 10) === 1, // 1 for Intel (little-endian), 0 for Motorola (big-endian)
                isSigned: sign === '-',
                scale: parseFloat(scale),
                offset: parseFloat(offset),
                min: parseFloat(min || '0'),
                max: parseFloat(max || '0'),
                unit: unit || "",
            };
            currentMessage.signals[name] = signal;
        } else if (valueTableMatch) {
            const [, id, signalName, valuesStr] = valueTableMatch;
            const message = matrix[id];
            if (message && message.signals[signalName]) {
                const valueTable: { [key: number]: string } = {};
                const valuePairs = valuesStr.trim().split(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/);
                
                for (let i = 0; i < valuePairs.length; i += 2) {
                    const val = parseInt(valuePairs[i], 10);
                    const label = valuePairs[i + 1]?.replace(/"/g, '');
                    if (!isNaN(val) && label !== undefined) {
                        valueTable[val] = label;
                    }
                }
                message.signals[signalName].valueTable = valueTable;
            }
        }
    }

    return matrix;
};
