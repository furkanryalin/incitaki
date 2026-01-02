export default function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center border border-gray-200/50 animate-pulse">
      <div className="aspect-square mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
    </div>
  );
}

