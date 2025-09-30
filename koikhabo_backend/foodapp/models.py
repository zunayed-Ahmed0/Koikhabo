from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
import math
import json
from django.utils import timezone
from datetime import date, datetime, timedelta

# -------------------- Institution --------------------
class Institution(models.Model):
    INSTITUTION_TYPES = [
        ('university', 'University'),
        ('medical_college', 'Medical College'),
        ('college', 'College'),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=INSTITUTION_TYPES)
    area = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return f"{self.name} ({self.area})"

# -------------------- User Profile --------------------
class UserProfile(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    institution = models.ForeignKey(Institution, on_delete=models.SET_NULL, null=True, blank=True)
    preferred_areas = models.JSONField(default=list)  # List of area names
    reward_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

# -------------------- Guest Session --------------------
class GuestSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Guest {self.session_id}"

# -------------------- Food Category --------------------
class FoodCategory(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default='🍽️')

    class Meta:
        verbose_name_plural = "Food Categories"

    def __str__(self):
        return self.name

# -------------------- Restaurant --------------------
class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    area = models.CharField(max_length=100)  # Dhaka area
    address = models.CharField(max_length=300)
    phone = models.CharField(max_length=20)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    is_open = models.BooleanField(default=True)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)

    # Restaurant features
    has_private_room = models.BooleanField(default=False)
    has_smoking_zone = models.BooleanField(default=False)
    has_prayer_zone = models.BooleanField(default=False)
    capacity = models.IntegerField()  # Total seating capacity

    # Theme and branding
    logo = models.TextField(default='🍽️')  # Emoji or simple SVG
    color_theme = models.CharField(max_length=7, default='#FF6B6B')  # Hex color
    font_family = models.CharField(max_length=100, default='Inter')
    wallpaper_url = models.URLField(blank=True)

    # Cuisines offered (JSON array)
    cuisines = models.JSONField(default=list)  # ['Bengali', 'Chinese', etc.]

    def calculate_distance(self, user_lat, user_lon):
        if not self.latitude or not self.longitude:
            return float('inf')
        R = 6371  # Earth's radius in kilometers
        lat1, lon1 = math.radians(float(user_lat)), math.radians(float(user_lon))
        lat2, lon2 = math.radians(float(self.latitude)), math.radians(float(self.longitude))
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    def __str__(self):
        return self.name

# -------------------- Seat --------------------
class Seat(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='seats')
    code = models.CharField(max_length=10)  # e.g., "A1", "B2"
    is_private_room = models.BooleanField(default=False)
    x_position = models.IntegerField()  # For layout positioning
    y_position = models.IntegerField()  # For layout positioning

    class Meta:
        unique_together = ['restaurant', 'code']

    def __str__(self):
        return f"{self.restaurant.name} - Seat {self.code}"

# -------------------- Menu Item --------------------
class MenuItem(models.Model):
    CUISINE_CHOICES = [
        ('bengali', 'Bengali'),
        ('chinese', 'Chinese'),
        ('middle_eastern', 'Middle Eastern'),
        ('western', 'Western'),
        ('japanese', 'Japanese'),
        ('indian', 'Indian'),
        ('thai', 'Thai'),
        ('italian', 'Italian'),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    cuisine_type = models.CharField(max_length=20, choices=CUISINE_CHOICES)
    category = models.ForeignKey(FoodCategory, on_delete=models.CASCADE)
    is_vegetarian = models.BooleanField(default=False)
    spice_level = models.IntegerField(choices=[(1, 'Mild'), (2, 'Medium'), (3, 'Spicy')], default=1)
    is_available = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)

    # Student set menu fields
    is_student_set = models.BooleanField(default=False)
    set_items = models.JSONField(default=list)  # List of items included in student set
    requires_student_id = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

# -------------------- Discount --------------------
class Discount(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='discounts')
    name = models.CharField(max_length=100)
    description = models.TextField()
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    minimum_order = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

# -------------------- Booking --------------------
class Booking(models.Model):
    BOOKING_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    # User or guest
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
    guest_session = models.ForeignKey(GuestSession, on_delete=models.CASCADE, null=True, blank=True)

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    seats = models.ManyToManyField(Seat, blank=True)  # Made optional for generated seats
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    # Additional fields for booking details
    customer_name = models.CharField(max_length=100, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    payment_method = models.CharField(max_length=50, default='cash')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    seat_codes = models.JSONField(default=list, blank=True)  # Store generated seat IDs

    def __str__(self):
        user_info = self.user.email if self.user else f"Guest {self.guest_session.session_id}"
        return f"Booking {self.id} - {user_info} at {self.restaurant.name}"

# # -------------------- Order --------------------
# class Order(models.Model):
#     ORDER_STATUS = [
#         ('pending', 'Pending'),
#         ('confirmed', 'Confirmed'),
#         ('preparing', 'Preparing'),
#         ('ready', 'Ready for Pickup'),
#         ('out_for_delivery', 'Out for Delivery'),
#         ('delivered', 'Delivered'),
#         ('cancelled', 'Cancelled'),
#     ]

#     PAYMENT_STATUS = [
#         ('pending', 'Pending'),
#         ('paid', 'Paid'),
#         ('failed', 'Failed'),
#         ('refunded', 'Refunded'),
#     ]

#     PAYMENT_METHODS = [
#         ('cash', 'Cash on Delivery'),
#         ('bkash', 'bKash'),
#         ('nagad', 'Nagad'),
#         ('card', 'Credit/Debit Card'),
#     ]

#     # User or guest
#     user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
#     guest_session = models.ForeignKey(GuestSession, on_delete=models.CASCADE, null=True, blank=True)

#     restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
#     subtotal = models.DecimalField(max_digits=8, decimal_places=2)
#     discount_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
#     delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
#     total_amount = models.DecimalField(max_digits=8, decimal_places=2)

#     payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
#     payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
#     status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')

#     # Delivery details
#     delivery_contact = models.JSONField(default=dict)  # phone, email, address
#     rider_name = models.CharField(max_length=100, blank=True)
#     rider_phone = models.CharField(max_length=15, blank=True)

#     special_instructions = models.TextField(blank=True)
#     booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         user_info = self.user.email if self.user else f"Guest {self.guest_session.session_id}"
#         return f"Order #{self.id} - {user_info}"
# -------------------- Order --------------------
class Order(models.Model):
    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready for Pickup'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHODS = [
        ('cash', 'Cash on Delivery'),
        ('bkash', 'bKash'),
        ('nagad', 'Nagad'),
        ('card', 'Credit/Debit Card'),
    ]

    # User or guest
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
    guest_session = models.ForeignKey(GuestSession, on_delete=models.CASCADE, null=True, blank=True)

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    subtotal = models.DecimalField(max_digits=8, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)

    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')

    # Delivery details
    delivery_contact = models.JSONField(default=dict)  # phone, email, address
    rider_name = models.CharField(max_length=100, blank=True)
    rider_phone = models.CharField(max_length=15, blank=True)

    special_instructions = models.TextField(blank=True)
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_info = self.user.email if self.user else f"Guest {self.guest_session.session_id}"
        return f"Order #{self.id} - {user_info}"

    # -------------------- Reward Points --------------------
    def save(self, *args, **kwargs):
        # Call parent save first
        super().save(*args, **kwargs)

        # Only assign points if the order is paid and belongs to a registered user
        if self.payment_status == 'paid' and self.user:
            points_earned = int(self.total_amount // 100)  # 1 point per 100 Taka
            if points_earned > 0:
                self.user.points += points_earned
                self.user.save()

# -------------------- Order Item --------------------
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"

# -------------------- Review --------------------
class Review(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'order')

    def __str__(self):
        return f"{self.user.email} - {self.restaurant.name} ({self.rating}/5)"

# -------------------- Occupied Seat (for random occupancy) --------------------
class OccupiedSeat(models.Model):
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    occupied_until = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_occupied(self):
        return timezone.now() < self.occupied_until

    def __str__(self):
        return f"{self.seat} occupied until {self.occupied_until}"

# -------------------- Reward Redemption --------------------
class RewardRedemption(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    points_used = models.IntegerField()
    discount_amount = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.points_used} points for {self.discount_amount} tk"
