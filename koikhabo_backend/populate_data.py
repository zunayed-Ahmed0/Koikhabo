import os
import django
from decimal import Decimal
from datetime import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'koikhabo_backend.settings')
django.setup()

from foodapp.models import Restaurant, FoodCategory, FoodItem

def populate_restaurants():
    # Create some categories if not exist
    categories = {
        'Breakfast': FoodCategory.objects.get_or_create(name='Breakfast', defaults={'icon': '🍳'})[0],
        'Lunch': FoodCategory.objects.get_or_create(name='Lunch', defaults={'icon': '🍛'})[0],
        'Dinner': FoodCategory.objects.get_or_create(name='Dinner', defaults={'icon': '🍲'})[0],
        'Snack': FoodCategory.objects.get_or_create(name='Snack', defaults={'icon': '🍪'})[0],
    }
    
    restaurants_data = [
        {
            'name': 'Central Canteen',
            'description': 'Main campus dining hall with traditional Bengali cuisine',
            'address': 'Central Campus, Ground Floor',
            'phone': '01711-123456',
            'latitude': Decimal('23.7808'),
            'longitude': Decimal('90.2792'),
            'is_open': True,
            'opening_time': time(7, 0),
            'closing_time': time(22, 0),
            'average_rating': Decimal('4.2'),
            'total_reviews': 156,
            'total_seats': 80,
            'available_seats': 65,
            'location_type': 'canteen'
        },
        # Add other restaurants similarly...
    ]
    
    for data in restaurants_data:
        restaurant, created = Restaurant.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"Created restaurant: {restaurant.name}")
        
        menu_items = [
            # Breakfast items
            {'name': 'Rice & Dal', 'price': Decimal('45'), 'meal_type': 'breakfast', 'is_vegetarian': True, 'category': categories['Breakfast']},
            {'name': 'Paratha & Curry', 'price': Decimal('60'), 'meal_type': 'breakfast', 'is_vegetarian': True, 'category': categories['Breakfast']},
            {'name': 'Egg Curry', 'price': Decimal('55'), 'meal_type': 'breakfast', 'is_vegetarian': False, 'category': categories['Breakfast']},
            # Lunch items
            {'name': 'Chicken Curry', 'price': Decimal('80'), 'meal_type': 'lunch', 'is_vegetarian': False, 'category': categories['Lunch']},
            {'name': 'Fish Fry', 'price': Decimal('70'), 'meal_type': 'lunch', 'is_vegetarian': False, 'category': categories['Lunch']},
            {'name': 'Vegetable Curry', 'price': Decimal('50'), 'meal_type': 'lunch', 'is_vegetarian': True, 'category': categories['Lunch']},
            {'name': 'Biryani', 'price': Decimal('120'), 'meal_type': 'lunch', 'is_vegetarian': False, 'category': categories['Lunch']},
            # Dinner items
            {'name': 'Beef Curry', 'price': Decimal('100'), 'meal_type': 'dinner', 'is_vegetarian': False, 'category': categories['Dinner']},
            {'name': 'Mutton Curry', 'price': Decimal('150'), 'meal_type': 'dinner', 'is_vegetarian': False, 'category': categories['Dinner']},
            {'name': 'Dal & Rice', 'price': Decimal('40'), 'meal_type': 'dinner', 'is_vegetarian': True, 'category': categories['Dinner']},
            # Snacks
            {'name': 'Samosa', 'price': Decimal('15'), 'meal_type': 'snack', 'is_vegetarian': True, 'category': categories['Snack']},
            {'name': 'Tea', 'price': Decimal('10'), 'meal_type': 'snack', 'is_vegetarian': True, 'category': categories['Snack']},
            {'name': 'Coffee', 'price': Decimal('20'), 'meal_type': 'snack', 'is_vegetarian': True, 'category': categories['Snack']},
        ]
        
        for item_data in menu_items:
            food_item, created = FoodItem.objects.get_or_create(
                restaurant=restaurant,
                name=item_data['name'],
                defaults={
                    'price': item_data['price'],
                    'meal_type': item_data['meal_type'],
                    'is_vegetarian': item_data['is_vegetarian'],
                    'category': item_data['category'],
                    'description': f"Delicious {item_data['name'].lower()} from {restaurant.name}",
                    'is_available': True,
                }
            )
            if created:
                print(f"Created food item: {food_item.name} for {restaurant.name}")

if __name__ == '__main__':
    populate_restaurants()
    print("Database populated successfully!")
