import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getProductByHandle, getProductsList } from '@lib/data/products'
import { getRegion, listRegions } from '@lib/data/regions'
import ProductTemplate from '@modules/products/templates'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// Skip static params completely for now to ensure build succeeds
export async function generateStaticParams() {
  // Simply return an empty array to avoid build-time data fetching
  return []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const params = await props.params
    const { handle } = params
    
    const region = await getRegion(params.countryCode).catch(() => null)
    if (!region) {
      return {
        title: "Product | Solace Medusa Starter",
        description: "Product page",
      }
    }

    const product = await getProductByHandle(handle, region.id).catch(() => null)
    if (!product) {
      return {
        title: "Product | Solace Medusa Starter",
        description: "Product page",
      }
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
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Product | Solace Medusa Starter",
      description: "Product page",
    }
  }
}

export default async function ProductPage(props: Props) {
  try {
    const params = await props.params
    
    const region = await getRegion(params.countryCode).catch(() => null)
    if (!region) {
      return notFound()
    }

    const pricedProduct = await getProductByHandle(params.handle, region.id).catch(() => null)
    if (!pricedProduct) {
      return notFound()
    }

    return (
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
      />
    )
  } catch (error) {
    console.error("Error loading product page:", error)
    return notFound()
  }
}
