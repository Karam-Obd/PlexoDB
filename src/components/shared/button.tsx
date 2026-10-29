import { useState } from 'react'
import { AccentEnum } from '../../core/enums/accent'
import { SizeEnum } from '../../core/enums/size'
import { ButtonVariantEnum } from '../../core/enums/button-variant'

type TButtonProps = {
  children?: React.ReactNode
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
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function Button({
  children,
  accent = AccentEnum.PRIMARY,
  size = SizeEnum.MD,
  variant = ButtonVariantEnum.SOFT,
  className,
  disabled = false,
  icon = false,
  toggle = false,
  active: activeProp = false,
  onClick,
  ...props
}: TButtonProps) {
  const [activeState, setActiveState] = useState(activeProp)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (toggle) setActiveState(prev => !prev)
    if (disabled) return
    onClick?.(e)
  }

  return (
    <button
      className={`button button-${variant} button-${accent} button${icon ? '-icon' : ''}-${size}${activeState ? ' active' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }
