import React, { useState, useEffect } from 'react'

import Blocks from './blocks'
import useDebounce from './debounce'

import './App.css'

const blocks = new Blocks()

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
        // Do nothing
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
        const found = await blocks.getDate(timestamp)
        setBlock(found ? found.block : 0)
        setIsLoading(false)
      }
    }

    getBlock(debouncedTimestamp)
  }, [debouncedTimestamp])

  return (
    <div className="App">
      <h1>{'Block Number By Date'}</h1>
      <p className="block">{block}</p>
      <p className="loading">{isLoading ? 'Loading...' : null}</p>
      <input
        type="string"
        placeholder={'latest | first | timestamp | date'}
        onChange={e => setTimestamp(e.target.value)}
      />
    </div>
  )
}

export default App
