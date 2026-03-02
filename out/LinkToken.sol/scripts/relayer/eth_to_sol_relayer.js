#!/usr/bin/env node
'use strict';

/**
 * ETH → SOL bridge helper via Li.Fi (li.quest).
 *
 * Modes:
 *   - Quote only (default): fetches a quote/transactionRequest and prints it.
 *   - Execute (RELAYER_EXECUTE=true): sends the transaction via ethers.js using
 *     PRIVATE_KEY and RPC_URL. Execution requires the `ethers` package installed.
 *
 * Required env:
 *   FROM_CHAIN_ID   (e.g. 1)
 *   TO_CHAIN_ID     (e.g. 101 for Solana)
 *   FROM_TOKEN      (e.g. ETH)
 *   TO_TOKEN        (e.g. SOL)
 *   FROM_AMOUNT_WEI  OR  FROM_AMOUNT_ETH  (or argv[2] as ETH amount)
 *
 * Optional env:
 *   BRIDGE_API_URL (default https://li.quest/v1)
 *   RPC_URL        (default https://eth.llamarpc.com)
 *   RELAYER_EXECUTE (default false)
 *   PRIVATE_KEY    (hex string, 0x-prefixed) — required when RELAYER_EXECUTE=true
 */

const https = require('https');

function getEnv(name, { required = true, fallback } = {}) {
  const v = process.env[name] ?? fallback;
  if (required && (v === undefined || v === null || v === '')) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

const BRIDGE_API_URL = getEnv('BRIDGE_API_URL', { required: false, fallback: 'https://li.quest/v1' }).replace(/\/+$/, '');
const FROM_CHAIN_ID = getEnv('FROM_CHAIN_ID');
const TO_CHAIN_ID = getEnv('TO_CHAIN_ID');
const FROM_TOKEN = getEnv('FROM_TOKEN');
const TO_TOKEN = getEnv('TO_TOKEN');
const RELAYER_EXECUTE = /^true$/i.test(process.env.RELAYER_EXECUTE || 'false');
const RPC_URL = getEnv('RPC_URL', { required: false, fallback: 'https://eth.llamarpc.com' });

function chooseAmountWei() {
  if (process.env.FROM_AMOUNT_WEI) return process.env.FROM_AMOUNT_WEI;
  const parseEth = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0) throw new Error('FROM_AMOUNT_ETH must be a positive number');
    return BigInt(Math.round(n * 1e18)).toString();
  };
  if (process.env.FROM_AMOUNT_ETH) return parseEth(process.env.FROM_AMOUNT_ETH);
  if (process.argv[2]) return parseEth(process.argv[2]);
  throw new Error('Provide FROM_AMOUNT_WEI or FROM_AMOUNT_ETH (or argv[2] as ETH).');
}

const FROM_AMOUNT_WEI = chooseAmountWei();

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { accept: 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function normalizeTxRequest(tx) {
  if (!tx) throw new Error('quote.transactionRequest is missing');
  // ethers v6 friendly normalization
  const out = { ...tx };
  if (typeof out.gasLimit === 'string') out.gasLimit = BigInt(out.gasLimit);
  if (typeof out.maxPriorityFeePerGas === 'string') out.maxPriorityFeePerGas = BigInt(out.maxPriorityFeePerGas);
  if (typeof out.maxFeePerGas === 'string') out.maxFeePerGas = BigInt(out.maxFeePerGas);
  if (typeof out.value === 'string') out.value = BigInt(out.value);
  return out;
}

async function executeTx(transactionRequest) {
  const newLocal = 'PRIVATE_KEY';
  const privateKey = getEnv(newLocal);
  let ethers;
  try {
    ({ ethers } = require('ethers'));
  } catch (err) {
    throw new Error('ethers package is required for execution. Run `npm install ethers` in this directory.');
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL, Number(FROM_CHAIN_ID));
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`→ Broadcasting from ${wallet.address} using ${RPC_URL}`);
  const txResponse = await wallet.sendTransaction(transactionRequest);
  console.log('Tx sent:', txResponse.hash);
  const receipt = await txResponse.wait();
  console.log('Tx mined in block', receipt.blockNumber);
}

async function main() {
  console.log(
    `→ Quote: ${FROM_TOKEN} on chain ${FROM_CHAIN_ID} → ${TO_TOKEN} on chain ${TO_CHAIN_ID}, amount (wei)=${FROM_AMOUNT_WEI}`,
  );
  const url =
    `${BRIDGE_API_URL}/quote?fromChain=${FROM_CHAIN_ID}&toChain=${TO_CHAIN_ID}` +
    `&fromToken=${encodeURIComponent(FROM_TOKEN)}&toToken=${encodeURIComponent(TO_TOKEN)}` +
    `&fromAmount=${FROM_AMOUNT_WEI}&allowExchanges=true`;

  const quote = await getJson(url);
  console.log('--- Quote response ---');
  console.log(JSON.stringify(quote, null, 2));

  if (!RELAYER_EXECUTE) return;

  const txRequest = normalizeTxRequest(quote.transactionRequest);
  console.log('--- Executing transaction ---');
  await executeTx(txRequest);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
