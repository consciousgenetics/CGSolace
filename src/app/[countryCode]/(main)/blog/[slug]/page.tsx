import { notFound } from 'next/navigation'

import { getAllBlogSlugs, getBlogPostBySlug } from '@lib/data/fetch'
import { listRegions } from '@lib/data/regions'
import { StoreRegion } from '@medusajs/types'
import BlogPostTemplate from '@modules/blog/templates/blogPostTemplate'

// Skip static generation completely during build
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  // Skip blog static generation during production builds
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL) {
    console.log('Skipping blog static params generation in production/Vercel environment');
    return [
      { countryCode: 'us', slug: 'placeholder' }
    ];
  }

  try {
    const slugs = await getAllBlogSlugs();

    if (!slugs || slugs.length === 0) {
      console.log('No blog slugs found, using fallback');
      return [
        { countryCode: 'us', slug: 'placeholder' }
      ];
    }

    try {
      const countryCodes = await listRegions()
        .then((regions: StoreRegion[]) =>
          regions
            ?.map((r) => r.countries?.map((c) => c.iso_2))
            .flat()
            .filter(Boolean) as string[]
        )
        .catch(() => ['us']);

      if (!countryCodes || countryCodes.length === 0) {
        console.log('No country codes found, using fallback');
        return slugs.map((slug: string) => ({
          countryCode: 'us',
          slug: slug || 'placeholder',
        }));
      }

      const staticParams = countryCodes
        ?.map((countryCode: string) =>
          slugs.map((slug: string) => ({
            countryCode,
            slug: slug || 'placeholder',
          }))
        )
        .flat();

      return staticParams;
    } catch (error) {
      console.error('Error processing regions:', error);
      return slugs.map((slug: string) => ({
        countryCode: 'us',
        slug: slug || 'placeholder',
      }));
    }
  } catch (error) {
    console.error('Error in generateStaticParams for blog:', error);
    return [
      { countryCode: 'us', slug: 'placeholder' }
    ];
  }
}

export async function generateMetadata(props) {
  try {
    const params = await props.params
    const article = await getBlogPostBySlug(params.slug)

    if (!article) {
      return {
        title: 'Article Not Found',
      }
    }

    return {
      title: article.Title,
    }
  } catch (error) {
    console.warn('Error generating metadata:', error)
    return {
      title: 'Blog',
    }
  }
}

export default async function BlogPost(props: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  try {
    const params = await props.params
    const { slug, countryCode } = params
    const article = await getBlogPostBySlug(slug)

    if (!article) {
      notFound()
    }

    return <BlogPostTemplate article={article} countryCode={countryCode} />
  } catch (error) {
    console.error('Error fetching blog post:', error)
    notFound()
  }
}
