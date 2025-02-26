import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export function BlogContent({ content }: { content: any }) {
  const textContent = extractTextContent(content)

  return (
    <Markdown
      components={{
        img: ({ node, ...props }) => (
          <Box className="relative h-[350px] w-full">
            <Image
              fill
              src={props.src || ''}
              alt={props.alt || ''}
              className="w-full object-cover"
            />
          </Box>
        ),
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
      {textContent}
    </Markdown>
  )
}
