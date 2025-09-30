# Authentication and API views for Koikhabo food delivery system

from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q
from django.conf import settings
from datetime import datetime, timedelta, date
import uuid
import re
from .models import (
    Institution, UserProfile, GuestSession, Restaurant, Seat, MenuItem, 
    Discount, Booking, Order, OrderItem, Review, OccupiedSeat, RewardRedemption
)

from .serializers import (
    InstitutionSerializer, UserProfileSerializer, RestaurantSerializer, 
    MenuItemSerializer, BookingSerializer, OrderSerializer, ReviewSerializer
)

# -------------------- Health Check --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'healthy', 'timestamp': timezone.now()})

# -------------------- Authentication --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    email = request.data.get('email')
    full_name = request.data.get('full_name', '')

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Email-based login (no password verification as per requirements)
    user, created = UserProfile.objects.get_or_create(
        email=email,
        defaults={'name': full_name} if full_name else {}
    )

    # Update name if provided and user already exists
    if not created and full_name and user.name != full_name:
        user.name = full_name
        user.save()

    return Response({
        'user_id': user.id,
        'email': user.email,
        'name': user.name,
        'reward_points': user.reward_points,
        'institution': user.institution.name if user.institution else None,
        'preferred_areas': user.preferred_areas,
        'created': created
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def guest_session(request):
    session_id = str(uuid.uuid4())
    guest = GuestSession.objects.create(session_id=session_id)
    
    return Response({
        'session_id': guest.session_id,
        'guest_id': guest.id
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    name = request.data.get('name')
    password = request.data.get('password')
    
    if not name or not password:
        return Response({'error': 'Name and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Case-insensitive name check
    admin_users_lower = [user.lower() for user in settings.ADMIN_USERS]
    if name.lower() in admin_users_lower and password == settings.ADMIN_PASSWORD:
        return Response({
            'admin_name': name,
            'message': 'Admin login successful'
        })

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# -------------------- Institution Management --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def institutions_list(request):
    search = request.GET.get('search', '')
    institutions = Institution.objects.all()
    
    if search:
        institutions = institutions.filter(
            Q(name__icontains=search) | Q(area__icontains=search)
        )
    
    serializer = InstitutionSerializer(institutions, many=True)
    return Response(serializer.data)

# -------------------- User Profile Management --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def update_user_areas(request):
    user_id = request.data.get('user_id')
    areas = request.data.get('areas', [])
    
    try:
        user = UserProfile.objects.get(id=user_id)
        user.preferred_areas = areas
        user.save()
        return Response({'message': 'Areas updated successfully'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def user_history(request):
    user_id = request.GET.get('user_id')
    
    try:
        user = UserProfile.objects.get(id=user_id)
        orders = Order.objects.filter(user=user).order_by('-created_at')
        bookings = Booking.objects.filter(user=user).order_by('-created_at')
        reviews = Review.objects.filter(user=user).order_by('-created_at')
        
        return Response({
            'orders': OrderSerializer(orders, many=True).data,
            'bookings': BookingSerializer(bookings, many=True).data,
            'reviews': ReviewSerializer(reviews, many=True).data,
            'reward_points': user.reward_points
        })
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# -------------------- Restaurant Management --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def restaurants_list(request):
    # COMPLETELY IGNORE LOCATION PARAMETERS - ALWAYS RETURN ALL RESTAURANTS
    latitude = None  # Force disable location filtering
    longitude = None  # Force disable location filtering

    search = request.GET.get('search', '')
    cuisine_filter = request.GET.get('cuisine', '')
    has_private_room = request.GET.get('has_private_room')
    has_smoking = request.GET.get('has_smoking')
    has_prayer = request.GET.get('has_prayer')

    # Log if location parameters were sent (for debugging)
    if request.GET.get('latitude') or request.GET.get('longitude'):
        print(f"🚫 LOCATION PARAMETERS IGNORED: lat={request.GET.get('latitude')}, lng={request.GET.get('longitude')}")

    restaurants = Restaurant.objects.filter(is_open=True)

    # Apply filters
    if search:
        restaurants = restaurants.filter(
            Q(name__icontains=search) | Q(area__icontains=search)
        )

    if cuisine_filter:
        restaurants = restaurants.filter(cuisines__contains=[cuisine_filter])

    if has_private_room == 'true':
        restaurants = restaurants.filter(has_private_room=True)

    if has_smoking == 'true':
        restaurants = restaurants.filter(has_smoking_zone=True)

    if has_prayer == 'true':
        restaurants = restaurants.filter(has_prayer_zone=True)

    # ALWAYS RETURN ALL RESTAURANTS - NO LOCATION FILTERING
    restaurant_data = []
    for restaurant in restaurants:
        data = RestaurantSerializer(restaurant).data
        # No distance calculation or filtering
        restaurant_data.append(data)

    print(f"✅ RETURNING ALL {len(restaurant_data)} RESTAURANTS (no location filtering)")
    return Response(restaurant_data)

@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_detail(request, restaurant_id):
    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        return Response(RestaurantSerializer(restaurant).data)
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_menu(request, restaurant_id):
    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        menu_items = MenuItem.objects.filter(restaurant=restaurant, is_available=True)
        
        category = request.GET.get('category')
        if category:
            menu_items = menu_items.filter(cuisine_type=category)
        
        return Response({
            'restaurant': RestaurantSerializer(restaurant).data,
            'menu_items': MenuItemSerializer(menu_items, many=True).data
        })
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

# -------------------- Seat Management --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_seats(request, restaurant_id):
    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        seats = Seat.objects.filter(restaurant=restaurant)
        
        # Get occupied seats
        now = timezone.now()
        occupied_seats = OccupiedSeat.objects.filter(
            seat__restaurant=restaurant,
            occupied_until__gt=now
        ).values_list('seat_id', flat=True)
        
        # Get booked seats
        booked_seats = Booking.objects.filter(
            restaurant=restaurant,
            start_time__lte=now,
            end_time__gt=now,
            status='confirmed'
        ).values_list('seats', flat=True)
        
        seat_data = []
        for seat in seats:
            seat_info = {
                'id': seat.id,
                'code': seat.code,
                'is_private_room': seat.is_private_room,
                'x_position': seat.x_position,
                'y_position': seat.y_position,
                'is_occupied': seat.id in occupied_seats,
                'is_booked': any(seat.id in booking for booking in booked_seats)
            }
            seat_data.append(seat_info)
        
        return Response({
            'restaurant': RestaurantSerializer(restaurant).data,
            'seats': seat_data,
            'layout': 'restaurant'  # Could be customized per restaurant
        })
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

# -------------------- Booking Management --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def user_bookings(request):
    user_id = request.GET.get('user_id')

    if not user_id:
        return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = UserProfile.objects.get(id=user_id)
        bookings = Booking.objects.filter(user=user).order_by('-created_at')

        return Response({
            'bookings': BookingSerializer(bookings, many=True).data
        })
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
@permission_classes([AllowAny])
def create_booking(request, restaurant_id):
    user_id = request.data.get('user_id')
    guest_id = request.data.get('guest_id')
    # restaurant_id comes from URL parameter
    seat_ids = request.data.get('seat_ids', [])
    start_time = request.data.get('start_time')
    end_time = request.data.get('end_time')

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)

        # Validate seats are available
        now = timezone.now()
        start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))

        # Check for conflicts
        conflicting_bookings = Booking.objects.filter(
            restaurant=restaurant,
            seats__in=seat_ids,
            start_time__lt=end_dt,
            end_time__gt=start_dt,
            status='confirmed'
        )

        if conflicting_bookings.exists():
            return Response({'error': 'Some seats are already booked for this time'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Get additional booking data
        customer_name = request.data.get('customer_name', '')
        customer_phone = request.data.get('customer_phone', '')
        payment_method = request.data.get('payment_method', 'cash')
        total_amount = request.data.get('total_amount', 0)

        # Create booking with all details
        booking = Booking.objects.create(
            user_id=user_id if user_id else None,
            guest_session_id=guest_id if guest_id else None,
            restaurant=restaurant,
            start_time=start_dt,
            end_time=end_dt,
            status='confirmed',
            customer_name=customer_name,
            customer_phone=customer_phone,
            payment_method=payment_method,
            total_amount=total_amount,
            seat_codes=seat_ids  # Store the generated seat IDs
        )

        return Response({
            'booking_id': booking.id,
            'status': 'confirmed',
            'message': 'Booking confirmed successfully'
        })

    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# -------------------- Payment Validation --------------------
def validate_bd_phone(phone):
    """Validate Bangladesh phone number: ^01[3-9]\\d{8}$"""
    pattern = r'^01[3-9]\d{8}$'
    return re.match(pattern, phone) is not None

def validate_pin(pin):
    """Validate 4-digit PIN"""
    return len(pin) == 4 and pin.isdigit()

def luhn_check(card_number):
    """Validate credit card using Luhn algorithm"""
    def digits_of(n):
        return [int(d) for d in str(n)]

    digits = digits_of(card_number)
    odd_digits = digits[-1::-2]
    even_digits = digits[-2::-2]
    checksum = sum(odd_digits)
    for d in even_digits:
        checksum += sum(digits_of(d*2))
    return checksum % 10 == 0

def validate_card(card_number, expiry_month, expiry_year, pin):
    """Validate credit card details"""
    if len(card_number) != 16 or not card_number.isdigit():
        return False, "Invalid card number format"

    if not luhn_check(card_number):
        return False, "Invalid card number"

    # Check expiry date
    try:
        exp_month = int(expiry_month)
        exp_year = int(expiry_year)
        current_year = datetime.now().year % 100  # Get last 2 digits
        current_month = datetime.now().month

        if exp_year < current_year or (exp_year == current_year and exp_month < current_month):
            return False, "Card has expired"
    except ValueError:
        return False, "Invalid expiry date"

    if not validate_pin(pin):
        return False, "Invalid PIN"

    return True, "Valid"

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_payment(request):
    payment_method = request.data.get('payment_method')

    if payment_method in ['bkash', 'nagad']:
        phone = request.data.get('phone', '')
        pin = request.data.get('pin', '')

        if not validate_bd_phone(phone):
            return Response({'error': 'Invalid Bangladesh phone number'},
                          status=status.HTTP_400_BAD_REQUEST)

        if not validate_pin(pin):
            return Response({'error': 'Invalid PIN'},
                          status=status.HTTP_400_BAD_REQUEST)

    elif payment_method == 'card':
        card_number = request.data.get('card_number', '')
        expiry_month = request.data.get('expiry_month', '')
        expiry_year = request.data.get('expiry_year', '')
        pin = request.data.get('pin', '')

        is_valid, message = validate_card(card_number, expiry_month, expiry_year, pin)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Payment details valid'})

# -------------------- Order Management --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    user_id = request.data.get('user_id')
    guest_id = request.data.get('guest_id')
    restaurant_id = request.data.get('restaurant_id')
    items = request.data.get('items', [])
    payment_method = request.data.get('payment_method')
    delivery_contact = request.data.get('delivery_contact', {})

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)

        # Calculate totals
        subtotal = 0
        for item in items:
            menu_item = MenuItem.objects.get(id=item['menu_item_id'])
            subtotal += menu_item.price * item['quantity']

        # Apply discounts and calculate total
        discount_amount = 0
        delivery_fee = 50 if payment_method != 'cash' else 0  # Free delivery for cash
        total_amount = subtotal - discount_amount + delivery_fee

        # Create order
        order = Order.objects.create(
            user_id=user_id if user_id else None,
            guest_session_id=guest_id if guest_id else None,
            restaurant=restaurant,
            subtotal=subtotal,
            discount_amount=discount_amount,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            payment_method=payment_method,
            delivery_contact=delivery_contact,
            rider_name=f"Rider {uuid.uuid4().hex[:6]}",  # Random rider name
            rider_phone=f"01{uuid.uuid4().hex[:9]}"[:11],  # Random BD phone
            status='confirmed'
        )

        # Create order items
        for item in items:
            menu_item = MenuItem.objects.get(id=item['menu_item_id'])
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item['quantity'],
                price=menu_item.price
            )

        # Award reward points for users
        if user_id:
            user = UserProfile.objects.get(id=user_id)
            points_earned = int(total_amount // 100)  # 1 point per 100 tk
            user.reward_points += points_earned
            user.save()

        return Response({
            'order_id': order.id,
            'status': 'confirmed',
            'total_amount': str(total_amount),
            'rider_name': order.rider_name,
            'rider_phone': order.rider_phone,
            'estimated_delivery': '30-45 minutes'
        })

    except (Restaurant.DoesNotExist, MenuItem.DoesNotExist) as e:
        return Response({'error': 'Invalid restaurant or menu item'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def order_history(request):
    user_id = request.GET.get('user_id')
    guest_id = request.GET.get('guest_id')

    try:
        orders = Order.objects.all().order_by('-created_at')

        # Filter by user or guest
        if user_id:
            user = UserProfile.objects.get(id=user_id)
            orders = orders.filter(user=user)
        elif guest_id:
            guest = GuestSession.objects.get(id=guest_id)
            orders = orders.filter(guest_session=guest)
        else:
            return Response({'error': 'User ID or Guest ID required'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'orders': OrderSerializer(orders, many=True).data,
            'total_orders': orders.count()
        })
    except (UserProfile.DoesNotExist, GuestSession.DoesNotExist):
        return Response({'error': 'User or guest not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([AllowAny])
def order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        return Response(OrderSerializer(order).data)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

# -------------------- Review System --------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def create_review(request, order_id):
    user_id = request.data.get('user_id')
    rating = request.data.get('rating')
    text = request.data.get('text', '')

    try:
        order = Order.objects.get(id=order_id)

        if order.status != 'delivered':
            return Response({'error': 'Can only review delivered orders'},
                          status=status.HTTP_400_BAD_REQUEST)

        if not user_id:
            return Response({'error': 'Only registered users can leave reviews'},
                          status=status.HTTP_400_BAD_REQUEST)

        user = UserProfile.objects.get(id=user_id)

        # Check if review already exists
        if Review.objects.filter(user=user, order=order).exists():
            return Response({'error': 'Review already exists for this order'},
                          status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(
            user=user,
            restaurant=order.restaurant,
            order=order,
            rating=rating,
            text=text
        )

        # Update restaurant average rating
        restaurant = order.restaurant
        reviews = Review.objects.filter(restaurant=restaurant)
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        restaurant.average_rating = round(avg_rating, 2)
        restaurant.total_reviews = len(reviews)
        restaurant.save()

        return Response({
            'review_id': review.id,
            'message': 'Review submitted successfully'
        })

    except (Order.DoesNotExist, UserProfile.DoesNotExist):
        return Response({'error': 'Order or user not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# -------------------- Admin Dashboard --------------------
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard(request):
    admin_name = request.GET.get('admin_name')

    if not admin_name or admin_name not in settings.ADMIN_USERS:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    # Enhanced admin dashboard with detailed analytics
    from django.db.models import Sum, Count, Avg
    from datetime import datetime, timedelta

    # Get all data
    users = UserProfile.objects.all()
    all_orders = Order.objects.all().order_by('-created_at')
    all_bookings = Booking.objects.all().order_by('-created_at')
    all_reviews = Review.objects.all().order_by('-created_at')

    # Calculate revenue statistics
    total_revenue = all_orders.aggregate(total=Sum('total_amount'))['total'] or 0
    delivered_orders = all_orders.filter(status='delivered')
    confirmed_revenue = delivered_orders.aggregate(total=Sum('total_amount'))['total'] or 0

    # Restaurant-wise revenue and order stats
    restaurant_stats = all_orders.values(
        'restaurant__name',
        'restaurant__id',
        'restaurant__area'
    ).annotate(
        total_orders=Count('id'),
        total_revenue=Sum('total_amount'),
        avg_order_value=Avg('total_amount')
    ).order_by('-total_revenue')

    # Recent activity (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_orders = all_orders.filter(created_at__gte=week_ago)
    recent_revenue = recent_orders.aggregate(total=Sum('total_amount'))['total'] or 0

    # User activity stats with detailed order information
    user_stats = []
    for user in users:
        user_orders = all_orders.filter(user=user)
        user_bookings = all_bookings.filter(user=user)
        user_spent = user_orders.aggregate(total=Sum('total_amount'))['total'] or 0

        # Get user's recent orders with restaurant info
        recent_user_orders = user_orders[:5]  # Last 5 orders
        order_details = []
        for order in recent_user_orders:
            order_details.append({
                'order_id': order.id,
                'restaurant_name': order.restaurant.name,
                'total_amount': float(order.total_amount),
                'status': order.status,
                'created_at': order.created_at,
                'items_count': order.items.count()
            })

        user_stats.append({
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'institution': user.institution.name if user.institution else 'No Institution',
            'total_orders': user_orders.count(),
            'total_bookings': user_bookings.count(),
            'total_spent': float(user_spent),
            'reward_points': user.reward_points,
            'last_order': user_orders.first().created_at if user_orders.exists() else None,
            'recent_orders': order_details
        })

    # Sort users by total spent (highest spenders first)
    user_stats.sort(key=lambda x: x['total_spent'], reverse=True)

    return Response({
        'users': user_stats,
        'orders': OrderSerializer(all_orders[:100], many=True).data,  # Latest 100 orders
        'bookings': BookingSerializer(all_bookings[:50], many=True).data,
        'reviews': ReviewSerializer(all_reviews[:50], many=True).data,
        'restaurant_stats': list(restaurant_stats),
        'stats': {
            'total_users': users.count(),
            'total_orders': all_orders.count(),
            'total_bookings': all_bookings.count(),
            'total_reviews': all_reviews.count(),
            'total_revenue': float(total_revenue),
            'confirmed_revenue': float(confirmed_revenue),
            'recent_revenue': float(recent_revenue),
            'avg_order_value': float(all_orders.aggregate(avg=Avg('total_amount'))['avg'] or 0),
            'pending_orders': all_orders.filter(status='pending').count(),
            'confirmed_orders': all_orders.filter(status='confirmed').count(),
            'delivered_orders': delivered_orders.count(),
            'cancelled_orders': all_orders.filter(status='cancelled').count(),
        }
    })
