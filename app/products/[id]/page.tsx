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

// 🚨 REMOVE type annotation completely — let Next.js infer it
export default function ProductPage(props: any) {
  const id = props?.params?.id;
  return <ProductDetail productId={id} />;
}



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

// // Corrected: Make the component async and await params
// export default async function ProductPage({ params }: { params: { id: string } }) {
//   // Await params to safely access its properties, as per Next.js recommendation
//   const { id } = await params;
//   return <ProductDetail productId={id} />;
// }
