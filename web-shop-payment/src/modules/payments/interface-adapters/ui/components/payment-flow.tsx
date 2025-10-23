'use client';

export interface PaymentFlowProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PaymentFlow({ className, style }: PaymentFlowProps): JSX.Element {
  // Payment Service doesn't have products module
  // Products are handled by the main client service
  return (
    <div className={className} style={style}>
      <div className="text-center p-8">
        <h2 className="text-white text-xl font-bold mb-4">Payment Service</h2>
        <p className="text-gray-300">
          This is a dedicated payment processing service.
          Products are managed by the main client service.
        </p>
        <p className="text-gray-400 mt-4">
          Navigate to <code>/payment</code> to process payments.
        </p>
      </div>
    </div>
  );
}
