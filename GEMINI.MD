DRIVELINK/
├── backend/
│ ├── config/ # Django project root
│ │ ├── **init**.py
│ │ ├── settings/
│ │ │ ├── **init**.py
│ │ │ ├── base.py # Shared settings
│ │ │ ├── development.py # Local dev (DEBUG=True)
│ │ │ └── production.py # Deploy (DEBUG=False)
│ │ ├── urls.py
│ │ ├── asgi.py
│ │ └── wsgi.py
│ ├── apps/ # All Django apps
│ │ ├── **init**.py
│ │ ├── core/ # Custom User, shared models
│ │ │ ├── **init**.py
│ │ │ ├── admin.py
│ │ │ ├── apps.py
│ │ │ ├── models.py # User model
│ │ │ ├── serializers.py
│ │ │ ├── views.py
│ │ │ └── utils.py # JWT helpers, permissions
│ │ ├── cars/ # Car + CarImage models
│ │ │ ├── **init**.py
│ │ │ ├── admin.py
│ │ │ ├── apps.py
│ │ │ ├── models.py
│ │ │ ├── serializers.py
│ │ │ ├── views.py
│ │ │ └── ordering.py # Smart scoring engine
│ │ ├── rentals/ # Rental bookings
│ │ │ ├── **init**.py
│ │ │ ├── admin.py
│ │ │ ├── apps.py
│ │ │ ├── models.py
│ │ │ ├── serializers.py
│ │ │ ├── views.py
│ │ │ └── validators.py # Date overlap logic
│ │ ├── purchases/ # Purchase orders
│ │ │ ├── **init**.py
│ │ │ ├── admin.py
│ │ │ ├── apps.py
│ │ │ ├── models.py
│ │ │ ├── serializers.py
│ │ │ ├── views.py
│ │ │ └── stock_manager.py
│ │ └── payments/ # Paystack integration
│ │ ├── **init**.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── models.py # Transaction logs (optional)
│ │ ├── serializers.py
│ │ ├── views.py
│ │ └── paystack.py # Webhook verification, API client
│ ├── media/ # User uploaded images
│ │ └── cars/
│ │ ├── main/
│ │ └── gallery/
│ ├── static/ # Collected static files
│ ├── requirements/
│ │ ├── base.txt
│ │ ├── development.txt
│ │ └── production.txt
│ ├── .env # Environment variables
│ ├── manage.py
│ └── README.md
│
├── frontend/
│ ├── public/
│ │ └── favicon.ico
│ ├── src/
│ │ ├── assets/ # Images, fonts, global CSS
│ │ │ ├── fonts/
│ │ │ ├── images/
│ │ │ └── styles/
│ │ │ ├── \_variables.css
│ │ │ ├── \_mixins.css
│ │ │ └── global.css
│ │ ├── components/ # Reusable UI
│ │ │ ├── common/
│ │ │ │ ├── Navbar.jsx
│ │ │ │ ├── Footer.jsx
│ │ │ │ ├── Loader.jsx
│ │ │ │ └── ErrorBoundary.jsx
│ │ │ ├── cars/
│ │ │ │ ├── CarCard.jsx
│ │ │ │ ├── CarCard.module.css
│ │ │ │ ├── CarFilter.jsx
│ │ │ │ ├── CarGallery.jsx
│ │ │ │ └── SpecsTable.jsx
│ │ │ ├── booking/
│ │ │ │ ├── DateRangePicker.jsx
│ │ │ │ ├── QuantitySelector.jsx
│ │ │ │ └── PriceCalculator.jsx
│ │ │ └── admin/
│ │ │ ├── CarTable.jsx
│ │ │ ├── CarModal.jsx
│ │ │ ├── BookingsTable.jsx
│ │ │ └── SummaryCards.jsx
│ │ ├── pages/ # Route-level pages
│ │ │ ├── auth/
│ │ │ │ ├── UserLogin.jsx
│ │ │ │ ├── AdminLogin.jsx
│ │ │ │ └── Register.jsx
│ │ │ ├── user/
│ │ │ │ ├── RentalCatalog.jsx
│ │ │ │ ├── PurchaseCatalog.jsx
│ │ │ │ ├── CarDetail.jsx
│ │ │ │ ├── RentalHistory.jsx
│ │ │ │ ├── PurchaseHistory.jsx
│ │ │ │ └── UserProfile.jsx
│ │ │ ├── admin/
│ │ │ │ ├── AdminDashboard.jsx
│ │ │ │ ├── AdminCars.jsx
│ │ │ │ ├── AdminBookings.jsx
│ │ │ │ └── AdminUsers.jsx
│ │ │ └── payment/
│ │ │ └── PaymentCallback.jsx
│ │ ├── hooks/ # Custom React hooks
│ │ │ ├── useAuth.js
│ │ │ ├── usePaystack.js
│ │ │ ├── useDebounce.js
│ │ │ └── useCarFilter.js
│ │ ├── services/ # API calls
│ │ │ ├── api.js # Axios instance
│ │ │ ├── auth.js
│ │ │ ├── cars.js
│ │ │ ├── rentals.js
│ │ │ ├── purchases.js
│ │ │ └── payments.js
│ │ ├── context/ # React Context
│ │ │ ├── AuthContext.jsx
│ │ │ └── ToastContext.jsx
│ │ ├── utils/ # Helpers
│ │ │ ├── tokenStorage.js
│ │ │ ├── formatters.js # Currency, date
│ │ │ └── validators.js
│ │ ├── layouts/ # Layout wrappers
│ │ │ ├── UserLayout.jsx
│ │ │ ├── AdminLayout.jsx
│ │ │ └── PublicLayout.jsx
│ │ ├── routes/ # Route definitions
│ │ │ ├── AppRoutes.jsx
│ │ │ ├── ProtectedRoute.jsx
│ │ │ └── AdminRoute.jsx
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│ ├── .env
│ ├── .env.example
│ ├── index.html
│ ├── package.json
│ ├── vite.config.js
│ └── README.md
│
├── .gitignore
└── README.md (Project root)

PROJECT SCOPE :

DRIVELINK
Car Rental & Purchase System

Product Requirements Document
Version 1.0.0 — April 2026

Stack Django REST Framework + React (Vite) + MySQL
Payments Paystack (live integration)
Roles User, Admin (role-based, separate login)
Build Type Solo, client-facing production system

 

1. Executive Summary
   DriveLink is a full-stack web application enabling customers to rent or purchase vehicles through a clean, role-separated interface. The platform integrates Paystack for real payment processing, a smart ordering engine for intelligent car recommendations, and a complete admin control panel for fleet and booking management.

The system distinguishes rental inventory from purchase inventory — cars are categorized independently for each transaction type — and enforces stock integrity through atomic database operations. All financial transactions flow through Paystack's verified webhook pipeline, ensuring payment confirmation before any booking or purchase is activated.

2. Project Metadata
   Project Name DriveLink — Car Rental & Purchase System

Version 1.0.0

Date April 2026

Build Type Solo, client-facing production system

Backend Python 3.12 + Django 5.x + Django REST Framework 3.x

Frontend React 18 + Vite + React Router DOM v6 + Axios + SCSS Modules

Database MySQL 8.x

Auth JWT (SimpleJWT) — role-injected tokens, separate login pages

Payments Paystack (Initialize + Verify + Webhooks)

Smart Order Weighted scoring engine — popularity, availability, price match, recency

Media Django MEDIA_ROOT — car images served via /media/ endpoint

3. Goals & Non-Goals
   3.1 Goals
   • Provide a seamless, role-separated experience for users and admins
   • Enable real Paystack payment processing for both rentals and purchases
   • Enforce strict rental/purchase inventory separation
   • Implement smart ordering to surface the most relevant cars to users
   • Maintain atomic stock management — no double-bookings, no overselling
   • Deliver a production-ready, client-presentable codebase

3.2 Non-Goals
• No multi-vendor / dealership marketplace support
• No mobile native app (web responsive only)
• No vehicle insurance or financing integration
• No real-time vehicle tracking or GPS
• No multi-currency support (NGN only via Paystack)
• No user-to-user messaging or negotiation

4. User Roles & Access Control
   4.1 Role Definitions

Role Login Entry Auth Scope Primary Capabilities
User /login JWT — role: user Browse, rent, purchase, view history, manage profile
Admin /admin/login JWT — role: admin Manage fleet, manage bookings, view dashboard, analytics

4.2 Role-Based Route Guards
• Public routes: /login, /admin/login, /register, / (landing)
• User-protected routes: /dashboard, /cars/rental, /cars/purchase, /checkout/:id, /history, /profile
• Admin-protected routes: /admin/dashboard, /admin/cars, /admin/bookings, /admin/users
• Role mismatch redirects to appropriate login page — not a 404

5. Functional Requirements
   5.1 Authentication System
   5.1.1 User Registration
   • Fields: first name, last name, email, phone number, password, confirm password
   • Email must be unique — validated at model and serializer level
   • Password hashed with Django's default PBKDF2 algorithm
   • On success: JWT access + refresh tokens returned, user redirected to /dashboard

5.1.2 User Login (/login)
• Accepts email + password
• Returns JWT access token (15 min expiry) + refresh token (7 days)
• Token payload includes: user_id, email, role, full_name
• Failed login returns 401 with generic error message

5.1.3 Admin Login (/admin/login)
• Separate endpoint: POST /api/auth/admin/login/
• Only accounts with role=admin can authenticate here
• Non-admin credentials return 403 Forbidden

5.1.4 Token Refresh
• Axios interceptor auto-refreshes on 401 response
• Refresh token stored in httpOnly cookie (security) or localStorage
• On refresh failure: user is logged out and redirected to login

5.2 Car Management (Admin)
5.2.1 Add Car
• Fields: name, brand, model year, description, category (rental/purchase), fuel type, transmission, seats, color, daily_rate (rental only), purchase_price (purchase only), stock, main image, gallery images (up to 5)
• Category is mutually exclusive — a car is either for rent OR for purchase
• Image upload via multipart/form-data, stored in MEDIA_ROOT
• Stock must be >= 1 on creation

5.2.2 Edit Car
• All fields editable post-creation
• Image replacement supported — old image deleted from filesystem
• Stock can be increased (restocking) but not reduced below current active bookings count

5.2.3 Delete Car
• Soft delete — car is marked inactive, not removed from DB
• Deleted cars hidden from user-facing catalog
• Existing active rentals/purchases referencing this car are preserved

5.3 Car Catalog (User)
5.3.1 Rental Catalog (/cars/rental)
• Displays all active cars with category=rental
• Smart ordering applied by default (Section 5.6)
• Filters: brand, fuel type, transmission, seats, price range, availability
• Search: by name or brand (debounced, 300ms)
• Each card: main image, name, brand, daily rate, availability badge, View Details CTA

5.3.2 Purchase Catalog (/cars/purchase)
• Displays all active cars with category=purchase
• Same smart ordering, filters, and search as rental catalog
• Each card: main image, name, brand, purchase price, stock badge, Buy Now CTA
• Out-of-stock cars displayed with disabled CTA and greyed badge

5.3.3 Car Detail Page (/cars/:id)
• Gallery carousel, full specifications table, description
• Rental cars: date range picker (start date, end date), total cost auto-calculated
• Purchase cars: quantity selector (max = current stock), total cost displayed
• 'Proceed to Payment' CTA triggers Paystack checkout

5.4 Rental Flow

1. User selects a rental car and chooses start/end dates
2. System validates: car available, dates not overlapping existing bookings, start >= today
3. Booking record created with status=PENDING
4. Paystack transaction initialized — reference stored on booking
5. User completes Paystack payment (redirect or inline popup)
6. Paystack webhook hits POST /api/payments/webhook/ — signature verified
7. On charge.success: booking status set to CONFIRMED, car availability updated
8. On failure: booking status set to FAILED, no inventory change
9. User sees confirmation page with booking details and reference

5.5 Purchase Flow 10. User selects a purchase car and quantity 11. System validates: stock >= quantity requested 12. Purchase record created with status=PENDING, stock NOT yet reduced 13. Paystack transaction initialized 14. User completes payment 15. Webhook receives charge.success — signature verified 16. Stock atomically reduced: Car.objects.select_for_update() — quantity subtracted 17. Purchase status set to CONFIRMED 18. If stock reaches 0: car marked unavailable automatically 19. User receives purchase confirmation with receipt details

5.6 Smart Ordering Engine
The smart ordering engine ranks cars in the catalog using a weighted scoring algorithm computed at query time. It is not ML — it is a deterministic, configurable scoring function applied per car.

Signal Weight Description
Booking Popularity 35% Number of confirmed bookings/purchases in last 30 days
Availability 25% Cars with stock > 3 scored higher; unavailable cars penalized
Price Match 20% Proximity to user's session-inferred budget range
Recency 10% Newer listings scored higher (added_at recency)
Rating / Reviews 10% Average user rating (if review system active, else neutral)

• Score computed server-side in CarListView — annotated via Django ORM aggregate
• Sort order: DESC by score. User can override with manual sort (price asc/desc, newest)
• Budget inference: derived from user's last 3 completed transactions, defaulting to mid-range

5.7 Paystack Integration
5.7.1 Initialize Payment
• Endpoint: POST /api/payments/initialize/
• Payload: amount (kobo), email, reference (UUID), metadata {booking_id or purchase_id, type}
• Returns: authorization_url for redirect or inline embedding
• Reference stored on Booking/Purchase before redirect

5.7.2 Verify Payment (Webhook)
• Endpoint: POST /api/payments/webhook/
• HMAC-SHA512 signature verified using Paystack secret key before any processing
• Invalid signature returns 400 immediately — no DB changes
• Handles events: charge.success, charge.failed, transfer.success
• Idempotent: duplicate webhook calls for same reference are no-ops

5.7.3 Frontend Redirect
• After Paystack redirect, frontend hits GET /api/payments/verify/?reference=xxx
• Returns booking/purchase status — frontend shows success or failure UI

5.8 History & Dashboard (User)
• GET /api/rentals/my/ — paginated list of user's rentals (status, dates, car, amount)
• GET /api/purchases/my/ — paginated list of user's purchases (car, quantity, amount, date)
• Filter by status: all, confirmed, pending, failed
• Each entry: expandable detail row with Paystack reference and receipt download link

5.9 Admin Dashboard
• Summary cards: total cars, active rentals, total purchases, revenue (sum of confirmed payments)
• Charts: bookings by month (last 6 months), revenue trend, top 5 cars by bookings
• Recent bookings table: user, car, type, amount, status, date
• Quick action links: Add Car, View All Bookings, Manage Users

6. Data Models
   6.1 User
   Field Type Notes
   id AutoField PK
   first_name CharField(100)
   last_name CharField(100)
   email EmailField UNIQUE Used as USERNAME_FIELD
   phone CharField(20) Optional
   role CharField ENUM 'user' | 'admin' default='user'
   is_active BooleanField default=True
   date_joined DateTimeField auto_now_add

6.2 Car
Field Type Notes
id AutoField PK
name CharField(200)
brand CharField(100)
model_year IntegerField
description TextField
category CharField ENUM 'rental' | 'purchase'
fuel_type CharField ENUM 'petrol' | 'diesel' | 'electric' | 'hybrid'
transmission CharField ENUM 'manual' | 'automatic'
seats IntegerField
color CharField(50)
daily_rate DecimalField(10,2) Nullable — rental only
purchase_price DecimalField(12,2) Nullable — purchase only
stock IntegerField default=1
is_available BooleanField default=True
is_active BooleanField Soft delete flag
main_image ImageField upload_to='cars/main/'
added_at DateTimeField auto_now_add
updated_at DateTimeField auto_now

6.3 Rental
Field Type Notes
id AutoField PK
user FK(User) on_delete=PROTECT
car FK(Car) on_delete=PROTECT
start_date DateField
end_date DateField
total_days IntegerField Computed on save
total_amount DecimalField(12,2) daily_rate \* total_days
status CharField ENUM 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'
paystack_reference CharField(100) UUID generated pre-payment
created_at DateTimeField auto_now_add

6.4 Purchase
Field Type Notes
id AutoField PK
user FK(User) on_delete=PROTECT
car FK(Car) on_delete=PROTECT
quantity IntegerField default=1
unit_price DecimalField(12,2) Snapshot of purchase_price at time of order
total_amount DecimalField(12,2) unit_price \* quantity
status CharField ENUM 'PENDING' | 'CONFIRMED' | 'FAILED'
paystack_reference CharField(100) UUID generated pre-payment
created_at DateTimeField auto_now_add

6.5 CarImage (Gallery)
Field Type Notes
id AutoField PK
car FK(Car) on_delete=CASCADE, related_name='gallery'
image ImageField upload_to='cars/gallery/'
order IntegerField Display order in carousel

7. API Endpoints Reference
   7.1 Auth
   Method Endpoint Auth Description
   POST /api/auth/register/ Public Create new user account
   POST /api/auth/login/ Public User login — returns JWT
   POST /api/auth/admin/login/ Public Admin login — role-gated
   POST /api/auth/token/refresh/ Public Refresh JWT access token
   GET /api/auth/me/ User/Admin Return current user profile
   PATCH /api/auth/me/update/ User Update profile fields

7.2 Cars
Method Endpoint Auth Description
GET /api/cars/ Public List all cars (smart ordered, filterable)
GET /api/cars/?category=rental Public Rental catalog
GET /api/cars/?category=purchase Public Purchase catalog
GET /api/cars/:id/ Public Car detail
POST /api/cars/ Admin Create new car (multipart)
PATCH /api/cars/:id/ Admin Update car
DELETE /api/cars/:id/ Admin Soft delete car

7.3 Rentals
Method Endpoint Auth Description
POST /api/rentals/ User Create rental booking (PENDING)
GET /api/rentals/my/ User User's rental history
GET /api/rentals/ Admin All rentals (admin view)
GET /api/rentals/:id/ User/Admin Rental detail
PATCH /api/rentals/:id/cancel/ User Cancel PENDING rental

7.4 Purchases
Method Endpoint Auth Description
POST /api/purchases/ User Create purchase order (PENDING)
GET /api/purchases/my/ User User's purchase history
GET /api/purchases/ Admin All purchases (admin view)
GET /api/purchases/:id/ User/Admin Purchase detail

7.5 Payments
Method Endpoint Auth Description
POST /api/payments/initialize/ User Initialize Paystack transaction
GET /api/payments/verify/ User Verify payment by reference
POST /api/payments/webhook/ Paystack Receive Paystack webhook events

8. Frontend Module Build Sequence
   The frontend is built in strict dependency order. Each module must be fully functional before the next begins. This prevents import errors, broken context, and cascading failures during development.

Module Name Contents Depends On
M0 Project Scaffold Vite init, folder structure, path aliases, SCSS variables, CSS custom properties, global reset None
M1 Axios & Auth Infrastructure axios instance, interceptor with refresh queue, AuthContext (useReducer), token storage utilities M0
M2 Route Architecture React Router setup, PublicRoute, UserRoute, AdminRoute guards, 404 page, layout shells M1
M3 Auth Pages User Login, Admin Login, Register — forms, validation, toast feedback, redirect on success M2
M4 Car Catalog (Rental) RentalCatalog page, CarCard component, SmartOrder integration, filter sidebar, search bar M3
M5 Car Catalog (Purchase) PurchaseCatalog page — reuses CarCard, separate filter config, stock badge M4
M6 Car Detail Page ImageCarousel, SpecsTable, DateRangePicker (rental), QuantitySelector (purchase), cost calculator M5
M7 Paystack Checkout Flow usePaystack hook, PaystackPopup or redirect, PaymentCallback page, verify API call M6
M8 User History RentalHistory, PurchaseHistory, status filter tabs, expandable rows, reference display M7
M9 Admin — Car Management CarTable, AddCarModal (multipart upload), EditCarModal, DeleteConfirmModal, image preview M8
M10 Admin — Bookings View RentalsTable, PurchasesTable, status badge, date filters, pagination, export CSV M9
M11 Admin Dashboard SummaryCards, BookingChart (Recharts), RevenueChart, TopCarsChart, RecentBookingsTable M10
M12 Profile & Polish UserProfile edit form, responsive mobile nav, loading skeletons, error boundaries, 404 page M11

9. Backend Django App Structure
   App Responsibility
   core Base settings, custom User model, JWT configuration, CORS, shared mixins
   cars Car model, CarImage model, CarListView (smart ordering), CarDetailView, Admin CRUD
   rentals Rental model, CreateRentalView, MyRentalsView, AdminRentalsView, availability validator
   purchases Purchase model, CreatePurchaseView, MyPurchasesView, AdminPurchasesView, stock manager
   payments PaystackInitializeView, PaystackVerifyView, PaystackWebhookView, HMAC validator, idempotency

10. Smart Ordering — Implementation Detail
    The ordering engine is implemented as an annotated queryset in CarListView. No external ML library is required — pure Django ORM aggregates produce a numeric score per car.

10.1 Score Formula
score = (0.35 _ popularity_score) + (0.25 _ availability*score) + (0.20 * price*match_score) + (0.10 * recency_score) + (0.10 \* rating_score)

• popularity*score: Count of CONFIRMED rentals/purchases in last 30 days, normalized 0–100
• availability_score: 100 if stock > 3, 50 if stock 1–3, 0 if unavailable
• price_match_score: 100 - abs(car_price - user_budget) / user_budget * 100, floored at 0
• recency*score: Days since added, scaled: (30 - min(days_old, 30)) / 30 * 100
• rating_score: avg_rating / 5 \* 100 if reviews exist, else 50 (neutral)

10.2 Budget Inference
• If user has >= 1 prior confirmed transaction: budget = avg(total_amount) of last 3
• Else: budget defaults to median price across all active cars in that category
• Budget passed as context to scoring function — not stored on user model

11. Security Considerations
    Concern Mitigation
    JWT Secret Exposure SECRET_KEY in .env, never committed. Access tokens short-lived (15 min).
    Paystack Webhook Forgery HMAC-SHA512 signature verified on every webhook before processing
    Stock Race Conditions select_for_update() used in purchase confirmation — atomic stock decrement
    Rental Date Overlap DB-level validation + queryset overlap check before booking creation
    Admin Route Leakage role field checked server-side on every admin-gated endpoint — not just frontend guard
    Media File Access Sensitive files served via Django — not exposed directly through Nginx in dev
    SQL Injection Django ORM used exclusively — no raw queries
    CORS CORS_ALLOWED_ORIGINS restricted to frontend origin in production

12. Non-Functional Requirements
    Requirement Target
    API Response Time < 300ms for catalog endpoints (excluding external Paystack calls)
    Payment Webhook Latency < 2s from Paystack event to DB update
    Image Upload Size Max 5MB per image, max 5 gallery images per car
    Pagination Default 12 cars per page on catalog; 20 rows per page in admin tables
    Mobile Responsiveness Fully responsive down to 375px viewport
    Browser Support Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
    DB Integrity All financial state changes wrapped in transaction.atomic()
    Code Quality No N+1 queries — all relational data fetched with select_related / prefetch_related

13. Environment Variables
    13.1 Backend (.env)
    Variable Example Value Description
    SECRET_KEY django-insecure-xxx Django secret key
    DEBUG False Set False in production
    DB_NAME drivelink_db MySQL database name
    DB_USER root MySQL user
    DB_PASSWORD password123 MySQL password
    DB_HOST localhost MySQL host
    DB_PORT 3306 MySQL port
    PAYSTACK_SECRET_KEY sk_live_xxx Paystack secret (server-side only)
    PAYSTACK_PUBLIC_KEY pk_live_xxx Sent to frontend via config endpoint
    FRONTEND_URL http://localhost:5173 For CORS and Paystack callback URL
    MEDIA_ROOT /var/www/drivelink/media/ File storage path

13.2 Frontend (.env)
Variable Example Value Description
VITE_API_BASE_URL http://localhost:8000/api Backend API base URL
VITE_PAYSTACK_PUBLIC_KEY pk_live_xxx Paystack public key for inline JS

14. Deliverables Checklist

# Deliverable Status

1 Django project with 5 apps + MySQL connection □ Pending
2 Custom User model with role field + JWT auth □ Pending
3 Car model + CarImage + Admin CRUD endpoints □ Pending
4 Rental model + availability validator + booking endpoint □ Pending
5 Purchase model + atomic stock manager + purchase endpoint □ Pending
6 Smart ordering engine in CarListView □ Pending
7 Paystack initialize + verify + webhook handler □ Pending
8 React frontend — Modules M0–M12 (13 modules) □ Pending
9 Admin dashboard with Recharts analytics □ Pending
10 Full .env configuration for both environments □ Pending
11 README with setup instructions □ Pending

End of Product Requirements Document
DriveLink v1.0.0 — April 2026
