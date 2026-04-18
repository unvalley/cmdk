import type { HTMLAttributes, JSX, ReactNode, Ref } from "react"

/**
 * Props for the loading indicator shown inside the command palette.
 *
 * Additional HTML attributes are forwarded to the progress container.
 */
export type CommandLoadingProps = HTMLAttributes<HTMLDivElement> & {
  /** Ref forwarded to the loading container. */
  ref?: Ref<HTMLDivElement>
  /** 0..1 progress; surfaced as aria-valuenow when set. */
  progress?: number
  /** Loading content, such as text or a spinner. */
  children?: ReactNode
}

/** Renders a progressbar-compatible loading region. */
export const CommandLoading = ({
  ref,
  progress,
  children,
  ...rest
}: CommandLoadingProps): JSX.Element => (
  <div
    ref={ref}
    command-palette-loading=""
    role="progressbar"
    aria-valuenow={progress != null ? Math.round(progress * 100) : undefined}
    aria-valuemin={0}
    aria-valuemax={100}
    {...rest}
  >
    {children}
  </div>
)
