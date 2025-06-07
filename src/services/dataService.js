// src/services/dataService.js
import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  where 
} from 'firebase/firestore';

// Get or create device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Save restaurant data to local storage and Firebase
const saveRestaurantData = async (restaurantId, data) => {
  try {
    // Add timestamp and device ID
    const dataWithMeta = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to local storage first (for offline access)
    const allData = JSON.parse(localStorage.getItem('restaurantData') || '{}');
    allData[restaurantId] = dataWithMeta;
    localStorage.setItem('restaurantData', JSON.stringify(allData));
    
    // Save to Firebase
    const deviceId = getDeviceId();
    await setDoc(doc(db, "devices", deviceId, "restaurants", restaurantId), dataWithMeta);
    
    return true;
  } catch (error) {
    console.error("Error saving restaurant data:", error);
    return false;
  }
};

// Get restaurant data from local storage (falls back to Firebase)
const getRestaurantData = async (restaurantId) => {
  try {
    // First try to get from local storage
    const allData = JSON.parse(localStorage.getItem('restaurantData') || '{}');
    
    // If found in local storage, return it
    if (allData[restaurantId]) {
      return allData[restaurantId];
    }
    
    // If not in local storage, try Firebase
    const deviceId = getDeviceId();
    const docRef = doc(db, "devices", deviceId, "restaurants", restaurantId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Save to local storage for next time
      const data = docSnap.data();
      allData[restaurantId] = data;
      localStorage.setItem('restaurantData', JSON.stringify(allData));
      return data;
    }
    
    // If not found anywhere, return null
    return null;
  } catch (error) {
    console.error("Error getting restaurant data:", error);
    // If Firebase fails, return what we have in local storage
    const allData = JSON.parse(localStorage.getItem('restaurantData') || '{}');
    return allData[restaurantId] || null;
  }
};

// Get all restaurant data for current device
const getAllRestaurantData = async () => {
  try {
    // First get from local storage
    const allData = JSON.parse(localStorage.getItem('restaurantData') || '{}');
    
    // Then try to get from Firebase
    const deviceId = getDeviceId();
    const restaurantsRef = collection(db, "devices", deviceId, "restaurants");
    const querySnapshot = await getDocs(restaurantsRef);
    
    // Merge Firebase data with local data, preferring newer timestamps
    querySnapshot.forEach((doc) => {
      const firestoreData = doc.data();
      const restaurantId = doc.id;
      const localData = allData[restaurantId];
      
      if (!localData) {
        // If not in local storage, add it
        allData[restaurantId] = firestoreData;
      } else {
        // If in both, keep the newer version
        const localDate = new Date(localData.lastUpdated || 0);
        const firestoreDate = new Date(firestoreData.lastUpdated || 0);
        
        if (firestoreDate > localDate) {
          allData[restaurantId] = firestoreData;
        }
      }
    });
    
    // Update local storage with merged data
    localStorage.setItem('restaurantData', JSON.stringify(allData));
    
    return allData;
  } catch (error) {
    console.error("Error getting all restaurant data:", error);
    // If Firebase fails, return what we have locally
    return JSON.parse(localStorage.getItem('restaurantData') || '{}');
  }
};

// Switch to a different device ID (for sync)
const switchDeviceId = async (newDeviceId) => {
  try {
    // Save the new device ID
    localStorage.setItem('deviceId', newDeviceId);
    
    // Clear local data so we can fetch from Firebase
    localStorage.removeItem('restaurantData');
    
    // Get all data for the new device ID
    const data = await getAllRestaurantData();
    
    return data;
  } catch (error) {
    console.error("Error switching device ID:", error);
    return null;
  }
};

export {
  getDeviceId,
  saveRestaurantData,
  getRestaurantData,
  getAllRestaurantData,
  switchDeviceId
};