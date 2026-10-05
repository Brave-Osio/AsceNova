import HeroSection from '../../features/landing/components/HeroSection';
import FeaturesSection from '../../features/landing/components/FeaturesSection';
import HowItWorksSection from '../../features/landing/components/HowItWorksSection';
import CtaSection from '../../features/landing/components/CtaSection';
import AppDownloadSection from '../../features/landing/components/AppDownloadSection';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <AppDownloadSection />
    </>
  );
}
