import React from 'react';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-48 bg-gray-300"></div>
      
      {/* Content placeholders */}
      <div className="p-4">
        <div className="flex justify-between">
          {/* Restaurant name placeholder */}
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
          
          {/* Rating placeholder */}
          <div className="h-5 bg-gray-300 rounded w-10"></div>
        </div>
        
        {/* Cuisine type placeholder */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;