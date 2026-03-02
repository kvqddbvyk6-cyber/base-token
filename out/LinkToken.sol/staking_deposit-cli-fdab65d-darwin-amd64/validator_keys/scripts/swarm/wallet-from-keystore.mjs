#!/usr/bin/env node
/**
 * Load a Wallet from an encrypted keystore JSON.
 * Usage:
 *   KEYSTORE_PASSWORD='yourpassword' node wallet-from-keystore.mjs [path-to-keystore.json]
 *   Or pipe JSON: cat keystore.json | KEYSTORE_PASSWORD='...' node wallet-from-keystore.mjs
 *
 * Never commit the password or keystore to git. Use env vars only.
 */
import { Wallet } from 'ethers';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';

const password = process.env.KEYSTORE_PASSWORD;

async function getStdinJson() {
  const rl = createInterface({ input: process.stdin });
  let data = '';
  for await (const chunk of rl) data += chunk;
  return data.trim() ? JSON.parse(data) : null;
}

async function main() {
  let keystoreJson;
  const path = process.argv[2];
  if (path) {
    keystoreJson = readFileSync(path, 'utf8');
    if (keystoreJson.startsWith('{')) keystoreJson = JSON.parse(keystoreJson);
  } else {
    const stdin = await getStdinJson();
    keystoreJson = stdin ? JSON.stringify(stdin) : null;
  }
  if (!keystoreJson) {
    console.error('Usage: KEYSTORE_PASSWORD=*** node wallet-from-keystore.mjs [keystore.json]');
    process.exit(1);
  }
  if (!password) {
    console.error('Set KEYSTORE_PASSWORD environment variable.');
    process.exit(1);
  }
  const wallet = await Wallet.fromEncryptedJson(
    typeof keystoreJson === 'string' ? keystoreJson : JSON.stringify(keystoreJson),
    password
  );
  console.log('Address:', wallet.address);
  const showKey = process.env.SHOW_PRIVATE_KEY === '1';
  if (showKey) {
    console.warn('WARNING: Private key below. Only use for import, never commit.');
    console.log('Private Key:', wallet.privateKey);
  } else {
    console.log('(Set SHOW_PRIVATE_KEY=1 to print private key; use only for import.)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
