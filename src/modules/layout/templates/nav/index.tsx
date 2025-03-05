import { listCategories } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import { getCollectionsData } from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { Container } from '@modules/common/components/container'

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
      <Container
        as="nav"
        className="duration-400 h-[80px] xsmall:h-[90px] medium:h-[110px] mx-0 max-w-full border-b border-basic-primary bg-primary/95 !py-0 transition-all ease-in-out medium:!px-14 shadow-md backdrop-blur-md"
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
