export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200/50 animate-pulse">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        
        {/* Price */}
        <div className="h-6 bg-gray-200 rounded w-24" />
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

