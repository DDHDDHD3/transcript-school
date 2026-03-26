# Aqooni Digital - System Documentation

## 1. Introduction
Aqooni Digital (formerly Qabas al-Huda) is a comprehensive, multi-tenant School Management System and Academic Records Portal. It is designed to streamline administrative tasks, manage student data, and provide a secure, publicly-verifiable platform for academic certificates.

## 2. Core Modules

### 2.1 Super Admin Dashboard
- **Platform Management**: Control over all registered schools and institutions.
- **Subscription Control**: Manage school statuses (Active, Suspended, Pending) and expiry dates.
- **Global Branding**: System-wide control for platform name and default logos.
- **Financial Moderation**: Approval/rejection of credit recharge requests.

### 2.2 School Admin Module
- **Institutional Identity**: Customization of school name, logo, stamps, and signatures.
- **Student Management**: Enrollment, academic year tracking, and record updates.
- **Grading Engine**: Customizable subjects and exam columns (Monthly, Midterm, Final).
- **Attendance System**: Daily tracking for morning/afternoon sessions with automated rate calculation.
- **Certificate Hub**: Bulk generation and customization of professional academic certificates.

### 2.3 Public Verification Portal
- **Instant Validation**: Anyone with a Certificate ID can verify its authenticity.
- **Data Integrity**: Direct links to the official school database to prevent fraud.

## 3. Technology Stack

- **Frontend**: React with Vite, Tailwind CSS for styling.
- **Animations**: Framer Motion for a premium user experience.
- **Authentication**: Clerk (enterprise-grade secure login).
- **Backend/Database**: PostgreSQL (via `pg` client).
- **Internationalization**: `react-i18next` with support for English, Arabic, and Somali.
- **Deployment**: Optimized for Vercel.

## 4. System Architecture
- **Multi-Tenancy**: Logical isolation of school data using `school_id`.
- **API Service Layer**: Centralized `api.ts` for all database interactions and business logic.
- **Responsive Design**: Mobile-first approach with PWA (Progressive Web App) support.

## 5. Financial Model
- **Subscription-Based**: Monthly or Yearly plans for institutional access.
- **Student Credits**: A credit system for student enrollment capacity.
- **Transparent Billing**: Direct dashboard for tracking service expiry and balance.
