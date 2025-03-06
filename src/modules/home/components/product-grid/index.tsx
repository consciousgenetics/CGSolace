import Image from "next/image"
import Link from "next/link"
import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { convertToLocale } from "@lib/util/money"
import ProductGridItem from "./product-grid-item"

export default async function ProductGrid() {
  // Get region to get prices in the correct currency
  const region = await getRegion("uk").catch(() => null)
  
  // Fetch actual product data if region is available
  let allStrainsProduct = null
  let merchPackProduct = null
  
  if (region) {
    // Fetch the products by their handles
    [allStrainsProduct, merchPackProduct] = await Promise.all([
      getProductByHandle("all-7-strains-pack", region.id).catch(() => null),
      getProductByHandle("merch-pack", region.id).catch(() => null)
    ])
  }
  
  // Format prices or use fallback
  const allStrainsPrice = allStrainsProduct && allStrainsProduct.variants && allStrainsProduct.variants[0] 
    ? convertToLocale({
        amount: allStrainsProduct.variants[0].calculated_price,
        currency_code: region?.currency_code || 'GBP'
      })
    : "Loading..." // Non-hardcoded fallback
    
  const merchPackPrice = merchPackProduct && merchPackProduct.variants && merchPackProduct.variants[0]
    ? convertToLocale({
        amount: merchPackProduct.variants[0].calculated_price,
        currency_code: region?.currency_code || 'GBP'
      })
    : "Loading..." // Non-hardcoded fallback

  return (
    <div className="w-full flex items-center justify-center py-24 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/127.png"
          alt="Background pattern"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="w-full max-w-[1400px] grid grid-cols-1 small:grid-cols-2 small:grid-rows-2 gap-12 px-4 small:px-8 relative z-10">
        {/* All 7 Strains Pack - Top Left */}
        <ProductGridItem 
          delay={0.1}
          title="ALL 7 STRAINS PACK"
          price={allStrainsPrice}
          priceLabel="Premium Pack"
          tagText="Premium Collection"
          tagColor="purple"
          description="If you want POTV feminized seeds from our temporary breeding lines, you will receive all 7 genetics:"
          tagItems={[
            "ZAMNESIA", "DARKWOOD OG", "ORANGE BLAZE", "BLOOD DIAMOND", 
            "PINK PANTHER", "PINK FROST", "PINK QUARTZ"
          ]}
          bonusItems={[
            "1 strain of your choice in your email",
            "Pack of pheno seeds (regular)",
            "Customize your genetics strain name"
          ]}
          buttonLink="/uk/products/all-7-strains-pack"
          buttonColor="purple"
        />

        {/* Strains Image - Top Right */}
        <ProductGridItem 
          delay={0.2}
          type="image"
          backgroundColor="purple" 
          imageSrc="/special-packs.png"
          imageAlt="Collection of colorful strain seed packets"
          imageTitle="Premium Seed Packs"
          imageTag="Special Collection"
        />

        {/* Seeds Packaging Image - Bottom Left */}
        <ProductGridItem 
          delay={0.3}
          type="image"
          backgroundColor="purple" 
          imageSrc="/cg-grinder.png"
          imageAlt="Person packaging seed packets"
          imageTitle="Quality Grinders"
          imageTag="Premium Experience"
          className="order-4 small:order-3"
        />

        {/* Merch Pack - Bottom Right */}
        <ProductGridItem 
          delay={0.4}
          title="MERCH PACK"
          price={merchPackPrice}
          priceLabel="Complete Pack"
          tagText="Fan Favorites"
          tagColor="amber"
          description="If you like a specific design that a merch pack includes:"
          listItems={[
            "1 shirt",
            "Address space",
            "Sticker",
            "Lighter"
          ]}
          buttonLink="/uk/products/merch-pack"
          buttonColor="amber"
          className="order-3 small:order-4"
        />
      </div>
    </div>
  )
} 