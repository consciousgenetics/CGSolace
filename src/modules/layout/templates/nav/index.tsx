import { listCategories } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import { getCollectionsData } from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { Container } from '@modules/common/components/container'

import NavActions from './nav-actions'
import NavContent from './nav-content'

export default async function NavWrapper(props: any) {
  // Implement error handling for each data fetching request
  let productCategories = []
  let collections = []
  let strapiCollections = { data: [] }
  let products = []

  try {
    // Fetch all data with Promise.allSettled to prevent one failed request from blocking others
    const results = await Promise.allSettled([
      listCategories(),
      getCollectionsList(),
      getCollectionsData(),
      getProductsList({
        pageParam: 0,
        queryParams: { limit: 4 },
        countryCode: props.countryCode,
      }).then(({ response }) => response),
    ])
    
    // Process results, assigning default values for any that failed
    if (results[0].status === 'fulfilled') {
      productCategories = results[0].value || []
    } else {
      console.error('Failed to fetch product categories:', results[0].reason)
    }
    
    if (results[1].status === 'fulfilled') {
      collections = results[1].value?.collections || []
    } else {
      console.error('Failed to fetch collections list:', results[1].reason)
    }
    
    if (results[2].status === 'fulfilled') {
      strapiCollections = results[2].value || { data: [] }
    } else {
      console.error('Failed to fetch Strapi collections:', results[2].reason)
    }
    
    if (results[3].status === 'fulfilled') {
      products = results[3].value?.products || []
    } else {
      console.error('Failed to fetch products list:', results[3].reason)
    }
  } catch (error) {
    console.error('Error in NavWrapper when fetching data:', error)
  }

  return (
    <Container
      as="nav"
      className="duration-400 sticky top-0 z-50 mx-0 max-w-full bg-black !py-4 transition-all ease-in-out medium:!px-14"
    >
      <Container className="flex items-center justify-between !p-0">
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
  )
}
