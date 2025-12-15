import { Link } from "react-router-dom";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faPaw,
  faStar,
  faShoppingBag,
  faCalendarAlt,
  faGift,
  faFootball,
} from "@fortawesome/free-solid-svg-icons";

const HeroBanner = () => {
  return (
    <section
      className="relative bg-gradient-to-br from-[#FCEFD5] via-[#fff5e6] to-[#FCEFD5] overflow-hidden"
      style={{
        backgroundImage: "url('/petbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Floating Background Elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float">
        <FontAwesomeIcon icon={faPaw} className="text-[#FFB84C]" />
      </div>
      <div className="absolute top-40 right-20 text-5xl opacity-20 animate-float-delayed">
        <FontAwesomeIcon icon={faFootball} className="text-[#002A48]" />
      </div>
      <div className="absolute bottom-20 left-40 text-4xl opacity-20 animate-float">
        <FontAwesomeIcon icon={faHeart} className="text-[#FFB84C]" />
      </div>

      {/* Responsive container: padding adjusts for mobile, tablet, desktop */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-28 relative">
        {/* Grid: single column on mobile, 2 columns on medium+ screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Content - Responsive spacing and text sizing */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fadeInLeft">
            {/* Badge - Adjusts size on mobile */}
            <div className="inline-flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md">
              <FontAwesomeIcon
                icon={faStar}
                className="text-[#FFB84C] text-sm sm:text-base"
              />
              <span className="text-xs sm:text-sm font-semibold text-[#002A48]">
                Trusted by 50,000+ Pet Parents
              </span>
            </div>

            {/* Heading - Responsive text sizing: smaller on mobile, larger on desktop */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#002A48] leading-tight">
              Everything Your Pet{" "}
              <span className="text-[#FFB84C] relative inline-block">
                Needs
              </span>{" "}
              & Loves
            </h1>

            {/* Description - Adjusts text size and line height for readability */}
            <p className="text-base sm:text-lg md:text-xl text-[#555] leading-relaxed max-w-xl">
              Premium products, expert veterinary services, and a loving
              community for your furry friends. From nutritious food to
              professional grooming—we've got everything covered!{" "}
              <FontAwesomeIcon icon={faPaw} className="text-[#FFB84C]" />
            </p>

            {/* Buttons - Stack on mobile, side-by-side on tablet+ */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                to="/products"
                className="group relative bg-[#002A48] text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full font-bold hover:bg-[#013A60] transition-all shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Shop Now <FontAwesomeIcon icon={faShoppingBag} />
              </Link>
              <Link
                to="/services"
                className="bg-white text-[#002A48] border-2 sm:border-3 border-[#002A48] px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-full font-bold hover:bg-[#002A48] hover:text-white transition-all shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Book Services <FontAwesomeIcon icon={faCalendarAlt} />
              </Link>
            </div>

            {/* Trust Indicators - Grid layout for better mobile spacing */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 border-t-2 border-[#002A48]/10">
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-[#FFB84C] flex items-center justify-center sm:justify-start gap-1">
                  4.9
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-lg sm:text-2xl"
                  />
                </div>
                <div className="text-xs sm:text-sm text-[#555] mt-1">
                  Customer Rating
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-[#FFB84C]">
                  10K+
                </div>
                <div className="text-xs sm:text-sm text-[#555] mt-1">
                  Products
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-[#FFB84C]">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-[#555] mt-1">
                  Support
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual - Hidden on small screens, shown on md+ */}
          <div className="relative animate-fadeInRight mt-8 md:mt-0">
            {/* Main Card - Responsive height and padding */}
            <div className="relative bg-gradient-to-br from-white to-[#f8f9fa] rounded-2xl sm:rounded-3xl shadow-2xl p-0 overflow-hidden transform hover:scale-105 transition-transform duration-500">
              {/* Image - Height adjusts for different screen sizes */}
              <img
                src="/petb.jpg"
                alt="Pets banner"
                className="w-full h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 object-cover"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

              {/* Floating Badge - Responsive sizing and positioning */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 bg-[#FFB84C] text-[#002A48] px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full font-bold shadow-lg animate-bounce flex items-center gap-1 sm:gap-2 text-xs sm:text-sm lg:text-base">
                <FontAwesomeIcon icon={faGift} /> New Arrivals
              </div>

              {/* Bottom text - Responsive sizing */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 lg:bottom-6 lg:left-6 text-white">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">
                  New Arrivals
                </h3>
                <p className="text-xs sm:text-sm md:text-base">
                  Treats, toys and more for your companion
                </p>
              </div>
            </div>

            {/* Decorative Floating Elements - Hidden on mobile, shown on md+ for cleaner mobile view */}
            <div className="hidden md:block absolute -top-4 lg:-top-6 -right-4 lg:-right-6 bg-[#002A48] text-white w-14 h-14 lg:w-20 lg:h-20 rounded-full flex items-center justify-center text-2xl lg:text-3xl shadow-xl animate-spin-slow">
              <FontAwesomeIcon icon={faPaw} />
            </div>
            <div className="hidden md:block absolute -bottom-4 lg:-bottom-6 -left-4 lg:-left-6 bg-[#FFB84C] text-[#002A48] w-16 h-16 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-3xl lg:text-4xl shadow-xl animate-bounce-slow">
              <FontAwesomeIcon icon={faFootball} />
            </div>
            <div className="hidden lg:block absolute top-1/2 -right-6 lg:-right-8 bg-white w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-xl lg:text-2xl shadow-lg animate-pulse">
              <FontAwesomeIcon icon={faHeart} className="text-[#FFB84C]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
