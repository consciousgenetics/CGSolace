import { Metadata } from 'next'

import { Container } from '@modules/common/components/container'
import { Text } from '@modules/common/components/text'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how we collect, use, and protect your personal information when you interact with our website, products and services.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-[80vh] py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-repeat opacity-100" style={{ backgroundImage: 'url("/126-wide.png")', backgroundSize: '800px' }}></div>
      
      <Container>
        <div className="max-w-4xl mx-auto w-full relative">
          <div className="text-center mb-8 sm:mb-12">
            <Text className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">Privacy Policy</Text>
            <Text className="text-white text-base sm:text-lg max-w-2xl mx-auto">
              Last updated: March 12, 2025
            </Text>
          </div>

          <div className="bg-black rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl backdrop-blur-sm bg-opacity-90">
            <div className="space-y-6 text-white">
              <div className="space-y-4">
                <Text className="text-lg">
                  This Privacy Policy describes how Conscious Genetics (the "Site", "we", "us", or "our") collects, uses, and discloses your personal information when you visit, use our services, or make a purchase from consciousgenetics.com (the "Site") or otherwise communicate with us regarding the Site (collectively, the "Services"). For purposes of this Privacy Policy, "you" and "your" means you as the user of the Services, whether you are a customer, website visitor, or another individual whose information we have collected pursuant to this Privacy Policy.
                </Text>
                <Text className="text-lg font-bold">Please read this Privacy Policy carefully.</Text>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Changes to This Privacy Policy</h2>
                <Text>
                  We may update this Privacy Policy from time to time, including to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on the Site, update the "Last updated" date and take any other steps required by applicable law.
                </Text>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">How We Collect and Use Your Personal Information</h2>
                <Text>
                  To provide the Services, we collect personal information about you from a variety of sources, as set out below. The information that we collect and use varies depending on how you interact with us.
                </Text>
                <Text>
                  In addition to the specific uses set out below, we may use information we collect about you to communicate with you, provide or improve or improve the Services, comply with any applicable legal obligations, enforce any applicable terms of service, and to protect or defend the Services, our rights, and the rights of our users or others.
                </Text>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">What Personal Information We Collect</h3>
                <Text>
                  The types of personal information we obtain about you depends on how you interact with our Site and use our Services. When we use the term "personal information", we are referring to information that identifies, relates to, describes or can be associated with you.
                </Text>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Information We Collect Directly from You</h3>
                <Text>Information that you directly submit to us through our Services may include:</Text>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact details including your name, address, phone number, and email.</li>
                  <li>Order information including your name, billing address, shipping address, payment confirmation, email address, and phone number.</li>
                  <li>Account information including your username, password, security questions and other information used for account security purposes.</li>
                  <li>Customer support information including the information you choose to include in communications with us, for example, when sending a message through the Services.</li>
                </ul>
              </div>

              <div className="mt-8">
                <Text className="text-sm text-gray-400">
                  For the complete privacy policy, please visit{" "}
                  <a 
                    href="https://consciousgenetics.com/policies/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 underline"
                  >
                    our official privacy policy page
                  </a>
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
