import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { formatBdt } from "../utils/currency";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item._id.toString(), newQuantity);
    }
  };

  const itemPrice = item.priceBDT || item.price || 0;
  const itemSubtotal = itemPrice * item.quantity;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=Product";
            }}
          />
        </div>

        {/* Product Details */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-[#002A48] mb-2 line-clamp-2">
            {item.productName}
          </h3>
          <p className="text-2xl font-bold text-[#FFB84C]">
            {formatBdt(itemPrice)}
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-[#FFB84C] hover:text-white transition-all duration-300 flex items-center justify-center"
            disabled={item.quantity <= 1}
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>

          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            className="w-16 h-10 text-center border-2 border-gray-200 rounded-lg font-semibold text-[#002A48] focus:border-[#FFB84C] focus:outline-none"
          />

          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-[#FFB84C] hover:text-white transition-all duration-300 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[100px]">
          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
          <p className="text-xl font-bold text-[#002A48]">
            {formatBdt(itemSubtotal)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item._id.toString())}
          className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all duration-300 flex items-center justify-center"
          title="Remove item"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
