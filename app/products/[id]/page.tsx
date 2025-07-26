// app/products/[id]/page.tsx

import ProductDetail from './ProductDetail';

export async function generateStaticParams() {
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

// Derive the type of a single parameter object from generateStaticParams's return type
// This precisely matches the structure { id: string } that params will have at runtime.
type ProductIdParam = Awaited<ReturnType<typeof generateStaticParams>>[number];

interface ProductPageProps {
  params: ProductIdParam; // Use the derived type for params
  // Include searchParams for full PageProps compatibility, even if not directly used
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetail productId={params.id} />;
}