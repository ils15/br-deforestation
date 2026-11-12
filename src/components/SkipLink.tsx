export interface SkipLinkProps {
  targetId?: string
  label?: string
  className?: string
}

export default function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={
        className ??
        'sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-foreground focus:shadow-lg'
      }
      data-testid="skip-link"
    >
      {label}
    </a>
  )
}