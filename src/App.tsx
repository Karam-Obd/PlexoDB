import { useEffect } from 'react'
import { AppHeader } from './components/app-header'
import { InfiniteCanvas } from './components/infinite-canvas'
import { InfiniteCanvasActions } from './components/infinite-canvas-actions'
import { EdgeLayer } from './components/edge-layer'
import { NodeLayer } from './components/node-layer'
import { Modal } from './core/def/modal'
import { ChangeLogModalBody, ChangeLogModalHeader } from './components/change-log-modal'
import { ModalLayer } from './components/modals-layer'
import { MockProvider } from './core/def/mock-provider'
import { useSchemaStore } from './store/schema-store'
import { useConnectionStore } from './store/connection-store'
import { useModalsStore } from './store/modals-store'
import { useCanvasStore } from './store/canvas-store'
import type { IDataStreamProvider } from './core/meta/i-data-stream-provider'

function App() {
  useEffect(() => {
    const provider: IDataStreamProvider = new MockProvider()
    const unsubscribe = provider.subscribe(event => useSchemaStore.getState().applyMutation(event))
    provider.connect()
    useConnectionStore.getState().setConnected('mock:ecommerce_db @ localhost:5432')
    useCanvasStore.getState().centerContent(Object.values(useSchemaStore.getState().tables))
    useModalsStore.getState().registerModal(
      'change-log-modal',
      new Modal({
        id: 'change-log-modal',
        header: <ChangeLogModalHeader />,
        body: <ChangeLogModalBody />,
        isOpen: true,
        isDrawer: true,
        drawerDir: 'right',
        fill: true,
        noBackDrop: true,
        noCloseButton: true
      })
    )

    return () => {
      unsubscribe()
      provider.disconnect()
      useConnectionStore.getState().setDisconnected()
      useModalsStore.getState().unregisterModal('change-log-modal')
    }
  }, [])

  return (
    <main className="w-screen h-screen overflow-hidden">
      <AppHeader />
      <InfiniteCanvas>
        <NodeLayer />
        <EdgeLayer />
      </InfiniteCanvas>
      <InfiniteCanvasActions />
      <ModalLayer />
    </main>
  )
}

export { App }
