// lib/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'your_openweather_api_key';

// Get current location from browser
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || null,
            speed: position.coords.speed || 0
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    }
  });
};

// Get altitude if not available from geolocation
export const getAltitude = async (latitude, longitude) => {
  try {
    // Using Open-Elevation API as a free alternative
    const response = await axios.get(
      `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`
    );
    return response.data.results[0].elevation;
  } catch (error) {
    console.error('Error fetching altitude:', error);
    return 0; // Default value if API fails
  }
};

// Get weather data based on location
export const getWeatherData = async (latitude, longitude) => {
  try {
    // Check if we have a valid API key
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_api_key') {
      console.warn('No valid OpenWeather API key found, using default values');
      throw new Error('Invalid API key');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
    );

    return {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      pressure: response.data.main.pressure
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Default values if API fails
    return {
      temperature: 25,
      humidity: 60,
      windSpeed: 5,
      pressure: 1013
    };
  }
};

// Fetch QoS predictions from Python backend
export const fetchQoSPredictions = async (networkParams) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, networkParams);
    return response.data;
  } catch (error) {
    console.error('Error fetching throughput prediction:', error);
    // Return default predictions if API fails
    return {
      throughput: 500,
      latency: 50,
      jitter: 10,
      packetLoss: 2
    };
  }
};

// Prepare full data payload for throughput prediction
export const prepareQoSData = async (operatorValue) => {
  try {
    // Get location data
    let locationData;
    try {
      locationData = await getCurrentLocation();
    } catch (error) {
      console.error('Error getting location:', error);
      // Default location data if geolocation fails
      locationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        speed: 0
      };
    }

    // Get altitude if not available
    if (locationData.altitude === null) {
      try {
        locationData.altitude = await getAltitude(locationData.latitude, locationData.longitude);
      } catch (error) {
        locationData.altitude = 0;
      }
    }

    // Get weather data
    let weatherData;
    try {
      weatherData = await getWeatherData(locationData.latitude, locationData.longitude);
    } catch (error) {
      weatherData = {
        temperature: 25,
        humidity: 60,
        windSpeed: 5,
        pressure: 1013
      };
    }

    // Calculate current hour
    const currentHour = new Date().getHours();

    // Prepare the full payload
    return {
      timestamp: Math.floor(Date.now() / 1000),
      Latitude: locationData.latitude,
      Longitude: locationData.longitude,
      Altitude: locationData.altitude,
      speed_kmh: locationData.speed ? locationData.speed * 3.6 : 0, // Convert m/s to km/h
      Hour: currentHour, // Not needed as backend will calculate it from timestamp
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      pressure: weatherData.pressure,
      operator: operatorValue
    };
  } catch (error) {
    console.error('Error preparing data:', error);
    // Return a default payload if anything fails
    return {
      timestamp: Math.floor(Date.now() / 1000),
      Latitude: 37.7749,
      Longitude: -122.4194,
      Altitude: 0,
      speed_kmh: 0,
      Hour: new Date().getHours(),
      temperature: 25,
      humidity: 60,
      windSpeed: 5,
      pressure: 1013,
      operator: operatorValue
    };
  }
};