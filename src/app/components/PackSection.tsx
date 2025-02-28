'use client'

import Image from "next/image"

const PackSection = () => {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                ALL 7 STRAINS PACK
              </h2>
              <div className="text-white space-y-4 mb-8">
                <p>• 7 unique strains in one convenient pack</p>
                <p>• Perfect for collectors and enthusiasts</p>
                <p>• Special bundle pricing</p>
                <p>• Limited time offer</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-white">£360.00</span>
                <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-full">
                  SHOP NOW
                </button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src="/pack-image.jpg"
                alt="All 7 Strains Pack"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PackSection 