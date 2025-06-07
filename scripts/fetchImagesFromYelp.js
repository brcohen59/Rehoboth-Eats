require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const Papa = require("papaparse");

const API_KEY = process.env.YELP_API_KEY;
const INPUT_CSV = "./public/data/rehoboth_restaurants.csv"; // adjust path if needed
const OUTPUT_CSV = "./restaurants_with_images.csv";

async function fetchYelpImage(restaurant) {
  const name = restaurant["Name"];
  const location = "Rehoboth Beach, DE"; // You can make this column-based if needed

  try {
    const response = await axios.get("https://api.yelp.com/v3/businesses/search", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      params: {
        term: name,
        location: location,
        limit: 1,
      },
    });

    const business = response.data.businesses[0];
    return business?.image_url || "";
  } catch (error) {
    console.error(`❌ Error fetching image for "${name}":`, error.message);
    return "";
  }
}

async function enrichRestaurants() {
  const csvData = fs.readFileSync(INPUT_CSV, "utf8");

  const { data: rows } = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  console.log(`🔍 Enriching ${rows.length} restaurants...`);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const imageUrl = await fetchYelpImage(r);
    rows[i]["ImageURL"] = imageUrl;
    console.log(`✅ ${r["Name"]} → ${imageUrl}`);
  }

  const newCsv = Papa.unparse(rows);
  fs.writeFileSync(OUTPUT_CSV, newCsv);
  console.log(`🎉 Done! Wrote: ${OUTPUT_CSV}`);
}

enrichRestaurants();