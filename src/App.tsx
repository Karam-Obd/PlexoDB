import { InfiniteCanvas } from './components/infinite-canvas'
import { NodeLayer } from './components/node-layer'

function App() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <InfiniteCanvas>
        <NodeLayer />
      </InfiniteCanvas>
    </main>
  )
}

export { App }
