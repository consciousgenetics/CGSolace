import React from 'react'

import Footer from '@modules/layout/templates/footer'
import NavWrapper from '@modules/layout/templates/nav'

const Layout: React.FC<{
  params: { countryCode: string }
  children: React.ReactNode
}> = ({ params, children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavWrapper countryCode={params.countryCode} />
      <main className="relative pt-[80px] xsmall:pt-[90px] medium:pt-[110px] flex-grow">{children}</main>
      <Footer countryCode={params.countryCode} />
    </div>
  )
}

export default Layout
