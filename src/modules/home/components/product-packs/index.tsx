import Image from 'next/image'

import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

export const ProductPacks = () => {
  return (
    <Container className="mt-10 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Top Row - Left: Yellow block with ALL 7 STRAINS PACK */}
        <div 
          className="bg-[#FFDD3C] p-6 md:p-8"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase mb-1 text-black">
            ALL 7 STRAINS PACK
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-3 text-black">
            £350.00
          </p>
          <p className="text-sm leading-snug text-black mb-2">
            If you want to try feminized seeds from our temporary breeding bank, you will receive all 7 genetics:
          </p>
          <div className="mb-4">
            <p className="text-sm leading-tight text-black mb-0.5">
              ZAMALAK 2.0 | DAWN CHORUS | ORANGE KUSH CAKE |
            </p>
            <p className="text-sm leading-tight text-black mb-0.5">
              BLOOD DIAMOND 2.0 | PINK PANTHER 2.0 | PINK FROST | PINK QUARTZ
            </p>
            <p className="text-sm leading-tight text-black">
              Plus Bonus Specials:
            </p>
          </div>
          <div className="mt-4">
            <LocalizedClientLink 
              href="/products/all-7-strains-pack"
              className="inline-block rounded-full px-6 py-1 text-center font-bold text-xs uppercase tracking-wide hover:opacity-90 bg-[#5D2C90] text-white"
            >
              SHOP NOW
            </LocalizedClientLink>
          </div>
        </div>

        {/* Top Row - Right: Seed Packets Image */}
        <div className="relative h-64 md:h-auto">
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
        <div className="relative h-64 md:h-auto">
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
          className="bg-[#7A4294] p-6 md:p-8"
        >
          <h2 className="text-xl md:text-2xl font-black uppercase mb-1 text-white">
            MERCH PACK
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-3 text-white">
            £50.00
          </p>
          <p className="text-sm leading-snug text-white mb-2">
            If you like a specific design that a merch pack includes:
          </p>
          <div className="mb-4">
            <p className="text-sm leading-tight text-white mb-0.5">
              T-shirt
            </p>
            <p className="text-sm leading-tight text-white mb-0.5">
              Ash tray
            </p>
            <p className="text-sm leading-tight text-white mb-0.5">
              Sticker
            </p>
            <p className="text-sm leading-tight text-white">
              Lighter
            </p>
          </div>
          <div className="mt-4">
            <LocalizedClientLink 
              href="/products/merch-pack"
              className="inline-block rounded-full px-6 py-1 text-center font-bold text-xs uppercase tracking-wide hover:opacity-90 bg-[#FFDD3C] text-black"
            >
              SHOP NOW
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </Container>
  )
} 