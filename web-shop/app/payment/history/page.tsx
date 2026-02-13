import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<any>;
}

export default async function PaymentHistoryPage({ searchParams }: PageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const userId = params.userId;

  if (!userId) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      <p className="text-gray-600">Payment history for user: {userId}</p>
      {/* TODO: Implement payment history view */}
    </div>
  );
}