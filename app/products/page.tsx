'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProducts } from '../../lib/api'; // Import getProducts from your API utility

/**
 * Products Page Component
 *
 * Displays the complete perfume collection with filtering and sorting
 * Features:
 * - Product filtering by category, price, and size
 * - Sorting options (name, price, rating)
 * - Responsive product grid
 * - Search and filter sidebar
 *
 * Performance optimizations:
 * - Reduced image sizes for faster loading
 * - Lazy loading for product images
 * - Optimized hero banner size
 */

// Define the Product interface to match the updated structure from admin/page.tsx
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  pricePer10Ml: number;
  calculatedPrices: Record<string, number>;
  rating: number;
  inStock: boolean;
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  reviews: number;
  sizes: string[];
  images: string[];
  isFeatured: boolean;
  isVisibleInCollection: boolean; // NEW: Flag to control visibility on frontend
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

// Function to apply discount to calculated prices (This function is present in your original file, keeping it)
const applyDiscountToPrices = (originalPrices: Record<string, number>, discountPercent: number): Record<string, number> => {
  const discountedPrices: Record<string, number> = {};
  if (discountPercent > 0 && discountPercent < 100) {
      for (const size in originalPrices) {
          discountedPrices[size] = parseFloat((originalPrices[size] * (1 - discountPercent / 100)).toFixed(2));
      }
  } else {
      return { ...originalPrices };
  }
  return discountedPrices;
};

// Default products data, conforming to the new Product interface
// This serves as a fallback if the API call fails or initially
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Midnight Rose',
    category: 'Floral',
    price: 92.5,
    pricePer10Ml: 18.5,
    calculatedPrices: {'30ml': 55.5, '50ml': 92.5, '100ml': 185},
    rating: 4.8,
    reviews: 124,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20deep%20red%20rose%20essence%2C%20elegant%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=1a&orientation=portrait',
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%20shot%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=1b&orientation=portrait'
    ],
    description: 'An enchanting blend of Damascus rose and midnight jasmine that captures the essence of a moonlit garden. This sophisticated fragrance opens with fresh bergamot and pink pepper, revealing a heart of velvety rose petals and jasmine sambac, before settling into a warm base of sandalwood and white musk.',
    notes: {
      top: ['Bergamot', 'Pink Pepper', 'Mandarin'],
      heart: ['Damascus Rose', 'Jasmine Sambac', 'Lily of the Valley'],
      base: ['Sandalwood', 'White Musk', 'Amber']
    },
    inStock: true,
    isFeatured: true,
    isVisibleInCollection: true // Default to true
  },
  {
    id: '2',
    name: 'Ocean Breeze',
    category: 'Fresh',
    price: 82.5,
    pricePer10Ml: 16.5,
    calculatedPrices: {'30ml': 49.5, '50ml': 82.5, '100ml': 165},
    rating: 4.9,
    reviews: 89,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20ocean%20blue%20essence%2C%20crystal%20clear%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=2a&orientation=portrait',
      'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20water%20droplets%2C%20crystal%20clear%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20fresh%20aquatic%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=2b&orientation=portrait'
    ],
    description: 'Fresh marine notes with hints of sea salt and citrus that transport you to pristine coastal waters. This invigorating fragrance combines aquatic accords with zesty citrus and clean marine notes for an instantly refreshing experience.',
    notes: {
      top: ['Sea Salt', 'Lemon', 'Grapefruit'],
      heart: ['Marine Accord', 'Water Lily', 'Cucumber'],
      base: ['Driftwood', 'White Amber', 'Clean Musk']
    },
    inStock: true,
    isFeatured: true,
    isVisibleInCollection: true
  },
  {
    id: '3',
    name: 'Golden Amber',
    category: 'Oriental',
    price: 97.5,
    pricePer10Ml: 19.5,
    calculatedPrices: {'30ml': 58.5, '50ml': 97.5, '100ml': 195},
    rating: 4.7,
    reviews: 156,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20golden%20amber%20essence%2C%20warm%20honey%20colored%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20oriental%20luxury%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=3a&orientation=portrait',
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%20shot%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=3b&orientation=portrait'
    ],
    description: 'Warm amber and vanilla with exotic spice undertones',
    notes: {
      top: ['Cardamom', 'Pink Pepper'],
      heart: ['Amber', 'Vanilla Orchid'],
      base: ['Sandalwood', 'Musk']
    },
    inStock: true,
    isFeatured: true,
    isVisibleInCollection: true
  },
  {
    id: '4',
    name: 'Silk Garden',
    category: 'Floral',
    price: 87.5,
    pricePer10Ml: 17.5,
    calculatedPrices: {'30ml': 52.5, '50ml': 87.5, '100ml': 175},
    rating: 4.6,
    reviews: 203,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20silk%20garden%20essence%2C%20delicate%20floral%20glass%20design%2C%20premium%20cosmetic%20photography%2C%20soft%20pink%20and%20white%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=4&orientation=portrait',
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=4b&orientation=portrait'
    ],
    description: 'Delicate peony and silk tree blossom harmony',
    notes: {
      top: ['Green Apple', 'Pear'],
      heart: ['Peony', 'Rose'],
      base: ['Cedarwood', 'Musk']
    },
    inStock: true,
    isFeatured: true,
    isVisibleInCollection: true
  },
  {
    id: '5',
    name: 'Urban Noir',
    category: 'Oriental',
    price: 105,
    pricePer10Ml: 21.0,
    calculatedPrices: {'30ml': 63, '50ml': 105, '100ml': 210},
    rating: 4.8,
    reviews: 95,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20dark%20noir%20essence%2C%20sleek%20black%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20urban%20sophisticated%20theme%2C%20minimalist%20white%20background%2C%20modern%20fragrance%20presentation&width=250&height=320&seq=5&orientation=portrait',
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=5b&orientation=portrait'
    ],
    description: 'Bold blend of dark woods and smoky incense',
    notes: {
      top: ['Black Pepper', 'Bergamot'],
      heart: ['Incense', 'Leather'],
      base: ['Cedar', 'Patchouli']
    },
    inStock: true,
    isFeatured: false,
    isVisibleInCollection: true
  },
  {
    id: '6',
    name: 'Citrus Dawn',
    category: 'Fresh',
    price: 77.5,
    pricePer10Ml: 15.5,
    calculatedPrices: {'30ml': 46.5, '50ml': 77.5, '100ml': 155},
    rating: 4.5,
    reviews: 78,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20bright%20citrus%20essence%2C%20fresh%20orange%20and%20lemon%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20energetic%20fresh%20theme%2C%20minimalist%20white%20background%2C%20vibrant%20fragrance%20presentation&width=250&height=320&seq=6&orientation=portrait',
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=6b&orientation=portrait'
    ],
    description: 'Energizing citrus burst with morning dew freshness',
    notes: {
      top: ['Lemon', 'Mandarin'],
      heart: ['Orange Blossom', 'Green Tea'],
      base: ['White Musk', 'Cedarwood']
    },
    inStock: true,
    isFeatured: false,
    isVisibleInCollection: true
  },
  {
    id: '7',
    name: 'Velvet Orchid',
    category: 'Floral',
    price: 112.5,
    pricePer10Ml: 22.5,
    calculatedPrices: {'30ml': 67.5, '50ml': 112.5, '100ml': 225},
    rating: 4.9,
    reviews: 167,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20purple%20velvet%20orchid%2C%20essence%2C%20elegant%20violet%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20luxurious%20floral%20theme%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=250&height=320&seq=7&orientation=portrait',
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=7b&orientation=portrait'
    ],
    description: 'Exotic orchid petals with velvety smooth finish',
    notes: {
      top: ['Rum', 'Honey'],
      heart: ['Black Orchid', 'Velvet Flower'],
      base: ['Vanilla', 'Sandalwood']
    },
    inStock: true,
    isFeatured: false,
    isVisibleInCollection: true
  },
  {
    id: '8',
    name: 'Mystic Woods',
    category: 'Oriental',
    price: 95,
    pricePer10Ml: 19.0,
    calculatedPrices: {'30ml': 57, '50ml': 95, '100ml': 190},
    rating: 4.7,
    reviews: 134,
    sizes: ['30ml', '50ml', '100ml'],
    images: [
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20with%20mystic%20forest%20essence%2C%20earthy%20wood%20glass%2C%20design%2C%20premium%20cosmetic%20photography%2C%20mysterious%20natural%20theme%2C%20minimalist%20white%20background%2C%20organic%20fragrance%20presentation&width=250&height=320&seq=8&orientation=portrait',
        'https://readdy.ai/api/search-image?query=luxury%20perfume%20bottle%20detail%2C%20close%20up%20of%20elegant%20cap%2C%20label%2C%20premium%20cosmetic%20photography%2C%20soft%20lighting%2C%20minimalist%20white%20background%2C%20sophisticated%20fragrance%20presentation&width=600&height=800&seq=8b&orientation=portrait'
    ],
    description: 'Mysterious forest blend with ancient cedar and moss',
    notes: {
      top: ['Pine', 'Juniper'],
      heart: ['Cedarwood', 'Moss'],
      base: ['Patchouli', 'Amber']
    },
    inStock: true,
    isFeatured: false,
    isVisibleInCollection: true
  }
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]); // State to hold products from localStorage
  const [isLoading, setIsLoading] = useState(true); // NEW: Loading state
  const [error, setError] = useState<string | null>(null); // NEW: Error state

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch products from backend API instead of localStorage
        const fetchedProducts = await getProducts(); // Assuming getProducts fetches from http://localhost:5050/api/products

        // Sanitize fetched products to ensure consistency with the frontend Product interface
        const sanitizedProducts = fetchedProducts.map((p: any) => {
          // Re-calculate originalCalculatedPrices if not present or inconsistent, or use backend's value
          const originalCalcedPrices = p.calculatedPrices && typeof p.calculatedPrices === 'object'
            ? p.calculatedPrices
            : calculateOriginalPricesForSizes(p.pricePer10Ml || 0, p.sizes || []);

          // Determine display price from smallest size if available, otherwise use default
          const sortedSizes = [...(p.sizes || [])].sort((a,b) => parseMlFromString(a) - parseMlFromString(b));
          const smallestSizePrice = sortedSizes.length > 0 && Object.keys(originalCalcedPrices).length > 0
                                    ? originalCalcedPrices[sortedSizes[0]]
                                    : 0; // Fallback if no sizes or calculated prices

          return {
            id: p._id || p.id, // Use p._id from MongoDB if available, fallback to p.id if it's from default/local storage
            name: p.name,
            category: p.category,
            price: smallestSizePrice, // Display price is the smallest size's price
            pricePer10Ml: typeof p.pricePer10Ml === 'number' ? p.pricePer10Ml : 0,
            calculatedPrices: originalCalcedPrices,
            rating: typeof p.rating === 'number' ? p.rating : 0,
            // inStock logic: if sizeStocks exist and all are zero, then false, otherwise true
            inStock: p.sizeStocks && typeof p.sizeStocks === 'object'
                     ? Object.values(p.sizeStocks).some((stock: any) => stock > 0)
                     : (typeof p.inStock === 'boolean' ? p.inStock : true), // Fallback if sizeStocks not present
            description: typeof p.description === 'string' ? p.description : '',
            notes: p.notes && typeof p.notes === 'object' && Array.isArray(p.notes.top) ? p.notes : {top: [], heart: [], base: []},
            reviews: typeof p.reviews === 'number' ? p.reviews : 0,
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            images: Array.isArray(p.images) ? p.images : [],
            isFeatured: typeof p.isFeatured === 'boolean' ? p.isFeatured : false,
            isVisibleInCollection: typeof p.isVisibleInCollection === 'boolean' ? p.isVisibleInCollection : true,
          };
        });

        // Log product IDs to check for duplicates
        const ids = sanitizedProducts.map((p: Product) => p.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
            console.warn("Duplicate product IDs detected:", ids.filter((id: string, index: number) => ids.indexOf(id) !== index));
            // You might want to filter out duplicates here or show a stronger error
        }
        console.log("Loaded Product IDs:", ids); // Log all IDs to debug duplicates


        setProducts(sanitizedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || "Failed to load products. Using fallback data.");
        setProducts(initialProducts); // Fallback to initial if API call fails
        console.log("Fallback Product IDs (initialProducts):", initialProducts.map(p => p.id));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount


  const categories = ['All', 'Floral', 'Fresh', 'Oriental'];
  const priceRanges = ['All', 'Under $170', '$170-$200', 'Over $200'];
  const sizes = ['All', '30ml', '50ml', '100ml'];


  /**
   * Filter products based on selected criteria
   */
  const filteredProducts = products.filter(product => {
    // NEW: Only show products that are marked as visible in collection
    if (!product.isVisibleInCollection) {
      return false;
    }

    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const priceMatch = selectedPrice === 'All' ||
      (selectedPrice === 'Under $170' && product.price < 170) ||
      (selectedPrice === '$170-$200' && product.price >= 170 && product.price <= 200) ||
      (selectedPrice === 'Over $200' && product.price > 200);
    const sizeMatch = selectedSize === 'All' || (Array.isArray(product.sizes) && product.sizes.includes(selectedSize));

    return categoryMatch && priceMatch && sizeMatch;
  });

  /**
   * Sort filtered products based on selected criteria
   */
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-xl text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()} // Simple reload to re-attempt fetch
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner - Optimized smaller image */}
      <section className="relative h-[400px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dsddrhaxq/video/upload/v1753485368/collection_mrzage.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <div className="relative z-10 flex items-end h-full w-full px-6 pb-8">
          <div className="text-white text-center w-full">
            <h1 className="text-3xl font-semibold mb-2">Our Complete Collection</h1>
            <p className="text-base max-w-xl mx-auto">
              Discover the perfect fragrance that reflects your unique personality and style
            </p>
          </div>
        </div>
      </section>


      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filter Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-50 p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-6">Filter & Sort</h3>

              {/* Sort By Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400 pr-8"
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                        selectedCategory === category
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <button
                      key={range}
                      onClick={() => setSelectedPrice(range)}
                      className={`block w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                        selectedPrice === range
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                <div className="space-y-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`block w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                        selectedSize === size
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </h2>
              <div className="text-sm text-gray-600">
                Showing {selectedCategory !== 'All' ? selectedCategory : 'all'} fragrances
              </div>
            </div>

            {/* Product Cards with optimized loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedProducts.map((product) => (
                // The key is correctly placed here
                <div key={product.id} className="group bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 relative">
                  <Link href={`/products/${product.id}`} className="block cursor-pointer">
                    <div className="aspect-[3/4] overflow-hidden mb-4">
                      <img
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-star-fill text-yellow-400 text-sm"></i>
                          </div>
                          <span className="text-sm text-gray-600">{product.rating}</span>
                          <span className="text-sm text-gray-400">({product.reviews})</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{product.description}</p>
                      <div className="flex items-center justify-between">
                        {/* Display "Starting from" price for the smallest size */}
                        <span className="text-2xl font-light">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-black hover:text-gray-600 transition-colors text-sm font-medium whitespace-nowrap">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* No products found state */}
            {sortedProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                  <i className="ri-search-line text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPrice('All');
                    setSelectedSize('All');
                  }}
                  className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}