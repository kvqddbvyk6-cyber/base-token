import { Wallet } from 'ethers';

// Paste your full keystore JSON here (the object from your backup)
const keystoreJson = `{ ... }`;
const password = 'Kijizzle12!';  // fixed: was missing closing quote

async function main() {
  const wallet = await Wallet.fromEncryptedJson(keystoreJson, password);
  console.log('Address:', wallet.address);
  console.log('Private Key:', wallet.privateKey);  // Only use for import; never commit or share
}

main().catch(console.error);
