import { cache } from 'react'
import { listCategories } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import { getCollectionsData } from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { Container } from '@modules/common/components/container'
import ClientCountdownTimer from '@modules/layout/components/countdown-timer/client-wrapper'

import NavActions from './nav-actions'
import NavContent from './nav-content'

// Cache the navigation data to prevent repeated fetching
const getNavData = cache(async (countryCode: string) => {
  const [productCategories, { collections }, strapiCollections, { products }] =
    await Promise.all([
      listCategories(),
      getCollectionsList(),
      getCollectionsData(),
      getProductsList({
        pageParam: 0,
        queryParams: { limit: 4 },
        countryCode: countryCode,
      }).then(({ response }) => response),
    ])

  return {
    productCategories,
    collections,
    strapiCollections,
    products
  }
})

// Add revalidation time to reduce API call frequency 
export const revalidate = 300 // 5 minutes

export default async function NavWrapper(props: any) {
  const { productCategories, collections, strapiCollections, products } = 
    await getNavData(props.countryCode)

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-[1000]">
      <div className="bg-black transition-all duration-300">
        <Container className="!p-0">
          <ClientCountdownTimer />
        </Container>
      </div>
      <Container
        as="nav"
        className="duration-300 h-16 xsmall:h-20 medium:h-24 mx-0 max-w-full border-b border-white/10 bg-black !py-0 transition-all ease-in-out medium:!px-14 backdrop-blur-lg"
      >
        <Container className="flex h-full items-center justify-between !p-0 text-white">
          <NavContent
            productCategories={productCategories}
            collections={collections}
            strapiCollections={strapiCollections}
            countryCode={props.countryCode}
            products={products}
          />
          <NavActions />
        </Container>
      </Container>
    </div>
  )
}
