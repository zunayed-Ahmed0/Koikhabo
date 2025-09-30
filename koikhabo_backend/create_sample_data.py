import os
import django
from datetime import time, date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'koikhabo_backend.settings')
django.setup()

from foodapp.models import FoodCategory, Restaurant, FoodItem

def create_sample_data():
    # Create categories
    categories = [
        {'name': 'Rice Dishes', 'icon': '🍚', 'description': 'Various rice-based meals'},
        {'name': 'Curry', 'icon': '🍛', 'description': 'Traditional curries'},
        {'name': 'Snacks', 'icon': '🍿', 'description': 'Light snacks and appetizers'},
        {'name': 'Beverages', 'icon': '🥤', 'description': 'Drinks and beverages'},
        {'name': 'Desserts', 'icon': '🍰', 'description': 'Sweet treats'},
    ]
    
    for cat_data in categories:
        category, created = FoodCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")
    
    # Create restaurants
    restaurants = [
        {
            'name': 'Campus Central Canteen',
            'description': 'Main campus dining hall',
            'address': 'Central Campus Building',
            'phone': '+880-123-456789',
            'latitude': 23.7465,
            'longitude': 90.3763,
            'opening_time': time(7, 0),
            'closing_time': time(22, 0),
            'location_type': 'canteen'
        },
        {
            'name': 'Engineering Food Court',
            'description': 'Food court near engineering building',
            'address': 'Engineering Building, 2nd Floor',
            'phone': '+880-123-456790',
            'latitude': 23.7470,
            'longitude': 90.3770,
            'opening_time': time(8, 0),
            'closing_time': time(20, 0),
            'location_type': 'food_court'
        }
    ]
    
    for rest_data in restaurants:
        restaurant, created = Restaurant.objects.get_or_create(
            name=rest_data['name'],
            defaults=rest_data
        )
        if created:
            print(f"Created restaurant: {restaurant.name}")
    
    # Create food items
    rice_category = FoodCategory.objects.get(name='Rice Dishes')
    curry_category = FoodCategory.objects.get(name='Curry')
    canteen = Restaurant.objects.get(name='Campus Central Canteen')
    
    food_items = [
        {
            'name': 'Chicken Biryani',
            'description': 'Aromatic rice with spiced chicken',
            'price': 120.00,
            'category': rice_category,
            'restaurant': canteen,
            'meal_type': 'lunch',
            'spice_level': 2,
            'available_date': date.today()
        },
        {
            'name': 'Beef Curry',
            'description': 'Traditional beef curry with rice',
            'price': 100.00,
            'category': curry_category,
            'restaurant': canteen,
            'meal_type': 'lunch',
            'spice_level': 3,
            'available_date': date.today()
        }
    ]
    
    for food_data in food_items:
        food_item, created = FoodItem.objects.get_or_create(
            name=food_data['name'],
            restaurant=food_data['restaurant'],
            defaults=food_data
        )
        if created:
            print(f"Created food item: {food_item.name}")

if __name__ == '__main__':
    create_sample_data()
    print("Sample data created successfully!")