import ProductDetail from './ProductDetail';

// With 'output: export' removed from next.config.ts,
// generateStaticParams is no longer mandatory for all dynamic routes at build time.
// You can remove this function entirely if you prefer purely client-side rendering for product details,
// or keep it if you want to pre-render a fixed set of popular products for initial load performance.
// Dynamically added products (from localStorage) will be fetched client-side.
export async function generateStaticParams() {
  // These are the IDs that Next.js will try to pre-render at build time.
  // Since products are now stored in localStorage (client-side),
  // this function cannot access dynamically added product IDs directly from localStorage during build.
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
  ];
}

export default function ProductPage({ params }: { params: { id: string } }) {
  // Remove 'await' from params. Next.js provides params directly as an object.
  // The 'await' keyword was causing the type incompatibility error.
  return <ProductDetail productId={params.id} />;
}