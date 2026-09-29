import React from 'react';

export default function EmergencyMarquee() {
  const item = (
    <div className="inline-flex items-center gap-2">
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      <span className="font-bold tracking-widest text-white">EMERGENCY SOS</span>
      <span className="opacity-60">—</span>
      <span className="font-medium tracking-normal text-white/95">+1 (302) 988-7308</span>
      <span className="opacity-40 ml-2">• 24/7 Rapid Trauma Dispatch</span>
    </div>
  );

  return (
    <a
      href="tel:+13029887308"
      className="fixed top-0 left-0 right-0 w-full z-[100] h-7 bg-error text-white flex items-center overflow-hidden no-underline cursor-pointer select-none shadow-sm transition-colors hover:bg-[#991b1b]"
      aria-label="Emergency SOS: Call +1 (302) 988-7308"
      title="Click to dial 24/7 Emergency SOS Helpline"
    >
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap font-headline-sm text-xs font-medium tracking-wider text-white/95">
        {item}
        {item}
        {item}
        {item}
        {item}
        {item}
      </div>
    </a>
  );
}
