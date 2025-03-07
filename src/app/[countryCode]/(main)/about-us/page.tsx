import { Metadata } from 'next'

import { getExploreBlogData } from '@lib/data/fetch'
import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'
import { Heading } from '@modules/common/components/heading'
import { Box } from '@modules/common/components/box'
import { ExploreBlog } from '@modules/home/components/explore-blog'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About Conscious Genetics',
  description:
    'Discover our journey in creating unique genetics with our mission to add terps to the purps.',
}

export default async function AboutUsPage() {
  const { data: posts } = await getExploreBlogData()

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-[url('/special-packs.png')] bg-center bg-cover bg-fixed z-0"></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-6xl md:text-7xl font-bold text-center mb-6 tracking-tight">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl text-center leading-relaxed font-light">
            Pioneering unique genetics with a focus on exceptional quality and innovative breeding techniques.
          </p>
        </div>
      </div>

      {/* Our Journey Section */}
      <Container className="py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div className="order-2 lg:order-1 space-y-8">
            <h2 className="text-4xl font-bold mb-6">Our Journey</h2>
            <div className="space-y-6 text-lg text-gray-700">
              <p className="leading-relaxed">
                <strong>Conscious Genetics</strong> began its breeding journey almost seven years ago with its flagship strain, the <span className="text-amber-600 font-medium">Conscious Kush V1</span>. This unique strain is a fusion of Sunset Sherbet x Orange Diesel X Blue Cookies x Guard Dawg.
              </p>
              <p className="leading-relaxed">
                After creating this strain, we sought to differentiate ourselves from other breeders by working on unique, deep purple-hued plants. There is a common belief that most purple strains seriously lack in the terps department, and we made it our mission to change that narrative.
              </p>
              <p className="leading-relaxed">
                Through extensive research and collaboration with <span className="text-amber-600 font-medium">Annunaki Genetics</span> based in the USA, we focused our work on rare purple genetics, hunting for unique strains to add distinctive colors to our collection.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative h-[600px] w-full overflow-hidden rounded-2xl">
              <Image 
                src="/cg-grinder.png" 
                alt="Conscious Genetics" 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Our Values Section */}
      <div className="bg-gray-50 py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group">
                <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="h-16 w-16 bg-amber-100 rounded-xl mb-6 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Innovation</h3>
                  <p className="text-gray-600 leading-relaxed">Our goal is to innovate in the genetics space by creating unique purple strains with exceptional terpene profiles, challenging the status quo.</p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="h-16 w-16 bg-amber-100 rounded-xl mb-6 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Quality</h3>
                  <p className="text-gray-600 leading-relaxed">We maintain the highest standards of quality in our breeding practices, ensuring dense buds, heavy resin production, and vigorous growth structure.</p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white p-10 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="h-16 w-16 bg-amber-100 rounded-xl mb-6 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Authenticity</h3>
                  <p className="text-gray-600 leading-relaxed">We stay true to our vision of creating distinctive purple genetics with exceptional terpene profiles, ensuring a unique experience for our customers.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Our Process Section */}
      <Container className="py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">Our Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="group">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-600"></div>
                <div className="pl-6">
                  <span className="text-amber-600 font-bold text-lg mb-2 block">01</span>
                  <h3 className="text-xl font-bold mb-4">Pheno Hunting</h3>
                  <p className="text-gray-600 leading-relaxed">We hunt through large volumes of stock to find unique purple strains with the perfect balance of color, structure, and terpene profile.</p>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-600"></div>
                <div className="pl-6">
                  <span className="text-amber-600 font-bold text-lg mb-2 block">02</span>
                  <h3 className="text-xl font-bold mb-4">Selective Breeding</h3>
                  <p className="text-gray-600 leading-relaxed">We carefully select male and female plants with the characteristics we're looking for, such as deep purple coloration, robust terpene profiles, and strong growth structure.</p>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-600"></div>
                <div className="pl-6">
                  <span className="text-amber-600 font-bold text-lg mb-2 block">03</span>
                  <h3 className="text-xl font-bold mb-4">Backcrossing & Stabilization</h3>
                  <p className="text-gray-600 leading-relaxed">Through careful backcrossing (BX) processes, we stabilize desirable traits in our genetics, creating consistent strains that growers can rely on.</p>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-600"></div>
                <div className="pl-6">
                  <span className="text-amber-600 font-bold text-lg mb-2 block">04</span>
                  <h3 className="text-xl font-bold mb-4">Testing & Refinement</h3>
                  <p className="text-gray-600 leading-relaxed">We thoroughly test our strains to ensure they meet our high standards for potency, terpene profile, yield, and bag appeal before bringing them to market.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Stats Section */}
      <div className="bg-gray-50 py-24">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="text-5xl font-bold mb-2 text-amber-600">7+</div>
                  <p className="text-gray-600 font-medium">Years of Experience</p>
                </div>
              </div>
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="text-5xl font-bold mb-2 text-amber-600">50+</div>
                  <p className="text-gray-600 font-medium">Unique Phenos</p>
                </div>
              </div>
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="text-5xl font-bold mb-2 text-amber-600">30%</div>
                  <p className="text-gray-600 font-medium">Top THC Content</p>
                </div>
              </div>
              <div className="group">
                <div className="bg-white p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="text-5xl font-bold mb-2 text-amber-600">4</div>
                  <p className="text-gray-600 font-medium">Major Breeding Lines</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Vision Section */}
      <Container className="py-24">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-8 text-center">Our Vision</h2>
            
            <div className="text-center mb-16">
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Conscious Genetics strongly believes the best strains we'll produce are yet to come. With our next seed drop, we plan to pheno hunt a range of selected strains and put our seven years of work into a few final strains.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { title: "Terps", desc: "Rich, complex terpene profiles that provide unique aromas and flavors." },
                { title: "Purps", desc: "Deep, vibrant purple coloration that sets our strains apart visually." },
                { title: "Potency", desc: "High potency with balanced effects for an exceptional experience." },
                { title: "Density", desc: "Dense, resinous buds that provide substantial weight and bag appeal." },
                { title: "Structure", desc: "Robust plant structure that supports heavy yields and easy maintenance." },
                { title: "Yield", desc: "Exceptional yield potential for both commercial and personal growers." }
              ].map((item, index) => (
                <div key={index} className="group">
                  <div className="bg-gray-50 p-6 rounded-xl hover:bg-amber-50 transition-colors duration-300">
                    <h3 className="font-bold text-xl mb-3 group-hover:text-amber-600 transition-colors duration-300">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Related Blog Posts */}
      <ExploreBlog posts={posts} />
    </div>
  )
}
