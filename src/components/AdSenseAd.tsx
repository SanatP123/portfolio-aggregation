"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseAdProps = {
  slot?: string;
  label: string;
};

const adsenseClient = "ca-pub-1496544894534044";

export default function AdSenseAd({ slot, label }: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const hasPushedRef = useRef(false);

  useEffect(() => {
    if (!slot) return;

    function renderAd() {
      if (hasPushedRef.current || !adRef.current || adRef.current.offsetWidth === 0) return;

      try {
        window.adsbygoogle = window.adsbygoogle ?? [];
        window.adsbygoogle.push({});
        hasPushedRef.current = true;
      } catch (error) {
        console.error("AdSense failed to render:", error);
      }
    }

    renderAd();

    const resizeObserver = new ResizeObserver(renderAd);
    if (adRef.current) {
      resizeObserver.observe(adRef.current);
    }

    window.addEventListener("resize", renderAd);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", renderAd);
    };
  }, [slot]);

  if (!slot) {
    return <div className="hidden min-h-[600px] w-40 min-[1800px]:block" aria-hidden="true" />;
  }

  return (
    <div className="hidden min-h-[600px] w-40 min-[1800px]:block" aria-label={label}>
      <ins
        ref={adRef}
        className="adsbygoogle block min-h-[600px] w-full"
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </div>
  );
}
