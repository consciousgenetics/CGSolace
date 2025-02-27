import { VariantColor } from 'types/strapi'

export const getVariantColor = (
  variantName: string,
  colors: VariantColor[] = []
) => {
  // Safe check - if colors is not an array or empty, return undefined
  if (!colors || !Array.isArray(colors) || colors.length === 0) {
    return undefined;
  }
  
  // Handle two possible formats - either directly accessing Name and Type, 
  // or using the nested attributes structure from the API
  let variantColor;
  
  // First try the direct structure (might be used after transformation)
  if ('Name' in colors[0]) {
    variantColor = colors.find((c: any) => c.Name === variantName);
    return variantColor?.Type?.[0];
  }
  
  // Then try the API structure with attributes
  variantColor = colors.find((c) => c.attributes?.Name === variantName);
  
  if (!variantColor?.attributes?.variant_types?.data?.length) {
    return undefined;
  }
  
  // Map the variant_types data to match the expected Type structure
  const firstType = variantColor.attributes.variant_types.data[0]?.attributes;
  if (!firstType) return undefined;
  
  return {
    Name: firstType.Name,
    Color: variantColor.attributes.Color,
    Image: firstType.Image?.data?.attributes
  };
}
