"use client";

import { AnnouncementBar } from "@/components/spa/AnnouncementBar";
import { FeatureStrip } from "@/components/spa/FeatureStrip";
import { Footer } from "@/components/spa/Footer";
import { Header } from "@/components/spa/Header";
import { Hero } from "@/components/spa/Hero";
import { LanguageProvider } from "@/components/spa/LanguageProvider";
import { LineFloatButton } from "@/components/spa/LineFloatButton";
import { PopularTreatments } from "@/components/spa/PopularTreatments";
import { QueuePanel } from "@/components/spa/queue/QueuePanel";
import { QueueProvider } from "@/components/spa/queue/QueueProvider";
import { ServicesSection } from "@/components/spa/ServicesSection";

export function SpaHome() {
  return (
    <LanguageProvider>
      <QueueProvider>
        <div className="spa">
          <AnnouncementBar />
          <Header />
          <Hero />
          <FeatureStrip />
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
