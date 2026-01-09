import { DailyRewards } from '@/modules/daily-rewards';

export default function DailyRewardsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Rewards Demo
          </h1>
          <p className="text-gray-600">
            Test the daily rewards functionality
          </p>
        </div>

        <div className="flex justify-center">
          <DailyRewards
            userId="demo-user-123"
          />
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">How it works:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Click "Claim Reward" to get daily points</li>
            <li>• You can only claim once per day</li>
            <li>• The system tracks your claim history</li>
            <li>• Rewards are managed through the merchant admin panel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}





