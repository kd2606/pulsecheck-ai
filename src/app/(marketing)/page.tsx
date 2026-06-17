import React from 'react';
import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import TrustBar from '@/components/landing/trust-bar';
import DataProblem from '@/components/landing/data-problem';
import FeatureGrid from '@/components/landing/feature-grid';
import PulseShowcase from '@/components/landing/pulse-showcase';
import HowItWorks from '@/components/landing/how-it-works';
import SafetyPrivacy from '@/components/landing/safety-privacy';
import AshaSection from '@/components/landing/asha-section';
import FinalCta from '@/components/landing/final-cta';
import Footer from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar />
      <Hero />
      <TrustBar />
      <DataProblem />
      <FeatureGrid />
      <PulseShowcase />
      <HowItWorks />
      <SafetyPrivacy />
      <AshaSection />
      <FinalCta />
      <Footer />
    </main>
  );
}
