import { ActIncLogo } from "@/components/common/ActIncLogo";

interface BrandFooterProps {
  className?: string;
  variant?: "muted" | "white";
  logoUrl?: string;
  companyName?: string;
}

export function BrandFooter({
  className,
  variant = "muted",
  logoUrl,
  companyName,
}: BrandFooterProps) {
  const textColor =
    variant === "white"
      ? "text-white/70"
      : "text-muted-foreground";

  return (
    <div
      className={`flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${textColor} ${className || ""}`.trim()}
    >
      <span>MEDE MOGELIJK GEMAAKT DOOR</span>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={companyName || "Bedrijfslogo"}
          className="h-3.5 max-h-4 max-w-24 object-contain"
        />
      ) : (
        <ActIncLogo className="h-3.5 w-auto shrink-0" />
      )}
    </div>
  );
}

