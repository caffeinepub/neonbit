import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AIEcosystem from "./components/AIEcosystem";
import AdminPanel from "./components/AdminPanel";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import HowToBuy from "./components/HowToBuy";
import LiveTicker from "./components/LiveTicker";
import MarketOverview from "./components/MarketOverview";
import MarketPanel from "./components/MarketPanel";
import MarketStats from "./components/MarketStats";
import Navbar from "./components/Navbar";
import PriceChart from "./components/PriceChart";
import SetupGuide from "./components/SetupGuide";
import TokenInfo from "./components/TokenInfo";
import TrendingHolders from "./components/TrendingHolders";
import WalletPanel from "./components/WalletPanel";

const queryClient = new QueryClient();

function AppContent() {
  const [adminOpen, setAdminOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

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
        onWalletClick={() => setWalletOpen(true)}
        onSetupClick={() => setSetupOpen(true)}
        onMarketClick={() => setMarketOpen(true)}
      />

      <main>
        <HeroSection />
        <LiveTicker />
        <MarketStats />
        <TrendingHolders />
        <AIEcosystem />
        <PriceChart />
        <TokenInfo />
        <HowToBuy />
        <MarketOverview />
      </main>

      <Footer onAdminClick={() => setAdminOpen(true)} />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
      <WalletPanel open={walletOpen} onClose={() => setWalletOpen(false)} />
      <SetupGuide open={setupOpen} onClose={() => setSetupOpen(false)} />
      <MarketPanel open={marketOpen} onClose={() => setMarketOpen(false)} />
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
