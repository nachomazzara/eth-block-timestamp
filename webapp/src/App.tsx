import React, { useState, useEffect } from 'react'

import Blocks from 'eth-block-timestamp'
import useDebounce from './debounce'
import { getNetworkNameById, getBaseLink } from './utils'

import './App.css'

let provider

if ((window as any).ethereum) {
  provider = (window as any).ethereum
} else {
  provider = 'https://mainnet.infura.io/v3/85bbcb55329846258cda4ad9734d2e1f'
}

const blocks = new Blocks(provider)

function App() {
  const [timestamp, setTimestamp] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [block, setBlock] = useState<number>()
  const [network, setNetwork] = useState<string>()
  const [account ,setAccounts] = useState<string[]>()

  const debouncedTimestamp = useDebounce(timestamp, 500)

  useEffect(() => {
    async function getLatestBlock() {
      const provider = (window as any).ethereum
      if (provider && typeof provider.request === 'function') {
        const res = await provider.request({ method: 'eth_requestAccounts' })
        setAccounts(res)
      }

      setIsLoading(true)
      let found

      try {
        found = await blocks.getDate('latest')
      } catch (e) {
        console.log(e.message)
      }
      setBlock(found ? found.block : 0)
      setIsLoading(false)
    }

    getLatestBlock()
  }, [])

  useEffect(() => {
    async function getBlock(timestamp?: string) {
      if (timestamp) {
        setIsLoading(true)
        let found
        try {
          found = await blocks.getDate(timestamp)
        } catch (e) {
          console.log(e.message)
        }

        setBlock(found ? found.block : undefined)
        setIsLoading(false)
      }
    }

    getBlock(debouncedTimestamp)
  }, [debouncedTimestamp])

  useEffect(() => {
    const getNetwork = async () => {
      const id = provider.networkVersion
      setNetwork(getNetworkNameById(id))
    }

    getNetwork()
  }, [account])

  const link = getBaseLink(network)

  return (
    <div className="App">
      <h1>{'Block Number By Date'}</h1>
      <p className="block">
        <a href={`${link}/block/${block}`} target="_blank" rel="noopener noreferrer">
          {block}
        </a>
      </p>
      <p className="loading">{isLoading ? 'Loading...' : null}</p>
      <input
        type="string"
        placeholder={'latest | first | timestamp | date'}
        onChange={(e) => setTimestamp(e.target.value)}
      />
      <a
        className="footer"
        href="https://github.com/nachomazzara/eth-block-timestamp"
        target="_blank"
        rel="noopener noreferrer"
      >
        {'< code />'}
      </a>
    </div>
  )
}

export default App
