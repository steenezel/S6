import * as React from 'react'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'animate-pulse rounded-md bg-slate-800/80',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  ),
)

Skeleton.displayName = 'Skeleton'

