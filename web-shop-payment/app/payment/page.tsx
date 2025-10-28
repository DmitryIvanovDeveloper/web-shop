import { Suspense } from 'react';
import { PaymentPage } from '../../src/modules/payments/interface-adapters/ui/payment-page';

/**
 * Next.js Payment Page Route (Server Component)
 * 
 * This is a Server Component that delegates to the Clean Architecture UI component
 * The actual business logic is in the PaymentPage UI component (Client Component)
 */

// Force dynamic rendering to ensure fresh data on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PaymentPageRoute(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPage />
    </Suspense>
  );
}
