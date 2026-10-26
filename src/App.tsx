import { useEffect } from 'react'
import { InfiniteCanvas } from './components/infinite-canvas'
import { EdgeLayer } from './components/edge-layer'
import { NodeLayer } from './components/node-layer'
import { MockProvider } from './core/def/mock-provider'
import { useSchemaStore } from './store/schema-store'
import type { IDataStreamProvider } from './core/meta/i-data-stream-provider'

function App() {
  useEffect(() => {
    const provider: IDataStreamProvider = new MockProvider()
    const unsubscribe = provider.subscribe(event => {
      useSchemaStore.getState().applyMutation(event)
    })
    provider.connect()

    return () => {
      unsubscribe()
      provider.disconnect()
    }
  }, [])

  return (
    <main className="w-screen h-screen overflow-hidden">
      <InfiniteCanvas>
        <NodeLayer />
        <EdgeLayer />
      </InfiniteCanvas>
    </main>
  )
}

export { App }
