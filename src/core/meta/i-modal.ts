import { SizeEnum } from '../enums/size'

interface IModal {
  id: string
  header: React.ReactNode
  body: React.ReactNode
  footer?: React.ReactNode
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  isOpen: boolean
  isDrawer: boolean
  drawerDir: 'left' | 'right'
  size: SizeEnum
  fill: boolean
  noCloseButton: boolean
  noBackDrop: boolean
}

export type { IModal }
