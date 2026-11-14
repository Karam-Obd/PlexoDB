import type { MouseEvent } from 'react'
import type { TAnchorProps } from '../../core/meta/t-component'

function Anchor({ children, onClick, href = '#', className = '', disabled, ...props }: TAnchorProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href === '#') {
      e.preventDefault()
    }
    if (disabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={`${className} ${disabled ? 'disabled' : ''}`.trim()}
      {...props}
    >
      {children}
    </a>
  )
}

export { Anchor }
