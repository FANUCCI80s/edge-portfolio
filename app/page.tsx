import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/landing/Hero";
import MarketsPreview from "@/components/landing/MarketsPreview";
import PerformanceSection from "@/components/landing/PerformanceSection";
import WhyEdgePortfolio from "@/components/landing/WhyEdgePortfolio";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050706] text-white">
      <Navbar />

      <Hero />

      <MarketsPreview />

      <PerformanceSection />

      <WhyEdgePortfolio />

      <HowItWorks />

      <Testimonials />

      <FinalCta />

      <Footer />
    </main>
  );
}