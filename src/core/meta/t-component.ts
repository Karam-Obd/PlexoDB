import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { AccentEnum } from '../enums/accent'
import type { ButtonVariantEnum } from '../enums/button-variant'
import type { SizeEnum } from '../enums/size'
import icons from '../../icons.json'

type TIconName = keyof typeof icons

type TIconProps = {
  name: TIconName
  className?: string
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

type TTableCardProps = {
  tableId: string
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

export type {
  TIconName,
  TIconProps,
  TBadgeProps,
  TButtonProps,
  TTileProps,
  TModalProps,
  TTableCardProps,
  TInfiniteCanvasProps,
  TStatusTheme,
  TMutationTheme,
}

