# Paystack Payment Gateway Integration Guide

## Overview

This documentation covers the complete implementation of Paystack payment gateway integration for the DRIVELINK application, supporting both Purchase and Rental transactions.

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Architecture Overview](#architecture-overview)
3. [API Endpoints](#api-endpoints)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Security Best Practices](#security-best-practices)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Setup Instructions

### 1. Backend Setup

#### Step 1: Install Required Package

```bash
pip install requests
```

#### Step 2: Configure Environment Variables

Add to your `backend/.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

Get these keys from [Paystack Dashboard](https://dashboard.paystack.com/settings/developer)

#### Step 3: Run Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

This creates the `payments_transaction` table.

#### Step 4: Update Settings

The payments app is already added to `INSTALLED_APPS` in `config/settings.py`.

#### Step 5: Add URL Routes

Payment URLs are already included in `config/urls.py`:

```python
path('api/payments/', include('apps.payments.urls')),
```

### 2. Frontend Setup

#### Step 1: Install Paystack SDK

Add to your `frontend/index.html`:

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

#### Step 2: Configure Environment Variables

Add to your `frontend/.env`:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Step 3: Import and Use PaystackButton Component

```jsx
import PaystackButton from './components/common/PaystackButton';

<PaystackButton
  amount={purchase.total_amount}
  transactionType="purchase"
  purchaseId={purchase.id}
  email={user.email}
  fullName={user.first_name + ' ' + user.last_name}
  phone={user.phone}
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
  paystackPublicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
/>
```

---

## Architecture Overview

### Data Flow

```
Frontend (React)
    ↓
[1] PaystackButton Component
    ├─ Initialize Payment Request
    ↓
Backend (Django)
    ↓
[2] PaymentInitializeView
    ├─ Validate Purchase/Rental
    ├─ Create Transaction Record
    ├─ Call Paystack API
    ├─ Return authorization_url & access_code
    ↓
Frontend
    ↓
[3] Paystack Inline Popup
    ├─ User enters card details
    ├─ Payment processed
    ↓
Paystack Servers
    ↓
[4] Payment Success
    ├─ Callback to Frontend
    ├─ Frontend verifies with Backend
    ↓
Backend
    ↓
[5] PaymentCallbackView
    ├─ Verify with Paystack API
    ├─ Update Transaction Status
    ├─ Update Purchase/Rental Status
    ↓
Database
```

### Model Relationships

```
User (1) ──→ (*) Transaction
Transaction
    ├─ purchase_id → Points to Purchase.id
    ├─ rental_id → Points to Rental.id
    ├─ reference → Paystack reference
    ├─ status → PENDING/SUCCESS/FAILED/CANCELLED
```

---

## API Endpoints

### 1. Initialize Payment

**Endpoint:** `POST /api/payments/initialize/`

**Authentication:** Required (Bearer Token)

**Request:**

```json
{
  "amount": 50000.00,
  "transaction_type": "purchase",
  "purchase_id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "08012345678"
}
```

**Response (201 Created):**

```json
{
  "transaction_id": 1,
  "reference": "ref_1234567890",
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "n8qzpge86d",
  "amount": 50000.00,
  "status": "pending"
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/payments/callback/`

**Authentication:** Optional (called from frontend)

**Request:**

```json
{
  "reference": "ref_1234567890"
}
```

**Response (200 OK):**

```json
{
  "status": true,
  "message": "Payment verified successfully",
  "transaction_id": 1,
  "reference": "ref_1234567890",
  "amount": 50000.00
}
```

### 3. Get Transaction Details

**Endpoint:** `GET /api/payments/verify/<reference>/`

**Authentication:** Required (Bearer Token)

**Response (200 OK):**

```json
{
  "id": 1,
  "user_email": "user@example.com",
  "amount": 50000.00,
  "status": "success",
  "status_display": "Success",
  "transaction_type": "purchase",
  "transaction_type_display": "Purchase",
  "reference": "ref_1234567890",
  "paystack_access_code": "n8qzpge86d",
  "paystack_authorization_url": "https://checkout.paystack.com/...",
  "purchase_id": 1,
  "rental_id": null,
  "created_at": "2024-04-25T10:30:00Z",
  "updated_at": "2024-04-25T10:35:00Z"
}
```

### 4. User Transactions

**Endpoint:** `GET /api/payments/transactions/`

**Authentication:** Required (Bearer Token)

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "amount": 50000.00,
    "status": "success",
    "status_display": "Success",
    "transaction_type": "purchase",
    "transaction_type_display": "Purchase",
    "reference": "ref_1234567890",
    "purchase_id": 1,
    "rental_id": null,
    "created_at": "2024-04-25T10:30:00Z"
  }
]
```

### 5. Transaction Detail

**Endpoint:** `GET /api/payments/transactions/<id>/`

**Authentication:** Required (Bearer Token)

**Response (200 OK):** Same as Get Transaction Details

### 6. Webhook

**Endpoint:** `POST /api/payments/webhook/`

**Authentication:** None (Paystack calls this)

**Note:** Configure this URL in Paystack Dashboard under Settings → Webhooks

---

## Backend Implementation

### Models (`apps/payments/models.py`)

The `Transaction` model stores all payment information:

```python
class Transaction(models.Model):
    user = ForeignKey(User)              # User making payment
    amount = DecimalField()              # Payment amount
    status = CharField()                 # PENDING/SUCCESS/FAILED/CANCELLED
    transaction_type = CharField()       # 'purchase' or 'rental'
    purchase_id = IntegerField()         # If purchase transaction
    rental_id = IntegerField()           # If rental transaction
    reference = CharField()              # Paystack reference (unique)
    paystack_access_code = CharField()   # For inline popup
    paystack_authorization_url = URLField()  # Redirect URL
    paystack_auth_code = CharField()     # For future recurring charges
    metadata = JSONField()               # Additional data
```

### Services (`apps/payments/services.py`)

#### PaystackService Class

Handles all Paystack API interactions:

```python
# Initialize a payment
paystack = PaystackService()
response = paystack.initialize_transaction(
    email='user@example.com',
    amount=50000,
    metadata={'purchase_id': 1}
)

# Verify a payment
verification = paystack.verify_transaction('ref_123')
is_successful = paystack.is_payment_successful(verification)
```

#### Helper Functions

```python
# Create transaction and initialize with Paystack
transaction, response = create_transaction(
    user=user,
    amount=50000,
    transaction_type='purchase',
    purchase_id=1
)

# Verify and update transaction
success, transaction, message = verify_and_update_transaction(
    reference='ref_123',
    purchase_or_rental_model=purchase_instance
)
```

### Views (`apps/payments/views.py`)

#### PaymentInitializeView

- Validates Purchase/Rental exists and belongs to user
- Verifies amount matches
- Creates Transaction record
- Returns Paystack authorization URL

#### PaymentCallbackView

- Verifies payment with Paystack
- Updates Transaction status
- Updates Purchase/Rental status to 'confirmed'

#### UserTransactionsView

- Lists all transactions for authenticated user
- Supports filtering and pagination

#### Webhook Handler

- Receives events from Paystack
- Automatically updates transaction status
- Handles charge.success events

---

## Frontend Integration

### PaystackButton Component

Located at `frontend/src/components/common/PaystackButton.jsx`

**Features:**

- Validates input before payment
- Handles authentication
- Shows Paystack popup
- Verifies payment with backend
- Error handling
- Loading states

**Usage Example:**

```jsx
import PaystackButton from '../common/PaystackButton';

const Checkout = () => {
  const handleSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    // Redirect or update UI
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
    // Show error message
  };

  return (
    <PaystackButton
      amount={purchase.total_amount}
      transactionType="purchase"
      purchaseId={purchase.id}
      email={user.email}
      fullName={`${user.first_name} ${user.last_name}`}
      phone={user.phone}
      onSuccess={handleSuccess}
      onError={handleError}
      buttonClassName="btn-primary"
      paystackPublicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
      apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
    />
  );
};
```

### Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | number | Yes | Payment amount in Naira |
| `transactionType` | string | Yes | 'purchase' or 'rental' |
| `purchaseId` | number | Conditional | Required if transactionType='purchase' |
| `rentalId` | number | Conditional | Required if transactionType='rental' |
| `email` | string | Yes | Customer email |
| `fullName` | string | Yes | Customer full name |
| `phone` | string | Yes | Customer phone |
| `paystackPublicKey` | string | Yes | Paystack public key |
| `onSuccess` | function | No | Callback on successful payment |
| `onError` | function | No | Callback on payment error |
| `buttonText` | string | No | Button display text |
| `buttonClassName` | string | No | CSS class for styling |
| `apiBaseUrl` | string | No | Backend API base URL |

---

## Security Best Practices

### 1. Backend Security

**✓ Environment Variables**
- Never commit API keys to version control
- Use `.env` files with `.gitignore`

```python
PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')
```

**✓ Amount Verification**
- Always verify amount on server before updating records

```python
if serializer.validated_data['amount'] != purchase.total_amount:
    return error_response
```

**✓ Authentication**
- Require authentication for payment endpoints
- Verify user owns the Purchase/Rental

```python
class PaymentInitializeView(APIView):
    permission_classes = [IsAuthenticated]
```

**✓ HTTPS Only**
- Use HTTPS in production (enforced by Django settings)

```python
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### 2. Frontend Security

**✓ Token Storage**
- Store JWT tokens securely (localStorage or cookies)
- Clear tokens on logout

**✓ HTTPS Only**
- Always use HTTPS in production

**✓ Validation**
- Validate all inputs before submission

```jsx
const handlePaymentSuccess = (paymentData) => {
  if (!paymentData.reference) throw new Error('Invalid response');
};
```

**✓ No Sensitive Data in Frontend**
- Never expose secret keys
- Use public key for frontend initialization

### 3. Paystack Security

**✓ Secret Key Protection**
- Keep Secret Key on backend only
- Use Public Key for frontend

**✓ Webhook Verification**
- Verify all webhooks come from Paystack
- Check webhook signature

```python
# This is already handled in the verify_transaction method
```

**✓ HTTPS Communication**
- All API calls use HTTPS

---

## Testing

### Backend Testing

#### Test Payment Initialization

```python
from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import User
from apps.purchases.models import Purchase

class PaymentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_initialize_payment(self):
        response = self.client.post('/api/payments/initialize/', {
            'amount': 50000,
            'transaction_type': 'purchase',
            'purchase_id': 1,
            'email': 'test@example.com',
            'full_name': 'Test User',
            'phone': '08012345678'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('authorization_url', response.data)
```

#### Test with Paystack Test Keys

Use Paystack test keys from dashboard:
- **Public Key:** pk_test_...
- **Secret Key:** sk_test_...

Test card details:
- **Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Frontend Testing

#### Test PaystackButton Component

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import PaystackButton from './PaystackButton';

describe('PaystackButton', () => {
  it('renders button with correct text', () => {
    render(
      <PaystackButton
        amount={1000}
        transactionType="purchase"
        purchaseId={1}
        email="test@example.com"
        fullName="Test User"
        phone="08012345678"
        paystackPublicKey="pk_test_123"
        buttonText="Pay Now"
      />
    );
    expect(screen.getByText('Pay Now')).toBeInTheDocument();
  });

  it('validates required fields', () => {
    render(
      <PaystackButton
        amount={1000}
        paystackPublicKey="pk_test_123"
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Issue: "API keys not configured"

**Solution:**
```bash
# Check your .env file
cat backend/.env | grep PAYSTACK

# Verify keys are loaded
python manage.py shell
>>> import os
>>> print(os.getenv('PAYSTACK_SECRET_KEY'))
>>> print(os.getenv('PAYSTACK_PUBLIC_KEY'))
```

### Issue: "Transaction reference not found"

**Solution:**
- Ensure payment was initialized
- Check database for transaction record
- Verify reference matches in requests

```sql
SELECT * FROM payments_transaction WHERE reference='ref_xxx';
```

### Issue: "Amount does not match"

**Solution:**
- Verify Purchase/Rental amount on database
- Check amount calculation on frontend
- Amount should be in full Naira (not kobo)

### Issue: "Paystack popup not showing"

**Solution:**
```html
<!-- Verify Paystack script is loaded in index.html -->
<script src="https://js.paystack.co/v1/inline.js"></script>

<!-- Check browser console for errors -->
console.log(window.PaystackPop); // Should not be undefined
```

### Issue: "Payment successful but not confirmed"

**Solution:**
- Check webhook configuration in Paystack Dashboard
- Verify backend logs for webhook errors
- Ensure CSRF exempt is set for webhook endpoint

```python
@csrf_exempt
def webhook_handler(request):
    # Already done in the code
    pass
```

### Issue: "CORS errors in frontend"

**Solution:**
```python
# backend/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Alternative
    "https://yourdomain.com",  # Production
]
```

---

## Database Migration

After implementing payments, run migrations:

```bash
cd backend
python manage.py makemigrations payments
python manage.py migrate payments
```

This creates the `payments_transaction` table with all necessary fields and indexes.

---

## Production Checklist

- [ ] Update Paystack keys to production keys
- [ ] Enable HTTPS/SSL
- [ ] Configure Paystack webhook URL
- [ ] Set DEBUG=False in Django settings
- [ ] Add allowed hosts to ALLOWED_HOSTS
- [ ] Test payment flow end-to-end
- [ ] Set up logging for payment transactions
- [ ] Configure email notifications for payments
- [ ] Backup database before go-live
- [ ] Monitor Paystack dashboard for issues

---

## Additional Resources

- [Paystack Documentation](https://paystack.com/docs/payments/accept-payments)
- [Paystack Test Cards](https://paystack.com/docs/test-keys)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Best Practices](https://react.dev/)

---

**Last Updated:** April 25, 2024
**Version:** 1.0.0
