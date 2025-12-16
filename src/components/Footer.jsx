import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faEnvelope as faEnvelopeSolid,
  faMapMarkerAlt,
  faPhone,
  faClock,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebookF,
  faInstagram,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-[#FCEFD5] pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
       

        {/* Main Footer Content - Responsive grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Company Info */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
              <div className="text-2xl sm:text-3xl">
                <FontAwesomeIcon icon={faPaw} className="text-[#FFB84C]" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#002A48]">
                Puchito
              </span>
            </div>
            <p className="text-[#555] mb-4 text-sm sm:text-base">
              Your one-stop shop for everything your pet needs. Quality products
              and services with love.
            </p>
            {/* Social icons - Centered on mobile, left-aligned on tablet+ */}
            <div className="flex space-x-3 justify-center sm:justify-start">
              <a
                href="#"
                className="text-xl sm:text-2xl hover:scale-110 transition text-[#002A48] hover:text-[#FFB84C]"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="#"
                className="text-xl sm:text-2xl hover:scale-110 transition text-[#002A48] hover:text-[#FFB84C]"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href="#"
                className="text-xl sm:text-2xl hover:scale-110 transition text-[#002A48] hover:text-[#FFB84C]"
                aria-label="Twitter"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a
                href="#"
                className="text-xl sm:text-2xl hover:scale-110 transition text-[#002A48] hover:text-[#FFB84C]"
                aria-label="YouTube"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-[#002A48] mb-3 sm:mb-4">
              Shop
            </h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link
                  to="/products"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/dog-products"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  Dog Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cat-products"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  Cat Products
                </Link>
              </li>
              <li>
                <Link
                  to="/accessories"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-[#002A48] mb-3 sm:mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link
                  to="/vet"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  Veterinary Care
                </Link>
              </li>
              <li>
                <Link
                  to="/grooming"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  Pet Grooming
                </Link>
              </li>
              <li>
                <Link
                  to="/training"
                  className="text-[#555] hover:text-[#FFB84C] transition inline-block"
                >
                  Pet Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Centered on mobile, left-aligned on tablet+ */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-[#002A48] mb-3 sm:mb-4">
              Contact Us
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-[#555] text-sm sm:text-base">
              <li className="flex items-start justify-center sm:justify-start">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mr-2 mt-1 text-[#FFB84C] flex-shrink-0"
                />
                <span className="text-left">
                  Kanchan,Green University of Bangladesh
                </span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="mr-2 text-[#FFB84C]"
                />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <FontAwesomeIcon
                  icon={faEnvelopeSolid}
                  className="mr-2 text-[#FFB84C]"
                />
                <span>hello@puchito.com</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mr-2 text-[#FFB84C]"
                />
                <span>Mon-Sat: 9AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Stacks on mobile, horizontal on desktop */}
        <div className="border-t-2 border-[#002A48]/10 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            {/* Copyright text - Responsive sizing */}
            <p className="text-[#555] text-xs sm:text-sm md:text-base text-center md:text-left flex flex-wrap items-center justify-center md:justify-start gap-1">
              © 2025 Puchito. All rights reserved. Made with{" "}
              <FontAwesomeIcon icon={faHeart} className="text-red-500" /> for
              pets.
            </p>
            {/* Footer links - Wrap on very small screens */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
              <Link
                to="/privacy"
                className="text-[#555] hover:text-[#FFB84C] transition whitespace-nowrap"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-[#555] hover:text-[#FFB84C] transition whitespace-nowrap"
              >
                Terms of Service
              </Link>
              <Link
                to="/faq"
                className="text-[#555] hover:text-[#FFB84C] transition whitespace-nowrap"
              >
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
