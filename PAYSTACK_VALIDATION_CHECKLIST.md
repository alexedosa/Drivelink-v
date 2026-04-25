# Paystack Integration - Validation Checklist

Use this checklist to verify that all components of the Paystack integration are properly installed and configured.

---

## ✅ Backend Files Verification

### 1. App Configuration
- [ ] File exists: `backend/apps/payments/__init__.py`
- [ ] File exists: `backend/apps/payments/apps.py`
  - [ ] Contains: `name = 'apps.payments'`

### 2. Models
- [ ] File exists: `backend/apps/payments/models.py`
- [ ] Contains: `Transaction` model
- [ ] Has fields: user, amount, status, transaction_type
- [ ] Has fields: purchase_id, rental_id, reference
- [ ] Has Paystack fields: paystack_access_code, paystack_authorization_url
- [ ] Has indexes on: (user, -created_at), (reference), (status)

### 3. Serializers
- [ ] File exists: `backend/apps/payments/serializers.py`
- [ ] Contains: `TransactionSerializer`
- [ ] Contains: `PaymentInitializeSerializer`
- [ ] Contains: `PaymentCallbackSerializer`
- [ ] Contains: `TransactionListSerializer`

### 4. Services
- [ ] File exists: `backend/apps/payments/services.py`
- [ ] Contains: `PaystackService` class
- [ ] Has method: `initialize_transaction()`
- [ ] Has method: `verify_transaction()`
- [ ] Has method: `is_payment_successful()`
- [ ] Has function: `create_transaction()`
- [ ] Has function: `verify_and_update_transaction()`

### 5. Views
- [ ] File exists: `backend/apps/payments/views.py`
- [ ] Contains: `PaymentInitializeView` (POST)
- [ ] Contains: `PaymentCallbackView` (POST)
- [ ] Contains: `PaymentVerifyView` (GET)
- [ ] Contains: `UserTransactionsView` (GET)
- [ ] Contains: `TransactionDetailView` (GET)
- [ ] Contains: `webhook_handler()` function

### 6. URLs
- [ ] File exists: `backend/apps/payments/urls.py`
- [ ] Route: `/initialize/` → PaymentInitializeView
- [ ] Route: `/callback/` → PaymentCallbackView
- [ ] Route: `/verify/<ref>/` → PaymentVerifyView
- [ ] Route: `/transactions/` → UserTransactionsView
- [ ] Route: `/transactions/<id>/` → TransactionDetailView
- [ ] Route: `/webhook/` → webhook_handler

### 7. Admin
- [ ] File exists: `backend/apps/payments/admin.py`
- [ ] Has: TransactionAdmin class
- [ ] Registered with Django admin

### 8. Migrations
- [ ] File exists: `backend/apps/payments/migrations/__init__.py`
- [ ] File exists: `backend/apps/payments/migrations/0001_initial.py`

### 9. Constants
- [ ] File: `backend/apps/core/constants.py` updated
- [ ] Contains: `PaymentStatus` class
  - [ ] Has: PENDING, SUCCESS, FAILED, CANCELLED
  - [ ] Has: CHOICES tuple
- [ ] Contains: `TransactionType` class
  - [ ] Has: PURCHASE, RENTAL
  - [ ] Has: CHOICES tuple

### 10. Settings
- [ ] File: `backend/config/settings.py` updated
- [ ] Contains: `'apps.payments'` in INSTALLED_APPS

### 11. URLs Configuration
- [ ] File: `backend/config/urls.py` updated
- [ ] Contains: `path('api/payments/', include('apps.payments.urls'))`

### 12. Environment File
- [ ] File exists: `backend/.env.example.payments`
- [ ] Contains: PAYSTACK_SECRET_KEY=sk_test_...
- [ ] Contains: PAYSTACK_PUBLIC_KEY=pk_test_...

---

## ✅ Frontend Files Verification

### 1. React Component
- [ ] File exists: `frontend/src/components/common/PaystackButton.jsx`
- [ ] Component name: `PaystackButton`
- [ ] Exported as default export
- [ ] Props include: amount, transactionType, purchaseId, rentalId
- [ ] Props include: email, fullName, phone
- [ ] Props include: onSuccess, onError, paystackPublicKey
- [ ] Has PropTypes validation
- [ ] Handles API calls with fetch
- [ ] Calls Paystack initialize
- [ ] Handles success/error callbacks

### 2. Example Components
- [ ] File exists: `frontend/src/components/common/PaystackButtonExample.jsx`
  - [ ] Shows purchase checkout example
- [ ] File exists: `frontend/src/components/common/PaystackRentalExample.jsx`
  - [ ] Shows rental checkout example

### 3. HTML Configuration
- [ ] File: `frontend/index.html` updated
- [ ] Contains: `<script src="https://js.paystack.co/v1/inline.js"></script>`
  - [ ] Placed before closing `</body>` tag

### 4. Environment File
- [ ] File exists: `frontend/.env.example.payments`
- [ ] Contains: VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
- [ ] Contains: VITE_API_BASE_URL=http://localhost:8000/api

---

## ✅ Documentation Verification

- [ ] File exists: `PAYSTACK_QUICK_START.md`
  - [ ] Contains 5-minute setup guide
  - [ ] Has test card details
  - [ ] Has troubleshooting section

- [ ] File exists: `PAYSTACK_INTEGRATION_GUIDE.md`
  - [ ] Contains 2000+ lines of documentation
  - [ ] Has setup instructions
  - [ ] Has API endpoints reference
  - [ ] Has security best practices
  - [ ] Has troubleshooting guide

- [ ] File exists: `PAYSTACK_IMPLEMENTATION_SUMMARY.md`
  - [ ] Contains file structure overview
  - [ ] Has setup checklist
  - [ ] Has deployment steps

---

## ✅ Database Verification

After running migrations, verify:

```bash
# In Django shell
python manage.py shell

# Check if Transaction table exists
from apps.payments.models import Transaction
Transaction.objects.all()  # Should work without errors

# Check table structure
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT * FROM payments_transaction LIMIT 0")
print([desc[0] for desc in cursor.description])
```

Should have columns: id, user_id, amount, status, transaction_type, purchase_id, rental_id, reference, paystack_access_code, paystack_authorization_url, paystack_auth_code, metadata, created_at, updated_at

---

## ✅ API Endpoint Verification

Test all endpoints (with authentication token):

```bash
# 1. Initialize Payment (POST)
curl -X POST http://localhost:8000/api/payments/initialize/ \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "transaction_type": "purchase",
    "purchase_id": 1,
    "email": "test@example.com",
    "full_name": "Test User",
    "phone": "08012345678"
  }'

# Expected: 201 Created with authorization_url

# 2. Verify Payment (POST)
curl -X POST http://localhost:8000/api/payments/callback/ \
  -H "Content-Type: application/json" \
  -d '{"reference": "ref_xxx"}'

# Expected: 200 OK with transaction details

# 3. List Transactions (GET)
curl -X GET http://localhost:8000/api/payments/transactions/ \
  -H "Authorization: Bearer <TOKEN>"

# Expected: 200 OK with list of transactions

# 4. Get Transaction Detail (GET)
curl -X GET http://localhost:8000/api/payments/transactions/1/ \
  -H "Authorization: Bearer <TOKEN>"

# Expected: 200 OK with transaction details
```

---

## ✅ Frontend Integration Verification

### In Your Component:

```jsx
// Check 1: Component imports correctly
import PaystackButton from './components/common/PaystackButton';
// Should not throw error

// Check 2: Paystack SDK is loaded
console.log(window.PaystackPop);
// Should NOT be undefined

// Check 3: Environment variables exist
console.log(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY);
// Should show your test key

console.log(import.meta.env.VITE_API_BASE_URL);
// Should show your API URL

// Check 4: Component renders
render(
  <PaystackButton
    amount={1000}
    transactionType="purchase"
    purchaseId={1}
    email="test@example.com"
    fullName="Test User"
    phone="08012345678"
    paystackPublicKey="pk_test_xxx"
  />
);
// Should render without errors
```

---

## ✅ Environment Variables Verification

### Backend (.env)

```bash
# Check backend environment variables
python manage.py shell
>>> import os
>>> print(os.getenv('PAYSTACK_SECRET_KEY'))
sk_test_xxx...  # Should print your key
>>> print(os.getenv('PAYSTACK_PUBLIC_KEY'))
pk_test_xxx...  # Should print your key
```

### Frontend (.env)

```bash
# Check frontend environment variables
npm run dev
# In browser console:
>>> console.log(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)
pk_test_xxx...  # Should print your key
```

---

## ✅ Permission & Authentication Verification

### Protected Endpoints (require auth)
- [ ] POST /api/payments/initialize/ ← Requires Bearer token
- [ ] GET /api/payments/transactions/ ← Requires Bearer token
- [ ] GET /api/payments/transactions/<id>/ ← Requires Bearer token
- [ ] GET /api/payments/verify/<ref>/ ← Requires Bearer token

### Public Endpoints (no auth required)
- [ ] POST /api/payments/callback/ ← No auth (called from frontend)
- [ ] POST /api/payments/webhook/ ← No auth (called by Paystack)

---

## ✅ Admin Interface Verification

1. Go to: http://localhost:8000/admin/
2. Login with admin credentials
3. Should see "Payments" section
4. Click on "Transactions"
5. Should see Transaction list (empty initially)
6. Verify columns: id, user, amount, status, transaction_type, created_at
7. Verify filters: status, transaction_type, created_at
8. Verify search: user email, reference, paystack_access_code

---

## ✅ Security Verification

### Secret Keys
- [ ] PAYSTACK_SECRET_KEY is NOT in any frontend files
- [ ] PAYSTACK_SECRET_KEY is NOT committed to git
- [ ] Only PAYSTACK_PUBLIC_KEY is used in frontend

### HTTPS
- [ ] All API calls use https in production
- [ ] Paystack script uses https
- [ ] Payment verification is server-side (secure)

### Authentication
- [ ] All payment endpoints verify user ownership
- [ ] Amount is verified on server before processing
- [ ] JWT tokens are validated

---

## ✅ Migration Verification

```bash
# Check migrations
python manage.py showmigrations payments
# Should show:
# [ ] payments.0001_initial

# Apply migrations
python manage.py migrate payments

# Verify
python manage.py showmigrations payments
# Should show:
# [X] payments.0001_initial

# Check database table
python manage.py dbshell
# sqlite> .tables
# Should include: payments_transaction

# Check table structure
sqlite> .schema payments_transaction
# Should show all columns and indexes
```

---

## ✅ Testing Verification

### Manual Test Flow

1. **Start Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   python manage.py runserver

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Create Test Purchase/Rental**
   - Go to frontend app
   - Create a purchase or rental
   - Note the ID and amount

3. **Navigate to Checkout**
   - Click "Pay Now" button
   - Should see Paystack button rendered

4. **Click Payment Button**
   - Paystack popup should appear
   - Enter test card: 4111 1111 1111 1111
   - Enter OTP: 123456
   - Click Pay

5. **Verify Success**
   - Should see success message
   - Check database: `SELECT * FROM payments_transaction;`
   - Status should be 'success'

---

## ✅ Common Issues to Check

- [ ] If GET request to payments endpoints fails, verify JWT token in Authorization header
- [ ] If Paystack popup doesn't show, check browser console for errors
- [ ] If "API keys not configured" error, verify .env file is in correct location and loaded
- [ ] If "Transaction not found" error, check reference parameter spelling
- [ ] If CORS error, verify domain is in CORS_ALLOWED_ORIGINS

---

## ✅ Production Readiness Checklist

- [ ] All environment variables configured with production keys
- [ ] DEBUG=False in Django settings
- [ ] HTTPS/SSL certificate configured
- [ ] ALLOWED_HOSTS updated with production domain
- [ ] CSRF_TRUSTED_ORIGINS updated
- [ ] CORS_ALLOWED_ORIGINS updated
- [ ] Database backups automated
- [ ] Logging configured for production
- [ ] Email notifications set up for payments
- [ ] Paystack webhook URL configured
- [ ] Payment error alerts configured
- [ ] Database indexes verified (should see query optimization)

---

## ✅ Success Criteria

All checks below should pass:

- [ ] New payments app created and registered
- [ ] Transaction model with all fields working
- [ ] All 5 API endpoints responding correctly
- [ ] Frontend component renders without errors
- [ ] Test payment can be initialized
- [ ] Test payment can be verified
- [ ] Transaction appears in database
- [ ] Transaction appears in admin interface
- [ ] User can view their transaction history
- [ ] Webhooks are received and processed
- [ ] All security measures in place
- [ ] Documentation is complete and accurate

---

**Validation Status:** ⏳ (Run through this checklist)  
**Last Updated:** April 25, 2024

If all checkboxes are marked ✅, your Paystack integration is ready for use!
