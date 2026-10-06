# Swariya Jewellery E-Commerce Backend - Product Requirements Document (PRD)

## 1. Executive Summary
**Swariya Jewellers Backend API** is a high-performance, secure, and scalable backend system designed specifically for a premium jewelry e-commerce platform. Jewelry e-commerce demands high visual presentation (HD video previews), precise dynamic pricing based on daily metal rates, granular product specification management (purity, metal weight, making charges, gemstone certification), custom design customer inquiries, robust order lifecycle tracking, secure payments, and role-based administrative control.

---

## 2. Core Functional Requirements & Domain Modules

### 2.1 Admin Authentication & Access Control (RBAC)
- **Admin Authentication**: JWT-based authentication with Refresh Tokens and bcrypt password hashing.
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: Full system access, staff management, payment configuration.
  - `INVENTORY_MANAGER`: Product catalog, category management, stock management, price updates.
  - `ORDER_MANAGER`: Order processing, fulfillment status, invoice generation, returns.
  - `CUSTOMER_SUPPORT`: Customer enquiry responses, design consultation request tracking.

### 2.2 Category & Subcategory Management
- **Hierarchical Taxonomy**: Multi-level categories (e.g., *Rings -> Diamond Engagement Rings*, *Necklaces -> Gold Chokers*).
- **Attribute Schemas**: Custom category-level filtering attributes (Metal type, Stone type, Gender, Occasion, Collection).
- **SEO & Navigation**: Unique URL slugs, meta titles, descriptions, banner images per category.

### 2.3 Product Catalog Management (Jewelry Specifics)
- **Basic Details**: Product Title, SKU, Slug, Description, Short Summary, Tags, Featured status.
- **Jewelry Specifications**:
  - **Metal Metadata**: Metal Type (`Gold`, `Silver`, `Platinum`), Purity (`14K`, `18K`, `22K`, `24K`, `925 Silver`), Gross Weight (grams), Net Metal Weight (grams).
  - **Gemstone / Diamond Metadata**: Stone Type (`Diamond`, `Ruby`, `Emerald`, `Solitaire`, `Cubic Zirconia`), Carat Weight, Clarity (`VVS1`, `VS2`, etc.), Color (`D-F`, `G-H`, etc.), Cut (`Ideal`, `Excellent`), Certification (`GIA`, `IGI`, `BIS Hallmarked`).
  - **Pricing Breakdown Parameters**: Base Metal Weight, Making Charge Type (`Percentage` or `Flat Per Gram`), Making Charge Amount, Stone Cost, GST Percentage (e.g., 3% for gold jewelry in India).
- **Variant Management**: Ring sizes, chain lengths, metal color options (`Yellow Gold`, `Rose Gold`, `White Gold`).
- **Inventory & Stock**: SKU stock count, low stock alert threshold, backorder settings.

### 2.4 Dynamic Price Calculation Engine
- **Daily Live Rate Integration**: Ability to store and update daily gold/silver spot prices per gram per purity.
- **Dynamic Price Formula**:
  $$\text{Final Price} = \left[ (\text{Net Metal Weight} \times \text{Live Rate per Gram}) + \text{Making Charges} + \text{Gemstone Price} \right] \times (1 + \frac{\text{GST \%}}{100})$$
- Automated price recalculation endpoint for real-time storefront display.

### 2.5 Media & Video Upload System
- **Multi-Media Storage**: Direct S3 / Cloudinary integration for HD image galleries and 360-degree product videos.
- **Video Specifications**: Support for video uploads (`MP4`, `WEBM`, max 50MB per video).
- **Transcoding & Streaming**: Integration with AWS Elastic Transcoder / Cloudinary for optimized HLS video streaming and auto-thumbnail extraction.

### 2.6 Customer Enquiry & Bespoke Customization System
- **Types of Enquiries**:
  - General Product Inquiry ("Inquire about this piece").
  - Bespoke / Custom Jewelry Design Request (Upload reference images, budget range, ring size, target date).
  - Video Call / Store Appointment Consultation Booking.
- **Enquiry Workflow**: Submission -> Assigned to Agent -> In Review -> Quotation Sent -> Closed.

### 2.7 Order & Cart Management
- **Guest & User Cart**: Redis-backed guest cart and database-backed persistent user cart.
- **Checkout & Address**: Multi-address management with PIN code serviceability validation (insured courier checks).
- **Order Lifecycle States**:
  `PENDING_PAYMENT` → `PAID` → `IN_PRODUCTION` / `HALLMARKING` → `READY_TO_SHIP` → `SHIPPED` → `DELIVERED` → `CANCELLED` / `RETURN_REQUESTED`.
- **Insured Shipping & Tracking**: Integration with logistics API (AWB tracking number, delivery insurance status).

### 2.8 Transactions & Payment Integration
- **Payment Gateways**: Razorpay, Stripe, UPI, EMI options, Bank Wire for high-value orders.
- **Transaction Logs**: Ledger of attempts, payment signature verification, gateway responses.
- **Webhooks**: Secure webhook handlers for async payment confirmation, failed payments, and auto-refunds.
- **Invoice Generation**: Automated PDF tax invoice generation with BIS Hallmarking badge details.

---

## 3. Non-Functional Requirements
- **Performance**: API response times $<150\text{ms}$ for catalog queries (Redis cache for category trees & top products).
- **Security**: OWASP compliance, rate-limiting on sensitive endpoints (auth, payment initiation), CORS policies, sanitized inputs.
- **Data Integrity**: Acid compliant transactions for stock updates and payment ledger writes.
- **Scalability**: Stateless micro-service/modular monolithic design ready for Docker & Kubernetes deployment.
