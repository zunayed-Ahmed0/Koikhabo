import React from 'react';
import './FoodCard.css';

const FoodCard = ({ food }) => {
  const getSpiceLevel = (level) => {
    const spices = ['', '🌶️ Mild', '🌶️🌶️ Medium', '🌶️🌶️🌶️ Spicy'];
    return spices[level] || '';
  };

  return (
    <div className="food-card">
      <div className="food-image-placeholder">
        <span className="food-emoji">🍽️</span>
      </div>
      <div className="food-info">
        <h3>{food.name}</h3>
        <p className="description">{food.description}</p>
        <div className="food-details">
          <span className="price">৳{food.price}</span>
          <span className="category">{food.category.name}</span>
        </div>
        <div className="food-meta">
          <span className="meal-type">{food.meal_type}</span>
          <span className="spice-level">{getSpiceLevel(food.spice_level)}</span>
          {food.is_vegetarian && <span className="veg-badge">🌱 Veg</span>}
        </div>
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  );
};

export default FoodCard;
