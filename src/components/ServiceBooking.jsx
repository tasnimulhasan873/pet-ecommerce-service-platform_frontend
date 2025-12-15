import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
  faHospital,
  faCut,
  faGraduationCap,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

const ServiceBooking = () => {
  const navigate = useNavigate();
  const services = [
    {
      id: 1,
      title: "Veterinary Care",
      icon: faHospital,
      description:
        "Expert medical care for your pets. Regular checkups, vaccinations, and emergency services.",
      features: [
        "Health Checkups",
        "Vaccinations",
        "Emergency Care",
        "Surgery",
      ],
      link: "/services",
    },
    {
      id: 2,
      title: "Pet Grooming",
      icon: faCut,
      description:
        "Professional grooming services to keep your pet looking and feeling their best.",
      features: [
        "Bath & Brush",
        "Nail Trimming",
        "Hair Styling",
        "Spa Treatment",
      ],
      link: "/services",
    },
    {
      id: 3,
      title: "Pet Training",
      icon: faGraduationCap,
      description:
        "Expert trainers to help your pet learn good behavior and fun tricks.",
      features: [
        "Basic Obedience",
        "Advanced Training",
        "Behavior Correction",
        "Puppy Classes",
      ],
      link: "/services",
    },
  ];

  return (
    <section className="bg-[#FCEFD5] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#002A48] mb-4">
            Professional Pet Services
          </h2>
          <p className="text-lg text-[#555]">
            Book expert care for your beloved companions
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8"
            >
              {/* Service Icon */}
              <div className="text-6xl mb-4 text-center">
                <FontAwesomeIcon
                  icon={service.icon}
                  className="text-[#FFB84C]"
                />
              </div>

              {/* Service Title */}
              <h3 className="text-2xl font-bold text-[#002A48] mb-3 text-center">
                {service.title}
              </h3>

              {/* Service Description */}
              <p className="text-[#555] mb-6 text-center leading-relaxed">
                {service.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-[#555]">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-[#FFB84C] mr-2"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Book Button */}
              <button
                onClick={() => navigate(service.link)}
                className="w-full bg-[#002A48] text-white py-3 rounded-full font-semibold hover:bg-[#013A60] transition"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceBooking;
