from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health-check'),
    
    # Authentication
    path('auth/login/', views.user_login, name='user-login'),
    path('auth/guest/', views.guest_session, name='guest-session'),
    path('auth/admin/', views.admin_login, name='admin-login'),
    
    # Institutions
    path('institutions/', views.institutions_list, name='institutions-list'),
    
    # User management
    path('user/areas/', views.update_user_areas, name='update-user-areas'),
    path('user/history/', views.user_history, name='user-history'),
    
    # Restaurants
    path('restaurants/', views.restaurants_list, name='restaurants-list'),
    path('restaurants/<int:restaurant_id>/', views.restaurant_detail, name='restaurant-detail'),
    path('restaurants/<int:restaurant_id>/menu/', views.restaurant_menu, name='restaurant-menu'),
    path('restaurants/<int:restaurant_id>/seats/', views.restaurant_seats, name='restaurant-seats'),
    
    # Bookings
    path('restaurants/<int:restaurant_id>/book/', views.create_booking, name='create-booking'),
    path('bookings/', views.user_bookings, name='user-bookings'),
    
    # Orders
    path('orders/', views.create_order, name='create-order'),
    path('orders/history/', views.order_history, name='order-history'),
    path('orders/<int:order_id>/', views.order_status, name='order-status'),
    path('orders/<int:order_id>/review/', views.create_review, name='create-review'),
    
    # Payment validation
    path('payment/validate/', views.validate_payment, name='validate-payment'),
    
    # Admin
    path('admin/dashboard/', views.admin_dashboard, name='admin-dashboard'),
]
