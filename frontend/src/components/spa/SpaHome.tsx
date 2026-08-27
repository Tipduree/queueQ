"use client";

import { AnnouncementBar } from "@/components/spa/AnnouncementBar";
import { FeatureStrip } from "@/components/spa/FeatureStrip";
import { Footer } from "@/components/spa/Footer";
import { Header } from "@/components/spa/Header";
import { Hero } from "@/components/spa/Hero";
import { HighlightSection } from "@/components/spa/HighlightSection";
import { LanguageProvider } from "@/components/spa/LanguageProvider";
import { LiffResumeBridge } from "@/components/liff/LiffResumeBridge";
import { LineAuthBridge } from "@/components/spa/line/LineAuthBridge";
import { LineFloatButton } from "@/components/spa/LineFloatButton";
import { PopularTreatments } from "@/components/spa/PopularTreatments";
import { QueuePanel } from "@/components/spa/queue/QueuePanel";
import { QueueProvider } from "@/components/spa/queue/QueueProvider";
import { ServicesSection } from "@/components/spa/ServicesSection";
import { SupportSection } from "@/components/spa/SupportSection";
import { TopBar } from "@/components/spa/TopBar";

export type SpaMode = "landing" | "booking";

type SpaHomeProps = {
  /** landing = store info + LINE float; booking = full queue (LIFF) */
  mode?: SpaMode;
};

export function SpaHome({ mode = "landing" }: SpaHomeProps) {
  const isBooking = mode === "booking";

  return (
    <LanguageProvider>
      <QueueProvider>
        <LineAuthBridge />
        {isBooking ? <LiffResumeBridge /> : null}
        <div className="spa spa--ref">
          {isBooking ? null : <AnnouncementBar />}
          <Header mode={mode} />
          <TopBar mode={mode} />
          <Hero showBookingCard />
          {isBooking ? null : <FeatureStrip />}
          <SupportSection />
          <HighlightSection />
          <ServicesSection mode={mode} />
          <PopularTreatments mode={mode} />
          <Footer mode={mode} />
          {!isBooking ? <LineFloatButton /> : null}
          <QueuePanel />
        </div>
      </QueueProvider>
    </LanguageProvider>
  );
}
