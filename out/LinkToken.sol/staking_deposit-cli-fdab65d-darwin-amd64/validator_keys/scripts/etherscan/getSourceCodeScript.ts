export const chain = '1'

const ETHERSCAN_V2_API_URL = 'https://api.etherscan.io/v2/api'
const moduleName = 'contract'
const actionName = 'getsourcecode'

export type EtherscanSourceCodeEntry = {
  SourceCode: string
  ABI: string
  ContractName: string
  CompilerVersion: string
  CompilerType: string
  OptimizationUsed: string
  Runs: string
  ConstructorArguments: string
  EVMVersion: string
  Library: string
  ContractFileName: string
  LicenseType: string
  Proxy: string
  Implementation: string
  SwarmSource: string
  SimilarMatch: string
}

export type EtherscanGetSourceCodeResponse = {
  status: string
  message: string
  result: EtherscanSourceCodeEntry[] | string
}

/**
 * Retrieve source code for a verified smart contract from Etherscan.
 * @param {string} apikey - Etherscan API key
 * @param {string} address - Contract address to query
 * @param {string} chainid - Chain ID (defaults to 1 for Ethereum mainnet)
 */
export const getSourceCode = async (
  apikey: string,
  address: string,
  chainid: string = chain
): Promise<EtherscanGetSourceCodeResponse> => {
  const query = new URLSearchParams({
    apikey,
    chainid,
    module: moduleName,
    action: actionName,
    address
  })

  const response = await fetch(`${ETHERSCAN_V2_API_URL}?${query.toString()}`)

  if (!response.ok) {
    throw new Error(`Etherscan request failed with HTTP ${response.status}`)
  }

  return response.json() as Promise<EtherscanGetSourceCodeResponse>
}
