// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { useToast } from '../contexts/ToastContext';
// import { useCart } from '../contexts/CartContext';
// import SeatBooking from '../components/SeatBooking';
// import './RestaurantDetail.css';

// const RestaurantDetail = () => {
//   const { id } = useParams();
//   const [restaurant, setRestaurant] = useState(null);
//   const [menuItems, setMenuItems] = useState([]);
//   const [activeTab, setActiveTab] = useState('menu');
//   const [loading, setLoading] = useState(true);
//   const { addToast } = useToast();
//   const { addToCart } = useCart();

//   useEffect(() => {
//     fetchRestaurantDetails();
//   }, [id]);

//   const fetchRestaurantDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/${id}/`);
//       if (response.ok) {
//         const data = await response.json();
//         setRestaurant(data);
//       }

//       const menuResponse = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/${id}/menu/`);
//       if (menuResponse.ok) {
//         const menuData = await menuResponse.json();
//         setMenuItems(menuData.menu_items || []);
//       }
//     } catch (error) {
//       addToast('Failed to load restaurant details', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddToCart = (item) => {
//     addToCart({
//       id: item.id,
//       name: item.name,
//       price: item.price,
//       restaurant_id: restaurant.id,
//       restaurant_name: restaurant.name,
//       quantity: 1,
//       is_student_set: item.is_student_set || false
//     });
//     addToast(`${item.name} added to cart! 🛒`, 'success');

//     // Add visual feedback
//     const button = document.querySelector(`[data-item-id="${item.id}"]`);
//     if (button) {
//       button.style.transform = 'scale(0.95)';
//       setTimeout(() => {
//         button.style.transform = 'scale(1)';
//       }, 150);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ padding: '2rem', textAlign: 'center' }}>
//         <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
//         <p>Loading restaurant details...</p>
//       </div>
//     );
//   }

//   if (!restaurant) {
//     return (
//       <div style={{ padding: '2rem', textAlign: 'center' }}>
//         <h2>Restaurant not found</h2>
//         <Link to="/restaurants">← Back to Restaurants</Link>
//       </div>
//     );
//   }

//   // Helper function to determine if a color is light or dark
//   const isLightColor = (color) => {
//     if (!color) return false;
//     // Convert hex to RGB
//     const hex = color.replace('#', '');
//     const r = parseInt(hex.substr(0, 2), 16);
//     const g = parseInt(hex.substr(2, 2), 16);
//     const b = parseInt(hex.substr(4, 2), 16);
//     // Calculate brightness
//     const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
//     return brightness > 155; // Light colors have brightness > 155
//   };

//   const headerTextColor = isLightColor(restaurant.color_theme) ? '#000000' : '#ffffff';
//   const headerBgColor = restaurant.color_theme || '#667eea';

//   return (
//     <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
//       <div style={{ background: headerBgColor, color: headerTextColor, padding: '2rem' }}>
//         <Link to="/restaurants" style={{ color: headerTextColor, textDecoration: 'none' }}>← Back to Restaurants</Link>
//         <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//           <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{restaurant.logo}</div>
//           <h1 style={{ fontFamily: restaurant.font_family, margin: 0, color: headerTextColor }}>{restaurant.name}</h1>
//           <p style={{ color: headerTextColor }}>{restaurant.area} • {restaurant.cuisines.join(', ')}</p>
//           <div style={{ color: headerTextColor }}>⭐ {restaurant.average_rating} ({restaurant.total_reviews} reviews)</div>
//         </div>
//       </div>

//       <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
//         <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
//           <button
//             onClick={() => setActiveTab('menu')}
//             style={{
//               padding: '1rem 2rem',
//               background: activeTab === 'menu' ? headerBgColor : 'white',
//               color: activeTab === 'menu' ? headerTextColor : '#333',
//               border: `2px solid ${headerBgColor}`,
//               borderRadius: '8px',
//               cursor: 'pointer'
//             }}
//           >
//             📋 Menu
//           </button>
//           <button
//             onClick={() => setActiveTab('booking')}
//             style={{
//               padding: '1rem 2rem',
//               background: activeTab === 'booking' ? headerBgColor : 'white',
//               color: activeTab === 'booking' ? headerTextColor : '#333',
//               border: `2px solid ${headerBgColor}`,
//               borderRadius: '8px',
//               cursor: 'pointer'
//             }}
//           >
//             🪑 Seat Booking
//           </button>
//         </div>

//         {activeTab === 'menu' && (
//           <div>
//             <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '2rem' }}>Menu Items</h2>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
//               {menuItems.map(item => (
//                 <div key={item.id} style={{
//                   background: 'white',
//                   padding: '1.5rem',
//                   borderRadius: '12px',
//                   boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
//                 }}>
//                   <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{item.name}</h3>
//                   <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{item.description}</p>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isLightColor(restaurant.color_theme) ? '#333' : restaurant.color_theme }}>
//                       ৳{item.price}
//                     </span>
//                     <button
//                       data-item-id={item.id}
//                       onClick={() => handleAddToCart(item)}
//                       style={{
//                         background: headerBgColor,
//                         color: headerTextColor,
//                         border: 'none',
//                         padding: '0.5rem 1rem',
//                         borderRadius: '6px',
//                         cursor: 'pointer',
//                         transition: 'transform 0.15s ease'
//                       }}
//                     >
//                       Add to Cart
//                     </button>
//                   </div>
//                   {item.is_student_set && (
//                     <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e8f5e8', borderRadius: '6px' }}>
//                       🎓 Student Set: {item.set_items.join(', ')}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === 'booking' && (
//           <SeatBooking restaurant={restaurant} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default RestaurantDetail;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import SeatBooking from '../components/SeatBooking';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/${id}/`);
      if (response.ok) {
        const data = await response.json();
        data.backgroundImageUrl = `/images/restaurants/restaurant_${id}.jpeg`;
        setRestaurant(data);
      }

      const menuResponse = await fetch(`${process.env.REACT_APP_API_URL}/restaurants/${id}/menu/`);
      if (menuResponse.ok) {
        const menuData = await menuResponse.json();
        setMenuItems(menuData.menu_items || []);
      }
    } catch (error) {
      addToast('Failed to load restaurant details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      quantity: 1,
      is_student_set: item.is_student_set || false
    });
    addToast(`${item.name} added to cart! 🛒`, 'success');

    const button = document.querySelector(`[data-item-id="${item.id}"]`);
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Restaurant not found</h2>
        <Link to="/restaurants">← Back to Restaurants</Link>
      </div>
    );
  }

  // Helper function to check text color
  const isLightColor = (color) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
  };

  const headerTextColor = isLightColor(restaurant.color_theme) ? '#000000' : '#ffffff';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header with background image */}
      <div
        className="restaurant-header"
        style={{ backgroundImage: `url(${restaurant.backgroundImageUrl})` }}
      >
        <div className="restaurant-intro">
          <Link to="/restaurants" className="back-link">← Back to Restaurants</Link>
          {/* <div className="restaurant-logo">{restaurant.logo}</div> */}
          <h1 className="restaurant-name">{restaurant.name}</h1>
          <p className="restaurant-meta">{restaurant.area} • {restaurant.cuisines.join(', ')}</p>
          <div className="restaurant-rating">⭐ {restaurant.average_rating} ({restaurant.total_reviews} reviews)</div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('menu')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'menu' ? restaurant.color_theme : 'white',
              color: activeTab === 'menu' ? headerTextColor : '#333',
              border: `2px solid ${restaurant.color_theme}`,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            📋 Menu
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'booking' ? restaurant.color_theme : 'white',
              color: activeTab === 'booking' ? headerTextColor : '#333',
              border: `2px solid ${restaurant.color_theme}`,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🪑 Seat Booking
          </button>
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '2rem' }}>Menu Items</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {menuItems.map(item => (
                <div key={item.id} style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{item.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isLightColor(restaurant.color_theme) ? '#333' : restaurant.color_theme }}>
                      ৳{item.price}
                    </span>
                    <button
                      data-item-id={item.id}
                      onClick={() => handleAddToCart(item)}
                      style={{
                        background: restaurant.color_theme,
                        color: headerTextColor,
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                  {item.is_student_set && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e8f5e8', borderRadius: '6px' }}>
                      🎓 Student Set: {item.set_items.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seat Booking Tab */}
        {activeTab === 'booking' && (
          <SeatBooking restaurant={restaurant} />
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
