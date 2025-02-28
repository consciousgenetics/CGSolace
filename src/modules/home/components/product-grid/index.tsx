import Image from "next/image"
import Link from "next/link"
import { Container } from "@modules/common/components/container"

export default function ProductGrid() {
  return (
    <div className="w-full overflow-x-hidden py-16 bg-black">
      <Container className="overflow-x-hidden">
        <div className="grid grid-cols-2 gap-1 h-[800px] relative">
          {/* Winsdor Collection - Top Left */}
          <div className="relative h-full overflow-hidden">
            <Image
              src="/product1.jpg"
              alt="Winsdor Collection"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h2 className="text-5xl font-light text-white mb-2">Winsdor</h2>
              <p className="text-white text-base font-light max-w-xs">
                Contemporary designs with sleek lines, crafted from premium oak in a natural finish.
              </p>
            </div>
          </div>

          {/* Savannah Collection - Top Right */}
          <div className="relative h-full overflow-hidden">
            <Image
              src="/product2.jpg"
              alt="Savannah Collection"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute bottom-0 left-0 p-8">
              <h2 className="text-5xl font-light text-white">Savannah</h2>
            </div>
          </div>

          {/* Ashton Collection - Bottom Left */}
          <div className="relative h-full overflow-hidden">
            <Image
              src="/product3.jpg"
              alt="Ashton Collection"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute bottom-0 left-0 p-8">
              <h2 className="text-5xl font-light text-white">Ashton</h2>
            </div>
          </div>

          {/* Savannah Collection Detail - Bottom Right */}
          <div className="relative h-full overflow-hidden">
            <Image
              src="/product4.jpg"
              alt="Savannah Collection Detail"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
          </div>

          {/* Discover Button - Centered */}
          <div className="absolute left-1/2 top-[15%] transform -translate-x-1/2 z-10">
            <Link
              href="/collections"
              className="bg-white text-black px-10 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Discover
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
} 