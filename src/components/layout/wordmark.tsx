export function Wordmark() {
  return (
    <span className="font-display inline-flex items-center gap-2 text-lg font-bold">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6">
        <path d="M12 2 22 12 12 22 2 12Z" fill="none" stroke="var(--color-accent)" strokeWidth="2.25" />
        <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" fill="var(--color-accent)" />
      </svg>
      <span>
        Side<span className="text-accent">Quest</span>
      </span>
    </span>
  );
}
