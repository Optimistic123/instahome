/**
 * Utility functions for safe API data handling
 * Prevents "map is not a function" and similar errors
 */

/**
 * Safely extracts array data from API response
 * @param {*} responseData - The data from API response
 * @param {Array} defaultValue - Default value if data is invalid
 * @returns {Array} - Always returns an array
 */
export const safeArray = (responseData, defaultValue = []) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }
  if (responseData && typeof responseData === 'object' && Array.isArray(responseData.data)) {
    return responseData.data;
  }
  console.warn('Expected array but got:', typeof responseData, responseData);
  return defaultValue;
};

/**
 * Safely extracts object data from API response
 * @param {*} responseData - The data from API response
 * @param {Object} defaultValue - Default value if data is invalid
 * @returns {Object|null} - Returns object or null
 */
export const safeObject = (responseData, defaultValue = null) => {
  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    return responseData;
  }
  if (responseData && typeof responseData === 'object' && responseData.data) {
    return responseData.data;
  }
  console.warn('Expected object but got:', typeof responseData, responseData);
  return defaultValue;
};

/**
 * Safely gets a property from an object
 * @param {Object} obj - The object
 * @param {string} path - Dot-separated path (e.g., 'images.0' or 'amenities')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} - The property value or default
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value == null || typeof value !== 'object') {
      return defaultValue;
    }
    value = value[key];
  }
  
  return value !== undefined ? value : defaultValue;
};

/**
 * Safely maps over an array, ensuring it's an array first
 * @param {*} data - The data to map over
 * @param {Function} mapper - The mapping function
 * @param {Array} defaultValue - Default value if data is invalid
 * @returns {Array} - Mapped array or empty array
 */
export const safeMap = (data, mapper, defaultValue = []) => {
  const array = safeArray(data, defaultValue);
  try {
    return array.map(mapper);
  } catch (error) {
    console.error('Error in safeMap:', error);
    return defaultValue;
  }
};

/**
 * Wraps API calls with error handling and safe data extraction
 * @param {Promise} apiCall - The API call promise
 * @param {*} defaultValue - Default value if call fails
 * @returns {Promise} - Promise that resolves to safe data
 */
export const safeApiCall = async (apiCall, defaultValue = null) => {
  try {
    const response = await apiCall;
    return response?.data ?? defaultValue;
  } catch (error) {
    console.error('API call failed:', error);
    // Return appropriate default based on error
    if (error.response?.status === 503) {
      console.warn('Service unavailable - database connection issue');
    }
    return defaultValue;
  }
};

