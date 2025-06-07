// src/TailwindTest.js
import React from 'react';

function TailwindTest() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4 mt-8">
      <div className="shrink-0">
        <span className="text-2xl">🍽️</span>
      </div>
      <div>
        <div className="text-xl font-medium text-black">Tailwind Test</div>
        <p className="text-slate-500">Tailwind CSS is working!</p>
      </div>
    </div>
  );
}

export default TailwindTest;