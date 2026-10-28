import { useEffect } from 'react'
import { InfiniteCanvas } from './components/infinite-canvas'
import { EdgeLayer } from './components/edge-layer'
import { NodeLayer } from './components/node-layer'
import { AppHeader } from './components/app-header'
import { MockProvider } from './core/def/mock-provider'
import { useConnectionStore } from './store/connection-store'
import { useSchemaStore } from './store/schema-store'
import type { IDataStreamProvider } from './core/meta/i-data-stream-provider'

function App() {
  useEffect(() => {
    const provider: IDataStreamProvider = new MockProvider()
    const unsubscribe = provider.subscribe(event => {
      useSchemaStore.getState().applyMutation(event)
    })
    provider.connect()
    useConnectionStore.getState().setConnected('mock:ecommerce_db @ localhost:5432')

    return () => {
      unsubscribe()
      provider.disconnect()
      useConnectionStore.getState().setDisconnected()
    }
  }, [])

  return (
    <main className="w-screen h-screen overflow-hidden">
      <AppHeader />
      <InfiniteCanvas>
        <NodeLayer />
        <EdgeLayer />
      </InfiniteCanvas>
    </main>
  )
}

export { App }
