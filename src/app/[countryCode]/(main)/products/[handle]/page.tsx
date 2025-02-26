import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getProductByHandle, getProductsList } from '@lib/data/products'
import { getRegion, listRegions } from '@lib/data/regions'
import ProductTemplate from '@modules/products/templates'

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateStaticParams() {
  // Skip product fetching during Vercel builds to avoid errors
  if (process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL) {
    console.log('Skipping product static params generation in Vercel environment');
    return [
      { countryCode: 'us', handle: 'placeholder' }
    ];
  }

  try {
    const countryCodes = await listRegions().then(
      (regions) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    ).catch(() => ['us']);

    if (!countryCodes) {
      return [{ countryCode: 'us', handle: 'placeholder' }];
    }

    const products = await Promise.all(
      countryCodes.map((countryCode) => {
        return getProductsList({ countryCode })
          .catch(() => ({ response: { products: [] } }));
      })
    ).then((responses) =>
      responses.map(({ response }) => response.products).flat()
    );

    const staticParams = countryCodes
      ?.map((countryCode) =>
        products.map((product) => ({
          countryCode,
          handle: product.handle || 'placeholder',
        }))
      )
      .flat();

    return staticParams;
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [{ countryCode: 'us', handle: 'placeholder' }];
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await getProductByHandle(handle, region.id)

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Solace Medusa Starter`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Solace Medusa Starter`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const pricedProduct = await getProductByHandle(params.handle, region.id)

  if (!pricedProduct) {
    notFound()
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
    />
  )
}
