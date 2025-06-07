// src/pages/RestaurantDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { saveRestaurantData, getRestaurantData } from '../services/dataService';

function RestaurantDetails({ restaurants }) {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const restaurant = restaurants.find((r) => r["Name"] === decodedName);

  const [visited, setVisited] = useState(false);
  const [myRating, setMyRating] = useState("");
  const [log, setLog] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await getRestaurantData(decodedName);
      if (data) {
        setVisited(data.visited ?? false);
        setMyRating(data.myRating ?? "");
        setLog(data.log ?? "");
      }
      setHasLoaded(true);
    };
    
    loadData();
  }, [decodedName]);
  
  useEffect(() => {
    if (!hasLoaded) return;
    
    const saveData = async () => {
      await saveRestaurantData(decodedName, {
        visited,
        myRating,
        log,
      });
    };
    
    saveData();
  }, [visited, myRating, log, decodedName, hasLoaded]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find the restaurant you're looking for.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const StarRating = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    // Determine if we should show the hover rating or the actual rating
    const displayRating = hoverRating > 0 ? hoverRating : rating;
    
    // Create array of 5 stars
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    
    // Function to handle when the mouse is over a specific position
    const handleMouseMove = (e, starIndex) => {
      const { left, width } = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - left) / width;
      
      // Calculate rating: if in first half of star, give half star, else full star
      let value = starIndex;
      if (percent < 0.5) {
        value -= 0.5;
      }
      
      setHoverRating(value);
    };
    
    return (
      <div className="flex items-center">
        <div className="flex">
          {stars.map((starIndex) => (
            <div 
              key={starIndex}
              className="relative cursor-pointer w-8 h-8 text-gray-300"
              onMouseMove={(e) => handleMouseMove(e, starIndex)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                // Toggle between full/half star or remove rating if clicking the same star
                if (rating === starIndex && hoverRating === 0) {
                  setRating(starIndex - 0.5);
                } else if (rating === starIndex - 0.5 && hoverRating === 0) {
                  setRating("");
                } else {
                  setRating(hoverRating > 0 ? hoverRating : starIndex);
                }
              }}
            >
              {/* Background star (always shown) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              
              {/* Filled star (shown based on rating) */}
              {displayRating >= starIndex ? (
                // Full star
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-8 w-8 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : displayRating >= starIndex - 0.5 ? (
                // Half star
                <div className="absolute inset-0 overflow-hidden w-4 h-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        
        {/* Display the numeric rating with bold text */}
        <span className="ml-2 text-gray-800 font-bold text-lg self-center">
          {displayRating > 0 ? displayRating.toFixed(1) : "-"}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{restaurant["Name"]}</h1>
          <p className="text-sm opacity-80">{restaurant["Cuisine / Type"]}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-800 hover:text-gray-900 font-medium transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to All Restaurants
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 md:flex-shrink-0">
              <div className="relative h-64 md:h-full">
                <img
                  src={restaurant["ImageURL"] || "https://via.placeholder.com/500x300?text=" + encodeURIComponent(restaurant["Name"])}
                  alt={restaurant["Name"]}
                  className="absolute w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="md:w-1/2 p-6 md:min-h-[600px]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium">
                    {restaurant["Cuisine / Type"]}
                  </span>
                </div>
                <div className="flex items-center text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium ml-1">{restaurant["Google Rating"]}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">My Experience</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-gray-800">Visit Status</h3>
                  </div>
                  <div className="ml-7">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visited}
                        onChange={(e) => setVisited(e.target.checked)}
                        className="w-5 h-5 text-gray-800 rounded border-gray-300 focus:ring-gray-800"
                      />
                      <span className="ml-2 text-gray-700">I've visited this restaurant</span>
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 relative">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <h3 className="font-bold text-gray-800">My Rating</h3>
                  </div>
                  
                  <div className="ml-7">
                    <StarRating rating={parseFloat(myRating) || 0} setRating={setMyRating} />
                    <p className="text-sm text-gray-500 mt-1">Click to rate this restaurant (0.5-5 stars)</p>
                  </div>
                  
                  {/* Reset button with circular arrows icon */}
                  {parseFloat(myRating) > 0 && (
                    <button 
                      onClick={() => setMyRating("")}
                      className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Reset rating"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-bold text-gray-800">My Notes</h3>
                  </div>
                  <div className="ml-7">
                    <textarea
                      value={log}
                      onChange={(e) => setLog(e.target.value)}
                      placeholder="What did you eat? How was your experience? Any recommendations?"
                      className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-gray-300 focus:border-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <button 
                  onClick={() => setHoursExpanded(!hoursExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-800">Business Hours</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-gray-500 transform transition-transform ${hoursExpanded ? 'rotate-180' : ''}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${hoursExpanded ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-4 bg-white border border-gray-200 border-t-0 rounded-b-md">
                    {restaurant["FormattedHours"] ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                        {restaurant["FormattedHours"].split('|').map((day, index) => {
                          const dayParts = day.trim().split(':');
                          const dayName = dayParts[0];
                          const hours = dayParts.slice(1).join(':').trim();
                          
                          return (
                            <div key={index} className="flex items-center text-sm">
                              <span className="font-medium text-gray-800 w-20">{dayName}</span>
                              <span className="text-gray-600">{hours}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">Hours not available</p>
                    )}
                  </div>
                </div>
              </div>
                            
              <div className="flex gap-3">
                <a 
                  href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant["Name"] + " San Mateo")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-gray-800 text-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Directions</span>
                </a>
                
                <a 
                  href={`https://www.yelp.com/search?find_desc=${encodeURIComponent(restaurant["Name"])}&find_loc=San+Mateo%2C+CA`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-gray-800 text-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Reviews</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} San Mateo Eats • Made with React & Tailwind</p>
        </div>
      </footer>
    </div>
  );
}

export default RestaurantDetails;