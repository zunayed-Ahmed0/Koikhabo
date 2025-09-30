// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { useToast } from '../contexts/ToastContext';
// import { useCart } from '../contexts/CartContext';
// import './RestaurantListing.css';

// const RestaurantListing = () => {
//   const [restaurants, setRestaurants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCuisine, setSelectedCuisine] = useState('');
//   const [filters, setFilters] = useState({
//     has_private_room: false,
//     has_smoking: false,
//     has_prayer: false
//   });

//   const { user, guestSession, isLoggedIn, logout, loading: authLoading } = useAuth();
//   const { getItemCount } = useCart();
//   const { addToast } = useToast();
//   const navigate = useNavigate();

//   // Colors array for colorful restaurant names
//   const colors = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#ff006e", "#8338ec"];

//   const fetchRestaurants = useCallback(async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams();
//       if (searchTerm) params.append('search', searchTerm);
//       if (selectedCuisine) params.append('cuisine', selectedCuisine);
//       if (filters.has_private_room) params.append('has_private_room', 'true');
//       if (filters.has_smoking) params.append('has_smoking', 'true');
//       if (filters.has_prayer) params.append('has_prayer', 'true');

//       const finalUrl = `${process.env.REACT_APP_API_URL}/restaurants/?${params}`;
//       const response = await fetch(finalUrl);

//       if (response.ok) {
//         const data = await response.json();
//         setRestaurants(data);
//       } else {
//         addToast('Failed to load restaurants', 'error');
//       }
//     } catch (error) {
//       console.error('Error fetching restaurants:', error);
//       addToast('Network error. Please try again.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, [searchTerm, selectedCuisine, filters, addToast]);

//   useEffect(() => {
//     if (authLoading) return;

//     if (!isLoggedIn()) {
//       navigate('/');
//       return;
//     }

//     fetchRestaurants();
//   }, [authLoading, isLoggedIn, navigate, fetchRestaurants]);

//   // Debounce search/filter changes
//   useEffect(() => {
//     const debounceTimer = setTimeout(fetchRestaurants, 500);
//     return () => clearTimeout(debounceTimer);
//   }, [searchTerm, selectedCuisine, filters, fetchRestaurants]);

//   const handleFilterChange = (filterName) => {
//     setFilters(prev => ({
//       ...prev,
//       [filterName]: !prev[filterName]
//     }));
//   };

//   const cuisineOptions = [
//     { value: '', label: 'All Cuisines' },
//     { value: 'bengali', label: 'Bengali' },
//     { value: 'chinese', label: 'Chinese' },
//     { value: 'japanese', label: 'Japanese' },
//     { value: 'western', label: 'Western' },
//     { value: 'middle_eastern', label: 'Middle Eastern' },
//     { value: 'indian', label: 'Indian' },
//     { value: 'thai', label: 'Thai' },
//     { value: 'italian', label: 'Italian' }
//   ];

//   const filteredRestaurants = useMemo(() => {
//     return restaurants.filter(restaurant => {
//       const matchesSearch =
//         restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesCuisine = !selectedCuisine || restaurant.cuisines.includes(selectedCuisine);

//       const matchesFilters =
//         (!filters.has_private_room || restaurant.has_private_room) &&
//         (!filters.has_smoking || restaurant.has_smoking_zone) &&
//         (!filters.has_prayer || restaurant.has_prayer_zone);

//       return matchesSearch && matchesCuisine && matchesFilters;
//     });
//   }, [restaurants, searchTerm, selectedCuisine, filters]);

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner">🍽️</div>
//         <p>Loading restaurants...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="restaurant-listing">
//       <header className="listing-header">
//         <div className="header-top">
//           <div className="user-info">
//             {user ? (
//               <span>Welcome, {user.name || user.email} 🏆 {user.reward_points} pts</span>
//             ) : guestSession ? (
//               <span>Guest Session 🎭</span>
//             ) : null}
//           </div>
//           <div className="header-actions">
//             <Link to="/cart" className="cart-btn">
//               🛒 Cart ({getItemCount()})
//             </Link>
//             {user && <Link to="/my-bookings" className="bookings-btn">🪑 My Bookings</Link>}
//             {user && <Link to="/user-history" className="history-btn">📋 History</Link>}
//             <button onClick={logout} className="logout-btn">🚪 Logout</button>
//           </div>
//         </div>

//         <h1>🍽️ Restaurants in Dhaka</h1>

//         <div className="search-filters">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search restaurants, food, or location..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//           </div>

//           <div className="filters-row">
//             <select
//               value={selectedCuisine}
//               onChange={(e) => setSelectedCuisine(e.target.value)}
//               className="cuisine-filter"
//             >
//               {cuisineOptions.map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>

//             <div className="feature-filters">
//               <label className="filter-checkbox">
//                 <input
//                   type="checkbox"
//                   checked={filters.has_private_room}
//                   onChange={() => handleFilterChange('has_private_room')}
//                 />
//                 👥 Private Room
//               </label>
//               <label className="filter-checkbox">
//                 <input
//                   type="checkbox"
//                   checked={filters.has_smoking}
//                   onChange={() => handleFilterChange('has_smoking')}
//                 />
//                 🚬 Smoking Zone
//               </label>
//               <label className="filter-checkbox">
//                 <input
//                   type="checkbox"
//                   checked={filters.has_prayer}
//                   onChange={() => handleFilterChange('has_prayer')}
//                 />
//                 🕌 Prayer Zone
//               </label>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="restaurants-grid">
//         {filteredRestaurants.length > 0 ? (
//           filteredRestaurants.map(restaurant => (
//             <div
//               key={restaurant.id}
//               className="restaurant-card"
//               onClick={() => navigate(`/restaurants/${restaurant.id}`)}
//             >
//               <div className="restaurant-header">
//                 <div className="restaurant-logo">{restaurant.logo}</div>
//                 <div className="restaurant-info">
//                   <h3
//                     className="restaurant-name"
//                     style={{
//                       fontFamily: restaurant.font_family,
//                       fontSize: '3rem', // 2.5x bigger
//                       color: colors[restaurant.id % colors.length] // colorful
//                     }}
//                   >
//                     {restaurant.name}
//                   </h3>
//                   <p className="restaurant-area">📍 {restaurant.area}</p>
//                   <div className="restaurant-cuisines">
//                     {restaurant.cuisines.map((cuisine, index) => (
//                       <span key={index} className="cuisine-tag">
//                         {cuisine}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//                 <div className="restaurant-meta">
//                   <div className="rating">
//                     ⭐ {restaurant.average_rating}
//                     <span className="review-count">({restaurant.total_reviews})</span>
//                   </div>
//                   {restaurant.distance && (
//                     <div className="distance">{restaurant.distance} km</div>
//                   )}
//                 </div>
//               </div>

//               <div className="restaurant-features">
//                 <div className="capacity-info">
//                   🪑 {restaurant.capacity} seats
//                 </div>
//                 <div className="feature-flags">
//                   {restaurant.has_private_room && <span className="feature-flag">👥 Private Room</span>}
//                   {restaurant.has_smoking_zone && <span className="feature-flag">🚬 Smoking Zone</span>}
//                   {restaurant.has_prayer_zone && <span className="feature-flag">🕌 Prayer Zone</span>}
//                 </div>
//               </div>

//               <div className="restaurant-footer">
//                 <div className="opening-hours">
//                   🕒 {restaurant.opening_time} - {restaurant.closing_time}
//                 </div>
//                 <div className="restaurant-status">
//                   {restaurant.is_open ? (
//                     <span className="status-open">🟢 Open</span>
//                   ) : (
//                     <span className="status-closed">🔴 Closed</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="no-results">
//             <h3>🔍 No restaurants found</h3>
//             <p>Try adjusting your search terms or filters</p>
//           </div>
//         )}
//       </main>

//       <div className="results-info">
//         <p>Showing all {filteredRestaurants.length} restaurants</p>
//       </div>
//     </div>
//   );
// };

// export default RestaurantListing;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import './RestaurantListing.css';

const RestaurantListing = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [filters, setFilters] = useState({
    has_private_room: false,
    has_smoking: false,
    has_prayer: false
  });

  const { user, guestSession, isLoggedIn, logout, loading: authLoading } = useAuth();
  const { getItemCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Colors array for colorful restaurant names
  const colors = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#ff006e", "#8338ec"];

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCuisine) params.append('cuisine', selectedCuisine);
      if (filters.has_private_room) params.append('has_private_room', 'true');
      if (filters.has_smoking) params.append('has_smoking', 'true');
      if (filters.has_prayer) params.append('has_prayer', 'true');

      const finalUrl = `${process.env.REACT_APP_API_URL}/restaurants/?${params}`;
      const response = await fetch(finalUrl);

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      } else {
        addToast('Failed to load restaurants', 'error');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCuisine, filters, addToast]);

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn()) {
      navigate('/');
      return;
    }

    fetchRestaurants();
  }, [authLoading, isLoggedIn, navigate, fetchRestaurants]);

  // Debounce search/filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(fetchRestaurants, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCuisine, filters, fetchRestaurants]);

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const cuisineOptions = [
    { value: '', label: 'All Cuisines' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'western', label: 'Western' },
    { value: 'middle_eastern', label: 'Middle Eastern' },
    { value: 'indian', label: 'Indian' },
    { value: 'thai', label: 'Thai' },
    { value: 'italian', label: 'Italian' }
  ];

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCuisine = !selectedCuisine || restaurant.cuisines.includes(selectedCuisine);

      const matchesFilters =
        (!filters.has_private_room || restaurant.has_private_room) &&
        (!filters.has_smoking || restaurant.has_smoking_zone) &&
        (!filters.has_prayer || restaurant.has_prayer_zone);

      return matchesSearch && matchesCuisine && matchesFilters;
    });
  }, [restaurants, searchTerm, selectedCuisine, filters]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🍽️</div>
        <p>Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-listing">
      <header className="listing-header">
        <div className="header-top">
          <div className="user-info">
            {user ? (
              <span>Welcome, {user.name || user.email} 🏆 {user.reward_points} pts</span>
            ) : guestSession ? (
              <span>Guest Session 🎭</span>
            ) : null}
          </div>
          <div className="header-actions">
            <Link to="/cart" className="cart-btn">
              🛒 Cart ({getItemCount()})
            </Link>
            {user && <Link to="/my-bookings" className="bookings-btn">🪑 My Bookings</Link>}
            {user && <Link to="/user-history" className="history-btn">📋 History</Link>}
            <button onClick={logout} className="logout-btn">🚪 Logout</button>
          </div>
        </div>

        <h1>🍽️ Restaurants in Dhaka</h1>

        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search restaurants, food, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-row">
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="cuisine-filter"
            >
              {cuisineOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="feature-filters">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.has_private_room}
                  onChange={() => handleFilterChange('has_private_room')}
                />
                👥 Private Room
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.has_smoking}
                  onChange={() => handleFilterChange('has_smoking')}
                />
                🚬 Smoking Zone
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.has_prayer}
                  onChange={() => handleFilterChange('has_prayer')}
                />
                🕌 Prayer Zone
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="restaurants-grid">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map(restaurant => (
            <div
              key={restaurant.id}
              className="restaurant-card"
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              <div className="restaurant-header">
                <div className="restaurant-logo">{restaurant.logo}</div>
                <div className="restaurant-info">
                  <h3
                    className="restaurant-name"
                    style={{
                      fontFamily: restaurant.font_family,
                      fontSize: '3rem', // 2.5x bigger
                      color: colors[restaurant.id % colors.length] // colorful
                    }}
                  >
                    {restaurant.name}
                  </h3>
                  <p className="restaurant-area">📍 {restaurant.area}</p>
                  <div className="restaurant-cuisines">
                    {restaurant.cuisines.map((cuisine, index) => (
                      <span key={index} className="cuisine-tag">
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="restaurant-meta">
                  <div className="rating">
                    ⭐ {restaurant.average_rating}
                    <span className="review-count">({restaurant.total_reviews})</span>
                  </div>
                  {restaurant.distance && (
                    <div className="distance">{restaurant.distance} km</div>
                  )}
                </div>
              </div>

              <div className="restaurant-features">
                <div className="capacity-info">
                  🪑 {restaurant.capacity} seats
                </div>
                <div className="feature-flags">
                  {restaurant.has_private_room && <span className="feature-flag">👥 Private Room</span>}
                  {restaurant.has_smoking_zone && <span className="feature-flag">🚬 Smoking Zone</span>}
                  {restaurant.has_prayer_zone && <span className="feature-flag">🕌 Prayer Zone</span>}
                </div>
              </div>

              <div className="restaurant-footer">
                <div className="opening-hours">
                  🕒 {restaurant.opening_time} - {restaurant.closing_time}
                </div>
                <div className="restaurant-status">
                  {restaurant.is_open ? (
                    <span className="status-open">🟢 Open</span>
                  ) : (
                    <span className="status-closed">🔴 Closed</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <h3>🔍 No restaurants found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}
      </main>

      <div className="results-info">
        <p>Showing all {filteredRestaurants.length} restaurants</p>
      </div>
    </div>
  );
};

export default RestaurantListing;
