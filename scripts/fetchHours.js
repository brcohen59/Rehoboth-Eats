const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

// Your Yelp API key
const YELP_API_KEY = process.env.YELP_API_KEY;

// Array to store restaurant data
const restaurants = [];

// Read existing CSV
fs.createReadStream('public/data/restaurants_with_images.csv')
  .pipe(csv())
  .on('data', (row) => {
    restaurants.push(row);
  })
  .on('end', async () => {
    console.log('CSV file successfully processed');
    
    // Process restaurants one by one
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`Processing ${i+1}/${restaurants.length}: ${restaurant.Name}`);
      
      try {
        // Search for the restaurant on Yelp
        const searchResponse = await axios.get(
          `https://api.yelp.com/v3/businesses/search`,
          {
            headers: {
              Authorization: `Bearer ${YELP_API_KEY}`
            },
            params: {
              term: restaurant.Name,
              location: 'San Mateo, CA',
              limit: 1
            }
          }
        );
        
        if (searchResponse.data.businesses && searchResponse.data.businesses.length > 0) {
          const businessId = searchResponse.data.businesses[0].id;
          
          // Get business details including hours
          const detailsResponse = await axios.get(
            `https://api.yelp.com/v3/businesses/${businessId}`,
            {
              headers: {
                Authorization: `Bearer ${YELP_API_KEY}`
              }
            }
          );
          
          // Extract hours
          if (detailsResponse.data.hours && detailsResponse.data.hours.length > 0) {
            const hours = detailsResponse.data.hours[0].open;
            
            // Format hours as JSON string
            restaurant.Hours = JSON.stringify(hours);
            
            // Optional: Also add formatted hours string
            restaurant.FormattedHours = formatHours(hours);
          } else {
            restaurant.Hours = '';
            restaurant.FormattedHours = '';
          }
          
          // Add phone number and address if not already present
          if (!restaurant.Phone && detailsResponse.data.phone) {
            restaurant.Phone = detailsResponse.data.phone;
          }
          
          if (!restaurant.Address && detailsResponse.data.location) {
            restaurant.Address = [
              detailsResponse.data.location.address1,
              detailsResponse.data.location.city,
              detailsResponse.data.location.state,
              detailsResponse.data.location.zip_code
            ].filter(Boolean).join(', ');
          }
        }
      } catch (error) {
        console.error(`Error processing ${restaurant.Name}:`, error.message);
      }
      
      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Write updated data back to CSV
    const csvWriter = createCsvWriter({
      path: 'public/data/restaurants_with_hours.csv',
      header: [
        { id: 'Name', title: 'Name' },
        { id: 'Cuisine / Type', title: 'Cuisine / Type' },
        { id: 'Google Rating', title: 'Google Rating' },
        { id: 'ImageURL', title: 'ImageURL' },
        { id: 'Hours', title: 'Hours' },
        { id: 'FormattedHours', title: 'FormattedHours' },
        { id: 'Phone', title: 'Phone' },
        { id: 'Address', title: 'Address' }
      ]
    });
    
    csvWriter.writeRecords(restaurants)
      .then(() => console.log('CSV file was written successfully'));
  });

// Function to format hours in a human-readable way
function formatHours(hoursArray) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Group by day
  const dayGroups = {};
  
  hoursArray.forEach(hour => {
    const day = daysOfWeek[hour.day];
    if (!dayGroups[day]) {
      dayGroups[day] = [];
    }
    
    // Format time (convert from 24h to 12h format)
    const start = formatTime(hour.start);
    const end = formatTime(hour.end);
    
    dayGroups[day].push(`${start} - ${end}`);
  });
  
  // Format result
  return Object.entries(dayGroups)
    .map(([day, times]) => `${day}: ${times.join(', ')}`)
    .join(' | ');
}

function formatTime(time) {
  // Convert HHMM format to HH:MM AM/PM
  const hour = parseInt(time.substring(0, 2));
  const minute = time.substring(2, 4);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  
  return `${formattedHour}:${minute} ${period}`;
}