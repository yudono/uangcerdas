# SmartKas 💸

**SmartKas helps small businesses take full control of their cashflow with smart, automated financial monitoring.**

---

## 📑 Table of Contents
1. [Inspiration](#inspiration)
2. [What it does](#what-it-does)
3. [Key Features](#key-features)
4. [Target Audience](#target-audience)
5. [AI Architecture](#ai-architecture)
6. [How we built it](#how-we-built-it)
    - [Client Side](#-client-side--fast-interactive-and-user-focused)
    - [Server Side](#-server-side--secure-scalable--data-driven)
    - [Bringing It All Together](#-bringing-it-all-together)

---

## Inspiration
Imagine running your business with complete clarity — every rupiah accounted for, no more silent money leaks, and every financial decision supported by real insight.

Many small businesses don’t succeed because they’re bigger or luckier, but because they finally gain control of their cashflow. With today’s technology, every entrepreneur has the power to build a healthier, more profitable future. A stable and growing business isn’t just a dream—it’s a step you can take today.

## What it does
SmartKas helps small businesses take full control of their cashflow with smart, automated financial monitoring. The platform uses an **AI-powered Financial Leak Detector** to identify hidden money leaks, send real-time alerts, and deliver clear, actionable recommendations you can apply instantly.

Getting started is simple: sign up with your phone number or email, connect your bank accounts, POS, or e-wallets, and let SmartKas sync your transactions automatically. From there, you’ll get an easy-to-read cashflow dashboard, weekly financial summaries, and instant notifications whenever something needs attention. Everything you need to manage your cashflow—efficiently, accurately, and in one place.

## Key Features
* **🤖 AI Financial Leak Detector:** Automatically identifies hidden drains on your cashflow and alerts you instantly.
* **🔗 Universal Sync:** Seamlessly connects with Bank Accounts, POS systems, and E-wallets to automate transaction tracking.
* **📊 Real-Time Dashboard:** An intuitive visual interface to view cashflow health at a glance.
* **🔔 Smart Notifications:** Get instant alerts for anomalies or financial actions that need immediate attention.
* **📈 Forecasting:** AI-driven predictions for future cash flow and product demand.

## Target Audience
Our primary focus is on **MSMEs (UMKM), Small Business Owners, and Entrepreneurs** who need a sophisticated yet simple way to manage financial health without requiring a dedicated finance team.

---

## 🏗️ AI Architecture
Our system is built on a modular data pipeline that seamlessly integrates data collection, cleansing, and advanced machine learning forecasting.

### 1. Data Preparation & Storage
The foundation of our model relies on clean, structured data.
* **Collection:** Raw historical data is ingested from user inputs into our database.
* **Cleansing:** We utilize **Python** and **Pandas** to perform rigorous data cleansing, removing inconsistencies and formatting the datasets for processing.
* **Storage:** The central backbone of the architecture is a **MySQL** database, which acts as the single source of truth.

### 2. Multi-Modal Query Input
To make the system accessible and versatile, we support various methods of data entry:
* **OCR (Optical Character Recognition):** For digitizing physical records or receipts.
* **File Uploads:** Support for **CSV** files.
* **Direct Input:** A user-friendly interface for manual entry.

### 3. The Model Service (AI Core)
Once the user requests a prediction, the system triggers the inference pipeline:
* **Preprocessing:** We use **Pandas** to transform fetched data into features.
* **Prediction Engines:**
    * **Isolation Forest:** For anomaly detection to handle outliers.
    * **Prophet:** A time-series forecasting model for the **Cash Flow Prediction Engine**.
    * **LightGBM:** A gradient boosting framework powering the **Products Prediction Engine**.

### 4. Visualization
Insights are rendered into intuitive charts using **Matplotlib**, allowing users to interpret cash flow trends and product predictions easily.

---

## How we built it
SmartKas is built using a modern, scalable, and secure architecture that separates the client side and server side for maximum performance, reliability, and user experience.

### 🖥️ Client Side — Fast, Interactive, and User-Focused
We designed the SmartKas front-end to be smooth, intuitive, and responsive across all devices.

* **Next.js:** Provides hybrid rendering (SSR/CSR) for fast load times and SEO-friendly pages.
* **TypeScript:** Ensures strong type safety and eliminates many runtime bugs.
* **Tailwind CSS:** Enables rapid UI development with a consistent, clean design system.
* **React:** Handles the core UI rendering with reusable, interactive components.
* **Recharts:** Powers the dynamic financial charts users see in the dashboard.
* **React Query (TanStack):** Manages client-side data fetching, caching, and state syncing.
* **Lucide Icons:** Provides crisp, modern iconography.
* **React Hook Form & Zod:** Simplifies form handling with fast validation and shared schemas.

### 💾 Server Side — Secure, Scalable & Data-Driven
SmartKas’s backend is built to process financial data safely, run AI analysis, and deliver insights in real time.

* **bcrypt:** Secures user authentication by hashing passwords on the server.
* **Kolosal:** Backend framework used to structure server logic and API endpoints.
* **Milvus:** Powers vector-based AI features for similarity search and intelligent pattern detection.
* **MySQL:** Stores structured financial data with reliability and high performance.
* **Prisma:** Acts as the ORM for secure, type-safe database access.

### ⭐ Bringing It All Together
By combining a modern, reactive front-end with a secure, intelligent backend, SmartKas delivers:
1.  Real-time cashflow insights.
2.  Fast and accurate financial dashboards.
3.  Secure authentication with strong encryption.
4.  AI-powered pattern detection.
5.  A clean and responsive user experience.

Each part of the stack works in harmony to create a platform that is fast, secure, and smart—built for UMKM businesses that need reliable cashflow analytics without complexity.
