import HeroBanner from "../components/HeroBanner";
import ProductSection from "../components/ProductSection";
import ServiceBooking from "../components/ServiceBooking";
import CommunitySection from "../components/CommunitySection";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-28">
        <HeroBanner />
        <ProductSection />
        {/* Static Promo / Info Section */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="bg-gradient-to-r from-[#F7F9FB] to-white rounded-2xl p-8 shadow-sm">
            <div className="md:flex md:items-center md:justify-between gap-6">
              <div className="md:flex-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#002A48] mb-3">
                  Quality Care & Premium Products
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Handpicked items, trusted veterinary services, and fast
                  delivery — everything your pets need in one place. Shop with
                  confidence and enjoy special offers every week.
                </p>
              </div>

              <div className="mt-6 md:mt-0 md:w-1/3">
                <a
                  href="/products"
                  className="inline-block w-full text-center py-3 px-4 bg-[#002A48] text-white font-semibold rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition-colors"
                >
                  Browse Products
                </a>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="text-3xl text-[#FFB84C]">🚚</div>
                <div>
                  <h4 className="font-semibold text-[#002A48]">
                    Free & Fast Shipping
                  </h4>
                  <p className="text-sm text-gray-500">
                    On orders over BDT 1500 across the country.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="text-3xl text-[#FFB84C]">💬</div>
                <div>
                  <h4 className="font-semibold text-[#002A48]">
                    24/7 Customer Support
                  </h4>
                  <p className="text-sm text-gray-500">
                    Phone, chat and email support for any order or service.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-start gap-4">
                <div className="text-3xl text-[#FFB84C]">🩺</div>
                <div>
                  <h4 className="font-semibold text-[#002A48]">
                    Vet-Verified Products
                  </h4>
                  <p className="text-sm text-gray-500">
                    Curated and recommended by certified veterinarians.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <ServiceBooking />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
