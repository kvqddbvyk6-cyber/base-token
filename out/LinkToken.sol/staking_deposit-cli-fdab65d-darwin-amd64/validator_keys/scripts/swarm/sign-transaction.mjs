#!/usr/bin/env node
/**
 * Sign and send a transaction using a wallet from keystore or private key.
 *
 * From keystore:
 *   KEYSTORE_PASSWORD=*** node sign-transaction.mjs --keystore ./keystore.json --to 0x... --value 6.1
 *
 * From private key (env only, never in CLI):
 *   PRIVATE_KEY=0x... node sign-transaction.mjs --to 0x... --value 6.1
 *
 * Options:
 *   --rpc <url>     RPC URL (default: process.env.ETH_RPC_URL or https://mainnet.base.org)
 *   --keystore path Path to keystore JSON (requires KEYSTORE_PASSWORD)
 *   --to address    Recipient address
 *   --value eth      Amount in ETH (e.g. 6.1)
 *   --dry-run       Don't send, only estimate and print tx params
 */
import { Wallet, JsonRpcProvider, parseEther } from 'ethers';
import { readFileSync } from 'fs';

function getArg(name, short) {
  const i = process.argv.indexOf(name);
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  if (short) {
    const si = process.argv.indexOf(short);
    if (si !== -1 && process.argv[si + 1]) return process.argv[si + 1];
  }
  return null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

async function main() {
  const rpcUrl = getArg('--rpc') || process.env.ETH_RPC_URL || 'https://mainnet.base.org';
  const to = getArg('--to');
  const valueEth = getArg('--value');
  const keystorePath = getArg('--keystore');
  const dryRun = hasFlag('--dry-run');

  if (!to || valueEth == null) {
    console.error('Usage: node sign-transaction.mjs --to <address> --value <eth> [--keystore path] [--rpc url] [--dry-run]');
    console.error('   Or set PRIVATE_KEY or KEYSTORE_PASSWORD + --keystore');
    process.exit(1);
  }

  let wallet;
  if (process.env.PRIVATE_KEY) {
    wallet = new Wallet(process.env.PRIVATE_KEY);
  } else if (keystorePath && process.env.KEYSTORE_PASSWORD) {
    const keystoreJson = readFileSync(keystorePath, 'utf8');
    wallet = await Wallet.fromEncryptedJson(keystoreJson, process.env.KEYSTORE_PASSWORD);
  } else {
    console.error('Provide PRIVATE_KEY or KEYSTORE_PASSWORD and --keystore');
    process.exit(1);
  }

  const provider = new JsonRpcProvider(rpcUrl);
  wallet = wallet.connect(provider);

  const valueWei = parseEther(valueEth);
  const tx = { to, value: valueWei };

  if (dryRun) {
    const fee = await provider.getFeeData();
    console.log('Dry run. Tx params:', { to, valueEth, valueWei: valueWei.toString(), gasPrice: fee.gasPrice?.toString() });
    return;
  }

  const sent = await wallet.sendTransaction(tx);
  console.log('Tx hash:', sent.hash);
  console.log('Explorer:', `${rpcUrl.includes('base') ? 'https://basescan.org' : 'https://etherscan.io'}/tx/${sent.hash}`);
  const receipt = await sent.wait();
  console.log('Block:', receipt.blockNumber, 'Status:', receipt.status === 1 ? 'success' : 'reverted');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
