import type { TCardProps } from '../../core/meta/t-component'

function Card({ header, children, footer, className = '', headerClassName = '', bodyClassName = '', footerClassName = '', hoverable = false }: TCardProps) {
  const bodyContent = children

  return (
    <div className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`.trim()}>
      {header != null && header !== false && <div className={`card-header ${headerClassName}`.trim()}>{header}</div>}
      {bodyContent != null && bodyContent !== false && <div className={`card-body ${bodyClassName}`.trim()}>{bodyContent}</div>}
      {footer != null && footer !== false && <div className={`card-footer ${footerClassName}`.trim()}>{footer}</div>}
    </div>
  )
}

export { Card }
