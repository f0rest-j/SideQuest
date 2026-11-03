import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-bg hover:bg-[#c9ff7d] active:bg-accent-dark shadow-[0_0_0_1px_rgb(184_255_90/0.4),0_8px_24px_-8px_rgb(184_255_90/0.5)]",
  secondary: "bg-surface-2 text-ink border border-line hover:border-muted/60 active:bg-surface",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-surface-2 active:bg-surface",
  danger: "bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20 active:bg-danger/25",
};

export function buttonClasses(variant: Variant = "primary", extra = ""): string {
  return [
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold",
    "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    extra,
  ].join(" ");
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
