import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping | Solace Store",
  description: "Shipping information and delivery details for Solace Store.",
}

export default function ShippingPage() {
  return (
    <div className="content-container flex flex-col py-16 gap-4">
      <h1 className="text-2xl-semi">Shipping Policy</h1>
      
      <div className="mt-8">
        <h2 className="text-xl-semi mb-4">Delivery Information</h2>
        <p className="mb-4">
          We strive to process and ship all orders within 1-2 business days. Once your order has been shipped, 
          you will receive a shipping confirmation email with tracking information.
        </p>
        
        <h2 className="text-xl-semi mb-4 mt-8">Shipping Methods</h2>
        <p className="mb-4">
          We offer various shipping methods depending on your location. Shipping rates and estimated delivery times 
          will be calculated at checkout.
        </p>
        
        <h2 className="text-xl-semi mb-4 mt-8">International Shipping</h2>
        <p className="mb-4">
          We ship worldwide. Please note that international orders may be subject to import duties and taxes, 
          which are the responsibility of the customer.
        </p>
      </div>
    </div>
  )
} 