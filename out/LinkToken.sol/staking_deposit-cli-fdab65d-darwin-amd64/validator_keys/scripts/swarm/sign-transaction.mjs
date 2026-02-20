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
 *   --value eth     Amount in ETH (e.g. 6.1)
 *   --block num     Block number to fetch (e.g. 429109); if only --block is set, prints block info and exits
 *   --dry-run       Don't send, only estimate and print tx params
 */
import ethers from 'ethers';
const { Wallet, providers: { JsonRpcProvider }, utils: { parseEther } } = ethers;
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
  const blockNum = getArg('--block');
  const keystorePath = getArg('--keystore');
  const dryRun = hasFlag('--dry-run');

  const provider = new JsonRpcProvider(rpcUrl);
  const baseUrl = rpcUrl.includes('base') ? 'https://basescan.org' : 'https://etherscan.io';

  if (blockNum != null) {
    const num = parseInt(blockNum, 10);
    if (Number.isNaN(num)) {
      console.error('Invalid --block:', blockNum);
      process.exit(1);
    }
    const block = await provider.getBlock(num);
    if (!block) {
      console.error('Block not found:', num);
      process.exit(1);
    }
    console.log('Block', block.number, ':', block.hash);
    console.log('Timestamp:', block.timestamp, new Date(Number(block.timestamp) * 1000).toISOString());
    console.log('Explorer:', `${baseUrl}/block/${block.number}`);
    if (!to && valueEth == null) process.exit(0);
  }

  if (!to || valueEth == null) {
    console.error('Usage: node sign-transaction.mjs --to <address> --value <eth> [--keystore path] [--rpc url] [--dry-run]');
    console.error('       node sign-transaction.mjs --block <num> [--rpc url]   (e.g. --block 429109)');
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

  wallet = wallet.connect(provider);

  const valueWei = parseEther(valueEth);
  const tx = { to, value: valueWei };

  if (dryRun) {
    const gasPrice = await provider.getGasPrice();
    console.log('Dry run. Tx params:', { to, valueEth, valueWei: valueWei.toString(), gasPrice: gasPrice?.toString() });
    return;
  }

  const sent = await wallet.sendTransaction(tx);
  console.log('Tx hash:', sent.hash);
  console.log('Explorer:', `${baseUrl}/tx/${sent.hash}`);
  const receipt = await sent.wait();
  console.log('Block:', receipt.blockNumber, 'Status:', receipt.status === 1 ? 'success' : 'reverted');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
