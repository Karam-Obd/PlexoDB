import { useState } from 'react'
import { AccentEnum } from '../../core/enums/accent'
import { SizeEnum } from '../../core/enums/size'
import { ButtonVariantEnum } from '../../core/enums/button-variant'
import type { TButtonProps } from '../../core/meta/t-component'

function Button({
  children,
  accent = AccentEnum.PRIMARY,
  size = SizeEnum.MD,
  variant = ButtonVariantEnum.SOFT,
  className,
  disabled = false,
  icon = false,
  toggle = false,
  active,
  onClick,
  ...props
}: TButtonProps) {
  const [activeState, setActiveState] = useState(active)

  const isControlled = active !== undefined
  const isActive = isControlled ? active : activeState

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isControlled && toggle) {
      setActiveState(prev => !prev)
    }
    if (disabled) return
    onClick?.(e)
  }

  return (
    <button
      className={`button button-${variant} button-${accent} button${icon ? '-icon' : ''}-${size}${isActive ? ' active' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }
