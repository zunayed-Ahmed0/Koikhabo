from rest_framework import serializers
from .models import (
    Institution, UserProfile, GuestSession, Restaurant, Seat, MenuItem, 
    Discount, Booking, Order, OrderItem, Review, OccupiedSeat, RewardRedemption
)

# -------------------- Institution Serializer --------------------
class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

# -------------------- User Profile Serializer --------------------
class UserProfileSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'

# -------------------- Guest Session Serializer --------------------
class GuestSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestSession
        fields = '__all__'

# -------------------- Restaurant Serializer --------------------
class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'

# -------------------- Seat Serializer --------------------
class SeatSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    
    class Meta:
        model = Seat
        fields = '__all__'

# -------------------- Menu Item Serializer --------------------
class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = MenuItem
        fields = '__all__'

# -------------------- Discount Serializer --------------------
class DiscountSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    
    class Meta:
        model = Discount
        fields = '__all__'

# -------------------- Booking Serializer --------------------
class BookingSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_address = serializers.CharField(source='restaurant.area', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    guest_session_id = serializers.CharField(source='guest_session.session_id', read_only=True)
    seat_list = serializers.SerializerMethodField()
    duration_hours = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = '__all__'

    def get_seat_list(self, obj):
        # Return both database seats and generated seat codes
        db_seats = [seat.code for seat in obj.seats.all()]
        generated_seats = obj.seat_codes if obj.seat_codes else []
        return db_seats + generated_seats

    def get_duration_hours(self, obj):
        if obj.start_time and obj.end_time:
            duration = obj.end_time - obj.start_time
            return round(duration.total_seconds() / 3600, 1)
        return 0

# -------------------- Order Item Serializer --------------------
class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = '__all__'

# -------------------- Order Serializer --------------------
class OrderSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_area = serializers.CharField(source='restaurant.area', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_institution = serializers.CharField(source='user.institution.name', read_only=True)
    guest_session_id = serializers.CharField(source='guest_session.session_id', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    customer_info = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_items_count(self, obj):
        return obj.items.count()

    def get_customer_info(self, obj):
        if obj.user:
            return {
                'type': 'user',
                'name': obj.user.name,
                'email': obj.user.email,
                'institution': obj.user.institution.name if obj.user.institution else None
            }
        elif obj.guest_session:
            return {
                'type': 'guest',
                'session_id': obj.guest_session.session_id,
                'contact': obj.delivery_contact
            }
        return None

# -------------------- Review Serializer --------------------
class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'

# -------------------- Occupied Seat Serializer --------------------
class OccupiedSeatSerializer(serializers.ModelSerializer):
    seat_code = serializers.CharField(source='seat.code', read_only=True)
    restaurant_name = serializers.CharField(source='seat.restaurant.name', read_only=True)
    
    class Meta:
        model = OccupiedSeat
        fields = '__all__'

# -------------------- Reward Redemption Serializer --------------------
class RewardRedemptionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    
    class Meta:
        model = RewardRedemption
        fields = '__all__'
