import type { SizeEnum } from '../enums/size'
import type { AccentEnum } from '../enums/accent'
import type { ButtonVariantEnum } from '../enums/button-variant'
import type { TNullable } from './t-shared'
import type { IRelationEdge } from './i-relation-edge'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import type { TRowMutatedEvent, TSchemaMutatedEvent, TSchemaSnapshotEvent, TStreamEvent } from './t-event'
import icons from '../../icons.json'

type TIconName = keyof typeof icons

type TIconProps = {
  name: TIconName
  className?: string
  width?: number
  height?: number
}

type TBadgeProps = {
  children?: ReactNode
  accent?: AccentEnum
  size?: SizeEnum
  className?: string
  title?: string
}

type TButtonProps = {
  children?: ReactNode
  accent?: AccentEnum
  size?: SizeEnum
  variant?: ButtonVariantEnum
  disabled?: boolean
  className?: string
  icon?: boolean
  toggle?: boolean
  active?: boolean
  onClick?: (...args: any[]) => any
  'data-tip'?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

type TAnchorProps = {
  children?: ReactNode
  disabled?: boolean
} & AnchorHTMLAttributes<HTMLAnchorElement>

type TTileProps = {
  children?: ReactNode
  accent?: AccentEnum
  size?: SizeEnum
  className?: string
  icon?: boolean
  logo?: boolean
}

type TModalProps = {
  id: string
}

type TConfirmModalHeaderProps = {
  label: string
}

type TConfirmModalBodyProps = {
  id: string
  buttonProps?: TButtonProps
  description?: string
  actionLabel: string
}

type TTableCardProps = {
  tableId: string
}

type TRelationEdgeProps = {
  edge: IRelationEdge
}

type TInfiniteCanvasProps = {
  children?: ReactNode
}

type TStatusTheme = {
  accent: AccentEnum
  indicatorClass: string
}

type TMutationTheme = {
  cardClass: string
  badgeAccent: AccentEnum
  indicatorClass: string
}

type TChangLogCardProps = {
  event: TStreamEvent
  className?: string
  openCard?: (event: TStreamEvent) => void
  onOpen?: (event: TStreamEvent) => void
}

type TSnapShotCardProps = Omit<TChangLogCardProps, 'event'> & {
  event: TSchemaSnapshotEvent
}

type TRowMutatedCardProps = Omit<TChangLogCardProps, 'event'> & {
  event: TRowMutatedEvent
}

type TSchemaMutatedCardProps = Omit<TChangLogCardProps, 'event'> & {
  event: TSchemaMutatedEvent
}

type TCardProps = {
  header?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  hoverable?: boolean
}

type TObjectDiffProps = {
  cur?: TNullable<Record<string, unknown>>
  prev?: TNullable<Record<string, unknown>>
  limit?: number
  prioritizeChanges?: boolean
  truncate?: boolean
  children?: ReactNode
}

type TLogDetailsModalProps = {
  event?: TNullable<TStreamEvent>
}

export type {
  TIconName,
  TIconProps,
  TBadgeProps,
  TButtonProps,
  TAnchorProps,
  TTileProps,
  TModalProps,
  TConfirmModalHeaderProps,
  TConfirmModalBodyProps,
  TTableCardProps,
  TRelationEdgeProps,
  TInfiniteCanvasProps,
  TStatusTheme,
  TMutationTheme,
  TChangLogCardProps,
  TSnapShotCardProps,
  TRowMutatedCardProps,
  TSchemaMutatedCardProps,
  TObjectDiffProps,
  TCardProps,
  TLogDetailsModalProps
}
