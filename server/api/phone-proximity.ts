import type { PhoneProximitySearchParams, PhoneProximitySearchResponse } from '~/utils/interfaces/phoneProximity';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  
  // Validate required parameters
  const latitude = query.latitude ? parseFloat(query.latitude as string) : null;
  const longitude = query.longitude ? parseFloat(query.longitude as string) : null;
  const radius = query.radius ? parseFloat(query.radius as string) : 5000; // Default 5km radius
  
  if (!latitude || !longitude) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters: latitude and longitude'
    });
  }
  
  if (isNaN(latitude) || isNaN(longitude) || isNaN(radius)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid parameter values: latitude, longitude, and radius must be numbers'
    });
  }
  
  // Validate ranges
  if (latitude < -90 || latitude > 90) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid latitude: must be between -90 and 90'
    });
  }
  
  if (longitude < -180 || longitude > 180) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid longitude: must be between -180 and 180'
    });
  }
  
  if (radius <= 0 || radius > 50000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid radius: must be between 1 and 50000 meters'
    });
  }
  
  try {
    const apiUrl = `http://104.234.204.107:3728/phone-numbers/proximity/search?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    
    const response = await $fetch<PhoneProximitySearchResponse>(apiUrl, {
      timeout: 10000 // 10 second timeout
    });
    
    return response;
  } catch (error) {
    console.error('Phone proximity search API error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch phone proximity data'
    });
  }
});
