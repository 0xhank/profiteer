import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Keypair } from "@solana/web3.js";

// Read the array from the JSON file


// Convert to base58 string
// const base58String = bs58.encode(uint8Array);
const base58String2 = "35jzd7jkuvPSNpYmpmHDR3ZafhhP3ePcUJG4R9PqncNs2VA28QQf6sHueb6uJAvDNdV2hdydPL6TuMYRhRG7LFp8"

const keypair = Keypair.fromSecretKey(bs58.decode(base58String2));
console.log({publicKey: keypair.publicKey.toBase58(), secretKey: base58String2});
