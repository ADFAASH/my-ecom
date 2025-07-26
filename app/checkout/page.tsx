// // project2/app/checkout/page.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useCart } from '../../lib/cartUtils';

// export default function Checkout() {
//   const { state, clearCart } = useCart();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [orderComplete, setOrderComplete] = useState(false);
//   const [finalOrderDetails, setFinalOrderDetails] = useState({
//     subtotal: 0,
//     tax: 0,
//     shipping: 0,
//     discountAmount: 0,
//     total: 0,
//     itemCount: 0,
//     orderNumber: '', // NEW: To store the generated order number
//   });
//   const [formData, setFormData] = useState({
//     email: '',
//     firstName: '',
//     lastName: '',
//     address: '',
//     city: '',
//     zipCode: '',
//     country: 'United States',
//     cardNumber: '',
//     expiryDate: '',
//     cvv: '',
//     cardName: ''
//   });

//   // Calculate current order values based on the cart state
//   const currentSubtotal = state.total;
//   const currentTax = currentSubtotal * 0.08;
//   const currentShipping = currentSubtotal > 150 ? 0 : 15;
//   const currentTotal = currentSubtotal + currentTax + currentShipping;

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleNext = () => {
//     if (currentStep < 3) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const saveOrderToLocalStorage = (orderData: any) => {
//     if (typeof window !== 'undefined') { // Ensure localStorage is available
//       const existingOrdersString = localStorage.getItem('lumiere-orders'); /*--------------------------------------------------------------- */
//       let existingOrders = [];
//       try {
//         existingOrders = existingOrdersString ? JSON.parse(existingOrdersString) : [];
//       } catch (error) {
//         console.error('Error parsing existing orders from localStorage:', error);
//         existingOrders = [];
//       }
      
//       existingOrders.push(orderData);
//       localStorage.setItem('lumiere-orders', JSON.stringify(existingOrders)); /*--------------------------------------------------------------- */
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const generatedOrderNumber = `#LUM${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

//     // Capture the final order details BEFORE clearing the cart
//     const orderDetailsToSave = {
//       subtotal: currentSubtotal,
//       tax: currentTax,
//       shipping: currentShipping,
//       discountAmount: 0, // Set this to the actual discount if tracked separately in cart state
//       total: currentTotal,
//       itemCount: state.itemCount,
//       orderNumber: generatedOrderNumber,
//       // Include a snapshot of the cart items and customer info for the order
//       items: state.items,
//       customerName: `${formData.firstName} ${formData.lastName}`,
//       email: formData.email,
//       shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
//       status: 'pending', // Initial status of the new order
//       date: new Date().toISOString().split('T')[0], // Current date (YYYY-MM-DD)
//     };

//     setFinalOrderDetails(orderDetailsToSave); // Update state for display on confirmation page
//     saveOrderToLocalStorage(orderDetailsToSave); // Save to localStorage

//     setOrderComplete(true); // Show confirmation page
//     clearCart(); // Now it's safe to clear the cart after details are captured
//   };

//   if (state.items.length === 0 && !orderComplete) {
//     return (
//       <div className="min-h-screen bg-white">
//         <div className="max-w-4xl mx-auto px-6 py-16">
//           <div className="text-center">
//             <h1 className="text-3xl font-light mb-4">Your Cart is Empty</h1>
//             <p className="text-gray-600 mb-8">Please add items to your cart before checkout.</p>
//             <Link
//               href="/products"
//               className="inline-block bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
//             >
//               Continue Shopping
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (orderComplete) {
//     return (
//       <div className="min-h-screen bg-white">
//         <div className="max-w-4xl mx-auto px-6 py-16">
//           <div className="text-center">
//             <div className="w-24 h-24 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
//               <i className="ri-check-line text-green-600 text-4xl"></i>
//             </div>
//             <h1 className="text-4xl font-light mb-4">Order Confirmed!</h1>
//             <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
//             <p className="text-gray-600 mb-8">Your order confirmation has been sent to your email.</p>

//             <div className="bg-gray-50 p-6 max-w-md mx-auto mb-8">
//               <h3 className="font-semibold mb-4">Order Details</h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Order Number:</span>
//                   <span className="font-mono">{finalOrderDetails.orderNumber}</span> {/* Use generated order number */}
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Total Paid:</span>
//                   <span className="font-semibold">${finalOrderDetails.total.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Estimated Delivery:</span>
//                   <span>3-5 business days</span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link
//                 href="/products"
//                 className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer text-center whitespace-nowrap"
//               >
//                 Continue Shopping
//               </Link>
//               <Link
//                 href="/"
//                 className="border-2 border-gray-300 text-gray-700 px-8 py-3 font-semibold hover:border-gray-400 transition-colors cursor-pointer text-center whitespace-nowrap"
//               >
//                 Back to Home
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="max-w-7xl mx-auto px-6 py-12">
//         <h1 className="text-4xl font-light mb-8">Checkout</h1>

//         {/* Progress Steps */}
//         <div className="flex items-center justify-center mb-12">
//           {[1, 2, 3].map((step) => (
//             <div key={step} className="flex items-center">
//               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
//                 currentStep >= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
//               }`}>
//                 {step}
//               </div>
//               <div className={`mx-4 text-sm ${
//                 currentStep >= step ? 'text-black' : 'text-gray-400'
//               }`}>
//                 {step === 1 ? 'Contact' : step === 2 ? 'Shipping' : 'Payment'}
//               </div>
//               {step < 3 && (
//                 <div className={`w-12 h-0.5 ${
//                   currentStep > step ? 'bg-black' : 'bg-gray-200'
//                 }`}></div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//           {/* Checkout Form */}
//           <div className="lg:col-span-2">
//             <form onSubmit={handleSubmit}>
//               {/* Step 1: Contact Information */}
//               {currentStep === 1 && (
//                 <div>
//                   <h2 className="text-2xl font-light mb-6">Contact Information</h2>
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
//                         <input
//                           type="text"
//                           name="firstName"
//                           value={formData.firstName}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
//                         <input
//                           type="text"
//                           name="lastName"
//                           value={formData.lastName}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Step 2: Shipping Address */}
//               {currentStep === 2 && (
//                 <div>
//                   <h2 className="text-2xl font-light mb-6">Shipping Address</h2>
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
//                       <input
//                         type="text"
//                         name="address"
//                         value={formData.address}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
//                         <input
//                           type="text"
//                           name="city"
//                           value={formData.city}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
//                         <input
//                           type="text"
//                           name="zipCode"
//                           value={formData.zipCode}
//                           onChange={handleInputChange}
//                           className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
//                       <select
//                         name="country"
//                         value={formData.country}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 pr-8"
//                       >
//                         <option value="United States">United States</option>
//                         <option value="Canada">Canada</option>
//                         <option value="United Kingdom">United Kingdom</option>
//                         <option value="Australia">Australia</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Step 3: Payment Information */}
//               {currentStep === 3 && (
//                 <div>
//                   <h2 className="text-2xl font-light mb-6">Payment Information</h2>
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
//                       <input
//                         type="text"
//                         name="cardNumber"
//                         value={formData.cardNumber}
//                         onChange={handleInputChange}
//                         placeholder="1234 5678 9012 3456"
//                         className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                         required
//                       />
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
//                         <input
//                           type="text"
//                           name="expiryDate"
//                           value={formData.expiryDate}
//                           onChange={handleInputChange}
//                           placeholder="MM/YY"
//                           className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
//                         <input
//                           type="text"
//                           name="cvv"
//                           value={formData.cvv}
//                           onChange={handleInputChange}
//                           placeholder="123"
//                           className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
//                       <input
//                         type="text"
//                         name="cardName"
//                         value={formData.cardName}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Navigation Buttons */}
//               <div className="flex justify-between mt-8">
//                 <div>
//                   {currentStep > 1 && (
//                     <button
//                       type="button"
//                       onClick={handleBack}
//                       className="flex items-center px-6 py-3 border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer whitespace-nowrap"
//                     >
//                       <div className="w-4 h-4 flex items-center justify-center mr-2">
//                         <i className="ri-arrow-left-line"></i>
//                       </div>
//                       Back
//                     </button>
//                   )}
//                 </div>
//                 <div>
//                   {currentStep < 3 ? (
//                     <button
//                       type="button"
//                       onClick={handleNext}
//                       className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
//                     >
//                       Continue
//                     </button>
//                   ) : (
//                     <button
//                       type="submit"
//                       className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
//                     >
//                       Complete Order
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </form>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <div className="bg-gray-50 p-6 sticky top-6">
//               <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

//               <div className="space-y-4 mb-6">
//                 {state.items.map((item) => (
//                   <div key={`${item.id}-${item.size}`} className="flex items-center space-x-3">
//                     <div className="w-16 h-20 flex-shrink-0 overflow-hidden bg-white">
//                       <img
//                         src={item.image}
//                         alt={item.name}
//                         className="w-full h-full object-cover object-top"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="text-sm font-medium">{item.name}</h4>
//                       <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
//                       <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="space-y-2 mb-6 text-sm">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span>${currentSubtotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Shipping</span>
//                   <span>{currentShipping === 0 ? 'Free' : `$${currentShipping.toFixed(2)}`}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Tax</span>
//                   <span>${currentTax.toFixed(2)}</span>
//                 </div>
//                 {/* No discount applied logic here, assuming it's handled on cart page state */}
//               </div>

//               <div className="border-t border-gray-200 pt-4">
//                 <div className="flex justify-between text-lg font-semibold">
//                   <span>Total</span>
//                   <span>${currentTotal.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// LastV2Gemini/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cartUtils';
import { createOrder } from '../../lib/api'; // Import the createOrder API function

export default function Checkout() {
  const { state, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [finalOrderDetails, setFinalOrderDetails] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discountAmount: 0,
    total: 0,
    itemCount: 0,
    orderNumber: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false); // New state for loading
  const [orderError, setOrderError] = useState<string | null>(null); // New state for errors

  const currentSubtotal = state.total;
  const currentTax = currentSubtotal * 0.08;
  const currentShipping = currentSubtotal > 150 ? 0 : 15;
  const currentTotal = currentSubtotal + currentTax + currentShipping;

  // Placeholder for promo code logic which is not fully implemented in this file's state
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');

  const promoCodes = {
    'WELCOME10': 0.1,
    'SAVE20': 0.2,
    'LUXURY15': 0.15
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  // REMOVED: saveOrderToLocalStorage function was here. It's no longer needed.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingOrder(true);
    setOrderError(null);

    const generatedOrderNumber = `#LUM${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare order data for the backend API
    const orderDataForBackend = {
      orderNumber: generatedOrderNumber,
      customerName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      items: state.items.map(item => ({ // Ensure items match backend schema
          id: item.id, // The unique item ID including size
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          // inStock is not strictly needed for backend order item, but included if your backend handles it
      })),
      total: currentTotal,
      status: 'pending', // Initial status when placed from checkout
      date: new Date().toISOString(), // Use ISO string for date
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
      subtotal: currentSubtotal,
      tax: currentTax,
      shipping: currentShipping,
      itemCount: state.itemCount,
      discountAmount: discount * currentSubtotal, // Use actual calculated discount
      shipped: false,
      delivered: false,
    };

    try {
      // Send order to backend API using the createOrder function from lib/api.ts
      const createdOrder = await createOrder(orderDataForBackend);

      // Update state for confirmation page using the response from the backend
      setFinalOrderDetails({
        subtotal: createdOrder.subtotal,
        tax: createdOrder.tax,
        shipping: createdOrder.shipping,
        discountAmount: createdOrder.discountAmount,
        total: createdOrder.total,
        itemCount: createdOrder.itemCount,
        orderNumber: createdOrder.orderNumber,
      });

      setOrderComplete(true); // Show confirmation page
      clearCart(); // Clear the cart after successful order placement

    } catch (error: any) {
      console.error('Failed to place order:', error);
      // Display a more user-friendly error message
      setOrderError(error.message || 'An error occurred while placing your order. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-light mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Please add items to your cart before checkout.</p>
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

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-24 h-24 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-6">
              <i className="ri-check-line text-green-600 text-4xl"></i>
            </div>
            <h1 className="text-4xl font-light mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
            <p className="text-gray-600 mb-8">Your order confirmation has been sent to your email.</p>

            <div className="bg-gray-50 p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold mb-4">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-mono">{finalOrderDetails.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-semibold">${finalOrderDetails.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>3-5 business days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer text-center whitespace-nowrap"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 font-semibold hover:border-gray-400 transition-colors cursor-pointer text-center whitespace-nowrap"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <div className={`mx-4 text-sm ${
                currentStep >= step ? 'text-black' : 'text-gray-400'
              }`}>
                {step === 1 ? 'Contact' : step === 2 ? 'Shipping' : 'Payment'}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 ${
                  currentStep > step ? 'bg-black' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Shipping Address</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500 pr-8"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Payment Information</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Submission Error */}
              {orderError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mt-4 text-center">
                  {orderError}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center px-6 py-3 border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-4 h-4 flex items-center justify-center mr-2">
                        <i className="ri-arrow-left-line"></i>
                      </div>
                      Back
                    </button>
                  )}
                </div>
                <div>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isProcessingOrder} // Disable button when processing
                      className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingOrder ? 'Processing...' : 'Complete Order'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center space-x-3">
                    <div className="w-16 h-20 flex-shrink-0 overflow-hidden bg-white">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-600">Size: {item.size}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${currentSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{currentShipping === 0 ? 'Free' : `$${currentShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${currentTax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoApplied})</span>
                    <span>-${(currentSubtotal * discount).toFixed(2)}</span>
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
                  <span>${currentTotal.toFixed(2)}</span>
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