import { Metadata } from 'next'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import SidebarBookmarks from '@modules/content/components/sidebar-bookmarks'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Review the terms governing the use of our website, products and services, including user responsibilities, legal rights, and policies.',
}

export default function TermsAndConditions() {
  const bookmarks = [
    { id: 'general-information', label: '1. General Information' },
    { id: 'legal-compliance', label: '2. Legal Compliance' },
    { id: 'orders-payment', label: '3. Orders & Payment' },
    { id: 'shipping-delivery', label: '4. Shipping & Delivery' },
    { id: 'returns-refunds', label: '5. Returns & Refunds' },
    { id: 'intellectual-property', label: '6. Intellectual Property' },
    { id: 'limitation-liability', label: '7. Limitation of Liability' },
    { id: 'privacy-policy', label: '8. Privacy Policy' },
    { id: 'amendments', label: '9. Amendments' },
    { id: 'contact-information', label: '10. Contact Information' },
  ]

  return (
    <Container className="min-h-screen max-w-full bg-secondary !p-0">
      <Container className="!py-8">
        <StoreBreadcrumbs breadcrumb="Terms & Conditions" />
        <Heading as="h1" className="mt-4 text-4xl medium:text-5xl">
          Terms & Conditions
        </Heading>
        <Box className="mt-6 grid grid-cols-12 medium:mt-12">
          <Box className="col-span-12 mb-10 medium:col-span-3 medium:mb-0">
            <SidebarBookmarks data={bookmarks} />
          </Box>
          <Box className="col-span-12 space-y-10 medium:col-span-8 medium:col-start-5">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Terms and Conditions<br />
                Last Updated: 11 March 2025
              </p>

              <p className="text-gray-600 mb-8">
                Welcome to Conscious Genetics. By accessing or using our website (https://conscious-genetics.com), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.
              </p>

              <div className="space-y-8">
                <section id="general-information">
                  <h2 className="text-xl font-bold mb-4">1. General Information</h2>
                  <div className="space-y-4">
                    <p>1.1. Conscious Genetics operates as a seed bank offering cannabis seeds as collectible souvenirs and for genetic preservation purposes only.</p>
                    <p>1.2. By using this website, you confirm that you are of legal age in your jurisdiction to purchase and possess cannabis seeds.</p>
                  </div>
                </section>

                <section id="legal-compliance">
                  <h2 className="text-xl font-bold mb-4">2. Legal Compliance</h2>
                  <div className="space-y-4">
                    <p>2.1. Our products are sold strictly as souvenirs or for genetic preservation. It is the customer's responsibility to research and comply with local laws before purchasing.</p>
                    <p>2.2. We do not condone or encourage the germination or cultivation of cannabis where it is illegal.</p>
                    <p>2.3. Conscious Genetics accepts no liability for customers who act outside of the law.</p>
                  </div>
                </section>

                <section id="orders-payment">
                  <h2 className="text-xl font-bold mb-4">3. Orders & Payment</h2>
                  <div className="space-y-4">
                    <p>3.1. All orders are subject to availability and confirmation of payment.</p>
                    <p>3.2. Payments must be made in full before the order is processed and shipped.</p>
                    <p>3.3. We reserve the right to refuse or cancel orders at our discretion.</p>
                  </div>
                </section>

                <section id="shipping-delivery">
                  <h2 className="text-xl font-bold mb-4">4. Shipping & Delivery</h2>
                  <div className="space-y-4">
                    <p>4.1. We aim to ship orders promptly; however, delivery times may vary depending on location.</p>
                    <p>4.2. Customers are responsible for ensuring that their shipping address is correct.</p>
                    <p>4.3. Conscious Genetics is not responsible for items lost, delayed, or seized in transit due to customs or legal issues.</p>
                  </div>
                </section>

                <section id="returns-refunds">
                  <h2 className="text-xl font-bold mb-4">5. Returns & Refunds</h2>
                  <div className="space-y-4">
                    <p>5.1. Due to the nature of our products, all sales are final. We do not accept returns or offer refunds.</p>
                    <p>5.2. If you receive a damaged or incorrect product, please contact us within 7 days of delivery for assistance.</p>
                  </div>
                </section>

                <section id="intellectual-property">
                  <h2 className="text-xl font-bold mb-4">6. Intellectual Property</h2>
                  <div className="space-y-4">
                    <p>6.1. All content on this website, including text, images, and branding, is the property of Conscious Genetics and may not be copied, reproduced, or used without permission.</p>
                  </div>
                </section>

                <section id="limitation-liability">
                  <h2 className="text-xl font-bold mb-4">7. Limitation of Liability</h2>
                  <div className="space-y-4">
                    <p>7.1. Conscious Genetics shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our website or products.</p>
                    <p>7.2. We make no guarantees regarding germination rates, plant characteristics, or yields.</p>
                  </div>
                </section>

                <section id="privacy-policy">
                  <h2 className="text-xl font-bold mb-4">8. Privacy Policy</h2>
                  <div className="space-y-4">
                    <p>8.1. We respect your privacy and will never share your personal information with third parties, except where required by law.</p>
                    <p>8.2. By using our website, you agree to our data collection practices as outlined in our Privacy Policy.</p>
                  </div>
                </section>

                <section id="amendments">
                  <h2 className="text-xl font-bold mb-4">9. Amendments</h2>
                  <div className="space-y-4">
                    <p>9.1. Conscious Genetics reserves the right to update or modify these Terms and Conditions at any time.</p>
                    <p>9.2. Continued use of the website after any changes constitutes acceptance of the revised Terms.</p>
                  </div>
                </section>

                <section id="contact-information">
                  <h2 className="text-xl font-bold mb-4">10. Contact Information</h2>
                  <div className="space-y-4">
                    <p>If you have any questions regarding these Terms and Conditions, please contact us at: info@consciousgenetics.com</p>
                  </div>
                </section>
              </div>
            </div>
          </Box>
        </Box>
      </Container>
    </Container>
  )
}
