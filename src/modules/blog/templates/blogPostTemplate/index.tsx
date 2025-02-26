import Image from 'next/image'

import { cn } from '@lib/util/cn'
import BlogBreadcrumbs from '@modules/blog/components/blog-breadcrumbs'
import { BlogContent } from '@modules/blog/components/blog-content'
import { BlogInfo } from '@modules/blog/components/blog-info'
import { TableOfContents } from '@modules/blog/components/blog-table-of-contents'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { BlogPost } from 'types/strapi'

export default async function BlogPostTemplate({
  article,
  countryCode,
}: {
  countryCode: string
  article: BlogPost
}) {
  const getContentAsString = (content: string | Array<{ type: string; children: Array<{ type: string; text: string }> }>) => {
    if (typeof content === 'string') {
      return content
    }
    return content.map(block => block.children.map(child => child.text).join('')).join('\n\n')
  }

  const readTime = (content: string | Array<{ type: string; children: Array<{ type: string; text: string }> }>) => {
    const contentString = getContentAsString(content)
    const wordsPerMinute = 200
    const noOfWords = contentString.split(/\s/g).length
    const minutes = noOfWords / wordsPerMinute
    return Math.ceil(minutes)
  }

  const extractHeadings = (content: string | Array<{ type: string; children: Array<{ type: string; text: string }> }>) => {
    const contentString = getContentAsString(content)
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extractedHeadings = []
    let match
    while ((match = headingRegex.exec(contentString)) !== null) {
      extractedHeadings.push({
        level: match[1].length,
        text: match[2],
        id: match[2].toLowerCase().replace(/\s+/g, '-'),
      })
    }
    return extractedHeadings
  }

  const headings = extractHeadings(article.Content)
  const hasHeadings = headings.length > 0

  const contentString = getContentAsString(article.Content)
  const paragraphs = contentString.split('\n\n')
  const firstParagraph = paragraphs[0]
  const restOfContent = paragraphs.slice(1).join('\n\n')

  return (
    <Container className="flex flex-col gap-6 !py-8 medium:gap-8">
      <Box className="flex flex-col gap-4">
        <BlogBreadcrumbs blogTitle={article.Title} countryCode={countryCode} />
        <Heading as="h1" className="text-4xl text-basic-primary small:text-5xl">
          {article.Title}
        </Heading>
      </Box>
      <Box className="grid grid-cols-12 gap-4">
        <Box
          className={cn(
            'col-span-12 hidden large:col-span-3 large:block',
            hasHeadings ? 'block' : 'hidden'
          )}
        >
          <TableOfContents headings={headings} />
        </Box>
        <Box
          className={cn(
            'col-span-12 large:col-span-9 large:col-start-5',
            hasHeadings
              ? 'large:col-span-9'
              : 'large:col-span-12 large:col-start-1'
          )}
        >
          <Box className="relative h-[400px] w-full">
            <Image
              src={article.FeaturedImage.url}
              alt={`${article.FeaturedImage.alternativeText ? article.FeaturedImage.alternativeText : article.Title}`}
              fill
              className="w-full object-cover"
            />
          </Box>
          <BlogInfo
            createdAt={article.createdAt}
            readTime={readTime(article.Content)}
          />
          <BlogContent content={firstParagraph} />
          <Box className="my-6 medium:hidden">
            <TableOfContents headings={headings} />
          </Box>
          <BlogContent content={restOfContent} />
        </Box>
      </Box>
    </Container>
  )
}
