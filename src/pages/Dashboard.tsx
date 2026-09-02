import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { OrbitalStats } from "../components/OrbitalStats";
import { ToolsSection } from "../components/ToolsSection";
import { OrbitalStatus } from "../components/OrbitalStatus";
import { RiskEvents } from "../components/RiskEvents";
import { Footer } from "../components/Footer";

export function Dashboard() {
  return (
    <div className="relative min-h-screen bg-bg">
      <Navbar />
      <main>
        <Hero />
        <OrbitalStats />
        <ToolsSection />
        <OrbitalStatus />
        <RiskEvents />
      </main>
      <Footer />
    </div>
  );
}
