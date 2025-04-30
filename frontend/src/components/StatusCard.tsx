export const StatusCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow px-4 py-3 w-60 text-sm">
    <div className="flex justify-between font-semibold text-purple-700 mb-2">
      <span>Admin</span>
      <span>Online</span>
    </div>
    <div className="flex justify-between py-1">
      <span>Buzz</span>
      <span className="px-2 rounded bg-pink-500 text-white">No</span>
    </div>
    <div className="flex justify-between py-1">
      <span>Victor</span>
      <span className="px-2 rounded bg-purple-600 text-white">Yes</span>
    </div>
  </div>
);
