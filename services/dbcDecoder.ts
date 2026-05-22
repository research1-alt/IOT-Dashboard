
export interface CANSignal {
    name: string;
    startBit: number;
    length: number;
    isLittleEndian: boolean;
    isSigned: boolean;
    scale: number;
    offset: number;
    min: number;
    max: number;
    unit: string;
    valueTable?: Record<number, string>;
}

export interface CANMessage {
    id: number;
    name: string;
    dlc: number;
    signals: CANSignal[];
}

export class DBCDecoder {
    private messages: Map<number, CANMessage> = new Map();

    constructor(dbcContent: string) {
        this.parse(dbcContent);
    }

    private parse(content: string) {
        const lines = content.split('\n');
        let currentMessage: CANMessage | null = null;

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('BO_ ')) {
                const parts = line.split(/\s+/);
                // BO_ 272170832 BattError: 8 BMS
                // Some DBCs use (ID | 0x80000000) for extended IDs
                let id = parseInt(parts[1]);
                if (id > 0x80000000) {
                    id = id & 0x7FFFFFFF;
                }
                const name = parts[2].replace(':', '');
                const dlc = parseInt(parts[3]);
                currentMessage = { id, name, dlc, signals: [] };
                this.messages.set(id, currentMessage);
            } else if (line.startsWith('SG_ ') && currentMessage) {
                // SG_ Battery_Fault : 0|1@1+ (1,0) [0|1] ""  IoT,HMI,MCU
                // Updated regex to handle scientific notation and multiplexers
                const match = line.match(/SG_ (\w+)\s*(?:[Mm]\d*)?\s*:\s*(\d+)\|(\d+)@(\d+)([\+-])\s*\(([\d\.eE+-]+),([\d\.eE+-]+)\)\s*\[([\d\.eE+-]+)\|([\d\.eE+-]+)\]\s*"([^"]*)"/);
                if (match) {
                    const [_, name, startBit, length, endian, sign, scale, offset, min, max, unit] = match;
                    currentMessage.signals.push({
                        name,
                        startBit: parseInt(startBit),
                        length: parseInt(length),
                        isLittleEndian: endian === '1',
                        isSigned: sign === '-',
                        scale: parseFloat(scale),
                        offset: parseFloat(offset),
                        min: parseFloat(min),
                        max: parseFloat(max),
                        unit
                    });
                }
            } else if (line.startsWith('VAL_ ')) {
                // VAL_ 272170832 Battery_Fault 1 "Err-01" ;
                const match = line.match(/VAL_ (\d+)\s+(\w+)\s+(.*);/);
                if (match) {
                    const [_, msgId, sigName, valuesStr] = match;
                    let id = parseInt(msgId);
                    if (id > 0x80000000) {
                        id = id & 0x7FFFFFFF;
                    }
                    const msg = this.messages.get(id);
                    if (msg) {
                        const sig = msg.signals.find(s => s.name === sigName);
                        if (sig) {
                            const valueTable: Record<number, string> = {};
                            const valMatches = valuesStr.matchAll(/(\d+)\s+"([^"]*)"/g);
                            for (const valMatch of valMatches) {
                                valueTable[parseInt(valMatch[1])] = valMatch[2];
                            }
                            sig.valueTable = valueTable;
                        }
                    }
                }
            }
        }
    }

    public decode(id: number | string, data: string[] | Uint8Array): Record<string, any> {
        let numericId: number;
        if (typeof id === 'number') {
            numericId = id;
        } else {
            const trimmed = id.trim();
            if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
                numericId = parseInt(trimmed, 16);
            } else if (/^[0-9A-Fa-f]{8}$/.test(trimmed) || /^[0-9A-Fa-f]{3}$/.test(trimmed)) {
                numericId = parseInt(trimmed, 16);
            } else {
                numericId = parseInt(trimmed, 10);
            }
        }
        
        // Handle extended ID bit if present in input
        if (numericId > 0x80000000) {
            numericId = numericId & 0x7FFFFFFF;
        }

        const message = this.messages.get(numericId);
        if (!message) return {};

        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data.map(h => parseInt(h, 16)));
        const decoded: Record<string, any> = {};

        for (const sig of message.signals) {
            try {
                let rawValue = BigInt(0);

                if (sig.isLittleEndian) {
                    // Intel format (Little Endian)
                    for (let i = 0; i < sig.length; i++) {
                        const bitPos = sig.startBit + i;
                        const byteIdx = Math.floor(bitPos / 8);
                        const bitIdx = bitPos % 8;
                        if (byteIdx < bytes.length) {
                            const bit = BigInt((bytes[byteIdx] >> bitIdx) & 1);
                            rawValue |= (bit << BigInt(i));
                        }
                    }
                } else {
                    // Motorola format (Big Endian)
                    // DBC Motorola start bit is the MSB in a sawtooth pattern
                    // We convert the sawtooth bit index to a linear bit index
                    const startBitLinear = (Math.floor(sig.startBit / 8) * 8) + (7 - (sig.startBit % 8));
                    for (let i = 0; i < sig.length; i++) {
                        const linearBitPos = startBitLinear + i;
                        const actualByte = Math.floor(linearBitPos / 8);
                        const actualBit = 7 - (linearBitPos % 8);
                        
                        if (actualByte < bytes.length) {
                            const bit = BigInt((bytes[actualByte] >> actualBit) & 1);
                            rawValue = (rawValue << BigInt(1)) | bit;
                        }
                    }
                }

                // Handle signed values (two's complement)
                if (sig.isSigned) {
                    const msbMask = BigInt(1) << BigInt(sig.length - 1);
                    if (rawValue & msbMask) {
                        rawValue = rawValue - (BigInt(1) << BigInt(sig.length));
                    }
                }

                let value: any = Number(rawValue) * sig.scale + sig.offset;
                
                // Apply value table if exists
                if (sig.valueTable && sig.valueTable[Number(rawValue)] !== undefined) {
                    value = sig.valueTable[Number(rawValue)];
                }

                decoded[sig.name] = value;
            } catch (e) {
                console.error(`Error decoding signal ${sig.name}:`, e);
                decoded[sig.name] = null;
            }
        }

        return decoded;
    }

    public getMessageName(id: number | string): string | undefined {
        let numericId: number;
        if (typeof id === 'number') {
            numericId = id;
        } else {
            const trimmed = id.trim();
            if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
                numericId = parseInt(trimmed, 16);
            } else if (/^[0-9A-Fa-f]{8}$/.test(trimmed) || /^[0-9A-Fa-f]{3}$/.test(trimmed)) {
                numericId = parseInt(trimmed, 16);
            } else {
                numericId = parseInt(trimmed, 10);
            }
        }
        if (numericId > 0x80000000) {
            numericId = numericId & 0x7FFFFFFF;
        }
        return this.messages.get(numericId)?.name;
    }
}
