import type { MouseEvent } from 'react'
import type { TAnchorProps } from '../../core/meta/t-component'

function Anchor({ children, onClick, href = '#', className = '', ...props }: TAnchorProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href === '#') {
      e.preventDefault()
    }
    onClick?.(e)
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}

export { Anchor }
