import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faGem,
  faBirthdayCake,
  faTrophy,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const RewardsBanner = () => {
  const rewards = [
    {
      icon: faGift,
      title: "Earn Points",
      description: "Get 10 points for every ৳120 spent",
    },
    {
      icon: faGem,
      title: "Exclusive Deals",
      description: "Member-only discounts & offers",
    },
    {
      icon: faBirthdayCake,
      title: "Birthday Treats",
      description: "Special gifts for your pet's birthday",
    },
    {
      icon: faTrophy,
      title: "VIP Access",
      description: "Early access to new products",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Rewards Card */}
        <div className="bg-gradient-to-r from-[#002A48] to-[#013A60] rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="text-white space-y-4">
              <div className="text-5xl mb-4">
                <FontAwesomeIcon icon={faStar} className="text-[#FFB84C]" />
              </div>
              <h2 className="text-4xl font-bold">Join Puchito Rewards Club</h2>
              <p className="text-lg opacity-90">
                Earn points with every purchase and unlock amazing benefits for
                you and your pet!
              </p>
              <button className="bg-[#FFB84C] text-[#002A48] px-8 py-3 rounded-full font-semibold hover:bg-[#ffcc7a] transition shadow-md mt-4">
                Join Free Today
              </button>
            </div>

            {/* Right Content - Benefits */}
            <div className="grid grid-cols-2 gap-4">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur rounded-xl p-4 text-center hover:bg-white/20 transition"
                >
                  <div className="text-4xl mb-2">
                    <FontAwesomeIcon
                      icon={reward.icon}
                      className="text-[#FFB84C]"
                    />
                  </div>
                  <h4 className="text-white font-bold mb-1">{reward.title}</h4>
                  <p className="text-white/80 text-sm">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#FFB84C]">50K+</div>
            <div className="text-[#555] mt-2">Happy Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#FFB84C]">1M+</div>
            <div className="text-[#555] mt-2">Points Redeemed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#FFB84C]">100+</div>
            <div className="text-[#555] mt-2">Partner Brands</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#FFB84C] flex items-center justify-center gap-1">
              4.9
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div className="text-[#555] mt-2">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsBanner;
