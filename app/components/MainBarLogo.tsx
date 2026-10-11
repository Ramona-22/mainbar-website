"use client";

interface LogoProps {
  textColor?: string;
  ringColor?: string;
}

export default function MainBarLogo({ 
  textColor = "text-[#4A332A]", 
  ringColor = "border-[#d8a0a0]" 
}: LogoProps) {
  return (
    <div className="relative inline-flex flex-col items-center justify-center py-6 px-4 md:py-8 md:px-10 select-none max-w-full">
      
      {/* Irregular Watercolor Wine Rings - Scaled for Mobile */}
      <div className={`absolute w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 rounded-[45%_55%_40%_60%/55%_45%_60%_40%] border-[3px] opacity-60 ${ringColor} pointer-events-none`}></div>
      <div className={`absolute w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-[50%_50%_60%_40%/40%_60%_50%_50%] border-2 opacity-40 ${ringColor} rotate-45 pointer-events-none`}></div>

      {/* Cursive "MainBar" - Fluid Typography */}
      <h1 
        className={`relative z-10 text-6xl sm:text-7xl md:text-8xl font-normal tracking-wide ${textColor} drop-shadow-sm leading-none`} 
        style={{ fontFamily: "var(--font-great-vibes), cursive" }}
      >
        MainBar
      </h1>

      {/* "drinks & food" Subtitle */}
      <span className={`relative z-10 text-[9px] sm:text-[10px] md:text-xs tracking-[0.2em] font-sans mt-0 md:-mt-2 ${textColor} opacity-80 uppercase text-center`}>
        drinks & food
      </span>
    </div>
  );
}