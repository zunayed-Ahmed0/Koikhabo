import os
import django
import random
from decimal import Decimal
from datetime import time, datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'koikhabo_backend.settings')
django.setup()

from foodapp.models import (
    Institution, Restaurant, FoodCategory, MenuItem, Seat, OccupiedSeat
)
from django.utils import timezone

def create_institutions():
    """Create institutions in Dhaka"""
    institutions_data = [
        # Universities
        ('University of Dhaka', 'university', 'Ramna', 23.7281, 90.3956),
        ('Bangladesh University of Engineering and Technology', 'university', 'Ramna', 23.7261, 90.3925),
        ('Dhaka University of Engineering & Technology', 'university', 'Gazipur', 23.9999, 90.4203),
        ('Jahangirnagar University', 'university', 'Savar', 23.8759, 90.2661),
        ('Islamic University of Technology', 'university', 'Gazipur', 23.9738, 90.4054),
        ('North South University', 'university', 'Bashundhara', 23.8103, 90.4125),
        ('BRAC University', 'university', 'Mohakhali', 23.7808, 90.4067),
        ('Independent University Bangladesh', 'university', 'Bashundhara', 23.8103, 90.4125),
        ('American International University-Bangladesh', 'university', 'Banani', 23.7937, 90.4066),
        ('East West University', 'university', 'Aftabnagar', 23.7515, 90.4371),
        ('Northern University', 'university', 'Airport', 23.8103, 90.4125),  # Special requirement
        ('United International University', 'university', 'Badda', 23.7806, 90.4193),
        ('Daffodil International University', 'university', 'Dhanmondi', 23.7465, 90.3754),
        ('Ahsanullah University of Science and Technology', 'university', 'Tejgaon', 23.7644, 90.3857),
        
        # Medical Colleges
        ('Dhaka Medical College', 'medical_college', 'Ramna', 23.7281, 90.3956),
        ('Sir Salimullah Medical College', 'medical_college', 'Mitford', 23.7197, 90.4086),
        ('Shaheed Suhrawardy Medical College', 'medical_college', 'Sher-e-Bangla Nagar', 23.7693, 90.3563),
        ('Armed Forces Medical College', 'medical_college', 'Dhaka Cantonment', 23.8103, 90.4125),
        ('Holy Family Red Crescent Medical College', 'medical_college', 'Eskaton', 23.7465, 90.4086),
        
        # Major Colleges
        ('Dhaka College', 'college', 'New Market', 23.7340, 90.3916),
        ('Intermediate College Dhaka', 'college', 'Dhanmondi', 23.7465, 90.3754),
        ('Government Science College', 'college', 'Tejgaon', 23.7644, 90.3857),
        ('Dhaka City College', 'college', 'Dhanmondi', 23.7465, 90.3754),
        ('Begum Badrunnesa Government Girls College', 'college', 'Bakshibazar', 23.7197, 90.4086),
        ('Eden Mohila College', 'college', 'Azimpur', 23.7197, 90.3916),
    ]
    
    for name, inst_type, area, lat, lon in institutions_data:
        Institution.objects.get_or_create(
            name=name,
            defaults={
                'type': inst_type,
                'area': area,
                'latitude': Decimal(str(lat)),
                'longitude': Decimal(str(lon))
            }
        )
    
    print(f"Created {len(institutions_data)} institutions")

def create_food_categories():
    """Create food categories"""
    categories = [
        ('Bengali', '🍛'),
        ('Chinese', '🥢'),
        ('Middle Eastern', '🥙'),
        ('Western', '🍔'),
        ('Japanese', '🍣'),
        ('Indian', '🍛'),
        ('Thai', '🍜'),
        ('Italian', '🍝'),
        ('Snacks', '🍪'),
        ('Beverages', '🥤'),
    ]
    
    for name, icon in categories:
        FoodCategory.objects.get_or_create(
            name=name,
            defaults={'icon': icon}
        )
    
    print(f"Created {len(categories)} food categories")

def create_restaurants():
    """Create 60 restaurants in Dhaka with diverse themes and ratings"""
    dhaka_areas = [
        'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur',
        'Badda', 'Motijheel', 'Paltan', 'Shantinagar', 'Wari', 'Jatrabari',
        'Old Dhaka', 'Banasree', 'Bashundhara', 'Tejgaon', 'Farmgate',
        'Lalmatia', 'Airport', 'Ramna', 'Eskaton', 'Malibagh', 'Rampura',
        'Khilgaon', 'Sabujbagh', 'Lalbagh', 'Hazaribagh', 'Sher-e-Bangla Nagar'
    ]
    
    restaurant_names = [
        # Bengali & Traditional (15)
        'Dhaka Delights', 'Taste of Bengal', 'Heritage Restaurant', 'Royal Bengal', 'Bangla Bites',
        'Padma Palace', 'Meghna Kitchen', 'Jamuna Junction', 'Surma Spice', 'Karnaphuli Cafe',
        'Chittagong Curry', 'Sylhet Sweets', 'Rangpur Recipes', 'Barisal Bites', 'Khulna Kitchen',

        # Japanese (10)
        'Sakura Japanese', 'Tokyo Express', 'Sushi Corner', 'Ramen House', 'Bento Box',
        'Wasabi Garden', 'Kyoto Kitchen', 'Osaka Delights', 'Hiroshima House', 'Nagoya Noodles',

        # Chinese & Asian (10)
        'Dragon Palace', 'Panda Express', 'Great Wall', 'Bamboo Garden', 'Golden Dragon',
        'Jade Garden', 'Phoenix Palace', 'Lotus Leaf', 'Ming Dynasty', 'Silk Route',

        # Indian & Spicy (8)
        'Maharaja Palace', 'Curry Express', 'Tandoor House', 'Biryani Corner', 'Spice Garden',
        'Mumbai Express', 'Delhi Darbar', 'Hyderabad House',

        # Western & Continental (8)
        'Pizza Corner', 'Burger Junction', 'Cafe Central', 'Grill Master', 'Steakhouse',
        'Urban Bites', 'Modern Eatery', 'Classic Diner',

        # Middle Eastern & Mediterranean (5)
        'Mediterranean Delight', 'Kebab House', 'Falafel Corner', 'Shawarma Express', 'Hummus Bar',

        # Fusion & International (4)
        'Fusion Kitchen', 'Global Grill', 'International Bites', 'World Kitchen'
    ]
    
    cuisines_options = [
        ['bengali', 'indian'],
        ['chinese', 'thai'],
        ['japanese'],
        ['western', 'italian'],
        ['middle_eastern'],
        ['bengali', 'chinese', 'western'],
        ['indian', 'middle_eastern'],
        ['japanese', 'thai'],
        ['western', 'italian', 'middle_eastern'],
        ['bengali', 'indian', 'chinese']
    ]
    
    colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#AED6F1', '#D7BDE2', '#F9E79F', '#A9DFBF',
        '#FAD7A0', '#D5A6BD', '#A3E4D7', '#D6EAF8', '#FADBD8', '#D5DBDB', '#FCF3CF', '#EBDEF0',
        '#E8F8F5', '#EBF5FB', '#FDF2E9', '#F4F6F6', '#FDEAA7', '#D1F2EB', '#D6DBDF', '#F8F9F9'
    ]
    fonts = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato', 'Nunito', 'Source Sans Pro']
    logos = ['🍽️', '🍛', '🍜', '🍝', '🍕', '🍔', '🌮', '🥘', '🍱', '🥗']
    
    # Ensure we have Japanese restaurants
    japanese_count = 0
    
    for i in range(60):
        area = random.choice(dhaka_areas)
        name = restaurant_names[i] if i < len(restaurant_names) else f"Restaurant {i+1}"

        # Ensure 10 Japanese restaurants
        if japanese_count < 10 and (i < 10 or random.random() < 0.3):
            cuisines = ['japanese']
            japanese_count += 1
        else:
            cuisines = random.choice(cuisines_options)

        # Generate realistic ratings and review counts
        average_rating = round(random.uniform(3.5, 5.0), 1)
        total_reviews = random.randint(15, 500)
        
        # Generate coordinates around Dhaka
        base_lat = 23.7644
        base_lon = 90.3857
        lat_offset = random.uniform(-0.1, 0.1)
        lon_offset = random.uniform(-0.1, 0.1)
        
        restaurant = Restaurant.objects.create(
            name=name,
            description=f"Authentic {', '.join(cuisines).title()} cuisine in {area}",
            area=area,
            address=f"{random.randint(1, 999)} {area} Road, Dhaka",
            phone=f"01{random.randint(700000000, 999999999)}",
            latitude=Decimal(str(base_lat + lat_offset)),
            longitude=Decimal(str(base_lon + lon_offset)),
            opening_time=time(8, 0),
            closing_time=time(23, 0),
            has_private_room=random.choice([True, False]),
            has_smoking_zone=random.choice([True, False]),
            has_prayer_zone=random.choice([True, False]),
            average_rating=Decimal(str(average_rating)),
            total_reviews=total_reviews,
            capacity=random.randint(20, 100),
            logo=random.choice(logos),
            color_theme=random.choice(colors),
            font_family=random.choice(fonts),
            cuisines=cuisines
        )
        
        # Create seats for the restaurant
        create_seats_for_restaurant(restaurant)
        
        # Create menu items
        create_menu_items_for_restaurant(restaurant)
        
        # Create some random occupied seats
        create_random_occupied_seats(restaurant)
    
    print(f"Created 35 restaurants with {japanese_count} Japanese restaurants")

def create_seats_for_restaurant(restaurant):
    """Create realistic restaurant seat layout"""
    capacity = restaurant.capacity
    seats_created = 0
    
    # Create tables with 2-6 seats each
    table_num = 1
    while seats_created < capacity:
        table_size = random.choice([2, 4, 6])
        remaining = capacity - seats_created
        if remaining < table_size:
            table_size = remaining
        
        # Position tables in a grid-like pattern
        row = (table_num - 1) // 5
        col = (table_num - 1) % 5
        
        for seat_in_table in range(table_size):
            seat_code = f"T{table_num}S{seat_in_table + 1}"
            x_pos = col * 100 + seat_in_table * 20
            y_pos = row * 80
            
            # Some seats are in private rooms
            is_private = restaurant.has_private_room and random.random() < 0.2
            
            Seat.objects.create(
                restaurant=restaurant,
                code=seat_code,
                is_private_room=is_private,
                x_position=x_pos,
                y_position=y_pos
            )
            
            seats_created += 1
        
        table_num += 1

def create_menu_items_for_restaurant(restaurant):
    """Create 25-40 menu items for each restaurant"""
    categories = list(FoodCategory.objects.all())
    item_count = random.randint(25, 40)
    
    # Menu items by cuisine type
    menu_items = {
        'bengali': [
            ('Rice with Dal', 'Traditional Bengali rice and lentil combo', 120),
            ('Fish Curry', 'Fresh fish in spicy Bengali curry', 250),
            ('Chicken Bhuna', 'Slow-cooked chicken in thick gravy', 280),
            ('Beef Rezala', 'Tender beef in creamy sauce', 320),
            ('Vegetable Curry', 'Mixed vegetables in curry sauce', 150),
            ('Hilsa Fish', 'National fish of Bangladesh', 400),
            ('Mutton Curry', 'Spicy goat meat curry', 350),
            ('Prawn Malai Curry', 'Prawns in coconut milk', 380),
        ],
        'chinese': [
            ('Fried Rice', 'Wok-fried rice with vegetables', 180),
            ('Chow Mein', 'Stir-fried noodles', 200),
            ('Sweet and Sour Chicken', 'Crispy chicken in tangy sauce', 280),
            ('Kung Pao Chicken', 'Spicy diced chicken with peanuts', 300),
            ('Spring Rolls', 'Crispy vegetable rolls', 120),
            ('Hot and Sour Soup', 'Traditional Chinese soup', 150),
            ('Beef Black Bean', 'Beef stir-fry with black bean sauce', 320),
            ('Szechuan Chicken', 'Spicy Szechuan-style chicken', 290),
        ],
        'japanese': [
            ('Sushi Platter', 'Assorted fresh sushi', 450),
            ('Chicken Teriyaki', 'Grilled chicken with teriyaki sauce', 350),
            ('Ramen Bowl', 'Traditional Japanese noodle soup', 280),
            ('Tempura', 'Lightly battered and fried seafood/vegetables', 320),
            ('Bento Box', 'Complete Japanese meal box', 380),
            ('Miso Soup', 'Traditional soybean soup', 120),
            ('Yakitori', 'Grilled chicken skewers', 250),
            ('Sashimi', 'Fresh raw fish slices', 400),
        ],
        'western': [
            ('Beef Burger', 'Juicy beef patty with fries', 320),
            ('Grilled Chicken', 'Herb-seasoned grilled chicken', 280),
            ('Fish and Chips', 'Battered fish with crispy fries', 350),
            ('Caesar Salad', 'Fresh romaine with Caesar dressing', 220),
            ('Pasta Carbonara', 'Creamy pasta with bacon', 300),
            ('BBQ Ribs', 'Tender ribs with BBQ sauce', 450),
            ('Club Sandwich', 'Triple-layer sandwich with fries', 280),
            ('Steak', 'Grilled beef steak with sides', 500),
        ],
        'middle_eastern': [
            ('Chicken Shawarma', 'Marinated chicken wrap', 250),
            ('Falafel Plate', 'Crispy chickpea balls with tahini', 200),
            ('Hummus with Pita', 'Creamy chickpea dip', 150),
            ('Kebab Platter', 'Mixed grilled meat skewers', 380),
            ('Biryani', 'Fragrant rice with meat', 300),
            ('Mandy', 'Traditional rice and meat dish', 350),
            ('Fattoush Salad', 'Mixed greens with crispy bread', 180),
            ('Baklava', 'Sweet pastry dessert', 120),
        ]
    }
    
    # Student set menus (130-250 tk)
    student_sets = [
        ('Student Rice Set', ['Rice', 'Dal', 'Vegetable', 'Pickle'], 130),
        ('Student Chicken Set', ['Rice', 'Chicken Curry', 'Dal'], 180),
        ('Student Fish Set', ['Rice', 'Fish Curry', 'Vegetables'], 200),
        ('Student Beef Set', ['Rice', 'Beef Curry', 'Dal', 'Salad'], 220),
        ('Student Noodles Set', ['Noodles', 'Vegetables', 'Soup'], 150),
        ('Student Burger Set', ['Burger', 'Fries', 'Drink'], 250),
    ]
    
    created_items = 0
    
    # Create regular menu items based on restaurant cuisines
    for cuisine in restaurant.cuisines:
        if cuisine in menu_items:
            items_for_cuisine = random.sample(menu_items[cuisine], min(8, len(menu_items[cuisine])))
            for name, desc, base_price in items_for_cuisine:
                if created_items >= item_count:
                    break
                
                # Add some price variation
                price = base_price + random.randint(-20, 50)
                
                MenuItem.objects.create(
                    restaurant=restaurant,
                    name=name,
                    description=desc,
                    price=Decimal(str(price)),
                    cuisine_type=cuisine,
                    category=random.choice(categories),
                    is_vegetarian=random.choice([True, False]),
                    spice_level=random.randint(1, 3),
                    is_student_set=False,
                    requires_student_id=False
                )
                created_items += 1
    
    # Add student sets (every restaurant must have them)
    student_count = random.randint(2, 4)
    for i in range(student_count):
        if created_items >= item_count:
            break
        
        name, items, price = random.choice(student_sets)
        MenuItem.objects.create(
            restaurant=restaurant,
            name=name,
            description=f"Student special: {', '.join(items)}",
            price=Decimal(str(price)),
            cuisine_type=restaurant.cuisines[0],
            category=random.choice(categories),
            is_vegetarian=random.choice([True, False]),
            spice_level=random.randint(1, 2),
            is_student_set=True,
            set_items=items,
            requires_student_id=True
        )
        created_items += 1

def create_random_occupied_seats(restaurant):
    """Create randomly occupied seats that will expire in 40-120 minutes"""
    seats = list(restaurant.seats.all())
    if not seats:
        return
    
    # Occupy 10-30% of seats randomly
    occupy_count = random.randint(len(seats) // 10, len(seats) // 3)
    occupied_seats = random.sample(seats, min(occupy_count, len(seats)))
    
    for seat in occupied_seats:
        # Random occupation time between 40-120 minutes from now
        minutes = random.randint(40, 120)
        occupied_until = timezone.now() + timedelta(minutes=minutes)
        
        OccupiedSeat.objects.create(
            seat=seat,
            occupied_until=occupied_until
        )

def main():
    print("Starting database seeding...")
    
    # Clear existing data
    print("Clearing existing data...")
    OccupiedSeat.objects.all().delete()
    MenuItem.objects.all().delete()
    Seat.objects.all().delete()
    Restaurant.objects.all().delete()
    Institution.objects.all().delete()
    FoodCategory.objects.all().delete()
    
    # Create new data
    create_food_categories()
    create_institutions()
    create_restaurants()
    
    print("Database seeding completed successfully!")
    print(f"Created:")
    print(f"- {Institution.objects.count()} institutions")
    print(f"- {Restaurant.objects.count()} restaurants")
    print(f"- {MenuItem.objects.count()} menu items")
    print(f"- {Seat.objects.count()} seats")
    print(f"- {OccupiedSeat.objects.count()} occupied seats")

if __name__ == '__main__':
    main()
