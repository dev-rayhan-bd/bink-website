import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
  return (
    <div className="min-h-dvh w-full bg-white flex flex-col md:flex-row relative">
      {/* Left Side: Image (Fills left half on desktop, hidden on mobile) */}
      <div className="hidden md:block md:w-1/2 relative bg-muted overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/8374254/pexels-photo-8374254.jpeg"
          alt="Act Inc team"
          fill
          sizes="50vw"
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Right Side: Auth Content */}
      <div className="w-full md:w-1/2 flex flex-col relative bg-background overflow-y-auto h-dvh">
        {children}
      </div>
    </div>
  );
}
