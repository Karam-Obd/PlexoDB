import { Base } from './base'
import { SizeEnum } from '../enums/size'
import type { IModal } from '../meta/i-modal'

class Modal extends Base<IModal> implements IModal {
  id!: string
  header!: React.ReactNode
  body!: React.ReactNode
  isOpen!: boolean
  isDrawer!: boolean
  drawerDir!: 'left' | 'right'
  size!: SizeEnum
  fill!: boolean
  noCloseButton!: boolean
  noBackDrop!: boolean

  deserialize({
    id = '',
    header = null,
    body = null,
    isOpen = false,
    isDrawer = false,
    drawerDir = 'left',
    size = SizeEnum.MD,
    fill = false,
    noCloseButton = false,
    noBackDrop = false
  }: Partial<IModal> = {}): void {
    this.primaryKey('id', id)
    this.header = header
    this.body = body
    this.isOpen = isOpen
    this.isDrawer = isDrawer
    this.drawerDir = drawerDir
    this.size = size
    this.fill = fill
    this.noCloseButton = noCloseButton
    this.noBackDrop = noBackDrop
  }
}

export { Modal }
