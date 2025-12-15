import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faShoppingBag,
  faTruck,
  faCreditCard,
  faUndo,
  faEnvelope,
  faPhone,
  faComments,
  faTimes,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const CustomerHelp = ({ isOpen, onClose }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      category: "Orders & Shopping",
      icon: faShoppingBag,
      questions: [
        {
          q: "How do I place an order?",
          a: "Browse products, add items to your cart, proceed to checkout, fill in your shipping details, and complete payment securely through our payment gateway.",
        },
        {
          q: "Can I modify my order after placing it?",
          a: "Orders can be modified within 1 hour of placement. Please contact us immediately via email or phone to request changes.",
        },
        {
          q: "How do I track my order?",
          a: "Go to My Account → Orders to view all your orders with real-time tracking information. You'll also receive email updates when your order status changes.",
        },
      ],
    },
    {
      category: "Shipping & Delivery",
      icon: faTruck,
      questions: [
        {
          q: "What are the shipping charges?",
          a: "Shipping is FREE for orders above ৳12,000. For orders below ৳12,000, a flat shipping fee of ৳600 applies.",
        },
        {
          q: "How long does delivery take?",
          a: "Standard delivery takes 3-5 business days within major cities and 5-7 business days for other areas. Express delivery options are available at checkout.",
        },
        {
          q: "Do you deliver nationwide?",
          a: "Yes, we deliver to all major cities and most areas across the country. Enter your zip code at checkout to confirm delivery availability.",
        },
      ],
    },
    {
      category: "Payment & Pricing",
      icon: faCreditCard,
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment gateway powered by Stripe.",
        },
        {
          q: "Is my payment information secure?",
          a: "Yes! We use industry-standard encryption and PCI-compliant payment processing. Your card details are never stored on our servers.",
        },
        {
          q: "Can I use discount coupons?",
          a: "Yes! Enter your coupon code during checkout. Discount will be applied automatically. Check our Rewards page for available offers.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      icon: faUndo,
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 7-day return policy for unopened and unused products. Pet food items cannot be returned once opened for safety reasons.",
        },
        {
          q: "How do I request a refund?",
          a: "Contact our support team with your order number and reason for return. Once approved, ship the product back to us. Refunds are processed within 5-7 business days.",
        },
        {
          q: "Who pays for return shipping?",
          a: "For defective or damaged products, we cover return shipping. For other returns, customers are responsible for return shipping costs.",
        },
      ],
    },
    {
      category: "Veterinary Services",
      icon: faComments,
      questions: [
        {
          q: "How do I book a veterinary appointment?",
          a: "Go to Services, browse verified veterinarians, select your preferred doctor, choose a date and time, then complete the booking with payment.",
        },
        {
          q: "Are your veterinarians verified?",
          a: "Yes! All veterinarians on our platform are verified by our admin team. We check credentials, licenses, and qualifications before approval.",
        },
        {
          q: "What if I need to cancel an appointment?",
          a: "Contact us at least 24 hours before your appointment for cancellation. Refunds are processed according to our cancellation policy.",
        },
        {
          q: "How do online consultations work?",
          a: "After booking, you'll receive a Google Meet link via email. Join the meeting at your scheduled time to consult with the veterinarian online.",
        },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002A48] to-[#004080] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl" />
            <div>
              <h2 className="text-2xl font-bold">Customer Help Center</h2>
              <p className="text-sm text-blue-100">
                We're here to help! Find answers to common questions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            aria-label="Close help center"
          >
            <FontAwesomeIcon icon={faTimes} className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Quick Contact Section */}
          <div className="bg-gradient-to-r from-[#FCEFD5] to-[#FFE8B8] rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-[#002A48] mb-4">
              Need Immediate Assistance?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-2xl text-[#FFB84C]"
                />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Email Us
                  </p>
                  <p className="text-sm font-bold text-[#002A48]">
                    support@puchito.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-2xl text-[#FFB84C]"
                />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Call Us</p>
                  <p className="text-sm font-bold text-[#002A48]">
                    +880 1234-567890
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                <FontAwesomeIcon
                  icon={faComments}
                  className="text-2xl text-[#FFB84C]"
                />
                <div>
                  <p className="text-xs text-gray-600 font-semibold">
                    Live Chat
                  </p>
                  <p className="text-sm font-bold text-[#002A48]">
                    Mon-Fri, 9AM-6PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-6">
            {faqs.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-xl text-[#FFB84C]"
                    />
                    <h3 className="text-lg font-bold text-[#002A48]">
                      {category.category}
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {category.questions.map((faq, faqIndex) => {
                    const faqId = `${categoryIndex}-${faqIndex}`;
                    const isOpen = openFaq === faqId;

                    return (
                      <div key={faqIndex}>
                        <button
                          onClick={() => toggleFaq(faqId)}
                          className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                        >
                          <span className="font-semibold text-[#002A48]">
                            {faq.q}
                          </span>
                          <FontAwesomeIcon
                            icon={isOpen ? faChevronUp : faChevronDown}
                            className="text-[#FFB84C] flex-shrink-0"
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 py-4 bg-blue-50 text-gray-700 leading-relaxed border-t border-blue-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-6 bg-gradient-to-r from-[#002A48] to-[#004080] text-white rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
            <p className="text-blue-100 mb-4">
              Our support team is available Monday to Friday, 9:00 AM - 6:00 PM
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:support@puchito.com"
                className="bg-[#FFB84C] text-[#002A48] px-6 py-3 rounded-full font-semibold hover:bg-[#FFA500] transition-colors"
              >
                Send Email
              </a>
              <a
                href="tel:+8801234567890"
                className="bg-white text-[#002A48] px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            For account-specific inquiries, please log in to access your
            dashboard or visit our{" "}
            <a
              href="/community"
              className="text-[#FFB84C] hover:underline font-semibold"
            >
              Community Page
            </a>{" "}
            for helpful articles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerHelp;
