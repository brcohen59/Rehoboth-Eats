const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
require('dotenv').config();

const YELP_API_KEY = process.env.YELP_API_KEY;
const restaurants = [];

fs.createReadStream('public/data/restaurants_with_hours.csv')
  .pipe(csv())
  .on('data', (row) => {
    restaurants.push(row);
  })
  .on('end', async () => {
    console.log('Getting Yelp ratings...');
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`Processing ${i+1}/${restaurants.length}: ${restaurant.Name}`);
      
      // Skip if already has rating
      if (restaurant['Google Rating'] && restaurant['Google Rating'] !== '') {
        console.log(`  Already has rating: ${restaurant['Google Rating']}`);
        continue;
      }
      
      try {
        const response = await axios.get(
          'https://api.yelp.com/v3/businesses/search',
          {
            headers: {
              Authorization: `Bearer ${YELP_API_KEY}`
            },
            params: {
              term: restaurant.Name,
              location: 'Rehoboth Beach, DE',
              limit: 1
            }
          }
        );
        
        if (response.data.businesses && response.data.businesses.length > 0) {
          const rating = response.data.businesses[0].rating;
          if (rating) {
            restaurant['Google Rating'] = rating;
            console.log(`  Found rating: ${rating}`);
          }
        }
      } catch (error) {
        console.error(`  Error: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Write updated CSV
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
      .then(() => console.log('Ratings updated successfully!'));
  });