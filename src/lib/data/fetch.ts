import {
  AboutUsData,
  BlogData,
  BlogPost,
  CollectionsData,
  ContentPageData,
  FAQData,
  HeroBannerData,
  MidBannerData,
  VariantColorData,
} from 'types/strapi'

export const fetchStrapiClient = async (
  endpoint: string,
  params?: RequestInit
) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_STRAPI_URL is not set');
      return { 
        ok: true, 
        json: () => Promise.resolve({ data: [] }) 
      }
    }
    
    const url = `${baseUrl}/api${endpoint}`;
    
    // Skip actual fetching during build time in production
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_STRAPI_URL) {
      console.log('Skipping Strapi fetch during build:', url);
      return { 
        ok: true, 
        json: () => Promise.resolve({ data: [] }) 
      }
    }

    console.log('Attempting to fetch from Strapi:', url);
    
    const headers = {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      headers,
      mode: 'cors',
      ...params,
    })

    if (!response.ok) {
      console.warn('Failed to fetch data from Strapi:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        endpoint: endpoint
      });
      
      // For development environments, we can show more detailed error information
      if (process.env.NODE_ENV === 'development') {
        console.error(`Strapi fetch failed for endpoint: ${endpoint}`);
        console.error(`Full URL attempted: ${url}`);
        console.error(`Status: ${response.status} ${response.statusText}`);
      }
      
      return { 
        ok: true, 
        json: () => Promise.resolve({ data: [] }) 
      }
    }

    // Create a wrapper for the json method that transforms image URLs
    const originalResponse = response
    return {
      ...originalResponse,
      json: async () => {
        const data = await originalResponse.json()
        return transformStrapiResponse(data)
      }
    }
  } catch (error) {
    console.warn('Error connecting to Strapi:', {
      message: error.message,
      error: error,
    });
    return { 
      ok: true, 
      json: () => Promise.resolve({ data: [] }) 
    }
  }
}

// Helper function to transform Strapi response and fix image URLs
const transformStrapiResponse = (data: any) => {
  if (!data) return data
  
  // Function to recursively process objects and arrays
  const processItem = (item: any): any => {
    if (!item) return item
    
    // If it's an array, process each item
    if (Array.isArray(item)) {
      return item.map(processItem)
    }
    
    // If it's an object, process each property
    if (typeof item === 'object') {
      // Handle image URL properties
      if (item.url && typeof item.url === 'string') {
        // Check if it's a relative URL that needs the Strapi base URL
        if (item.url.startsWith('/uploads/')) {
          const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
          item.url = `${baseUrl}${item.url}`;
        }
        // Ensure URL uses HTTPS in production
        if (process.env.NODE_ENV === 'production' && item.url.startsWith('http:')) {
          item.url = item.url.replace('http:', 'https:');
        }
      }
      
      // Handle image objects (common in Strapi v4)
      if (item.data && item.data.attributes && item.data.attributes.url) {
        // Check if it's a relative URL that needs the Strapi base URL
        if (item.data.attributes.url.startsWith('/uploads/')) {
          const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
          item.data.attributes.url = `${baseUrl}${item.data.attributes.url}`;
        }
        // Ensure URL uses HTTPS in production
        if (process.env.NODE_ENV === 'production' && item.data.attributes.url.startsWith('http:')) {
          item.data.attributes.url = item.data.attributes.url.replace('http:', 'https:');
        }
      }
      
      // Process nested objects
      Object.keys(item).forEach(key => {
        item[key] = processItem(item[key])
      })
    }
    
    return item
  }
  
  return processItem(data)
}

// Homepage data
export const getHeroBannerData = async (): Promise<HeroBannerData> => {
  const res = await fetchStrapiClient(
    `/homepage?populate[1]=HeroBanner&populate[2]=HeroBanner.CTA&populate[3]=HeroBanner.Image`,
    {
      next: { tags: ['hero-banner'] },
    }
  )

  return res.json()
}

export const getMidBannerData = async (): Promise<MidBannerData> => {
  const res = await fetchStrapiClient(
    `/homepage?populate[1]=MidBanner&populate[2]=MidBanner.CTA&populate[3]=MidBanner.Image`,
    {
      next: { tags: ['mid-banner'] },
    }
  )

  return res.json()
}

export const getCollectionsData = async (): Promise<CollectionsData> => {
  const res = await fetchStrapiClient(`/collections?&populate=*`, {
    next: { tags: ['collections-main'] },
  })

  return res.json()
}

export const getExploreBlogData = async (): Promise<BlogData> => {
  const res = await fetchStrapiClient(
    `/blogs?populate[1]=FeaturedImage&sort=createdAt:desc&pagination[start]=0&pagination[limit]=3`,
    {
      next: { tags: ['explore-blog'] },
    }
  )

  return res.json()
}

// Products
export const getProductVariantsColors = async (
  filter?: { id?: string }
): Promise<VariantColorData> => {
  try {
    // Update to use variant-colors endpoint instead
    const res = await fetchStrapiClient(
      `/variant-colors?populate[1]=variant_types&populate[2]=variant_types.Image&pagination[start]=0&pagination[limit]=100`,
      {
        next: { tags: ['variants-colors'] },
      }
    )

    return res.json()
  } catch (error) {
    console.error('Error fetching product variant colors:', error);
    return { data: [] };
  }
}

// About Us
export const getAboutUs = async (): Promise<AboutUsData> => {
  const res = await fetchStrapiClient(
    `/about-us?populate[1]=Banner&populate[2]=OurStory.Image&populate[3]=OurCraftsmanship.Image&populate[4]=WhyUs.Tile.Image&populate[5]=Numbers`,
    {
      next: { tags: ['about-us'] },
    }
  )

  return res.json()
}

// FAQ
export const getFAQ = async (): Promise<FAQData> => {
  const res = await fetchStrapiClient(
    `/faq?populate[1]=FAQSection&populate[2]=FAQSection.Question`,
    {
      next: { tags: ['faq'] },
    }
  )

  return res.json()
}

// Content Page
export const getContentPage = async (
  type: string,
  tag: string
): Promise<ContentPageData> => {
  const res = await fetchStrapiClient(`/${type}?populate=*`, {
    next: { tags: [tag] },
  })

  return res.json()
}

// Blog
export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const res = await fetchStrapiClient(
    `/blogs?filters[Slug][$eq]=${slug}&populate=deep`,
    {
      next: { tags: [`blog-${slug}`] },
    }
  )

  const data = await res.json()
  console.log('Blog post data:', data)

  if (data.data && data.data.length > 0) {
    return data.data[0]
  }

  return null
}

export const getBlogPosts = async ({
  sortBy = 'createdAt:desc',
  query,
  category,
}: {
  sortBy: string
  query?: string
  category?: string
}): Promise<BlogData> => {
  const baseUrl = `/blogs?populate=deep&sort=${sortBy}&pagination[limit]=1000`

  let urlWithFilters = baseUrl

  if (query) {
    urlWithFilters += `&filters[Title][$contains]=${query}`
  }

  if (category) {
    urlWithFilters += `&filters[Categories][Slug][$eq]=${category}`
  }

  const res = await fetchStrapiClient(urlWithFilters, {
    next: { tags: ['blog'] },
  })

  return res.json()
}

export const getBlogPostCategories = async (): Promise<BlogData> => {
  const res = await fetchStrapiClient(
    `/blog-post-categories?sort=createdAt:desc&pagination[limit]=100`,
    {
      next: { tags: ['blog-categories'] },
    }
  )

  return res.json()
}

export const getAllBlogSlugs = async (): Promise<string[]> => {
  try {
    const res = await fetchStrapiClient(`/blogs?populate=*`, {
      next: { tags: ['blog-slugs'] },
    })

    const data = await res.json()
    return data.data?.map((post: BlogPost) => post.Slug) || []
  } catch (error) {
    console.warn(`Error fetching blog slugs: ${error.message}`)
    return []
  }
}
