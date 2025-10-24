'use client';

import { Suspense } from 'react';
import { PaymentPage } from '../../src/modules/payments/interface-adapters/ui/payment-page';

/**
 * Next.js Payment Page Route
 * 
 * This is just a Next.js route handler that delegates to the Clean Architecture UI component
 * The actual business logic is in the PaymentPage UI component
 */
export default function PaymentPageRoute(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPage />
    </Suspense>
  );
}
