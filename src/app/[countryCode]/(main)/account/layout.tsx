import { getCustomer } from '@lib/data/customer'
import AccountLayout from '@modules/account/templates/account-layout'

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  // Add timeout protection to the customer fetch
  const customerPromise = getCustomer();
  
  // Use Promise.race to limit the time spent waiting for customer data
  let customer = null;
  try {
    customer = await Promise.race([
      customerPromise,
      new Promise<null>((resolve) => {
        // Set a timeout to resolve with null if the fetch takes too long
        setTimeout(() => resolve(null), 3000);
      }),
    ]);
  } catch (error) {
    console.error("Failed to fetch customer data:", error);
    // Continue with null customer to show the login page
  }

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
    </AccountLayout>
  )
}
