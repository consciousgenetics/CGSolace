import { sdk } from '@lib/config'

export const listCategories = async function () {
  try {
    return await sdk.store.category
      .list({ fields: '+category_children' }, { next: { tags: ['categories'] } })
      .then(({ product_categories }) => product_categories)
  } catch (error) {
    console.error('Error listing categories:', error)
    return []
  }
}

export const getCategoriesList = async function (
  offset: number = 0,
  limit: number = 100
) {
  try {
    return await sdk.store.category.list(
      // TODO: Look into fixing the type
      // @ts-ignore
      { limit, offset },
      { next: { tags: ['categories'] } }
    )
  } catch (error) {
    console.error('Error getting categories list:', error)
    return { product_categories: [] }
  }
}

export const getCategoryByHandle = async function (categoryHandle: string[]) {
  try {
    // Log the category handle to help with debugging
    console.log(`Getting category by handle: ${categoryHandle.join('/')}`);
    
    if (!categoryHandle || !Array.isArray(categoryHandle) || categoryHandle.length === 0) {
      console.warn('Invalid category handle:', categoryHandle);
      return { product_categories: [] };
    }
    
    // Set up a promise with timeout to prevent hanging requests
    const fetchWithTimeout = async () => {
      return Promise.race([
        sdk.store.category.list(
          // TODO: Look into fixing the type
          // @ts-ignore
          { handle: categoryHandle },
          { next: { tags: ['categories'] } }
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Category fetch timeout')), 10000)
        )
      ]);
    };
    
    return await fetchWithTimeout();
  } catch (error) {
    // More detailed error logging
    console.error(`Error getting category by handle [${categoryHandle?.join('/')}]:`, error);
    
    // Return empty result to prevent UI errors
    return { product_categories: [] }
  }
}
