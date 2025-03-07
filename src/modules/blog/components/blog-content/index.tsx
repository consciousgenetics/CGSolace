import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { transformUrl } from '@lib/util/transform-url'

export function BlogContent({ content }: { content: any }) {
  // Debug the incoming content
  console.log('BlogContent received:', {
    contentType: typeof content,
    content: content
  })

  const processedContent = typeof content === 'string' 
    ? content 
    : Array.isArray(content)
    ? content.map(block => {
        if (block.type === 'paragraph' && block.children) {
          return block.children.map(child => child.text).join('')
        }
        return block
      }).join('\n\n')
    : JSON.stringify(content)

  // Debug the processed content
  console.log('Processed content:', processedContent)

  return (
    <Markdown
      components={{
        img: ({ node, ...props }) => {
          if (!props.src) {
            console.log('Image component received no src')
            return null
          }
          
          // Transform the image URL
          const imageUrl = transformUrl(props.src)
          console.log('Blog image processing:', {
            node,
            props,
            originalSrc: props.src,
            transformedUrl: imageUrl
          })
          
          return (
            <Box className="relative h-[350px] w-full">
              <Image
                fill
                src={imageUrl}
                alt={props.alt || ''}
                className="w-full object-cover"
              />
            </Box>
          )
        },
        h2: ({ node, ...props }) => (
          <Heading
            id={props.children.toString().toLowerCase().replace(/\s+/g, '-')}
            as="h2"
            className="mb-2 text-xl text-basic-primary medium:text-2xl"
          >
            {props.children}
          </Heading>
        ),
        h3: ({ node, ...props }) => (
          <Heading
            as="h3"
            className="mb-2 text-lg text-basic-primary medium:text-xl"
          >
            {props.children}
          </Heading>
        ),
        p: ({ node, ...props }) => (
          <Text className="mb-6 text-secondary medium:mb-12">
            {props.children}
          </Text>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {processedContent}
    </Markdown>
  )
}
