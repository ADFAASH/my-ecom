'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-pacifico text-black mb-4">ENEZZAE</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Crafting exceptional fragrances that capture the essence of luxury and elegance since 1985.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-600 hover:text-black transition-colors text-sm">
                Home
              </Link>
              <Link href="/products" className="block text-gray-600 hover:text-black transition-colors text-sm">
                Collection
              </Link>
              <Link href="/about" className="block text-gray-600 hover:text-black transition-colors text-sm">
                Our Story
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Customer Care</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 hover:text-black transition-colors text-sm">
                Shipping Info
              </a>
              <a href="#" className="block text-gray-600 hover:text-black transition-colors text-sm">
                Returns
              </a>
              <a href="#" className="block text-gray-600 hover:text-black transition-colors text-sm">
                Contact Us
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors cursor-pointer">
                <i className="ri-instagram-line text-gray-700"></i>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors cursor-pointer">
                <i className="ri-facebook-fill text-gray-700"></i>
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors cursor-pointer">
                <i className="ri-twitter-fill text-gray-700"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 ENEZZAE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}