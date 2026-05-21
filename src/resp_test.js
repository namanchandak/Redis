/**
 * RESP Parser Test Suite
 * File: resp_test.js
 * Run with: node resp_test.js
 */

// Import the decode function from your index.js
const { decode } = require('./resp.js');

// Lightweight deep equality testing helper
function assertDeepEqual(actual, expected, message) {
    // If testing an Error object, extract the message for comparison
    if (actual instanceof Error && expected instanceof Error) {
        if (actual.message === expected.message) {
            console.log(`✅ PASS: ${message}`);
        } else {
            console.error(`❌ FAIL: ${message}\n   Expected Error: "${expected.message}"\n   Got Error:      "${actual.message}"`);
        }
        return;
    }

    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    
    if (actualStr === expectedStr) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
        console.error(`   Expected: ${expectedStr}`);
        console.error(`   Got:      ${actualStr}`);
    }
}

// ============================================================================
// EXECUTE TEST CASES
// ============================================================================
console.log("=== Running Redis RESP Parser Tests ===\n");

// --- 1. Test Primitives ---

assertDeepEqual(
    decode("+OK\r\n"), 
    "OK", 
    "Should decode simple string '+OK\\r\\n'"
);

assertDeepEqual(
    decode(":1000\r\n"), 
    1000, 
    "Should decode integer ':1000\\r\\n' into a JavaScript number"
);

assertDeepEqual(
    decode(":-45\r\n"), 
    -45, 
    "Should decode negative integer ':-45\\r\\n' into a JavaScript number"
);

assertDeepEqual(
    decode("-ERR unknown command\r\n"), 
    new Error("ERR unknown command"), 
    "Should decode Redis error strings into JavaScript Error objects"
);

assertDeepEqual(
    decode("$5\r\nhello\r\n"), 
    "hello", 
    "Should decode standard bulk string '$5\\r\\nhello\\r\\n'"
);

assertDeepEqual(
    decode("$-1\r\n"), 
    null, 
    "Should decode Null Bulk String '$-1\\r\\n' into null"
);


// --- 2. Test Arrays ---

assertDeepEqual(
    decode("*0\r\n"), 
    [], 
    "Should decode an empty array '*0\\r\\n' into []"
);

assertDeepEqual(
    decode("*-1\r\n"), 
    null, 
    "Should decode a Null Array '*-1\\r\\n' into null"
);

// Array containing 3 primitive types: [100, "hello", "OK"]
const mixedArrayPayload = "*3\r\n:100\r\n$5\r\nhello\r\n+OK\r\n";
assertDeepEqual(
    decode(mixedArrayPayload), 
    [100, "hello", "OK"], 
    "Should decode a flat mixed array of integers, bulk strings, and simple strings"
);


// --- 3. Test Complex & Nested Structures ---

// A nested array containing an integer and an array of integers: [1, [2, 3]]
const nestedArrayPayload = "*2\r\n:1\r\n*2\r\n:2\r\n:3\r\n";
assertDeepEqual(
    decode(nestedArrayPayload), 
    [1, [2, 3]], 
    "Should decode nested arrays recursively without failing"
);

// An array containing a Null Bulk string element: ["get", null]
const arrayWithNullPayload = "*2\r\n$3\r\nget\r\n$-1\r\n";
assertDeepEqual(
    decode(arrayWithNullPayload), 
    ["get", null], 
    "Should decode an array that contains a Null Bulk String element"
);

console.log("\n=== Test Session Completed ===");