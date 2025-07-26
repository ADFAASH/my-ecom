// // v2.2/components/ConditionalHeader.tsx
// 'use client';

// import { usePathname } from 'next/navigation';
// import Header from './Header';
// import React from 'react'; // Import React

// export default function ConditionalHeader() {
//   const pathname = usePathname();
//   const isHomePage = pathname === '/';

//   // Render Header if not on the homepage, or if it's the homepage but Header should be outside the video hero.
//   // Based on your last request, the Header for the homepage is handled within app/page.tsx's hero section.
//   // So, this component should render the Header ONLY if it's NOT the homepage.
//   return (
//     <>
//       {!isHomePage && <Header />}
//     </>
//   );
// }
// v2.4NavBarIssue/components/ConditionalHeader.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import React from 'react'; // Import React

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Render Header ONLY if it's NOT the homepage.
  return (
    <>
      {!isHomePage && <Header />}
    </>
  );
}