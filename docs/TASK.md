# Swariya Jewellery Backend - Task Breakdown & Implementation Plan

## Phase 1: Core Foundation & Infrastructure
- [x] Initialize Node.js TypeScript project (`package.json`, `tsconfig.json`).
- [x] Configure Express.js with `helmet`, `cors`, `morgan`, and global error handler middleware.
- [x] Configure PostgreSQL schema structure.
- [x] Set up environment variable configuration setup (`.env.example`).

## Phase 2: Authentication & Role-Based Access Control (RBAC)
- [x] Create Admin login & JWT verification (`POST /api/v1/auth/admin/login`).
- [x] Create `authMiddleware` and `requireRoles` permission guards.

## Phase 3: Category & Subcategory Management Module
- [x] Build Category tree API endpoints (`GET /api/v1/categories`, `POST /api/v1/categories`).
- [x] Implement subcategory creation with automatic URL slug formatting.

## Phase 4: Metal Rates & Dynamic Product Catalog Engine
- [x] Implement Product catalog data structures (purity, gross weight, net metal weight, making charges).
- [x] Write `PricingService` to dynamically calculate final item price:
  $$\text{Final Price} = [(\text{Net Weight} \times \text{Live Rate}) + \text{Making Charges} + \text{Gemstone Price}] \times 1.03$$
- [x] Build product search & slug lookup endpoints (`GET /api/v1/products/:slug`).

## Phase 5: Media & Video Upload Processing Service
- [x] Implement S3 Presigned Upload URL generator (`POST /api/v1/media/upload-url`).
- [x] Implement media confirmation & background video thumbnail job pipeline.

## Phase 6: Customer Enquiry & Bespoke Design Request System
- [x] Build customer inquiry submission API (`POST /api/v1/enquiries`).
- [x] Build Admin Enquiry Dashboard & status workflow transition API (`PATCH /api/v1/admin/enquiries/:id/status`).

## Phase 7: Order Lifecycle & Cart Management
- [x] Build checkout & order placement API (`POST /api/v1/orders/checkout`).
- [x] Build Order tracking endpoint (`GET /api/v1/orders/:orderNumber`).

## Phase 8: Transactions & Payment Integration
- [x] Build Razorpay gateway integration endpoint (`POST /api/v1/payments/create-razorpay-order`).
- [x] Implement HMAC SHA-256 webhook signature verification (`POST /api/v1/payments/webhook/razorpay`).

## Phase 9: Quality Assurance & Documentation
- [x] Organize system documentation cleanly inside `backend/docs/`.
