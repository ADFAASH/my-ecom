// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useCart } from '@/lib/cartUtils';

// /**
//  * Header Component
//  * @param isTransparent - Optional prop to control transparency and text color for hero section.
//  */
// export default function Header({ isTransparent = false }: { isTransparent?: boolean }) {
//   // State for mobile menu toggle
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Get real cart state from CartContext
//   const { state } = useCart();
//   const cartCount = state.itemCount;

//   /**
//    * Toggle mobile menu visibility
//    */
//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   /**
//    * Close mobile menu when navigation link is clicked
//    */
//   const closeMobileMenu = () => {
//     setIsMenuOpen(false);
//   };

//   // Classes for the main header div based on isTransparent prop
//   // Now includes group-hover effects to change to white background, shadow, and border.
//   const headerClasses = `px-6 py-4 transition-all duration-300
//     ${isTransparent ? 'bg-black/40 group-hover:bg-white group-hover:shadow-sm group-hover:border-b group-hover:border-gray-100' : 'bg-white shadow-sm border-b border-gray-100'}
//   `;

//   // Classes for navigation links, logo, and cart icon text/color based on isTransparent prop
//   // Now includes group-hover effects to change text color to black.
//   const linkTextColor = isTransparent ? 'text-white group-hover:text-black transition-colors duration-200' : 'text-gray-700 hover:text-black transition-colors duration-200';
//   const iconTextColor = isTransparent ? 'text-white group-hover:text-black transition-colors duration-200' : 'text-gray-700 hover:text-gray-600 transition-colors duration-200';
//   const brandLogoColor = isTransparent ? 'text-white group-hover:text-black transition-colors duration-200' : 'text-black hover:text-gray-700 transition-colors duration-200';
//   // Cart badge also changes background and text color on group-hover
//   const cartBadgeClasses = `absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium
//     ${isTransparent ? 'bg-black group-hover:bg-white group-hover:text-black text-white border border-white group-hover:border-black' : 'bg-black text-white'}
//   `;

//   return (
//     // Apply absolute positioning only if isTransparent is true
//     <header className={`w-full z-20 group ${isTransparent ? 'absolute top-0 left-0' : ''}`}> 
//       <div className={headerClasses}>
//         {/* Main header content container */}
//         <div className="flex items-center justify-between">

//           {/* Brand Logo - Left side */}
//           <Link
//             href="/"
//             className={`text-2xl font-pacifico transition-colors ${brandLogoColor}`}
//           >
//             Lumière
//           </Link>

//           {/* Desktop Navigation - Center */}
//           <nav className="hidden md:flex items-center space-x-8">
//             <Link
//               href="/"
//               className={`cursor-pointer relative ${linkTextColor}`}
//             >
//               Home
//             </Link>
//             <Link
//               href="/products"
//               className={`cursor-pointer relative ${linkTextColor}`}
//             >
//               Collection
//             </Link>
//             <Link
//               href="/about"
//               className={`cursor-pointer relative ${linkTextColor}`}
//             >
//               Our Story
//             </Link>
//           </nav>

//           {/* Right side actions */}
//           <div className="flex items-center space-x-4">

//             {/* Shopping Cart Icon with Badge */}
//             <Link href="/cart" className="relative cursor-pointer group">
//               <div className="w-6 h-6 flex items-center justify-center">
//                 <i className={`ri-shopping-bag-line text-xl ${iconTextColor}`}></i>
//               </div>

//               {/* Cart count badge - only shows if items exist */}
//               {cartCount > 0 && (
//                 <span className={cartBadgeClasses}>
//                   {cartCount}
//                 </span>
//               )}
//             </Link>

//             {/* Mobile Menu Toggle Button */}
//             <button
//               className="md:hidden cursor-pointer p-1"
//               onClick={toggleMenu}
//               aria-label="Toggle mobile menu"
//             >
//               {/* The mobile menu icon's color will be controlled by iconTextColor */}
//               <div className={`w-6 h-6 flex items-center justify-center`}> 
//                 <i className={`text-xl transition-transform ${isMenuOpen ? 'ri-close-line' : `ri-menu-line ${iconTextColor} `}`}></i>
//               </div>
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation Menu - Only visible when toggled */}
//         {isMenuOpen && (
//           // Mobile menu will always have a solid white background for readability when open
//           <nav className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 bg-white text-black">
//             <div className="flex flex-col space-y-3">
//               <Link
//                 href="/"
//                 className="text-gray-700 hover:text-black transition-colors cursor-pointer py-2"
//                 onClick={closeMobileMenu}
//               >
//                 Home
//               </Link>
//               <Link
//                 href="/products"
//                 className="text-gray-700 hover:text-black transition-colors cursor-pointer py-2"
//                 onClick={closeMobileMenu}
//               >
//                 Collection
//               </Link>
//               <Link
//                 href="/about"
//                 className="text-gray-700 hover:text-black transition-colors cursor-pointer py-2"
//                 onClick={closeMobileMenu}
//               >
//                 Our Story
//               </Link>
//             </div>
//           </nav>
//         )}
//       </div>
//     </header>
//   );
// }

// v2.4NavBarIssue/components/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cartUtils';

/**
 * Header Component
 * @param isTransparent - Optional prop to control transparency and text color for hero section.
 */
export default function Header({ isTransparent = false }: { isTransparent?: boolean }) {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get real cart state from CartContext
  const { state } = useCart();
  const cartCount = state.itemCount;

  /**
   * Toggle mobile menu visibility
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Close mobile menu when navigation link is clicked
   */
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  // Classes for the main header div based on isTransparent prop
  const headerClasses = `px-6 py-4 transition-all duration-300
    ${isTransparent ? 'bg-black/40 group-hover:bg-white group-hover:shadow-sm group-hover:border-b group-hover:border-gray-100' : 'bg-white shadow-sm border-b border-gray-100'}
  `;

  // Classes for navigation links, logo, and cart icon text/color based on isTransparent prop
  // Added transition-colors duration-200 for smoother color changes.
  const linkTextColor = isTransparent ? 'text-white group-hover:text-black transition-colors duration-200' : 'text-gray-700 hover:text-black transition-colors duration-200';
  const iconTextColor = isTransparent ? 'text-white group-hover:text-black transition-colors duration-200' : 'text-gray-700 hover:text-gray-600 transition-colors duration-200';
  const brandLogoColor = isTransparent ? 'text-white group-hover:text-black transition-colors duration-200' : 'text-black hover:text-gray-700 transition-colors duration-200';
  // Cart badge also changes background and text color on group-hover
  const cartBadgeClasses = `absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium
    ${isTransparent ? 'bg-black group-hover:bg-white group-hover:text-black text-white border border-white group-hover:border-black' : 'bg-black text-white'}
  `;

  return (
    // Apply absolute positioning only if isTransparent is true
    <header className={`w-full z-20 group ${isTransparent ? 'absolute top-0 left-0' : ''}`}> 
      <div className={headerClasses}>
        {/* Main header content container */}
        <div className="flex items-center justify-between w-full">

          {/* Left section: Desktop Navigation - Hidden on mobile */}
          <div className="flex-1 hidden md:flex items-center justify-start">
            <nav className="flex items-center space-x-8">
              <Link
                href="/"
                className={`cursor-pointer relative transition-colors duration-200 px-4 py-2 ${linkTextColor}`}
                >
                  <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-[2px] after:bg-black after:transition-all after:duration-300">
                    Home
                  </span>
                </Link>

              <Link
                href="/products"
                className={`cursor-pointer relative transition-colors duration-200 px-4 py-2 ${linkTextColor}`}
                >
                  <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-[2px] after:bg-black after:transition-all after:duration-300">
                      Collection
                  </span>
                </Link>
              
              <Link
              href="/about"
              className={`cursor-pointer relative transition-colors duration-200 px-4 py-2 ${linkTextColor}`}
            >
              <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 hover:after:w-full after:h-[2px] after:bg-black after:transition-all after:duration-300">
                About
              </span>
            </Link>


            </nav>
          </div>

          {/* Center section: Brand Logo */}
          <div className="flex-none">
            <Link
              href="/"
              className={`text-2xl font-pacifico transition-colors ${brandLogoColor}`}
            >
              Lumière
            </Link>
          </div>

          {/* Right section: Icons (Cart, User, Mobile Toggle) */}
          <div className="flex-1 flex items-center justify-end space-x-4">

            {/* Shopping Cart Icon with Badge */}
            <Link href="/cart" className="relative cursor-pointer group">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`ri-shopping-bag-line text-xl ${iconTextColor}`}></i>
              </div>

              {/* Cart count badge - only shows if items exist */}
              {cartCount > 0 && (
                <span className={cartBadgeClasses}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Icon (Added based on user request) */}
            <button className="relative cursor-pointer group">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className={`ri-user-line text-xl ${iconTextColor}`}></i>
              </div>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden cursor-pointer p-1"
              onClick={toggleMenu}
              aria-label="Toggle mobile menu"
            >
              <div className={`w-6 h-6 flex items-center justify-center`}>
                <i className={`text-xl transition-transform ${isMenuOpen ? 'ri-close-line' : `ri-menu-line ${iconTextColor} `}`}></i>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Only visible when toggled */}
        {isMenuOpen && (
          // Mobile menu will always have a solid white background for readability when open
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 bg-white text-black">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-700 hover:text-black transition-colors cursor-pointer py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-700 hover:text-black transition-colors cursor-pointer py-2"
                onClick={closeMobileMenu}
              >
                Collection
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-black transition-colors cursor-pointer py-2"
                onClick={closeMobileMenu}
              >
                Our Story
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}