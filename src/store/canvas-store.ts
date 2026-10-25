import { create } from 'zustand'
import { ThemeEnum } from '../core/enums/theme'
import type { TViewportState } from '../core/meta/t-viewport-state'

type TCanvasStore = {
  viewport: TViewportState
  theme: ThemeEnum
  setViewport: (viewport: TViewportState) => void
  pan: (dx: number, dy: number) => void
  zoom: (delta: number, focalPoint?: { clientX: number; clientY: number }) => void
  resetViewport: () => void
  setTheme: (theme: ThemeEnum) => void
  toggleTheme: () => void
}

const MIN_SCALE = 0.2
const MAX_SCALE = 3.0

const useCanvasStore = create<TCanvasStore>((set, get) => ({
  viewport: {
    panX: 0,
    panY: 0,
    scale: 1
  },
  theme: ThemeEnum.DARK,

  setViewport: (viewport: TViewportState) => {
    set({ viewport })
  },

  pan: (dx: number, dy: number) => {
    set(state => ({
      viewport: {
        ...state.viewport,
        panX: state.viewport.panX + dx,
        panY: state.viewport.panY + dy
      }
    }))
  },

  zoom: (delta: number, focalPoint?: { clientX: number; clientY: number }) => {
    const { viewport } = get()
    const nextScale = Math.min(Math.max(viewport.scale + delta, MIN_SCALE), MAX_SCALE)

    if (nextScale === viewport.scale) return

    if (!focalPoint) {
      set({ viewport: { ...viewport, scale: nextScale } })
      return
    }

    const scaleRatio = nextScale / viewport.scale
    const nextPanX = focalPoint.clientX - (focalPoint.clientX - viewport.panX) * scaleRatio
    const nextPanY = focalPoint.clientY - (focalPoint.clientY - viewport.panY) * scaleRatio

    set({
      viewport: {
        panX: nextPanX,
        panY: nextPanY,
        scale: nextScale
      }
    })
  },

  resetViewport: () => {
    set({
      viewport: {
        panX: 0,
        panY: 0,
        scale: 1
      }
    })
  },

  setTheme: (theme: ThemeEnum) => {
    document.documentElement.classList.toggle('dark', theme === ThemeEnum.DARK)
    set({ theme })
  },

  toggleTheme: () => {
    const nextTheme = get().theme === ThemeEnum.DARK ? ThemeEnum.LIGHT : ThemeEnum.DARK
    document.documentElement.classList.toggle('dark', nextTheme === ThemeEnum.DARK)
    set({ theme: nextTheme })
  }
}))

export { useCanvasStore }
