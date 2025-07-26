
'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat h-96"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://readdy.ai/api/search-image?query=luxury%20perfume%20laboratory%20elegant%20bottles%20artisan%20craftsmanship%20vintage%20distillery%20sophisticated%20amber%20lighting%20French%20perfumery%20heritage%20workshop&width=1400&height=600&seq=about1&orientation=landscape')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Our Story</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Discover the legacy of ENEZZAE - where passion meets perfection in every drop
            </p>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Beginning</h2>
            <p className="text-lg text-gray-700 mb-6">
              In 1892, in the heart of Grasse, France, master perfumer Henri ENEZZAE founded our house with a simple yet profound vision: to capture the essence of life's most precious moments in exquisite fragrances. What began as a small atelier has evolved into a prestigious maison, yet we remain true to our artisanal roots.
            </p>
            <p className="text-lg text-gray-700">
              Henri's philosophy was revolutionary for its time - he believed that perfume should not merely scent the body, but illuminate the soul. This belief became the cornerstone of our brand, inspiring the name "ENEZZAE" - French for light.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://readdy.ai/api/search-image?query=vintage%20French%20perfume%20workshop%20old%20master%20perfumer%20Henri%20working%20antique%20bottles%20brass%20equipment%20sepia%20tones%20historical%20craftsmanship%201890s%20Grasse%20France&width=600&height=500&seq=about2&orientation=portrait"
              alt="Henri ENEZZAE in his original workshop"
              className="w-full rounded-lg shadow-lg object-cover object-top"
            />
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
              <p className="text-sm font-medium text-gray-900">Henri ENEZZAE</p>
              <p className="text-sm text-gray-600">Founder, 1892</p>
            </div>
          </div>
        </div>

        {/* Heritage Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">A Legacy of Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-flask-line text-2xl text-amber-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">130+ Years</h3>
              <p className="text-gray-700">
                Over a century of perfumery expertise, passed down through five generations of master perfumers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-leaf-line text-2xl text-rose-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pure Ingredients</h3>
              <p className="text-gray-700">
                We source the finest natural essences from around the world, maintaining partnerships with trusted growers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-award-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Award Winning</h3>
              <p className="text-gray-700">
                Recipients of numerous international fragrance awards, including the prestigious Prix de la Parfumerie.
              </p>
            </div>
          </div>
        </div>

        {/* Craftsmanship Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <img 
              src="https://readdy.ai/api/search-image?query=modern%20luxury%20perfume%20laboratory%20glass%20equipment%20sophisticated%20distillation%20process%20elegant%20bottles%20pristine%20white%20workspace%20professional%20perfumer%20creating%20fragrance&width=600&height=500&seq=about3&orientation=portrait"
              alt="Modern ENEZZAE laboratory"
              className="w-full rounded-lg shadow-lg object-cover object-top"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Modern Craftsmanship</h2>
            <p className="text-lg text-gray-700 mb-6">
              Today, our master perfumer Céleste Dubois continues Henri's legacy in our state-of-the-art laboratory. Each fragrance undergoes a meticulous 18-month development process, from initial concept to final bottling.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              We blend traditional French perfumery techniques with modern innovation, using only the purest ingredients. Our signature three-tier fragrance architecture - featuring top, heart, and base notes - creates complex, evolving scents that tell a story on your skin.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-time-line text-xl text-purple-600"></i>
              </div>
              <div>
                <p className="font-semibold text-gray-900">18 Months</p>
                <p className="text-gray-600">Development time per fragrance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability</h3>
              <p className="text-gray-700 mb-6">
                We are committed to sustainable practices, from responsible sourcing to eco-friendly packaging. Our partnerships with local growers support biodiversity and fair trade practices.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-700">
                While honoring tradition, we embrace innovation. Our research into new extraction methods and sustainable alternatives keeps us at the forefront of modern perfumery.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Artistry</h3>
              <p className="text-gray-700 mb-6">
                Each ENEZZAE fragrance is a work of art, carefully composed to evoke emotions and memories. We believe that fragrance is the most intimate form of luxury.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-700">
                From the selection of raw materials to the final quality control, we maintain the highest standards of excellence in every aspect of our craft.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Meet Our Master Perfumer</h2>
          <div className="max-w-md mx-auto">
            <img 
              src="https://readdy.ai/api/search-image?query=elegant%20French%20woman%20perfumer%20C%C3%A9leste%20Dubois%20professional%20portrait%20laboratory%20background%20sophisticated%20confident%20smile%20luxury%20fragrance%20bottles%20expertise&width=400&height=500&seq=about4&orientation=portrait"
              alt="Céleste Dubois"
              className="w-full rounded-lg shadow-lg mb-6 object-cover object-top"
            />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Céleste Dubois</h3>
            <p className="text-lg text-gray-600 mb-4">Master Perfumer & Creative Director</p>
            <p className="text-gray-700">
              With over 20 years of experience and training from the prestigious ISIPCA in Versailles, Céleste brings both technical mastery and artistic vision to every ENEZZAE creation.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-black text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-6">Experience Our Legacy</h2>
          <p className="text-xl mb-8 text-gray-300">
            Discover the fragrances that have captivated generations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Explore Collection
            </Link>
            <Link 
              href="/contact"
              className="border border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition-colors cursor-pointer whitespace-nowrap"
            >
              Visit Our Boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
