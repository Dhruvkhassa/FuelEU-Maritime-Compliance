export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-900/30 border-t-blue-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-900/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

