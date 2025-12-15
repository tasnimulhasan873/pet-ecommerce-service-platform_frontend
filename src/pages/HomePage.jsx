import HeroBanner from "../components/HeroBanner";
import ProductSection from "../components/ProductSection";
import ServiceBooking from "../components/ServiceBooking";
import RewardsBanner from "../components/RewardsBanner";
import CommunitySection from "../components/CommunitySection";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-28">
        <HeroBanner />
        <ProductSection />
        <ServiceBooking />
        <RewardsBanner />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
