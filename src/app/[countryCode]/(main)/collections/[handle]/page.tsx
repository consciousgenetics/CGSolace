import CollectionTemplate from '@modules/collections/templates'

// Set dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic'

// Add revalidation to reduce frequent API calls
export const revalidate = 300; // 5 minutes

export default CollectionTemplate
