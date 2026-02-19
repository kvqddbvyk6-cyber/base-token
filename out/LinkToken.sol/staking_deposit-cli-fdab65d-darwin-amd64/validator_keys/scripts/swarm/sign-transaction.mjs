import { Wallet, JsonRpcProvider, parseEther } from 'ethers';

// After importing from keystore (or from env), use the private key with a provider to sign/send txs
const privateKey = process.env.PRIVATE_KEY || '0x...';  // prefer env var
const provider = new JsonRpcProvider('https://...');    // e.g. https://mainnet.base.org
const wallet = new Wallet(privateKey, provider);

async function sendExample() {
  const tx = await wallet.sendTransaction({
    to: '0x...',
    value: parseEther('0.1'),
  });
  console.log('Tx hash:', tx.hash);
  const receipt = await tx.wait();
  console.log('Confirmed in block:', receipt.blockNumber);
}

// sendExample().catch(console.error);
