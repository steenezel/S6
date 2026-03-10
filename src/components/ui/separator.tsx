import * as React from 'react'

type SeparatorProps = React.HTMLAttributes<HTMLDivElement>

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={['h-px w-full bg-slate-800', className].filter(Boolean).join(' ')}
      {...props}
    />
  ),
)

Separator.displayName = 'Separator'

