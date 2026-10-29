import { notFound } from 'next/navigation';
import ProductPage, { generateMetadata as generateProductMetadata } from '../../../shop/[slug]/page';
import { getMenuRouteOption, getMenuRouteProduct } from '@/lib/menu-options';

async function getOption(params) {
  const { slug, optionSlug } = await params;
  const productSlug = getMenuRouteProduct(slug);
  const option = productSlug ? getMenuRouteOption(productSlug, optionSlug) : null;
  return option ? { productSlug, option } : null;
}

export async function generateMetadata({ params, searchParams }) {
  const [route, query = {}] = await Promise.all([getOption(params), searchParams]);
  if (!route) notFound();

  return generateProductMetadata({
    params: { slug: route.productSlug },
    searchParams: { ...query, [route.option.queryKey]: route.option.id }
  });
}

export default async function MenuOptionPage({ params, searchParams }) {
  const [route, query = {}] = await Promise.all([getOption(params), searchParams]);
  if (!route) notFound();

  return (
    <ProductPage
      params={{ slug: route.productSlug }}
      searchParams={{ ...query, [route.option.queryKey]: route.option.id }}
    />
  );
}
