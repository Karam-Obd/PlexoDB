import { AccentEnum } from '../core/enums/accent'
import { Button } from './shared/button'
import { Icon } from './shared/icon'
import { useCanvasStore, MIN_SCALE, MAX_SCALE } from '../store/canvas-store'
import { useSchemaStore } from '../store/schema-store'
import locale from '../locales/en.json'
import { ButtonVariantEnum } from '../core/enums/button-variant'

export function InfiniteCanvasActions() {
  const scale = useCanvasStore(s => s.viewport.scale)

  const handleCenter = () => {
    useCanvasStore.getState().centerContent(Object.values(useSchemaStore.getState().tables))
  }

  return (
    <div className="canvas-actions" onPointerDown={e => e.stopPropagation()}>
      <Button accent={AccentEnum.MUTED} className="tip tip-bottom" data-tip={locale.common.labels.zoomOut} icon disabled={scale <= MIN_SCALE} onClick={() => useCanvasStore.getState().zoom(-0.15)}>
        <Icon name="minus" />
      </Button>

      <Button
        accent={AccentEnum.MUTED}
        className="tip tip-bottom min-w-16 justify-center"
        variant={ButtonVariantEnum.GHOST}
        data-tip={locale.common.labels.resetZoom}
        onClick={() => useCanvasStore.getState().zoom(1 - scale)}
      >
        {Math.round(scale * 100)}%
      </Button>

      <Button accent={AccentEnum.MUTED} className="tip tip-bottom" data-tip={locale.common.labels.zoomIn} icon disabled={scale >= MAX_SCALE} onClick={() => useCanvasStore.getState().zoom(0.15)}>
        <Icon name="plus" />
      </Button>

      <span className="divider"></span>

      <Button accent={AccentEnum.MUTED} className="tip tip-bottom" data-tip={locale.common.labels.reCenter} icon onClick={handleCenter}>
        <Icon name="center" />
      </Button>

      <Button accent={AccentEnum.MUTED} className="tip tip-bottom" data-tip={locale.common.labels.autoArrange} icon onClick={() => useSchemaStore.getState().autoArrange()}>
        <Icon name="nodes" />
      </Button>
    </div>
  )
}
