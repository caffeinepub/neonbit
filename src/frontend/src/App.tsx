import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HowToBuy from "./components/HowToBuy";
import LiveTicker from "./components/LiveTicker";
import MarketOverview from "./components/MarketOverview";
import MarketStats from "./components/MarketStats";
import Navbar from "./components/Navbar";
import PriceChart from "./components/PriceChart";

const queryClient = new QueryClient();

function AppContent() {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0B0F14 0%, #0D1118 100%)",
      }}
    >
      <Navbar
        onGetStarted={() =>
          document
            .getElementById("learn")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        onAdminClick={() => setAdminOpen(true)}
      />

      <main>
        <HeroSection />
        <LiveTicker />
        <MarketStats />
        <PriceChart />
        <HowToBuy />
        <MarketOverview />
      </main>

      <Footer onAdminClick={() => setAdminOpen(true)} />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
