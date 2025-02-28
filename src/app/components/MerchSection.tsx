'use client'

import Image from "next/image"

const merchItems = [
  {
    id: 1,
    name: "MEN BLACK T-SHIRT",
    price: "29.99",
    image: "/merch1.jpg",
  },
  {
    id: 2,
    name: "MEN BLACK T-SHIRT",
    price: "29.99",
    image: "/merch2.jpg",
  },
  {
    id: 3,
    name: "MEN BLACK T-SHIRT",
    price: "29.99",
    image: "/merch3.jpg",
  },
  {
    id: 4,
    name: "MEN BLACK T-SHIRT",
    price: "29.99",
    image: "/merch4.jpg",
  },
]

const MerchSection = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          LATEST CLOTHING MERCH
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {merchItems.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="text-white text-lg font-semibold text-center">
                {item.name}
              </h3>
              <p className="text-purple-500 text-center">${item.price}</p>
              <div className="text-center mt-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full text-sm">
                  SHOP NOW
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MerchSection 