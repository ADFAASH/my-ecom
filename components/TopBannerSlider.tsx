// v2.4NavBarIssue/components/TopBannerSlider.tsx
'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const promoMessages = [
  "Free shipping on all U.S. orders $50+",
  "Exclusive Holiday Deals: Shop Now for Limited-Time Discounts!",
  "Unlock Radiant Beauty: Enjoy a Free Gift with Every Purchase!",
];

/**
 * TopBannerSlider Component
 * A simple auto-playing slider for promotional messages above the main navigation.
 */
export default function TopBannerSlider() {
  return (
    <div className="bg-black text-white text-xs py-2 text-center overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0} // No space between slides for a truly seamless look
        slidesPerView={'auto'} // Important: Allows slides to take width of their content, crucial for marquee effect
        loop={true} // Continuously loop through messages
        autoplay={{
          delay: 0, // Set delay to 0 for continuous movement without pauses
          disableOnInteraction: false, // Ensure autoplay continues even if there's interaction
        }}
        speed={10000} // Increased speed for slower, smoother scrolling. Adjust this value to control speed. (e.g., 5000 for faster)
        allowTouchMove={false} // Prevent manual swiping
      >
        {promoMessages.map((message, index) => (
          // Add 'whitespace-nowrap' to keep text on a single line and 'px-4' for horizontal padding between messages
          <SwiperSlide key={index} className="flex justify-center items-center">
            <p className="font-medium whitespace-nowrap px-8">{message}</p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}