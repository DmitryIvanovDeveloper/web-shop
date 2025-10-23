'use client';

export default function HomePage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-4xl font-bold mb-4">Payment Service</h1>
        <p className="text-gray-300 text-lg mb-8">
          This is a dedicated payment processing service.
        </p>
        <div className="text-gray-400">
          <p>Available endpoints:</p>
          <ul className="mt-2 space-y-1">
            <li>• /api/payments/create-intent</li>
            <li>• /api/payments/status/[id]</li>
            <li>• /api/products/list</li>
            <li>• /payment - Payment form</li>
            <li>• /payment/success - Success page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}