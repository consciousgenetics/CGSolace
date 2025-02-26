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
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
    const url = `${baseUrl}/api${endpoint}`;
    
    console.log('Attempting to fetch from Strapi:', url);
    
    // During build time in production, if we can't connect to Strapi,
    // return empty data instead of failing the build
    if (process.env.NODE_ENV === 'production') {
      try {
        const headers = {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };

        const response = await fetch(url, {
          headers,
          mode: 'cors',
          ...params,
        });

        if (!response.ok) {
          console.warn('Failed to fetch data from Strapi during build:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          });
          return { 
            ok: true, 
            json: () => Promise.resolve({ data: [] }) 
          };
        }

        // Create a wrapper for the json method that transforms image URLs
        const originalResponse = response;
        return {
          ...originalResponse,
          json: async () => {
            const data = await originalResponse.json();
            return transformStrapiResponse(data);
          }
        };
      } catch (error) {
        console.warn('Error connecting to Strapi during build:', {
          message: error.message,
          error: error,
          url: url,
        });
        return { 
          ok: true, 
          json: () => Promise.resolve({ data: [] }) 
        };
      }
    }

    // Development or runtime behavior
    const headers = {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await fetch(url, {
      headers,
      mode: 'cors',
      ...params,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from Strapi: ${response.status} ${response.statusText}`);
    }

    // Create a wrapper for the json method that transforms image URLs
    const originalResponse = response;
    return {
      ...originalResponse,
      json: async () => {
        const data = await originalResponse.json();
        return transformStrapiResponse(data);
      }
    };
  } catch (error) {
    console.error('Error in fetchStrapiClient:', {
      message: error.message,
      error: error,
      endpoint: endpoint,
    });
    
    // During build time, return empty data instead of throwing
    if (process.env.NODE_ENV === 'production') {
      return { 
        ok: true, 
        json: () => Promise.resolve({ data: [] }) 
      };
    }
    throw error;
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
      if (item.url && typeof item.url === 'string' && item.url.startsWith('/uploads/')) {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
        item.url = `${baseUrl}${item.url}`
      }
      
      // Handle image objects (common in Strapi v4)
      if (item.data && item.data.attributes && item.data.attributes.url) {
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
        item.data.attributes.url = `${baseUrl}${item.data.attributes.url}`
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
export const getProductVariantsColors = async (): Promise<VariantColorData> => {
  const res = await fetchStrapiClient(
    `/product-variants-colors?populate[1]=Type&populate[2]=Type.Image&pagination[start]=0&pagination[limit]=100`,
    {
      next: { tags: ['variants-colors'] },
    }
  )

  return res.json()
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
export const getBlogPosts = async ({
  sortBy = 'createdAt:desc',
  query,
  category,
}: {
  sortBy: string
  query?: string
  category?: string
}): Promise<BlogData> => {
  const baseUrl = `/blogs?populate[1]=FeaturedImage&populate[2]=Categories&sort=${sortBy}&pagination[limit]=1000`

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

// Blog
export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const res = await fetchStrapiClient(
    `/blogs?filters[Slug][$eq]=${slug}&populate=*`,
    {
      next: { tags: [`blog-${slug}`] },
    }
  )

  const data = await res.json()

  if (data.data && data.data.length > 0) {
    return data.data[0]
  }

  return null
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
