import { Play, ArrowRight, Signal, Wifi, BatteryFull } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function OnboardPage() {
  return (
    <div className="flex flex-col min-h-dvh dark bg-background text-foreground font-sans relative w-full overflow-hidden">
      
      {/* Top Video Section */}
      <div className="relative w-full h-[55dvh] min-h-100">
        {/* Background Video Placeholder Image */}
        <Image
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"
          alt="Video thumbnail"
          fill
          priority
          className="object-cover opacity-80"
        />
        
        {/* Overlay Gradient for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/95"></div>

        {/* Top Status Bar (Fake iOS status bar for mockup accuracy) */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-white/90 z-10 text-sm font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <BatteryFull className="w-5 h-5" />
          </div>
        </div>

        {/* ACT INC. Logo Overlay */}
        <div className="absolute top-12 left-5 z-10">
          <div className="border border-white px-2.5 py-1 flex items-center justify-center">
            <span className="font-bold text-sm tracking-widest uppercase">ACT INC.</span>
          </div>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center pl-1 hover:scale-105 transition-transform shadow-lg">
            <Play className="w-6 h-6 text-black fill-black" />
          </button>
        </div>

        {/* Video Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full px-6 pb-4 z-10">
          {/* Progress Track */}
          <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-primary w-1/2 rounded-full"></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-white/60 uppercase tracking-wide">
            <span>Tap to play</span>
            <span>0:00 / 6:12</span>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-24">
        <span className="text-primary text-[10px] font-bold tracking-widest uppercase mb-2">
          Welcome Message
        </span>
        
        <h1 className="text-[28px] font-bold font-heading leading-[1.2] tracking-tight mb-5 text-foreground">
          Welcome to the program
        </h1>
        
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          &quot;We&apos;re asking everyone in our organization to take part in this short training on social safety. It&apos;s not about checking a box — it&apos;s about creating a workplace where everyone feels respected and heard.&quot;
        </p>

        {/* Profile Card */}
        <div className="bg-secondary/20 rounded-lg p-5 border border-secondary/30">
          <h3 className="text-foreground font-bold text-[13px] mb-1.5 uppercase tracking-wide">
            John De Gilde
          </h3>
          <p className="text-muted-foreground text-xs">
            Programme Lead, ActInc Social Safety
          </p>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-black via-black/90 to-transparent z-20">
        <Link href="/auth/login" className="w-full flex justify-center">
          <Button 
            size="lg"
            className="w-full sm:w-fit gap-2"
          >
            SKIP TO THE PROGRAM
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

    </div>
  );
}

