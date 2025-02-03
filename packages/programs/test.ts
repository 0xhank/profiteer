import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

// Read the array from the JSON file
const numbers = [213,231,79,76,206,189,147,103,110,151,82,236,216,191,75,207,180,164,107,59,93,212,32,7,229,176,104,191,167,229,164,215,246,220,54,10,101,137,201,96,221,167,168,39,172,159,95,21,217,143,204,71,153,154,58,128,93,128,183,177,130,145,113,225];

// Convert array of numbers to Uint8Array
const uint8Array = new Uint8Array(numbers);

// Convert to base58 string
const base58String = bs58.encode(uint8Array);
console.log(base58String);