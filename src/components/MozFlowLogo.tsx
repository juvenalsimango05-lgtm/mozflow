export function MozFlowLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-bold tracking-tight bg-clip-text text-transparent ${className}`}
      style={{ backgroundImage: "var(--gradient-brand)" }}
    >
      MozFlow
    </span>
  );
}