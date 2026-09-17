import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SurveyIntroProps {
  title: string;
  description: string;
  badge: string;
  imageUrl: string;
  questionCount: number;
  format: string;
  startLabel?: string;
  onStart: () => void;
}

export function SurveyIntro({ 
  title, 
  description, 
  badge, 
  imageUrl, 
  questionCount, 
  format, 
  startLabel = "Starten",
  onStart, 
}: SurveyIntroProps) {
  const questionLabel = questionCount === 1 ? "Vraag" : "Vragen";

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full overflow-y-auto pb-2">
      {/* Cover Image */}
      <div className="relative w-full h-48 sm:h-55 rounded-lg overflow-hidden mb-3 shrink-0 bg-muted shadow-sm">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Content Card stretching down to bottom */}
      <div className="bg-secondary p-4 relative z-10 flex flex-col flex-1 justify-between border border-secondary/50 shadow-sm rounded-lg">
        <div>
          <span className="inline-block bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider w-max mb-3 shadow-sm rounded-md">
            {badge}
          </span>
          <h1 className="text-2xl font-bold font-heading text-secondary-foreground mb-2 wrap-break-word">
            {title}
          </h1>
          <p className="text-sm text-secondary-foreground/80 leading-relaxed mb-6 max-w-full wrap-break-word">
            {description}
          </p>
          
          {/* Stats Box */}
          <div className="bg-background/80 p-3 flex items-center justify-between mb-4 shadow-sm rounded-lg">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-primary">{questionCount}</div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{questionLabel}</div>
            </div>
            <div className="w-px h-10 bg-border/80"></div>
            <div className="flex-1 text-center">
              <div className="text-xl font-bold text-primary">{format}</div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Vorm</div>
            </div>
          </div>
        </div>

        {/* Start Button anchored at bottom */}
        <div className="mt-auto pt-4">
          <Button type="button" size="lg" className="w-full" onClick={onStart}>
            {startLabel} <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
