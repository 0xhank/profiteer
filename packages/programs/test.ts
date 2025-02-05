import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";


// Read the array from the JSON file
const numbers = [126,88,243,142,187,198,142,140,133,21,78,25,177,184,145,0,58,23,94,84,5,135,103,135,162,1,2,233,129,21,116,172,110,193,107,20,239,37,221,230,103,164,105,61,2,145,166,104,130,78,62,122,209,251,136,249,169,115,102,56,220,49,138,148]

// Convert array of numbers to Uint8Array
const uint8Array = new Uint8Array(numbers);

// Convert to base58 string
const base58String = bs58.encode(uint8Array);
console.log(base58String);
const keypair = Keypair.generate();

console.log(
  `✅ Finished! Our secret key in base58 is: ${bs58.encode(keypair.secretKey)}`
);