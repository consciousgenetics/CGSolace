import { notFound } from 'next/navigation'

import { getAllBlogSlugs, getBlogPostBySlug } from '@lib/data/fetch'
import { listRegions } from '@lib/data/regions'
import { StoreRegion } from '@medusajs/types'
import BlogPostTemplate from '@modules/blog/templates/blogPostTemplate'

// Skip static generation completely during build
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  // Skip static generation completely during build
  if (process.env.NODE_ENV === 'production') {
    return []
  }

  try {
    const slugs = await getAllBlogSlugs()
    if (!slugs || slugs.length === 0) {
      return []
    }

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes || countryCodes.length === 0) {
      return []
    }

    return slugs.flatMap((slug) =>
      countryCodes.map((countryCode) => ({
        slug,
        countryCode,
      }))
    )
  } catch (error) {
    console.warn('Error during static generation:', error)
    return []
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
