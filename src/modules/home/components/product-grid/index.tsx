import Image from "next/image"
import Link from "next/link"

export default function ProductGrid() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white overflow-hidden">
      <div className="w-screen h-full grid grid-cols-2 grid-rows-2 gap-0">
        {/* All 7 Strains Pack - Top Left */}
        <div className="relative p-6 small:p-8 flex flex-col justify-between h-full">
          <Image
            src="/126.png"
            alt="Background pattern"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          <div className="relative space-y-2">
            <h2 className="text-xl small:text-2xl font-bold uppercase tracking-wide break-words">ALL 7 STRAINS PACK</h2>
            <p className="text-lg small:text-xl font-bold">£350.00</p>
            <p className="text-xs small:text-sm">
              If you want POTV feminized seeds from our temporary breeding lines, you will receive all 7 genetics:
            </p>
            <p className="text-xs small:text-sm font-semibold break-words">
              ZAMNESIA | DARKWOOD OG | ORANGE BLAZE CAKE | BLOOD DIAMOND 2.0 | PINK PANTHER 2.0 | PINK FROST | PINK QUARTZ
            </p>
            <p className="text-xs small:text-sm font-semibold">Plus Bonus Specials:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-xs small:text-sm">
              <li>1 strain of your choice in your email</li>
              <li>Pack of pheno seeds (regular)</li>
              <li>Customize your genetics strain name and see it in the online store in your checkout!</li>
            </ul>
          </div>
          <div className="relative mt-3">
            <Link
              href="#"
              className="bg-purple-700 text-white px-6 py-1.5 small:px-8 small:py-2 rounded-full font-bold uppercase inline-block hover:bg-purple-800 transition-colors text-sm small:text-base"
            >
              SHOP NOW
            </Link>
          </div>
        </div>

        {/* Strains Image - Top Right */}
        <div className="relative h-full">
          <Image
            src={`/special-packs.png`}
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
            src={`/cg-grinder.png`}
            alt="Person packaging seed packets"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
        </div>

        {/* Merch Pack - Bottom Right */}
        <div className="relative p-6 small:p-8 flex flex-col justify-between text-white h-full">
          <Image
            src="/127.png"
            alt="Background pattern"
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
          <div className="relative space-y-2">
            <h2 className="text-xl small:text-2xl font-bold uppercase tracking-wide break-words">MERCH PACK</h2>
            <p className="text-lg small:text-xl font-bold">£90.00</p>
            <p className="text-xs small:text-sm">If you like a specific design that a merch pack includes:</p>
            <ul className="list-disc pl-5 space-y-0.5 text-xs small:text-sm">
              <li>1 shirt</li>
              <li>Address space</li>
              <li>Sticker</li>
              <li>Lighter</li>
            </ul>
          </div>
          <div className="relative mt-3">
            <Link
              href="#"
              className="bg-yellow-300 text-black px-6 py-1.5 small:px-8 small:py-2 rounded-full font-bold uppercase inline-block hover:bg-yellow-400 transition-colors text-sm small:text-base"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 