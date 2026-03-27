export default function ClientOverviewPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-1">Corner Bar Management</p>
        <h1 className="text-3xl font-bold text-white">Venue Portfolio</h1>
        <p className="text-gray-500 text-sm mt-1">Your venues, sponsorship opportunities, and performance data</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-400 text-lg mb-2">Welcome to the CBM Portal</p>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Upload your Toast POS data and SevenRooms exports to see detailed analytics,
          sponsorship opportunities, and revenue projections across all your venues.
        </p>
        <a href="/client/upload" className="inline-block mt-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm">
          Upload Data
        </a>
      </div>
    </div>
  );
}
