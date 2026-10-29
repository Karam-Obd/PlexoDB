import { create } from 'zustand'
import { ThemeEnum } from '../core/enums/theme'
import { getCenterPan } from '../core/utils/coordinates'
import type { ITableNode } from '../core/meta/i-table-node'
import type { TViewportState } from '../core/meta/t-viewport-state'

type TCanvasStore = {
  viewport: TViewportState
  theme: ThemeEnum
  setViewport: (viewport: TViewportState) => void
  pan: (dx: number, dy: number) => void
  zoom: (delta: number, focalPoint?: { clientX: number; clientY: number }) => void
  centerContent: (tables: ITableNode[]) => void
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
    const nextScale = Math.min(Math.max(Number((viewport.scale + delta).toFixed(2)), MIN_SCALE), MAX_SCALE)

    if (nextScale === viewport.scale) return

    const focalX = focalPoint ? focalPoint.clientX : (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
    const focalY = focalPoint ? focalPoint.clientY : (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)

    const scaleRatio = nextScale / viewport.scale
    set({
      viewport: {
        panX: Math.round(focalX - (focalX - viewport.panX) * scaleRatio),
        panY: Math.round(focalY - (focalY - viewport.panY) * scaleRatio),
        scale: nextScale
      }
    })
  },

  centerContent: (tables: ITableNode[]) => {
    const { viewport } = get()
    const pan = getCenterPan(tables, viewport.scale)
    set({
      viewport: {
        ...viewport,
        panX: pan.x,
        panY: pan.y
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

export { useCanvasStore, MIN_SCALE, MAX_SCALE }
