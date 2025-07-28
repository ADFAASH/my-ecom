'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cartUtils';
import { createOrder } from '../../lib/api';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe.js outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  cardNumber: string; // These are handled by PaymentElement, but keep for consistency with old form
  expiryDate: string; // These are handled by PaymentElement, but keep for consistency with old form
  cvv: string;        // These are handled by PaymentElement, but keep for consistency with old form
  cardName: string;   // This needs to be captured for the customerName
}

function CheckoutForm({
  totalPriceForDisplay,
  formData,
  setOrderComplete,
  setFinalOrderDetails,
  clearCart
}: {
  totalPriceForDisplay: number;
  formData: CheckoutFormData;
  setOrderComplete: (complete: boolean) => void;
  setFinalOrderDetails: (details: any) => void;
  clearCart: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { state } = useCart();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'failure'>('idle');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setOrderError(null);

    // Validate form data before proceeding with Stripe payment
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.zipCode || !formData.country) {
      setMessage("Please fill in all contact and shipping details.");
      setIsLoading(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout?payment_success=true`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      if (stripeError.type === "card_error" || stripeError.type === "validation_error") {
        setMessage(stripeError.message || "Card error occurred.");
      } else {
        setMessage("An unexpected error occurred during payment.");
      }
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage("Payment succeeded!");

      const generatedOrderNumber = `#LUM${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderDataForBackend = {
        orderNumber: generatedOrderNumber,
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        items: state.items.map(item => ({
          id: item.id, // Assuming item.id is the product's MongoDB _id
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        total: parseFloat(totalPriceForDisplay.toFixed(2)),
        status: 'pending',
        date: new Date().toISOString(),
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}, ${formData.country}`,
        subtotal: parseFloat((totalPriceForDisplay / 1.08).toFixed(2)), // Example: assuming 8% tax was included in totalPriceForDisplay
        tax: parseFloat((totalPriceForDisplay - (totalPriceForDisplay / 1.08)).toFixed(2)),
        shipping: totalPriceForDisplay > 150 ? 0 : 15, // Example shipping logic
        itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
        discountAmount: 0, // Implement discount logic if you have it
        shipped: false,
        delivered: false,
        paymentIntentId: paymentIntent.id,
      };

      try {
        const newOrder = await createOrder(orderDataForBackend);
        setFinalOrderDetails({
          subtotal: newOrder.subtotal,
          tax: newOrder.tax,
          shipping: newOrder.shipping,
          discountAmount: newOrder.discountAmount,
          total: newOrder.total,
          itemCount: newOrder.itemCount,
          orderNumber: newOrder.orderNumber,
        });
        setOrderComplete(true);
        clearCart();
        setOrderStatus('success');
      } catch (err: any) {
        console.error('Error placing order after payment:', err);
        setOrderError(err.message || 'Failed to complete order after successful payment.');
        setOrderStatus('failure');
      }
    } else {
      setMessage(`Payment status: ${paymentIntent?.status || 'failed'}. Something went wrong.`);
      setOrderStatus('failure');
    }

    setIsLoading(false);
  };

  if (orderStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-green-500 text-6xl mb-4">✔</div>
        <h1 className="text-3xl font-semibold mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-700">Thank you for your purchase.</p>
        <p className="text-base text-gray-500 mb-6">Your order confirmation has been sent to your email.</p>
        <div className="flex space-x-4">
          <Link href="/products" className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors cursor-pointer">
            Continue Shopping
          </Link>
          <Link href="/" className="border border-gray-300 px-6 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (orderStatus === 'failure') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="text-red-500 text-6xl mb-4">✖</div>
        <h1 className="text-3xl font-semibold mb-2">Order Failed!</h1>
        <p className="text-lg text-gray-700 mb-4">{orderError || "There was an issue processing your order."}</p>
        <button
          onClick={() => setOrderStatus('idle')}
          className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      {message && <div id="payment-message" className="text-red-500 mt-4">{message}</div>}
      <button disabled={isLoading || !stripe || !elements} className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? "Processing Payment..." : `Complete Order - $${totalPriceForDisplay.toFixed(2)}`}
      </button>
    </form>
  );
}


export default function CheckoutPage() {
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

  const [formData, setFormData] = useState<CheckoutFormData>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const currentSubtotal = state.total;
  const currentTax = currentSubtotal * 0.08;
  const currentShipping = currentSubtotal > 150 ? 0 : 15;
  const currentTotal = currentSubtotal + currentTax + currentShipping;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeElementsOptions, setStripeElementsOptions] = useState<StripeElementsOptions | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientSecret() {
      if (currentTotal <= 0) {
        setFetchError("Cart total is zero, cannot proceed with payment.");
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Math.round(currentTotal * 100) }), // Amount in cents
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setStripeElementsOptions({
          clientSecret: data.clientSecret,
          appearance: {
            theme: 'stripe',
            labels: 'floating',
          },
        });
      } catch (error: any) {
        console.error('Error fetching client secret:', error);
        setFetchError(error.message || 'Could not set up payment. Please refresh.');
      }
    }

    if (!clientSecret) {
      fetchClientSecret();
    }
  }, [currentTotal, clientSecret]);

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Your cart is empty. Add some items to checkout!</p>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`mx-4 text-sm ${
              currentStep >= 1 ? 'text-black' : 'text-gray-400'
            }`}>
              Contact
            </div>
            <div className={`w-12 h-0.5 ${
              currentStep > 1 ? 'bg-black' : 'bg-gray-200'
            }`}></div>
          </div>

          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`mx-4 text-sm ${
              currentStep >= 2 ? 'text-black' : 'text-gray-400'
            }`}>
              Shipping
            </div>
            <div className={`w-12 h-0.5 ${
              currentStep > 2 ? 'bg-black' : 'bg-gray-200'
            }`}></div>
          </div>

          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <div className={`mx-4 text-sm ${
              currentStep >= 3 ? 'text-black' : 'text-gray-400'
            }`}>
              Payment
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Checkout Form Steps */}
          <div>
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
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
                <div className="flex justify-end mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.email && formData.firstName && formData.lastName) {
                        setCurrentStep(2);
                      } else {
                        alert("Please fill in all contact details.");
                      }
                    }}
                    className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Continue to Shipping
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
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
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center px-6 py-3 border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-2"></i> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.address && formData.city && formData.zipCode && formData.country) {
                        setCurrentStep(3);
                      } else {
                        alert("Please fill in all shipping details.");
                      }
                    }}
                    className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                {fetchError ? (
                  <div className="text-red-600 text-center p-4 border border-red-300 bg-red-50 rounded-md">
                    {fetchError}
                  </div>
                ) : clientSecret && stripeElementsOptions ? (
                  <Elements options={stripeElementsOptions} stripe={stripePromise}>
                    <CheckoutForm
                      totalPriceForDisplay={currentTotal}
                      formData={formData}
                      setOrderComplete={setOrderComplete}
                      setFinalOrderDetails={setFinalOrderDetails}
                      clearCart={clearCart}
                    />
                  </Elements>
                ) : (
                  <div className="text-center text-gray-500 p-4">Loading payment options...</div>
                )}
                 <div className="flex justify-start mt-8">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center px-6 py-3 border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-left-line mr-2"></i> Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {state.items.map(item => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>${currentSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{currentShipping === 0 ? 'Free' : `$${currentShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>${currentTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>${currentTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Promo Code</h3>
                <div className="flex space-x-2">
                  <input type="text" placeholder="APPLY_CODE" className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}