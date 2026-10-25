import { InfiniteCanvas } from './components/infinite-canvas'
import { EdgeLayer } from './components/edge-layer'
import { NodeLayer } from './components/node-layer'

function App() {
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
