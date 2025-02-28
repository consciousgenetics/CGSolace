'use client'

const reviews = [
  {
    id: 1,
    name: "John Doe",
    rating: 5,
    comment: "Amazing quality and fast shipping! Will definitely order again.",
    location: "London, UK",
  },
  {
    id: 2,
    name: "Jane Smith",
    rating: 5,
    comment: "Best products I've tried. The customer service is outstanding!",
    location: "London, UK",
  },
  {
    id: 3,
    name: "Mike Johnson",
    rating: 5,
    comment: "Exceeded my expectations. Highly recommended!",
    location: "London, UK",
  },
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(rating)].map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const CustomerReviews = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          CUSTOMER REVIEWS
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-900 p-6 rounded-lg border border-gray-800"
            >
              <StarRating rating={review.rating} />
              <p className="text-white mt-4 mb-6">{review.comment}</p>
              <div className="text-gray-400">
                <p className="font-semibold">{review.name}</p>
                <p className="text-sm">{review.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CustomerReviews 