"use client";

import { Footer } from "@/components/spa/Footer";
import { Header } from "@/components/spa/Header";
import { Hero } from "@/components/spa/Hero";
import { HighlightSection } from "@/components/spa/HighlightSection";
import { LanguageProvider } from "@/components/spa/LanguageProvider";
import { LineFloatButton } from "@/components/spa/LineFloatButton";
import { PopularTreatments } from "@/components/spa/PopularTreatments";
import { QueuePanel } from "@/components/spa/queue/QueuePanel";
import { QueueProvider } from "@/components/spa/queue/QueueProvider";
import { ServicesSection } from "@/components/spa/ServicesSection";
import { SupportSection } from "@/components/spa/SupportSection";
import { TopBar } from "@/components/spa/TopBar";

export function SpaHome() {
  return (
    <LanguageProvider>
      <QueueProvider>
        <div className="spa spa--ref">
          <TopBar />
          <Header />
          <Hero />
          <SupportSection />
          <HighlightSection />
          <ServicesSection />
          <PopularTreatments />
          <Footer />
          <LineFloatButton />
          <QueuePanel />
        </div>
      </QueueProvider>
    </LanguageProvider>
  );
}
