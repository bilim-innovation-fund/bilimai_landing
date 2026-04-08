import { setRequestLocale } from "next-intl/server";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Navigation />
      <Hero />
      <LogoMarquee />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
