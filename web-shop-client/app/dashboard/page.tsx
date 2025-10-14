export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 border-r border-yellow-400/30 backdrop-blur-sm z-50" style={{ backgroundColor: '#04183e' }}>
        {/* Header */}
        <div className="p-3 border-b border-yellow-400/30">
          <div className="flex justify-center">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <div className="text-black font-bold text-lg" style={{ fontFamily: 'monospace' }}>
                PG3D
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

