import * as React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement>

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={['rounded-2xl border bg-slate-900/60', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
)

Card.displayName = 'Card'

