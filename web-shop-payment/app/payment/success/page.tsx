'use client';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage(): JSX.Element {
  const router = useRouter();

  const handleBackToProducts = () => {
    // Redirect back to the main shop
    const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3001';
    window.location.href = clientUrl;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-white text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-300 text-lg mb-8">
          Thank you for your purchase. You will receive a confirmation email shortly.
        </p>
        <button
          onClick={handleBackToProducts}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
