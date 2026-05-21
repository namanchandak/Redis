function decode(data)
{
    if(data.length === 0)
        return "no data"

    const decoded = decodeOne(data);
    return decoded.value;
}

module.exports = { decode };

function decodeOne(data)
{
    if(data.length === 0)
        return { value: "no data", rest: "" };

    switch (data[0]) {
        case "+":
            return readSimpleString(data);
        
        case "-":
            return readError(data);

        case ":":
            return readInt64(data);

        case "$":
            return readBulkString(data);

        case "*":
            return readArray(data);
    
        default:
            return { value: "nil", rest: "" };
    }
}

function readSimpleString(data)
{
    let original = "";
    let i = 1;
    for(; data[i] !== '\r' && i < data.length ; i++)
    {
        original += data[i];
    }

    let rest = data.substring(i + 2);

    return { value: original, rest: rest };
}

function readInt64(data)
{
    let original = "";
    let i = 1;
    for(; data[i] !== '\r' && i < data.length ; i++)
    {
        original += data[i];
    }

    let rest = data.substring(i + 2);

    return { value: Number(original), rest: rest };
}

function readBulkString(data)
{
    if (data.startsWith("$-1\r\n")) {
        return { value: null, rest: data.substring(5) };
    }

    let original = "";
    let i = 1;

    for(; data[i] !== '\n'; i++) {}
    i++; // Move past '\n'

    for(; data[i] !== '\r' && i < data.length ; i++)
    {
        original += data[i];
    }

    let rest = data.substring(i + 2);

    return { value: original, rest: rest };
}

function readError(data) 
{
    let original = "";
    let i = 1;
    for(; data[i] !== '\r' && i < data.length ; i++)
    {
        original += data[i];
    }
    let rest = data.substring(i + 2);
    return { value: new Error(original), rest: rest };
}

function readArray(data) {
    const newlineIdx = data.indexOf('\r\n');
    if (newlineIdx === -1) {
        throw new Error("Malformed RESP array");
    }
    
    const length = parseInt(data.substring(1, newlineIdx), 10);
    
    if (length === -1) {
        return { value: null, rest: data.substring(newlineIdx + 2) };
    }

    const result = [];
    let remainingData = data.substring(newlineIdx + 2); 

    for (let i = 0; i < length; i++) {
        if (!remainingData) {
            throw new Error(`Parser Error: 'remainingData' became undefined at array index ${i}.`);
        }

        if (remainingData.length === 0) {
            throw new Error("Unexpected end of RESP data while parsing array");
        }

        const decoded = decodeOne(remainingData);
        
        if (!decoded || typeof decoded !== 'object' || !('rest' in decoded)) {
            throw new Error(`Parser Error: decodeOne did not return a { value, rest } object at array index ${i}.`);
        }

        result.push(decoded.value);
        remainingData = decoded.rest; 
    }
    
    return {
        value: result,
        rest: remainingData
    };
}