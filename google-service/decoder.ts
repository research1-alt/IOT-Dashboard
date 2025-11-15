
import type { CANMessage, CanMatrix, Signal } from '../types';

const extractSignalValue = (data: Uint8Array, signal: Signal): number => {
    let rawValue = 0;
    
    if (signal.isLittleEndian) {
        for (let i = 0; i < signal.length; i++) {
            const bitIndex = signal.startBit + i;
            const byteIndex = Math.floor(bitIndex / 8);
            if (byteIndex >= data.length) continue;
            const bitInByte = bitIndex % 8;
            if ((data[byteIndex] >> bitInByte) & 1) {
                rawValue |= 1 << i;
            }
        }
    } else { // Big Endian / Motorola
        let bitCount = 0;
        for (let i = 0; i < data.length * 8; i++) {
            const byteIndex = Math.floor(i / 8);
            if (byteIndex >= data.length) break;
            const bitInByte = 7 - (i % 8);
            
            const bitPos = byteIndex * 8 + (7 - bitInByte);

            if (bitPos >= signal.startBit && bitPos < signal.startBit + signal.length) {
                if ((data[byteIndex] >> bitInByte) & 1) {
                     rawValue |= 1 << (signal.length - 1 - bitCount);
                }
                bitCount++;
            }
        }
    }

    if (signal.isSigned && (rawValue & (1 << (signal.length - 1)))) {
        rawValue -= 1 << signal.length;
    }

    return rawValue * signal.scale + signal.offset;
}

const decodeMessages = (messages: CANMessage[], matrix: CanMatrix): CANMessage[] => {
    return messages.map(message => {
        const messageIdDecimal = parseInt(message.id, 16).toString();
        const definition = matrix[messageIdDecimal];

        if (!definition) {
            return message;
        }

        const dataBytes = new Uint8Array(message.data.map(hex => parseInt(hex, 16)));
        const decodedSignals: { [key: string]: number | string } = {};

        for (const signalName in definition.signals) {
            const signal = definition.signals[signalName];
            const value = extractSignalValue(dataBytes, signal);
            decodedSignals[signal.name] = parseFloat(value.toPrecision(10));
        }

        return { ...message, name: definition.name, decoded: decodedSignals };
    });
};


const formatDecodedMessagesToCSV = (decodedMessages: CANMessage[]): string => {
    if (decodedMessages.length === 0) {
        return "";
    }

    const allSignalNames = new Set<string>();
    decodedMessages.forEach(msg => {
        if (msg.decoded) {
            Object.keys(msg.decoded).forEach(signalName => allSignalNames.add(signalName));
        }
    });

    const sortedSignalNames = Array.from(allSignalNames).sort();
    const headers = ['Timestamp', 'MessageID', 'MessageName', ...sortedSignalNames];
    
    const rows = decodedMessages.map(msg => {
        if (!msg.decoded) return null; // Only include rows that were successfully decoded

        const rowData: (string | number)[] = [
            msg.timestamp.toFixed(4),
            msg.id,
            msg.name || '',
        ];
        
        sortedSignalNames.forEach(signalName => {
            if (msg.decoded && msg.decoded[signalName] !== undefined) {
                rowData.push(msg.decoded[signalName]);
            } else {
                rowData.push('');
            }
        });
        return rowData.join(',');
    }).filter(row => row !== null); // Filter out non-decoded messages

    if (rows.length === 0) return "";

    return [headers.join(','), ...rows].join('\n');
}

export const decodeCanData = (messages: CANMessage[], matrix: CanMatrix): string => {
    const decoded = decodeMessages(messages, matrix);
    return formatDecodedMessagesToCSV(decoded);
};
