class UserRole:
    USER = 'user'
    ADMIN = 'admin'
    CHOICES = [(USER, 'User'), (ADMIN, 'Admin')]

class BookingStatus:
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    CHOICES = [(PENDING, 'Pending'), (CONFIRMED, 'Confirmed'), (FAILED, 'Failed'), (CANCELLED, 'Cancelled')]

class CarCategory:
    RENTAL = 'rental'
    PURCHASE = 'purchase'
    CHOICES = [(RENTAL, 'For Rent'), (PURCHASE, 'For Sale')]

class FuelType:
    PETROL = 'petrol'
    DIESEL = 'diesel'
    ELECTRIC = 'electric'
    HYBRID = 'hybrid'
    CHOICES = [(PETROL, 'Petrol'), (DIESEL, 'Diesel'), (ELECTRIC, 'Electric'), (HYBRID, 'Hybrid')]

class Transmission:
    MANUAL = 'manual'
    AUTOMATIC = 'automatic'
    CHOICES = [(MANUAL, 'Manual'), (AUTOMATIC, 'Automatic')]

class PaymentStatus:
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    CHOICES = [(PENDING, 'Pending'), (SUCCESS, 'Success'), (FAILED, 'Failed'), (CANCELLED, 'Cancelled')]

class TransactionType:
    PURCHASE = 'purchase'
    RENTAL = 'rental'
    CHOICES = [(PURCHASE, 'Purchase'), (RENTAL, 'Rental')]