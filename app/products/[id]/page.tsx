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



