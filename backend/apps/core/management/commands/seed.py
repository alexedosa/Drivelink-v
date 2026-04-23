from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from apps.users.models import User
from apps.cars.models import Car
from apps.core.constants import CarCategory, FuelType, Transmission

class Command(BaseCommand):
    help = 'Seed database with users and cars'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # Users
        users_data = [
            {'email': 'admin@drivelink.com', 'password': 'admin123', 'first_name': 'Admin', 'last_name': 'User', 'role': 'admin', 'is_staff': True, 'is_superuser': True},
            {'email': 'user1@test.com', 'password': 'user123', 'first_name': 'John', 'last_name': 'Doe', 'role': 'user'},
            {'email': 'user2@test.com', 'password': 'user123', 'first_name': 'Jane', 'last_name': 'Smith', 'role': 'user'},
            {'email': 'user3@test.com', 'password': 'user123', 'first_name': 'Mike', 'last_name': 'Johnson', 'role': 'user'},
            {'email': 'user4@test.com', 'password': 'user123', 'first_name': 'Sarah', 'last_name': 'Williams', 'role': 'user'},
            {'email': 'user5@test.com', 'password': 'user123', 'first_name': 'David', 'last_name': 'Brown', 'role': 'user'},
        ]

        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'role': data.get('role', 'user'),
                    'is_staff': data.get('is_staff', False),
                    'is_superuser': data.get('is_superuser', False),
                    'password': make_password(data['password'])
                }
            )
            if created:
                self.stdout.write(f"Created user: {data['email']}")

        # Cars with images
        image_files = [
            'campbell-3ZUsNJhi_Ik-unsplash.jpg',
            'dhiva-krishna-X16zXcbxU4U-unsplash.jpg',
            'hyundai-motor-group-V1DFo8C4JPA-unsplash.jpg',
            'joey-banks-YApiWyp0lqo-unsplash.jpg',
            'olav-tvedt-6lSBynPRaAQ-unsplash.jpg',
            'wolf-schram-19t6J2RVqQE-unsplash.jpg',
        ]

        cars_data = [
            {'name': 'Camry', 'brand': 'Toyota', 'model_year': 2023, 'category': CarCategory.RENTAL, 'fuel_type': FuelType.PETROL, 'transmission': Transmission.AUTOMATIC, 'seats': 5, 'color': 'Silver', 'daily_rate': 25000, 'stock': 3},
            {'name': 'Civic', 'brand': 'Honda', 'model_year': 2023, 'category': CarCategory.RENTAL, 'fuel_type': FuelType.PETROL, 'transmission': Transmission.AUTOMATIC, 'seats': 5, 'color': 'White', 'daily_rate': 22000, 'stock': 2},
            {'name': 'X5', 'brand': 'BMW', 'model_year': 2024, 'category': CarCategory.PURCHASE, 'fuel_type': FuelType.PETROL, 'transmission': Transmission.AUTOMATIC, 'seats': 7, 'color': 'Black', 'purchase_price': 45000000, 'stock': 1},
            {'name': 'Model 3', 'brand': 'Tesla', 'model_year': 2024, 'category': CarCategory.PURCHASE, 'fuel_type': FuelType.ELECTRIC, 'transmission': Transmission.AUTOMATIC, 'seats': 5, 'color': 'Red', 'purchase_price': 65000000, 'stock': 2},
            {'name': 'Corolla', 'brand': 'Toyota', 'model_year': 2022, 'category': CarCategory.RENTAL, 'fuel_type': FuelType.PETROL, 'transmission': Transmission.AUTOMATIC, 'seats': 5, 'color': 'Blue', 'daily_rate': 18000, 'stock': 4},
            {'name': 'GLE', 'brand': 'Mercedes', 'model_year': 2024, 'category': CarCategory.PURCHASE, 'fuel_type': FuelType.PETROL, 'transmission': Transmission.AUTOMATIC, 'seats': 7, 'color': 'Grey', 'purchase_price': 55000000, 'stock': 1},
        ]

        for i, car_data in enumerate(cars_data):
            car, created = Car.objects.get_or_create(
                name=car_data['name'],
                brand=car_data['brand'],
                defaults=car_data
            )
            if created and i < len(image_files):
                car.main_image = f'cars/main/{image_files[i]}'
                car.save()
                self.stdout.write(f"Created car: {car.name} with image")

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))