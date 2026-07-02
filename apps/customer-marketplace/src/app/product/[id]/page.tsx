import { ProductPageContent } from './product-page-content';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProductPageContent productId={id} />;
}
