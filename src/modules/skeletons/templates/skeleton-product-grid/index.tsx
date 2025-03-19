import repeat from '@lib/util/repeat'
import SkeletonProductPreview from '@modules/skeletons/components/skeleton-product-preview'

const SkeletonProductGrid = () => {
  return (
    <ul
      className="grid w-full grid-cols-1 gap-x-4 gap-y-8 small:grid-cols-2 large:grid-cols-3 justify-items-center"
      data-testid="products-list"
    >
      {repeat(8).map((index) => (
        <li key={index}>
          <SkeletonProductPreview />
        </li>
      ))}
    </ul>
  )
}

export default SkeletonProductGrid
