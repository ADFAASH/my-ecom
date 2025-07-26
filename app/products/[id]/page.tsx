// import ProductDetail from './ProductDetail';

// export async function generateStaticParams() {
//   return [
//     { id: '1' },
//     { id: '2' },
//     { id: '3' },
//     { id: '4' },
//     { id: '5' },
//     { id: '6' },
//     { id: '7' },
//     { id: '8' },
//   ];
// }

// // 🚨 REMOVE type annotation completely — let Next.js infer it
// export default function ProductPage(props: any) {
//   const id = props?.params?.id;
//   return <ProductDetail productId={id} />;
// }

// app/products/[id]/page.tsx

import ProductDetail from './ProductDetail';

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`, {
    next: { revalidate: 60 }, // optional: for ISR support
  });

  const products = await res.json();

  return products.map((product: any) => ({
    id: product._id,
  }));
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail productId={params.id} />;
}
