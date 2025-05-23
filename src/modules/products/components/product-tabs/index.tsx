'use client'

import { useMemo } from 'react'

import { HttpTypes } from '@medusajs/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@modules/common/components/accordion'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { MinusThinIcon, PlusIcon } from '@modules/common/icons'

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const dimensions = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('dim_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const design = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('des_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const tabs = [
    {
      label: 'Description',
      component: <ProductDescriptionTab description={product.description} />,
    },
    Object.entries(dimensions).length > 0 && {
      label: 'Dimensions',
      component: <ProductDimensionsTab dimensions={dimensions} />,
    },
    Object.entries(design).length > 0 && {
      label: 'Design',
      component: <ProductDesignTab design={design} />,
    },
   
  ].filter(Boolean)

  return (
    <div className="w-full">
      <Accordion type="single" collapsible defaultValue="item-0" className="flex w-full flex-col">
        {tabs.map((tab, id) => {
          return (
            <AccordionItem
              key={id}
              value={`item-${id}`}
              className="border-gray-200 border-b last:border-b-0"
              data-testid="product-tab"
            >
              <AccordionTrigger className="!rounded-none !py-2 transition-all duration-200 ease-in-out [&[data-state=closed]>#minusIconSvg]:hidden [&[data-state=open]>#plusIconSvg]:hidden">
                <Heading
                  className="text-lg font-medium text-black"
                  as="h3"
                >
                  {tab.label}
                </Heading>
                <div
                  id="plusIconSvg"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-black hover:text-gray-700 active:text-gray-900"
                >
                  <PlusIcon />
                </div>
                <div
                  id="minusIconSvg"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-black hover:text-gray-700 active:text-gray-900"
                >
                  <MinusThinIcon />
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3 !pb-4">
                {tab.component}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

const ProductDescriptionTab = ({ description }: { description: string }) => {
  return (
    <Text
      data-testid="product-description-tab"
      size="md"
      className="whitespace-pre-line text-gray-700 font-latto"
    >
      {description}
    </Text>
  )
}

const ProductDimensionsTab = ({
  dimensions,
}: {
  dimensions: Record<string, unknown>
}) => {
  return (
    <Box data-testid="product-dimensions-tab">
      {Object.entries(dimensions).map(([key, value]) => (
        <div key={key}>
          <Text as="span" className="font-medium text-black font-latto">
            {formatKey(key, 'dim_')}:
          </Text>{' '}
          <Text as="span" className="text-gray-700 font-latto">
            {value as string}
          </Text>
        </div>
      ))}
    </Box>
  )
}

const ProductDesignTab = ({ design }: { design: Record<string, unknown> }) => {
  return (
    <Box data-testid="product-design-tab">
      {Object.entries(design).map(([key, value]) => (
        <div key={key}>
          <Text as="span" className="font-medium text-black font-latto">
            {formatKey(key, 'des_')}:
          </Text>{' '}
          <Text as="span" className="text-gray-700 font-latto">
            {value as string}
          </Text>
        </div>
      ))}
    </Box>
  )
}



const formatKey = (key: string, prefix: string): string => {
  return key
    .replace(prefix, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
