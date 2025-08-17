// Size ordering utility for product variants
export const getSizeOrder = (value: string): number => {
  // Size ordering priority - optimized for clothing merch
  // Handles both lowercase and proper case variations
  const normalizedValue = value.toLowerCase().trim()
  const sizeOrder: Record<string, number> = {
    // Extra small sizes
    'xxs': 0,
    'xs': 1,
    'extra small': 1,
    'extra-small': 1,
    
    // Small sizes
    's': 2,
    'small': 2,
    
    // Medium sizes  
    'm': 3,
    'medium': 3,
    'med': 3,
    
    // Large sizes
    'l': 4,
    'large': 4,
    
    // Extra Large sizes
    'xl': 5,
    'x-large': 5,
    'extra large': 5,
    'extra-large': 5,
    'extralarge': 5,
    
    // Double Extra Large and beyond
    'xxl': 6,
    '2xl': 6,
    'xx-large': 6,
    'double xl': 6,
    'double extra large': 6,
    
    // Triple Extra Large and beyond
    '3xl': 7,
    'xxxl': 7,
    'xxx-large': 7,
    'triple xl': 7,
    'triple extra large': 7,
    
    // 4XL and beyond
    '4xl': 8,
    '5xl': 9
  }
  return sizeOrder[normalizedValue] ?? 999 // Default high value for unknown sizes
}

// Check if a variant title contains size information
export const isSizeVariant = (title: string): boolean => {
  const lowerTitle = title.toLowerCase().trim()
  const sizeKeywords = ['small', 'medium', 'large', 'xl', 'xxl', 'xs', 'xxs', 's', 'm', 'l']
  
  // Check if the title exactly matches a size or contains size keywords
  return sizeKeywords.some(keyword => {
    // Check for exact match or as a standalone word
    return lowerTitle === keyword || 
           lowerTitle.includes(` ${keyword} `) || 
           lowerTitle.startsWith(`${keyword} `) || 
           lowerTitle.endsWith(` ${keyword}`) ||
           lowerTitle === keyword
  })
}

// Sort variants by size if they contain size information, otherwise alphabetically
export const sortVariantsBySizeOrder = (variants: any[]): any[] => {
  console.log('Sorting variants:', variants.map(v => v.title))
  
  return [...variants].sort((a, b) => {
    const titleA = a.title || ''
    const titleB = b.title || ''
    
    // Check if both variants seem to be size variants
    const isVariantASizeVariant = isSizeVariant(titleA)
    const isVariantBSizeVariant = isSizeVariant(titleB)
    
    console.log(`Variant comparison: "${titleA}" (${isVariantASizeVariant}) vs "${titleB}" (${isVariantBSizeVariant})`)
    
    if (isVariantASizeVariant && isVariantBSizeVariant) {
      // For clothing merch, often the entire title is the size (e.g., "Small", "Medium", "Large", "XL")
      const orderA = getSizeOrder(titleA)
      const orderB = getSizeOrder(titleB)
      
      console.log(`Direct size orders: "${titleA}" = ${orderA}, "${titleB}" = ${orderB}`)
      
      // If direct size lookup works, use it
      if (orderA !== 999 && orderB !== 999) {
        return orderA - orderB
      }
      
      // Extract size from the title (for cases like "T-Shirt - Small")
      const sizeA = titleA.split(/[\s\-:]+/).find(part => getSizeOrder(part) < 999) || titleA
      const sizeB = titleB.split(/[\s\-:]+/).find(part => getSizeOrder(part) < 999) || titleB
      
      const extractedOrderA = getSizeOrder(sizeA)
      const extractedOrderB = getSizeOrder(sizeB)
      
      console.log(`Extracted size orders: "${sizeA}" = ${extractedOrderA}, "${sizeB}" = ${extractedOrderB}`)
      
      if (extractedOrderA !== 999 && extractedOrderB !== 999) {
        return extractedOrderA - extractedOrderB
      }
    }
    
    // Fallback to alphabetical sorting
    console.log(`Falling back to alphabetical sort for "${titleA}" vs "${titleB}"`)
    return titleA.localeCompare(titleB)
  })
}

// Sort option values by size order
export const sortOptionValuesBySizeOrder = (values: any[], optionTitle: string): any[] => {
  if (optionTitle.toLowerCase() === 'size') {
    return [...values].sort((a, b) => getSizeOrder(a.value) - getSizeOrder(b.value))
  }
  // Default alphabetical sort for other options
  return [...values].sort((a, b) => a.value.localeCompare(b.value))
}
