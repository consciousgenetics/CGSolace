import Image from "next/image"

const HeroSection = () => {
  return (
    <div className="relative h-[600px] w-full">
      <div className="absolute inset-0 bg-black/60 z-10" />
      <Image
        src="/hero-bg.jpg"
        alt="Hero background"
        fill
        className="object-cover"
        priority
      />
      <div className="relative z-20 container mx-auto h-full flex flex-col items-center justify-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-6">
          PUTTING TERPS INTO
          <br />
          THOSE PURPS
        </h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg">
          SHOP ALL
        </button>
      </div>
    </div>
  )
}

export default HeroSection 