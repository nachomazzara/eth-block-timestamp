const CHAINS = {
  ETHEREUM_MAINNET: { value: 'mainnet', label: 'Ethereum Mainnet', id: 1 },
  ETHEREUM_ROPSTEN: { value: 'ropsten', label: 'Ropsten Testnet', id: 3 },
  ETHEREUM_RINKEBY: { value: 'rinkeby', label: 'Rinkeby Testnet', id: 4 },
  ETHEREUM_GOERLI: { value: 'goerli', label: 'Goerli Testnet', id: 5 },
  ETHEREUM_KOVAN: { value: 'kovan', label: 'Kovan Testnet', id: 42 },
  BSC_MAINNET: { value: 'bsc', label: 'Binance Smart Chain Mainnet', id: 56 },
  BSC_TESTNET: {
    value: 'bsc-testnet',
    label: 'Binance Smart Chain Testnet',
    id: 97,
  },
  MATIC_MAINNET: { value: 'matic', label: 'Matic Mainnet', id: 137 },
  MATIC_MUMBAI: { value: 'mumbai', label: 'Matic Mumbai', id: 80001 },
}

export function getChains() {
  return Object.values(CHAINS)
}

export function getNetworkNameById(id: string): string {
  const chain = getChains().find((chain) => String(chain.id) === id)
  return chain ? chain.value : ''
}


function isEthereumChain(network: string) {
  return (
    network === CHAINS.ETHEREUM_MAINNET.value ||
    network === CHAINS.ETHEREUM_ROPSTEN.value ||
    network === CHAINS.ETHEREUM_KOVAN.value ||
    network === CHAINS.ETHEREUM_GOERLI.value ||
    network === CHAINS.ETHEREUM_RINKEBY.value
  )
}

function isMaticChain(network: string) {
  return (
    network === CHAINS.MATIC_MAINNET.value ||
    network === CHAINS.MATIC_MUMBAI.value
  )
}

function isBSCChain(network: string) {
  return (
    network === CHAINS.BSC_MAINNET.value || network === CHAINS.BSC_TESTNET.value
  )
}

export function getBaseLink(network: string): string {
  if (isEthereumChain(network)) {
    return `https://${network !== 'mainnet' ? `${network}.` : ''}etherscan.io`
  }

  if (isBSCChain(network)) {
    return `https://${network === CHAINS.BSC_TESTNET.value ? 'testnet.' : ''
      }bscscan.com/block`
  }

  if (isMaticChain(network)) {
    return `https://${network === CHAINS.MATIC_MUMBAI.value ? 'mumbai.' : ''
      }polygonscan.com`
  }

  console.warn(`Could not find any link for the chain: ${network}`)

  return ''
}
