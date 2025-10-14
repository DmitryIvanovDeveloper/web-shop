import { AppLayout } from '../src/components/layout/app-layout';

export default function Home() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-white mb-8">Welcome to Web Shops X</h1>
        <p className="text-gray-300 text-lg">Your gaming marketplace hub</p>
        <div className="mt-8">
          <a 
            href="/shop" 
            className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-all"
          >
            Browse Shop
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
