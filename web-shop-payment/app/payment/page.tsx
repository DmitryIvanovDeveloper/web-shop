'use client';

import { Suspense } from 'react';
import { PaymentPage } from '../../src/modules/payments/interface-adapters/ui/payment-page';

/**
 * Next.js Payment Page Route
 * 
 * This is just a Next.js route handler that delegates to the Clean Architecture UI component
 * The actual business logic is in the PaymentPage UI component
 */

// Force dynamic rendering to ensure environment variables are available
export const dynamic = 'force-dynamic';

export default function PaymentPageRoute(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPage />
    </Suspense>
  );
}
