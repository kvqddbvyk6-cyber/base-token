import { Keypair } from "@solana/web3.js";
import * as fs from "fs";

/**
 * Load a Solana keypair from env:
 * - PRIVATE_KEY: base58 string or JSON array of bytes
 * - KEYPAIR_PATH: path to a JSON keypair file
 */
export function loadKeypair(): Keypair {
  const secret = process.env.PRIVATE_KEY;
  const keypairPath = process.env.KEYPAIR_PATH;
  if (!secret && !keypairPath) {
    throw new Error( "Set PRIVATE_KEY (base58 or JSON array) or KEYPAIR_PATH");
  }
  if (secret) {
    if (secret.startsWith("[")) {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secret)));
    }
    const bs58 = require("bs58");
    return Keypair.fromSecretKey(bs58.decode(secret));
  }
  const data = JSON.parse(fs.readFileSync(keypairPath!, "utf-8"));
  return Keypair.fromSecretKey(Uint8Array.from(data));
}
