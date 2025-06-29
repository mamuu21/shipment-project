# 🚚 AMKA SHIPMENT – Full Stack Shipment Tracking System

AMKA SHIPMENT is a full-stack shipment tracking system designed to manage shipments, customers, parcels, invoices, and documents. Built with **Django REST Framework** on the backend and **React.js + Bootstrap** on the frontend, this system enables real-time shipment management, token-based authentication, and role-based access control.

---

## 📁 Project Structure

amka-shipment/
├── .venv/ # Virtual environment
├── backend/ # Django backend
├── frontend/ # React frontend
├── .gitignore
├── README.md
---

## ✅ Features

### 🔐 Authentication
- JWT authentication with secure token handling
- Login, logout, and token refresh
- Role-based views (Admin, Staff, Customer)

### 📦 Shipment Management
- Add/edit/view shipments and their details
- Link customers and parcels to shipments
- Invoice generation and tracking

### 📬 Parcel & Customer Module
- Add and manage parcels with weight/volume tracking
- Connect customers to specific shipments

### 📊 Dashboard
- Clean dashboard interface with status summaries and metrics
- Searchable and paginated tables

---

## 🚀 Tech Stack

| Frontend                | Backend               | Tools & Deployment       |
|------------------------|-----------------------|--------------------------|
| React.js               | Django + DRF          | Git & GitHub             |
| Bootstrap 5            | JWT Authentication    | Postman (API Testing)    |
| Axios (API calls)      | Django ORM + SQLite   | VSCode / PyCharm         |

---
## 🛠️ Setup Instructions

### 1. Clone the repository

bash
git clone https://github.com/your-username/amka-shipment.git
cd amka-shipment
