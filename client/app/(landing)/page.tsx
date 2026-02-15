// app/(landing)/page.tsx
import { Suspense } from "react";
import dynamic from "next/dynamic";

import Navbar from "./components/navbar";
import Hero from "./components/hero";
import { FeaturesSection } from "./components/feature";
import { Footer } from "./components/footer";

// Use dynamic imports for heavier components
const IntegrationsSection = dynamic(
  () =>
    import("./components/integration").then((mod) => ({
      default: mod.IntegrationsSection,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 w-full bg-gray-50" />,
  },
);

const TestimonialsSection = dynamic(
  () =>
    import("./components/testimonial").then((mod) => ({
      default: mod.TestimonialsSection,
    })),
  {
    ssr: true,
    loading: () => <div className="h-96 w-full bg-gray-50" />,
  },
);

export default function LandingPage() {
  return (
    <main>
      {/* Always visible components */}
      <Navbar />
      <Hero />

      <FeaturesSection />

      {/* Less critical content - load after initial view */}
      <Suspense fallback={<div className="h-96 w-full bg-gray-50" />}>
        <IntegrationsSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 w-full bg-gray-50" />}>
        <TestimonialsSection />
      </Suspense>

      <Footer />
    </main>
  );
}
