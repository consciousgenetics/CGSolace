import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { BlogPost } from 'types/strapi'
import { transformUrl } from '@lib/util/transform-url'

const extractTextContent = (content: any): string => {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map(block => {
        if (block.children) {
          return block.children
            .map(child => child.text || '')
            .join('')
        }
        return ''
      })
      .join('\n')
  }
  return ''
}

export function BlogTile({ post }: { post: BlogPost }) {
  const textContent = extractTextContent(post.Content)
  
  // Transform the featured image URL if it exists
  const featuredImageUrl = post.FeaturedImage?.url ? transformUrl(post.FeaturedImage.url) : null

  return (
    <Box className="flex min-w-40 flex-col overflow-hidden bg-secondary">
      <Box className="h-[224px] overflow-hidden large:h-[280px]">
        <LocalizedClientLink href={`/blog/${post.Slug}`}>
          {featuredImageUrl ? (
            <Image
              className="h-full w-full object-cover object-center"
              src={featuredImageUrl}
              alt={post.FeaturedImage.alternativeText ?? 'Blog post image'}
              width={600}
              height={600}
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <Text>No image available</Text>
            </div>
          )}
        </LocalizedClientLink>
      </Box>
      <Box className="flex flex-col gap-4 p-4 small:gap-6 small:p-5">
        <div className="flex flex-col gap-1">
          <LocalizedClientLink href={`/blog/${post.Slug}`}>
            <Heading
              as="h3"
              className="line-clamp-2 text-lg font-medium text-basic-primary"
            >
              {post.Title}
            </Heading>
          </LocalizedClientLink>
          <div className="w-full">
            <Text
              className="line-clamp-2 text-secondary"
              size="md"
              title={textContent}
            >
              {textContent}
            </Text>
          </div>
        </div>
      </Box>
    </Box>
  )
}
