import React, { useMemo } from 'react';
import RestaurantCard from './RestaurantCard';

const VirtualizedRestaurantList = ({ restaurants, searchTerm, filters }) => {
  // Memoize filtered restaurants to prevent unnecessary re-renders
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.menu_items?.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filters.priceFilter !== 'all') {
      filtered = filtered.filter(restaurant => {
        const avgPrice = restaurant.menu_items?.reduce((sum, item) => 
          sum + parseFloat(item.price), 0) / (restaurant.menu_items?.length || 1);
        
        switch (filters.priceFilter) {
          case 'budget': return avgPrice < 200;
          case 'mid': return avgPrice >= 200 && avgPrice < 500;
          case 'premium': return avgPrice >= 500;
          default: return true;
        }
      });
    }

    if (filters.mealFilter !== 'all') {
      filtered = filtered.filter(restaurant =>
        restaurant.menu_items?.some(item => item.meal_type === filters.mealFilter)
      );
    }

    // Sort by favorites first, then by rating
    return filtered.sort((a, b) => {
      // Favorites first (you'd need to pass favorites from context)
      // Then by rating
      return parseFloat(b.average_rating) - parseFloat(a.average_rating);
    });
  }, [restaurants, searchTerm, filters]);

  return (
    <div className="restaurant-grid">
      {filteredRestaurants.map(restaurant => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
      
      {filteredRestaurants.length === 0 && (
        <div className="no-results">
          <h3>🔍 No restaurants found</h3>
          <p>Try adjusting your filters or search terms</p>
          <div className="search-suggestions">
            <p>Popular searches:</p>
            <div className="suggestion-tags">
              <span className="tag">🍕 Pizza</span>
              <span className="tag">🍛 Biryani</span>
              <span className="tag">🍜 Chinese</span>
              <span className="tag">🥗 Healthy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualizedRestaurantList;