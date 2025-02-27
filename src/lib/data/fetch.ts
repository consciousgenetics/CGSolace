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
import qs from 'qs'

export async function fetchStrapiClient(
  endpoint: string,
  urlParamsObject = {},
  options = {}
) {
  try {
    // Merge default and user options
    const mergedOptions = {
      next: { revalidate: 3600 },
      ...options,
    };

    // Build request URL
    const queryString = qs.stringify(urlParamsObject);
    const requestUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api${endpoint}${
      queryString ? `?${queryString}` : ''
    }`;

    // Perform the request
    const response = await fetch(requestUrl, mergedOptions);

    // If response is not ok, throw error
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`API error: ${response.status} for ${requestUrl}`);
        try {
          const errorText = await response.text();
          console.error(`Error details: ${errorText}`);
        } catch (e) {
          console.error("Couldn't parse error response");
        }
      }
      throw new Error(`Error fetching from Strapi: ${response.status} ${response.statusText}`);
    }

    // Parse and return JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Strapi client error:", error);
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
export async function getProductVariantsColors() {
  try {
    // First try with lowercase endpoint (new format)
    try {
      const variants = await fetchStrapiClient(
        "/product-variant-colors",
        { populate: ["Type", "Type.Image"] }
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Successfully fetched from /product-variant-colors");
      }
      
      return variants.data;
    } catch (error) {
      // If that fails, try with plural endpoint
      try {
        const variants = await fetchStrapiClient(
          "/product-variant-colors",
          { populate: ["Type", "Type.Image"] }
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log("Successfully fetched from /product-variant-colors");
        }
        
        return variants.data;
      } catch (pluralError) {
        // If that fails, try with variant-colors endpoint
        try {
          const variants = await fetchStrapiClient(
            "/variant-colors",
            { populate: ["Type", "Type.Image"] }
          );
          
          if (process.env.NODE_ENV === 'development') {
            console.log("Successfully fetched from /variant-colors");
          }
          
          return variants.data;
        } catch (variantError) {
          // Finally try the custom route if none of the standard endpoints work
          if (process.env.NODE_ENV === 'development') {
            console.log("Attempting to fetch from custom route /product-variants-colors");
          }
          
          const variants = await fetchStrapiClient(
            "/product-variants-colors",
            { populate: ["Type", "Type.Image"] }
          );
          
          return variants.data;
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch product variant colors:", error);
    // Return empty array to prevent UI errors
    return [];
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
