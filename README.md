# 💎 Swariya Jewellery E-Commerce Backend API

Enterprise Grade Node.js & TypeScript Backend API designed for Swariya Jewellers e-commerce platform featuring dynamic gold spot pricing, HD 360-degree video showcase uploads, bespoke custom design inquiries, order lifecycle state management, and Razorpay/Stripe payment gateway webhooks.

---

## 📁 System Documentation Directory (`/docs`)

All system design, architecture, database schemas, and business rules are organized inside the [`/docs`](file:///g:/swariya%20jewl/backend/docs) directory:

- 📄 **[Product Requirements Document (PRD.md)](file:///g:/swariya%20jewl/backend/docs/PRD.md)** - Feature specs & domain breakdown
- 🏗️ **[System Architecture (ARCHITECTURE.md)](file:///g:/swariya%20jewl/backend/docs/ARCHITECTURE.md)** - Tech stack, Mermaid diagrams, clean architecture
- 📜 **[Business Rules & Guidelines (RULES.md)](file:///g:/swariya%20jewl/backend/docs/RULES.md)** - Dynamic Gold/Silver pricing formulas & validation rules
- 🗄️ **[Database & API Design (DESIGN.md)](file:///g:/swariya%20jewl/backend/docs/DESIGN.md)** - PostgreSQL ERD schemas & RESTful endpoint specifications
- 📋 **[Implementation Task Breakdown (TASK.md)](file:///g:/swariya%20jewl/backend/docs/TASK.md)** - Phase-by-phase development progress
- 🧠 **[Technical Memory & Decisions (MEMORY.md)](file:///g:/swariya%20jewl/backend/docs/MEMORY.md)** - Technical context & environment configurations

---

## 🛠️ Folder Structure

```
backend/
├── docs/                     # Comprehensive System Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   ├── DESIGN.md
│   ├── TASK.md
│   └── MEMORY.md
├── src/                      # Source Code
│   ├── controllers/          # Request handlers (Auth, Category, Product, Media, Enquiry, Order, Transaction)
│   ├── middlewares/          # JWT Auth & Role-Based Access Control (RBAC) guards
│   ├── routes/               # Versioned API routes (/api/v1)
│   ├── services/             # Pure business logic (Dynamic Pricing Calculator)
│   ├── app.ts                # Express app bootstrap
│   └── server.ts             # HTTP server entrypoint
├── .env.example              # Environment variable template
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript compiler settings
└── README.md                 # Project Overview
```

---

## 🚀 Quickstart Guide

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```

3. **Build & Production Server**:
   ```bash
   npm run build
   npm start
   ```
