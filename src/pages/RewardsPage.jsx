import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicketAlt,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const RewardsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/coupons");
      if (response.data.success) {
        // Only show active coupons that haven't expired
        const activeCoupons = response.data.coupons.filter(
          (coupon) =>
            coupon.isActive &&
            (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())
        );
        setCoupons(activeCoupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="container mx-auto px-6 py-12">
        <div>
          <h2 className="text-2xl font-bold text-[#002A48] mb-6 text-center">
            <FontAwesomeIcon icon={faTicketAlt} className="mr-2" />
            Available Coupons & Rewards
          </h2>

          {coupons.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎟️</div>
              <p className="text-gray-500 text-lg mb-2">
                No active coupons available right now
              </p>
              <p className="text-gray-400">
                Check back later for exciting offers!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border-2 border-[#FFB84C] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#FFB84C] text-[#002A48] px-4 py-2 rounded-lg font-bold text-lg">
                      {coupon.code}
                    </div>
                    <FontAwesomeIcon
                      icon={faTicketAlt}
                      className="text-3xl text-[#FFB84C]"
                    />
                  </div>

                  <h3 className="font-bold text-xl text-[#002A48] mb-2">
                    {coupon.type === "percentage"
                      ? `${coupon.value}% OFF`
                      : `$${coupon.value} OFF`}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    {coupon.description || "Special discount for you!"}
                  </p>

                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    {coupon.minPurchase && (
                      <p>
                        <span className="font-semibold">Min Purchase:</span> $
                        {coupon.minPurchase}
                      </p>
                    )}
                    {coupon.expiryDate && (
                      <p>
                        <span className="font-semibold">Valid Until:</span>{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                    {coupon.usageLimit && (
                      <p>
                        <span className="font-semibold">Remaining Uses:</span>{" "}
                        {coupon.usageLimit - (coupon.usedCount || 0)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="bg-[#002A48] text-white px-6 py-3 rounded-full hover:bg-[#FFB84C] hover:text-[#002A48] transition-all duration-300 w-full font-semibold flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon
                      icon={copiedCode === coupon.code ? faCheck : faCopy}
                    />
                    {copiedCode === coupon.code ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
