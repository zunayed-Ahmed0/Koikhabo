import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const campusAPI = {
  // Restaurants
  getNearbyRestaurants: (params) => api.get('/nearby-restaurants/', { params }),
  getRestaurantMenu: (restaurantId) => api.get(`/restaurant/${restaurantId}/menu/`),
  getTodaysMenu: (params) => api.get('/todays-menu/', { params }),
  
  // Availability
  getRestaurantAvailability: (restaurantId) =>
    api.get(`/restaurants/${restaurantId}/availability/`),

  // Reservations & Orders
  createSeatReservation: (reservationData) =>
    api.post('/reservations/', reservationData),
  createOrder: (orderData) =>
    api.post('/orders/', orderData),
};

export default api;


