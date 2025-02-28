import Image from 'next/image'

import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export const ProductPacks = () => {
  return (
    <Container className="mt-10 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Top Row - Left: Yellow block with ALL 7 STRAINS PACK */}
        <div 
          className="bg-[#FFDD3C] p-6 md:p-10 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-black uppercase tracking-wide mb-1 text-black">
            ALL 7 STRAINS PACK
          </h2>
          <p className="text-2xl font-bold mb-3 text-black">
            £350.00
          </p>
          <p className="text-sm mb-2 leading-snug text-black">
            If you want to try feminized seeds from our temporary breeding bank, you will receive all 7 genetics:
          </p>
          <div className="mb-3">
            <p className="text-xs md:text-sm mb-1 leading-tight text-black">
              ZAMALAK 2.0 | DAWN CHORUS | ORANGE KUSH CAKE |
            </p>
            <p className="text-xs md:text-sm mb-1 leading-tight text-black">
              BLOOD DIAMOND 2.0 | PINK PANTHER 2.0 | PINK FROST | PINK QUARTZ
            </p>
            <p className="text-xs md:text-sm leading-tight text-black">
              Plus Bonus Specials:
            </p>
          </div>
          <div className="mt-4">
            <LocalizedClientLink 
              href="/products/all-7-strains-pack"
              className="inline-block rounded-full px-8 py-2 text-center font-bold text-sm uppercase tracking-wide hover:opacity-90 bg-[#5D2C90] text-white"
            >
              SHOP NOW
            </LocalizedClientLink>
          </div>
        </div>

        {/* Top Row - Right: Seed Packets Image */}
        <div className="relative h-64 md:h-80">
          <Image
            src="/images/product-packs/all-strains-pack.jpg"
            alt="All 7 strains pack product image showing seed packets"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Bottom Row - Left: Person in Hoodie Image */}
        <div className="relative h-64 md:h-80">
          <Image
            src="/images/product-packs/merch-pack.jpg"
            alt="Person wearing merchandise hoodie"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Bottom Row - Right: Purple block with MERCH PACK */}
        <div 
          className="bg-[#7A4294] p-6 md:p-10 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-black uppercase tracking-wide mb-1 text-white">
            MERCH PACK
          </h2>
          <p className="text-2xl font-bold mb-3 text-white">
            £50.00
          </p>
          <p className="text-sm mb-2 leading-snug text-white">
            If you like a specific design that a merch pack includes:
          </p>
          <div className="mb-3">
            <p className="text-xs md:text-sm mb-1 leading-tight text-white">
              T-shirt
            </p>
            <p className="text-xs md:text-sm mb-1 leading-tight text-white">
              Ash tray
            </p>
            <p className="text-xs md:text-sm mb-1 leading-tight text-white">
              Sticker
            </p>
            <p className="text-xs md:text-sm leading-tight text-white">
              Lighter
            </p>
          </div>
          <div className="mt-4">
            <LocalizedClientLink 
              href="/products/merch-pack"
              className="inline-block rounded-full px-8 py-2 text-center font-bold text-sm uppercase tracking-wide hover:opacity-90 bg-[#FFDD3C] text-black"
            >
              SHOP NOW
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </Container>
  )
} 