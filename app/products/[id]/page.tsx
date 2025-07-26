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

interface ProductPageProps {
  params: {
    id: string;
  };
  // Add searchParams as Next.js's PageProps usually includes it
  // Even if not used, its absence can cause type conflicts with generateStaticParams
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetail productId={params.id} />;
}