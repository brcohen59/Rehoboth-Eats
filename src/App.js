// src/App.js
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RestaurantDetails from "./pages/RestaurantDetails"; // Adjust path if needed
import { getAllRestaurantData, saveRestaurantData, getRestaurantData } from './services/dataService';
import SyncPage from './pages/syncPage';
import SkeletonCard from './components/SkeletonCard';

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [sortedRestaurants, setSortedRestaurants] = useState([]);
  const [sortKey, setSortKey] = useState("Name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filter, setFilter] = useState("all"); // "all", "visited", "unvisited"
  const [visitedMap, setVisitedMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/data/restaurants_with_hours.csv`, {
      header: true,
      download: true,
      complete: (results) => {
        setRestaurants(results.data);
      },
    });
  }, []);

  // Load visited data from Firebase
  useEffect(() => {
    const loadAllData = async () => {
      if (restaurants.length === 0) return;
      
      setLoading(true); // Start loading
      
      try {
        const allData = await getAllRestaurantData();
        
        const map = {};
        restaurants.forEach((r) => {
          const restaurantData = allData[r["Name"]];
          if (restaurantData && restaurantData.visited) {
            map[r["Name"]] = true;
          }
        });
        
        setVisitedMap(map);
      } catch (error) {
        console.error("Error loading restaurant data:", error);
      } finally {
        setLoading(false); // End loading regardless of success/failure
      }
    };
    
    loadAllData();
  }, [restaurants]);

  const toggleVisited = (e, name) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update state immediately for UI responsiveness
    setVisitedMap((prev) => {
      const newVal = !prev[name];
      const newMap = { ...prev, [name]: newVal };
      
      // Save the change to Firebase and localStorage
      getRestaurantData(name).then(existingData => {
        const data = existingData || {};
        saveRestaurantData(name, {
          ...data,
          visited: newVal
        });
      });
      
      return newMap;
    });
  };

  useEffect(() => {
    let filtered = [...restaurants];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r["Name"]?.toLowerCase().includes(term) || 
        r["Cuisine / Type"]?.toLowerCase().includes(term)
      );
    }
    
    // Apply visited filter
    filtered = filtered.filter(r => {
      const isVisited = visitedMap[r["Name"]];
      if (filter === "visited") return isVisited;
      if (filter === "unvisited") return !isVisited;
      return true; // "all"
    });
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      const valA = a[sortKey] || "";
      const valB = b[sortKey] || "";

      if (sortKey === "Google Rating") {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        return sortOrder === "asc" ? numA - numB : numB - numA;
      } else {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
    });

    setSortedRestaurants(filtered);
  }, [restaurants, sortKey, sortOrder, filter, visitedMap, searchTerm]);

  return (
    <Router basename="/Rehoboth-Eats">
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-100">
              {/* Header */}
              <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg">
                <div className="container mx-auto px-4 py-6">
                  <h1 className="text-3xl font-bold">Rehoboth Beach Eats</h1>
                  <p className="text-gray-300 opacity-90">Discover and track local restaurants</p>
                </div>

                <Link 
                  to="/sync" 
                  className="text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-md flex items-center"
                  title="Sync Devices"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">Sync</span>
                </Link>
              </header>

              <main className="container mx-auto px-4 py-8">
                {/* Search and Controls */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <div className="flex-grow">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search restaurants or cuisines..."
                          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-500 transition"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute right-3 top-3 text-gray-400">
                          🔍
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center">
                        <label className="text-sm text-gray-700 mr-2">Sort by:</label>
                        <select 
                          value={sortKey} 
                          onChange={(e) => setSortKey(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white"
                        >
                          <option value="Name">Name</option>
                          <option value="Cuisine / Type">Cuisine</option>
                          <option value="Google Rating">Rating</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="text-sm text-gray-700 mr-2">Order:</label>
                        <select 
                          value={sortOrder} 
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white"
                        >
                          <option value="asc">Ascending</option>
                          <option value="desc">Descending</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="text-sm text-gray-700 mr-2">Show:</label>
                        <select 
                          value={filter} 
                          onChange={(e) => setFilter(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-orange-300 focus:border-orange-500 bg-white"
                        >
                          <option value="all">All</option>
                          <option value="visited">Visited</option>
                          <option value="unvisited">Not Visited</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Showing {sortedRestaurants.length} of {restaurants.length} restaurants
                  </div>
                </div>

                {/* Restaurant Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Show 8 skeleton cards while loading */}
                    {[...Array(8)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : (
                  sortedRestaurants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {sortedRestaurants.map((restaurant, index) => {
                        const visited = visitedMap[restaurant["Name"]];
                        
                        return (
                          <Link 
                            to={`/restaurant/${encodeURIComponent(restaurant["Name"])}`}
                            key={index}
                            className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                          >
                            {/* Restaurant Card */}
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={restaurant["ImageURL"] || "https://via.placeholder.com/300x200?text=" + encodeURIComponent(restaurant["Name"])}
                                alt={restaurant["Name"]}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              
                              <button
                                onClick={(e) => toggleVisited(e, restaurant["Name"])}
                                className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 ${
                                  visited 
                                    ? "bg-green-500 text-white" 
                                    : "bg-white text-gray-400 hover:text-gray-600 border border-gray-200"
                                }`}
                                title={visited ? "Visited" : "Mark as visited"}
                              >
                                {visited ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <div className="inline-block px-2 py-1 rounded bg-gray-800 text-xs font-medium text-white mb-2">
                                  {restaurant["Cuisine / Type"]}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <h2 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition">
                                  {restaurant["Name"]}
                                </h2>
                                <div className="flex items-center text-amber-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="font-medium ml-1">{restaurant["Google Rating"]}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow">
                      <p className="text-xl text-gray-500">No restaurants found</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  )
                )}
              </main>
              
              <footer className="mt-12 bg-gray-800 text-white py-6">
                <div className="container mx-auto px-4 text-center text-sm">
                  <p>© {new Date().getFullYear()} Rehoboth Beach Eats • Made with React & Tailwind</p>
                </div>
              </footer>
            </div>
          }
        />
        <Route path="/restaurant/:name" element={<RestaurantDetails restaurants={restaurants} />} />
        <Route path="/sync" element={<SyncPage />} />
      </Routes>
    </Router>
  );
}

export default App;