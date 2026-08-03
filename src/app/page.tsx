import Landing from "@/components/landing/Landing";

export default function HomePage() {
  return <Landing copyrightYear={new Date().getUTCFullYear()} />;
}
