import React, { useState, useEffect } from 'react'

import Blocks from './lib/blocks'
import useDebounce from './debounce'

import './App.css'

let provider

if ((window as any).ethereum) {
  provider = (window as any).ethereum
} else {
  provider = 'https://mainnet.infura.io/v3/02e880217a8b4077bc05fcab2ee1d922'
}

const blocks = new Blocks(provider)

function App() {
  const [timestamp, setTimestamp] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const [block, setBlock] = useState<number>()

  const debouncedTimestamp = useDebounce(timestamp, 500)

  useEffect(() => {
    async function getLatestBlock() {
      const provider = (window as any).ethereum
      if (provider && typeof provider.enable === 'function') {
        await provider.enable()
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

  return (
    <div className="App">
      <h1>{'Block Number By Date'}</h1>
      <p className="block">
        <a
          href={`https://etherscan.io/block/${block}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {block}
        </a>
      </p>
      <p className="loading">{isLoading ? 'Loading...' : null}</p>
      <input
        type="string"
        placeholder={'latest | first | timestamp | date'}
        onChange={e => setTimestamp(e.target.value)}
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
