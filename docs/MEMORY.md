# Swariya Jewellery Backend - Technical Memory & Knowledge Base

## 1. Project Memory Overview
**Project Name**: Swariya Jewellery E-Commerce Backend API  
**Domain**: Premium Fine Jewelry E-Commerce, Custom Bespoke Jewelry Inquiries, Dynamic Metal Pricing Engine  
**Target Environment**: Node.js (v20 LTS), TypeScript, PostgreSQL 16, Redis 7, AWS S3 / Cloudinary  
**Architecture**: Modular Monolithic Architecture with Controller-Service-Repository pattern.

---

## 2. Domain Glossary & Key Specifications

- **Gross Weight**: The total physical weight of the finished jewelry item including metals, diamonds, and gemstones (in grams).
- **Net Metal Weight**: The actual weight of pure metal (Gold/Silver/Platinum) excluding gemstones (in grams). Used for price calculations.
- **Purity**:
  - `24K Gold` (99.9% fine gold)
  - `22K Gold` (91.6% purity - standard for traditional Indian gold jewelry)
  - `18K Gold` (75.0% purity - standard for diamond studded jewelry)
  - `14K Gold` (58.3% purity - durable for daily wear)
  - `925 Silver` (92.5% sterling silver)
- **Making Charges**: Crafting/labor cost added by artisans. Can be defined as a flat rate per gram or a percentage of net metal value.
- **BIS Hallmarking**: Bureau of Indian Standards hallmark seal certifying precious metal purity.
- **Bespoke Inquiry**: A custom customer request to design custom jewelry based on uploaded reference photos and specified metal/stone budgets.

---

## 3. Key Technical & Architectural Decisions Log

| Date | Decision | Rationale |
| :--- | :--- | :--- |
| **2026-10-01** | Presigned S3 URLs for Media Uploads | Direct-to-S3 uploads bypass backend server network bottlenecks for large 360-degree product videos (up to 50MB). |
| **2026-10-01** | Dynamic Price Calculation Engine | Jewelry prices fluctuate daily based on gold spot prices. Instead of static database prices, backend dynamically computes `(NetWeight * Rate) + MakingCharges + Gemstones + GST` using Redis cached rates. |
| **2026-10-01** | BullMQ + Redis Task Queue | Asynchronous tasks like video thumbnail generation, HLS encoding, customer enquiry emails, and payment invoice PDF generation are offloaded to background workers to ensure fast API responses ($<150\text{ms}$). |
| **2026-10-01** | HMAC Verification for Webhooks | Payment gateways (Razorpay/Stripe) webhooks use SHA-256 HMAC signature validation to prevent spoofing and double-spending attacks. |

---

## 4. Documentation Directory Index

```
backend/
├── docs/             # Dedicated Documentation Directory
│   ├── PRD.md            # Product Requirements Document
│   ├── ARCHITECTURE.md   # System Architecture & Component Diagrams
│   ├── RULES.md          # Business Rules & State Validation
│   ├── DESIGN.md         # Database Schema (ERD & DDL) & REST API Specs
│   ├── TASK.md           # Implementation Roadmap & Task Checklist
│   └── MEMORY.md         # Technical Context & Knowledge Base
├── src/              # Application Source Code
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript Configuration
└── README.md         # Root Overview & Quickstart Guide
```
