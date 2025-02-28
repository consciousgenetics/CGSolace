import Image from "next/image"
import Link from "next/link"
import { Container } from "@modules/common/components/container"

export default function ProductGrid() {
  return (
    <div className="w-full overflow-x-hidden py-16">
      <Container className="overflow-x-hidden !max-w-none !p-0">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-[1000px]">
          {/* All 7 Strains Pack - Top Left */}
          <div className="bg-yellow-300 p-6 small:p-10 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold uppercase tracking-wide break-words">ALL 7 STRAINS PACK</h2>
              <p className="text-2xl font-bold">£350.00</p>
              <p className="text-sm small:text-base">
                If you want POTV feminized seeds from our temporary breeding lines, you will receive all 7 genetics:
              </p>
              <p className="text-sm small:text-base font-semibold break-words">
                ZAMNESIA | DARKWOOD OG | ORANGE BLAZE CAKE | BLOOD DIAMOND 2.0 | PINK PANTHER 2.0 | PINK FROST | PINK QUARTZ
              </p>
              <p className="text-sm small:text-base font-semibold">Plus Bonus Specials:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm small:text-base">
                <li>1 strain of your choice in your email</li>
                <li>Pack of pheno seeds (regular)</li>
                <li>Customize your genetics strain name and see it in the online store in your checkout!</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="#"
                className="bg-purple-700 text-white px-8 py-2 rounded-full font-bold uppercase inline-block hover:bg-purple-800 transition-colors"
              >
                SHOP NOW
              </Link>
            </div>
          </div>

          {/* Strains Image - Top Right */}
          <div className="relative h-full">
            <Image
              src="/images/product-packs/Special packs.png"
              alt="Collection of colorful strain seed packets"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
          </div>

          {/* Seeds Packaging Image - Bottom Left */}
          <div className="relative h-full">
            <Image
              src="/images/product-packs/Conscious Genetics  Grinder Merch Pack.png"
              alt="Person packaging seed packets"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
          </div>

          {/* Merch Pack - Bottom Right */}
          <div className="bg-purple-700 p-6 small:p-10 flex flex-col justify-between text-white h-full">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold uppercase tracking-wide break-words">MERCH PACK</h2>
              <p className="text-2xl font-bold">£90.00</p>
              <p className="text-sm small:text-base">If you like a specific design that a merch pack includes:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm small:text-base">
                <li>1 shirt</li>
                <li>Address space</li>
                <li>Sticker</li>
                <li>Lighter</li>
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="#"
                className="bg-yellow-300 text-black px-8 py-2 rounded-full font-bold uppercase inline-block hover:bg-yellow-400 transition-colors"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
} 