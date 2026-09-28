import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SurveyIntroProps {
  title: string;
  description: string;
  badge?: string;
  imageUrl: string;
  questionCount: number;
  format?: string;
  startLabel?: string;
  onStart: () => void;
  className?: string;
}

export function SurveyIntro({ 
  title, 
  description, 
  badge = "Leermodule", 
  imageUrl, 
  questionCount, 
  format = "Interactief", 
  startLabel = "Start",
  onStart, 
  className,
}: SurveyIntroProps) {
  const questionLabel = questionCount === 1 ? "Vraag" : "Vragen";

  return (
    <div
      className={cn(
        "flex h-full min-h-full flex-1 flex-col w-full bg-secondary overflow-hidden",
        className
      )}
    >
      {/* Scrollable upper area containing Cover Image + Content Details */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col w-full scrollbar-none [&::-webkit-scrollbar]:hidden">
        {/* Cover Image */}
        <div className="relative w-full h-48 sm:h-56 shrink-0 bg-muted">
          <Image 
            src={imageUrl} 
            alt={title} 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Content Details inside Blue Background Card */}
        <div className="flex flex-1 flex-col justify-start p-4 sm:p-5 text-secondary-foreground">
          {/* Badge */}
          <div className="mb-3">
            <span className="inline-block bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-xs">
              {badge}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold font-heading text-secondary-foreground mb-2 tracking-tight wrap-break-word">
            {title}
          </h1>

          {/* Description */}
          <p className="text-sm text-secondary-foreground/85 leading-relaxed mb-6 max-w-full wrap-break-word whitespace-pre-line">
            {description}
          </p>
          
          {/* Stats Box */}
          <div className="bg-background/90 dark:bg-background/80 rounded-lg p-3.5 flex items-center justify-between shadow-xs border border-border/40 mt-auto">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-primary">{questionCount}</div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                {questionLabel}
              </div>
            </div>
            <div className="w-px h-10 bg-border"></div>
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-primary">{format}</div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                FORMAT
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button anchored / sticky at the bottom */}
      <div className="shrink-0 p-4 sm:p-5 bg-secondary pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button 
          type="button" 
          size="lg-full" 
          onClick={onStart}
        >
          {startLabel} <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
