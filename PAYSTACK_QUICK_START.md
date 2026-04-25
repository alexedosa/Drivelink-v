# Paystack Integration - Quick Start Guide

## 5-Minute Setup

### Step 1: Get Paystack Keys (2 min)

1. Visit [https://dashboard.paystack.com](https://dashboard.paystack.com)
2. Go to Settings → Developer
3. Copy your **Test** keys:
   - Public Key: `pk_test_...`
   - Secret Key: `sk_test_...`

### Step 2: Configure Backend (2 min)

```bash
cd backend

# Open or create .env file
# Add these lines:
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

### Step 3: Create Database Tables (1 min)

```bash
# Still in backend directory
python manage.py makemigrations payments
python manage.py migrate
```

### Step 4: Configure Frontend (minimal)

```bash
cd ../frontend

# Open or create .env file
# Add these lines:
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
VITE_API_BASE_URL=http://localhost:8000/api
```

**Ensure Paystack SDK is in `index.html`:**

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

---

## Usage in Your App

### Backend: No changes needed!

The payment endpoints are already available:
- `POST /api/payments/initialize/` - Start a payment
- `POST /api/payments/callback/` - Verify payment
- `GET /api/payments/transactions/` - List user's payments

### Frontend: Add PaystackButton

In your checkout/purchase component:

```jsx
import PaystackButton from './components/common/PaystackButton';

export default function Checkout({ purchase, user }) {
  const handleSuccess = (paymentData) => {
    // Payment successful! Update your UI
    console.log('Payment completed:', paymentData);
  };

  return (
    <div>
      <h2>Complete Purchase</h2>
      <p>Total: ₦{purchase.total_amount}</p>
      
      <PaystackButton
        amount={purchase.total_amount}
        transactionType="purchase"
        purchaseId={purchase.id}
        email={user.email}
        fullName={user.first_name + ' ' + user.last_name}
        phone={user.phone}
        onSuccess={handleSuccess}
        paystackPublicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}
      />
    </div>
  );
}
```

---

## Test the Payment

### Test Card Details

- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **OTP:** 123456 (if prompted)

### Payment Flow

1. User clicks "Pay Now"
2. Paystack popup opens
3. User enters test card details
4. Payment is processed
5. Success page shows transaction ID

---

## Verify It's Working

### Check Database

```bash
# Open Django shell
python manage.py shell

# Check if transaction was created
from apps.payments.models import Transaction
Transaction.objects.all()

# Should show your test transaction
```

### Check Admin Panel

1. Go to `http://localhost:8000/admin`
2. Login with your admin account
3. Go to Payments → Transactions
4. Should see your test transaction

---

## Production Deployment

When deploying to production:

1. **Get Production Keys** from Paystack Dashboard (switch from Test to Live)
2. **Update Environment Variables:**
   ```env
   PAYSTACK_SECRET_KEY=sk_live_your_production_key
   PAYSTACK_PUBLIC_KEY=pk_live_your_production_key
   ```
3. **Enable HTTPS** on your domain
4. **Configure Paystack Webhook:**
   - URL: `https://yourdomain.com/api/payments/webhook/`
   - Go to Paystack Dashboard → Settings → Webhooks
5. **Update CORS** in Django settings for your production domain
6. **Set DEBUG=False** in Django settings

---

## Common Issues & Fixes

### "Paystack keys not configured"
→ Check your `.env` file has the keys with exact variable names

### "Popup doesn't show"
→ Verify `<script src="https://js.paystack.co/v1/inline.js"></script>` is in `index.html`

### "Transaction created but payment not verified"
→ Check webhook configuration in Paystack Dashboard

### "CORS Error"
→ Make sure `CORS_ALLOWED_ORIGINS` in settings.py includes your frontend URL

---

## Next Steps

1. ✅ Read [PAYSTACK_INTEGRATION_GUIDE.md](./PAYSTACK_INTEGRATION_GUIDE.md) for detailed documentation
2. ✅ Test with different payment amounts
3. ✅ Implement success/error notifications in your UI
4. ✅ Add payment history view for users
5. ✅ Set up email notifications for payments
6. ✅ Deploy to production with live keys

---

**Need Help?**

- [Paystack Docs](https://paystack.com/docs)
- [Paystack Support](https://support.paystack.com)
- Check logs: `python manage.py runserver` and check the terminal output

---

**Status:** Ready to Use ✅
