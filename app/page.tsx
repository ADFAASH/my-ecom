// LastV2Gemini/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper modules
import { Navigation, Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css/effect-coverflow';

import Header from '../components/Header'; // Import Header for homepage
import { getProducts } from '@/lib/api'; // Import your API utility


/**
 * Homepage Component
 *
 * Main landing page for Lumière perfume website
 * Features:
 * - Hero section with background image and CTAs
 * - Featured products showcase
 * - Brand story section with statistics
 * - Newsletter signup
 * - Final CTA section
 *
 * Performance optimizations:
 * - Next.js Image component for optimized loading
 * - Lazy loading for images below the fold
 * - Reduced image sizes for better performance
 */

// Define the Product interface to match the structure from admin/page.tsx
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  pricePer10Ml: number;
  calculatedPrices: Record<string, number>;
  rating: number; // Note: 'rating' is not in admin/page.tsx Product interface, but exists here.
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
  isVisibleInCollection: boolean; // Flag to control visibility on frontend
  _id?: string; // Add _id for type safety when fetching from MongoDB
}


export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const fetchedProducts: any[] = await getProducts(); // Fetch all products from API
        // Map MongoDB's _id to the frontend's id for consistency
        const sanitizedProducts = fetchedProducts.map(p => ({
            ...p,
            id: p._id // Ensure using MongoDB's _id as the primary ID on frontend
        }));
        // Filter by both isFeatured and isVisibleInCollection
        const currentFeatured = sanitizedProducts.filter(p => p.isFeatured && p.isVisibleInCollection);
        setFeaturedProducts(currentFeatured);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]); // Fallback to empty if API fails
      }
    };

    fetchFeaturedProducts();
  }, []); // Run once on mount to fetch data

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-screen w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="https://res.cloudinary.com/dsddrhaxq/video/upload/v1753485329/hero_aoydj7.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-black/40 z-0"></div>

        <Header isTransparent={true} />

        <div className="relative z-10 flex items-center h-full pt-24">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
                Discover Your
                <span className="block font-pacifico text-4xl md:text-6xl">Signature Scent</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Crafted with the finest ingredients, our luxury fragrances capture the essence of elegance and sophistication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-colors cursor-pointer text-center whitespace-nowrap"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-black transition-colors cursor-pointer text-center whitespace-nowrap"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-light mb-4">Featured Collection</h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Discover our most beloved fragrances, each carefully crafted to tell a unique story
      </p>
    </div>

    {featuredProducts.length > 0 ? (
      <div className="relative mx-auto max-w-6xl">
        <div className="custom-prev-arrow absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <button className="bg-white/90 border border-gray-300 shadow-md hover:shadow-lg rounded-full p-2 md:p-3 transition-all">
            <i className="ri-arrow-left-s-line text-2xl text-gray-600 hover:text-black"></i>
          </button>
        </div>
        <div className="custom-next-arrow absolute top-1/2 right-0 -translate-y-1/2 z-10">
          <button className="bg-white/90 border border-gray-300 shadow-md hover:shadow-lg rounded-full p-2 md:p-3 transition-all">
            <i className="ri-arrow-right-s-line text-2xl text-gray-600 hover:text-black"></i>
          </button>
        </div>

        <Swiper
          modules={[EffectCoverflow, Navigation, Autoplay]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={3}
          spaceBetween={-40}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 80,
            modifier: 1.5,
            slideShadows: false,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            nextEl: '.custom-next-arrow',
            prevEl: '.custom-prev-arrow',
          }}
          className="mySwiper"
        >
          {featuredProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="flex flex-col items-center">
                <Link
                  href={`/products/${product.id}`}
                  className="block w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px]"
                >
                  <div className="bg-transparent overflow-visible transition-all duration-300">
                    <img
                      src={product.images[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-auto object-contain drop-shadow-xl"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <h3 className="text-sm font-semibold">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-sm font-light mt-1">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    ) : (
      <div className="text-center py-10 text-gray-600">
        No featured products available. Please add some from the Admin panel and mark them as featured and visible.
      </div>
    )}
  </div>
</section>


      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold tracking-wide uppercase mb-10">
            Trending Brands
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { alt: "Chanel", url: "https://www.chanel.com", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752889623/ccChanel_cok6yq.png" },
              { alt: "Dior", url: "https://www.dior.com", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752889623/Dior_fnwn6n.png" },
              { alt: "Giorgio Armani", url: "https://www.marcjacobs.com", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752890813/pngegg_1_lhkkj7.png" },
              { alt: "Boss", url: "https://www.hugoboss.com", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752889974/pngegg_vrrlrm.png" },
              { alt: "Jean Paul Gaultier", url: "https://www.jeanpaulgaultier.com", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752889623/JeanPaul_v7fwcs.png" },
              { alt: "YSL", url: "https://www.yslbeauty.com", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752889624/YSL_bxatzp.png" },
              { alt: "Gucci", url: "https://www.gucci.com", src: "https://media.theperfumeshop.com/medias/sys_master/root/h93/he0/10104783437854/Gucci_Logo_Black/Gucci-Logo-Black.png" },
              { alt: "Tom Ford", url: "#", src: "https://res.cloudinary.com/dsddrhaxq/image/upload/v1752889624/TomFord_g3hnyl.png" },
              { alt: "Dolce & Gabbana", url: "https://www.dolcegabbana.com", src: "https://media.theperfumeshop.com/medias/sys_master/root/h93/he0/10104783437854/Gucci_Logo_Black/Gucci-Logo-Black.png" }
            ].map((brand) => (
              <a
                key={brand.alt}
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 w-32 flex items-center justify-center transition-all duration-300"
                onMouseEnter={() => setHoveredBrand(brand.alt)}
                onMouseLeave={() => setHoveredBrand(null)}
              >
                <img
                  src={brand.src}
                  alt={brand.alt}
                  className={`max-h-full max-w-full object-contain transition duration-300 transform ${
                    hoveredBrand && hoveredBrand !== brand.alt ? 'grayscale opacity-60' : 'grayscale-0 opacity-100'
                  } ${hoveredBrand === brand.alt ? 'scale-110 drop-shadow-lg' : ''}`}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-light mb-4">Stay In The Know</h2>
          <p className="text-white/80 mb-8 text-lg">
            Be the first to discover new fragrances, exclusive collections, and special offers
          </p>

          {subscribed ? (
            <div className="bg-white/10 border border-white/20 rounded p-6">
              <div className="w-12 h-12 flex items-center justify-center bg-green-500 rounded-full mx-auto mb-4">
                <i className="ri-check-line text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to Lumière</h3>
              <p className="text-white/80">
                Thank you for subscribing! You&apos;ll receive exclusive updates and offers soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-white/60 text-sm mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-light mb-6">Ready to Find Your Perfect Scent?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Explore our complete collection of luxury fragrances and discover the scent that defines you
              </p>
              <Link
                href="/products"
                className="inline-block bg-black text-white px-12 py-4 text-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Shop Now
              </Link>
            </div>
          </section>
        </div>
      );
    }