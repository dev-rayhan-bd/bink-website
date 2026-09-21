import { ActIncLogo } from "@/components/common/ActIncLogo";

interface BrandFooterProps {
  className?: string;
  variant?: "muted" | "white";
}

export function BrandFooter({ className, variant = "muted" }: BrandFooterProps) {
  const textColor =
    variant === "white"
      ? "text-white/70"
      : "text-muted-foreground";

  return (
    <div
      className={`flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${textColor} ${className || ""}`.trim()}
    >
      <span>MOGELIJK GEMAAKT DOOR</span>
      <ActIncLogo className="h-3.5 w-auto shrink-0" />
    </div>
  );
}
