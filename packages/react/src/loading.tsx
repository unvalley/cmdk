import type { HTMLAttributes, ReactNode, Ref } from 'react'

export type LoadingProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>
  /** 0..1 progress; surfaced as aria-valuenow when set. */
  progress?: number
  children?: ReactNode
}

export const Loading = ({ ref, progress, children, ...rest }: LoadingProps) => (
  <div
    ref={ref}
    cmdk-loading=""
    role="progressbar"
    aria-valuenow={progress != null ? Math.round(progress * 100) : undefined}
    aria-valuemin={0}
    aria-valuemax={100}
    {...rest}
  >
    {children}
  </div>
)
