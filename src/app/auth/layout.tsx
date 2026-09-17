import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
  return (
    <div className="min-h-dvh w-full bg-white flex flex-col md:flex-row relative">
      {/* Left Side: Image */}
      <div className="hidden md:block md:w-1/2 relative bg-zinc-200">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
          alt="Act Inc team collaboration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side: Auth Content */}
      <div className="w-full md:w-1/2 flex flex-col relative bg-white overflow-y-auto h-dvh">
        {children}
      </div>
    </div>
  );
}
