import { listCategories } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import { getCollectionsData } from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { Container } from '@modules/common/components/container'
import { CountdownTimer } from '@modules/layout/components/countdown-timer'

import NavActions from './nav-actions'
import NavContent from './nav-content'

export default async function NavWrapper(props: any) {
  const [productCategories, { collections }, strapiCollections, { products }] =
    await Promise.all([
      listCategories(),
      getCollectionsList(),
      getCollectionsData(),
      getProductsList({
        pageParam: 0,
        queryParams: { limit: 4 },
        countryCode: props.countryCode,
      }).then(({ response }) => response),
    ])

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-[1000]">
      <div className="bg-amber-400 transition-all duration-300">
        <Container className="!p-0">
          <CountdownTimer />
        </Container>
      </div>
      <Container
        as="nav"
        className="duration-300 h-16 xsmall:h-20 medium:h-24 mx-0 max-w-full border-b border-basic-primary/10 bg-primary/95 !py-0 transition-all ease-in-out medium:!px-14 backdrop-blur-lg"
      >
        <Container className="flex h-full items-center justify-between !p-0">
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
