import Navbar from "@/components/navigation/Navbar";
import Hero from "@/components/landing/Hero";
import MarketsPreview from "@/components/landing/MarketsPreview";
import PerformanceSection from "@/components/landing/PerformanceSection";
import WhyEdgePortfolio from "@/components/landing/WhyEdgePortfolio";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import ContactForm from "@/components/landing/ContactForm";
import ActivityNotifications from "@/components/landing/ActivityNotifications";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050806] text-white">
      <Navbar />

      <Hero />

      {/* Recent deposit and withdrawal activity */}
      <ActivityNotifications />

      <MarketsPreview />

      <PerformanceSection />

      <WhyEdgePortfolio />

      <HowItWorks />

      <Testimonials />

      <FAQ />

      <ContactForm />

      <FinalCta />

      <Footer />
    </main>
  );
}