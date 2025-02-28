import Image from "next/image"

const products = [
  {
    id: 1,
    name: "SUPER PURPLE",
    price: "19.99",
    image: "/product1.jpg",
  },
  {
    id: 2,
    name: "SPACE RANGER",
    price: "19.99",
    image: "/product2.jpg",
  },
  {
    id: 3,
    name: "SWEET DREAMS",
    price: "19.99",
    image: "/product3.jpg",
  },
  {
    id: 4,
    name: "SEPTEMBER",
    price: "19.99",
    image: "/product4.jpg",
  },
]

const ProductShowcase = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          WE BREED BY EXAMPLE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="text-white text-xl font-semibold text-center">
                {product.name}
              </h3>
              <p className="text-purple-500 text-center">${product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase 