// project2/app/cart/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cartUtils';

export default function Cart() {
  const { state, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');

  const promoCodes = {
    'WELCOME10': 0.1,
    'SAVE20': 0.2,
    'LUXURY15': 0.15
  };

  const subtotal = state.total;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 150 ? 0 : 15;
  const discountAmount = subtotal * discount;
  const total = subtotal + tax + shipping - discountAmount;

  const handlePromoCode = () => {
    const upperPromo = promoCode.toUpperCase();
    if (promoCodes[upperPromo as keyof typeof promoCodes]) {
      setDiscount(promoCodes[upperPromo as keyof typeof promoCodes]);
      setPromoApplied(upperPromo);
      setPromoCode('');
    }
  };

  const removePromo = () => {
    setDiscount(0);
    setPromoApplied('');
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-6">
              <i className="ri-shopping-bag-line text-gray-400 text-4xl"></i>
            </div>
            <h1 className="text-3xl font-light mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Discover our exquisite collection of luxury fragrances and find your signature scent.
            </p>
            <Link 
              href="/products"
              className="inline-block bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 border-b border-gray-100 pb-6"> {/* Corrected key to item.id */}
                  <div className="w-24 h-32 flex-shrink-0 overflow-hidden bg-gray-50">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">Size: {item.size}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Decrease quantity */}
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                        >
                          <i className="ri-subtract-line text-sm"></i>
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        {/* Increase quantity */}
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                        >
                          <i className="ri-add-line text-sm"></i>
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        {/* Remove from cart */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <Link 
                href="/products"
                className="inline-flex items-center text-black hover:text-gray-600 transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-arrow-left-line"></i>
                </div>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoApplied})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-400 text-sm"
                  />
                  <button
                    onClick={handlePromoCode}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>Code {promoApplied} applied</span>
                    <button
                      onClick={removePromo}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Try: WELCOME10, SAVE20, LUXURY15
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="block w-full bg-black text-white text-center py-4 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className="ri-shield-check-line"></i>
                    </div>
                    Secure Checkout
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 flex items-center justify-center mr-1">
                      <i className="ri-truck-line"></i>
                    </div>
                    Free Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}