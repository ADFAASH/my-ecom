// LastV2Gemini/app/products/[id]/ProductDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../../lib/cartUtils';

interface ProductDetailProps {
  productId: string;
}

// Define the Product interface to match the updated structure from admin/page.tsx
interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Main display price, often for the smallest size or a default
  pricePer10Ml: number; // Added from admin/page.tsx to enable price calculation
  calculatedPrices: Record<string, number>; // Prices for all sizes
  image: string; // Main image URL for thumbnail/list view
  sizeStocks: Record<string, number>; // NEW: Stock per individual size (e.g., {'30ml': 100, '50ml': 50})
  inStock: boolean; // Derived from sizeStocks
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  reviews: number;
  sizes: string[]; // Array of available size labels (e.g., ['30ml', '50ml'])
  images: string[];
}

// Helper function to parse ML from size string (e.g., "50ml" -> 50)
const parseMlFromString = (sizeString: string): number => {
    const match = sizeString.match(/(\d+)\s*ml/i);
    return match ? parseFloat(match[1]) : 0;
};

// Function to calculate ORIGINAL prices for various sizes based on price per 10ml
const calculateOriginalPricesForSizes = (pricePer10Ml: number, sizes: string[]): Record<string, number> => {
  const prices: Record<string, number> = {};
  sizes.forEach(sizeStr => {
    const ml = parseMlFromString(sizeStr);
    if (ml > 0 && pricePer10Ml > 0) {
      prices[sizeStr] = parseFloat(((ml / 10) * pricePer10Ml).toFixed(2));
    }
  });
  return prices;
};

// Helper to determine if a product (overall) is in stock based on its sizeStocks
const isProductOverallInStock = (sizeStocks: Record<string, number>): boolean => {
    return Object.values(sizeStocks).some(stock => stock > 0);
};

// Define default product details for fallback if localStorage is empty or corrupted
const defaultProductDetails: { [key: string]: Product } = {
  '1': {
    id: '1',
    name: 'Midnight Rose',
    category: 'Floral',
    price: 89.99, // Changed to match your image for Midnight Rose
    pricePer10Ml: 18.5,
    calculatedPrices: {'30ml': 55.5, '50ml': 92.5, '100ml': 185},
    sizeStocks: {'30ml': 20, '50ml': 45, '100ml': 15}, // Example stock per size
    reviews: 124,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20deep%20red%20rose%20essence%2C%20elegant%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=1&orientation=portrait',
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%20shot%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=1b&orientation=portrait'
    ],
    image: 'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20deep%20red%20rose%20essence%2C%20elegant%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=1&orientation=portrait',
    description: 'An enchanting blend of Damascus rose and midnight jasmine that captures the essence of a moonlit garden. This sophisticated fragrance opens with fresh bergamot and pink pepper, revealing a heart of velvety rose petals and jasmine sambac, before settling into a warm base of sandalwood and white musk.',
    notes: {
      top: ['Bergamot', 'Pink Pepper', 'Mandarin'],
      heart: ['Damascus Rose', 'Jasmine Sambac', 'Lily of the Valley'],
      base: ['Sandalwood', 'White Musk', 'Amber']
    },
    inStock: true // Derived from sizeStocks
  },
  '2': {
    id: '2',
    name: 'Ocean Breeze',
    category: 'Fresh',
    price: 82.50, // Price from your image for Ocean Breeze
    pricePer10Ml: 16.5,
    calculatedPrices: {'30ml': 49.5, '50ml': 82.5, '100ml': 165},
    sizeStocks: {'30ml': 5, '50ml': 8, '100ml': 2}, // Example stock per size, Ocean Breeze stock 8 in 50ml size
    reviews: 89,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20ocean%20blue%20essence%2C%20crystal%20clear%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=2&orientation=portrait',
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20water%20droplets%2C%20crystal%20clear%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=2b&orientation=portrait'
    ],
    image: 'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20ocean%20blue%20essence%2C%20crystal%20clear%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=2&orientation=portrait',
    description: 'Fresh marine notes with hints of sea salt and citrus that transport you to pristine coastal waters. This invigorating fragrance combines aquatic accords with zesty citrus and clean marine notes for an instantly refreshing experience.',
    notes: {
      top: ['Sea Salt', 'Lemon', 'Grapefruit'],
      heart: ['Marine Accord', 'Water Lily', 'Cucumber'],
      base: ['Driftwood', 'White Amber', 'Clean Musk']
    },
    inStock: true // Derived from sizeStocks
  }
};


export default function ProductDetail({ productId }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // State for email notification
  const [notificationEmail, setNotificationEmail] = useState('');
  const [subscribedForNotification, setSubscribedForNotification] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Change this line:
        const res = await fetch(`http://localhost:5050/api/products/${productId}`); // Corrected URL/ProductDetail.tsx]
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);

        // Choose initial size
        const initialSize = data.sizes.includes('50ml') ? '50ml' : (data.sizes[0] || '');
        setSelectedSize(initialSize);

        // Cap initial quantity at available stock
        const initialStock = data.sizeStocks?.[initialSize] || 0;
        setQuantity(initialStock > 0 ? 1 : 0);
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      }
    };

    fetchProduct();
    setSelectedImageIndex(0);
    setSubscribedForNotification(false);
  }, [productId]);

  // Determine current stock based on selected size
  const currentStockForSelectedSize = product && selectedSize ? (product.sizeStocks[selectedSize] || 0) : 0;

  // Calculate the price for the selected quantity and size
  const pricePerUnit = product && selectedSize && product.calculatedPrices[selectedSize]
                       ? product.calculatedPrices[selectedSize]
                       : product?.price || 0;
  const totalPriceForDisplay = pricePerUnit * quantity;


  // Render loading state or not found message if product is not yet loaded or found
  if (product === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Product not found or still loading...</p>
      </div>
    );
  }

  const reviews = [
    {
      id: 1,
      name: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Absolutely divine fragrance! The rose notes are perfectly balanced and it lasts all day.',
      verified: true
    },
    {
      id: 2,
      name: 'Emma L.',
      rating: 5,
      date: '2024-01-10',
      comment: 'This has become my signature scent. So many compliments every time I wear it!',
      verified: true
    },
    {
      id: 3,
      name: 'Jessica R.',
      rating: 4,
      date: '2024-01-05',
      comment: 'Beautiful packaging and lovely scent. Perfect for evening occasions.',
      verified: true
    }
  ];

  const handleAddToCart = () => {
    // Ensure product and selectedSize are valid before adding to cart
    if (!product || !selectedSize || currentStockForSelectedSize <= 0) {
        // Optionally show an alert or message if trying to add out of stock
        alert('Product is out of stock for the selected size.');
        return;
    }

    // Cap the quantity at available stock for the selected size
    const quantityToAdd = Math.min(quantity, currentStockForSelectedSize);

    addToCart({
      id: `${product.id}-${selectedSize}`,
      name: `${product.name} (${selectedSize})`,
      price: pricePerUnit,
      image: (product.images && product.images.length > 0) ? product.images[0] : product.image,
      size: selectedSize,
      quantity: quantityToAdd,
      inStock: product.inStock, // This is overall product inStock, cart handles per-item stock
      stock: currentStockForSelectedSize // Pass the available stock for this specific size
    });
    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 3000);
  };

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationEmail) {
      console.log(`Notification requested for ${product.name} (${product.id}) at ${notificationEmail}`);
      setSubscribedForNotification(true);
      setNotificationEmail('');
    }
  };

  const handleQuantityDecrease = () => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
  };

  const handleQuantityIncrease = () => {
    setQuantity(prevQuantity => Math.min(prevQuantity + 1, currentStockForSelectedSize)); // Cap at selected size's stock
  };


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition-colors cursor-pointer">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-black transition-colors cursor-pointer">Products</Link>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-[3/4] mb-4 overflow-hidden bg-gray-50">
              <img
                src={(product.images && product.images.length > 0) ? product.images[selectedImageIndex] : product.image}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Display thumbnail images if available, otherwise just use the main image */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden cursor-pointer ${
                      selectedImageIndex === index ? 'ring-2 ring-black' : 'hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
            </div>

            <h1 className="text-4xl font-light mb-4">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-star-${i < Math.floor(product.reviews > 0 ? 5 : 0) ? 'fill' : 'line'} text-yellow-400 text-sm`}></i>
                  </div>
                ))}
                <span className="text-sm text-gray-600 ml-2">{product.reviews > 0 ? '5.0' : 'No ratings yet'}</span>
              </div>
              <span className="text-sm text-gray-500">({product.reviews || '0'} reviews)</span>
            </div>

            <div className="text-3xl font-light mb-8">${totalPriceForDisplay.toFixed(2)}</div>

            <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>

            {/* Fragrance Notes - only display if available */}
            {product.notes && product.notes.top && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Fragrance Notes</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Top Notes: </span>
                    <span className="text-sm text-gray-600">{product.notes.top.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Heart Notes: </span>
                    <span className="text-sm text-gray-600">{product.notes.heart.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Base Notes: </span>
                    <span className="text-sm text-gray-600">{product.notes.base.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Size Selection - only display if sizes are available */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                <div className="flex space-x-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border transition-colors cursor-pointer whitespace-nowrap ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleQuantityDecrease}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <i className="ri-subtract-line"></i>
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={handleQuantityIncrease}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
              {/* {currentStockForSelectedSize > 0 && currentStockForSelectedSize <= 10 && (
                <p className="text-sm text-yellow-600 mt-2">Only {currentStockForSelectedSize} left in stock for {selectedSize}!</p>
              )} */}
              {currentStockForSelectedSize === 0 && (
                <p className="text-sm text-red-600 mt-2">Out of Stock for {selectedSize}</p>
              )}
            </div>

            {/* Add to Cart Button / Out of Stock Notification */}
            {currentStockForSelectedSize > 0 ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors mb-4 cursor-pointer whitespace-nowrap"
                >
                  Add to Cart - ${totalPriceForDisplay.toFixed(2)}
                </button>

                {showAddedMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 mb-4 flex items-center">
                    <div className="w-5 h-5 flex items-center justify-center mr-2">
                      <i className="ri-check-line"></i>
                    </div>
                    Added to cart successfully!
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 p-6 text-center mb-4">
                <p className="text-lg font-semibold text-red-600 mb-3">Out of Stock for {selectedSize}</p>
                {subscribedForNotification ? (
                  <div className="text-green-700">
                    <i className="ri-check-circle-line mr-2"></i>
                    You'll be notified when it's back!
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 mb-4">
                      Enter your email to be notified when this product is back in stock:
                    </p>
                    <form onSubmit={handleNotifyMe} className="flex">
                      <input
                        type="email"
                        placeholder="Your email address"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-400 text-sm"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
                      >
                        Notify Me
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-truck-line"></i>
                </div>
                Free shipping on orders over $150
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-shield-check-line"></i>
                </div>
                30-day return guarantee
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-light mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 flex items-center justify-center">
                        <i className={`ri-star-${i < review.rating ? 'fill' : 'line'} text-yellow-400 text-sm`}></i>
                      </div>
                    ))}
                  </div>
                  {review.verified && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{review.name}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(review.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}