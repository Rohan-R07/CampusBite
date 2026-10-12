# 🍔 CampusBite - SNPSU Campus Canteen System

A modern, fast, and beginner-friendly backend API built with **FastAPI** to streamline canteen operations, food menus, and student ordering across campus dining facilities.

---

## 📌 Project Overview (Current Phase)

This phase focuses exclusively on the **core business logic** of canteens, menus, and ordering without the friction of authentication or payment gateways. This provides a clean sandbox for testing API contracts, validating business logic, and integrating with the frontend.

### Key Highlights
* **Zero Auth / Zero Payment Overhead**: Fully accessible endpoints for rapid testing and experimentation.
* **In-Memory Fast Store**: Zero-configuration, zero-database setup with pre-populated dummy data ready out-of-the-box.
* **Strict Validation**: Powered by **Pydantic v2** (`BaseModel`, `Field`, `Enum`) with clear request/response models.
* **Backend Calculations**: Automatic item validation, availability checks, item subtotal computations, and total order calculation on the server.
* **CORS Enabled**: Out-of-the-box support for web browsers and frontend clients.
* **Auto-Generated Docs**: Interactive OpenAPI (Swagger) and ReDoc interfaces available instantly.

---

## 🏗️ Architecture & Request Flow

```text
Client (Swagger / Postman / Frontend)
   │
   ▼
FastAPI Routers (/canteens, /menu-items, /orders)
   │
   ▼
Pydantic Schemas (Input Validation & Type Enforcement)
   │
   ▼
Business Logic (Availability checks, Subtotals, Auto-increment IDs)
   │
   ▼
In-Memory Store (database.py)
```

---

## 📂 Project Structure

```text
snpsu-campsuBite/
├── .gitignore               # Ignores Python bytecode and virtual environments
├── README.md                # Project documentation and API guide
├── Frontend/
│   └── index.html           # Frontend entrypoint
└── Backend/
    ├── database.py          # In-memory storage & seed data (canteens, menu items, orders)
    ├── main.py              # FastAPI application entrypoint & router aggregation
    ├── requirements.txt     # Python dependencies
    ├── schemas.py           # Pydantic models for validation and serialization
    └── routes/
        ├── __init__.py      # Routes package marker
        ├── canteens.py      # CRUD endpoints for campus canteens
        ├── menu_items.py    # CRUD endpoints for menu items with canteen validation
        └── orders.py        # Order creation, total calculation, & status management
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+ installed
* Git

### 2. Setup Virtual Environment

Navigate to the `Backend` directory:
```powershell
cd Backend
```

If you don't have a virtual environment set up:
```powershell
python -m venv venv
```

Activate the virtual environment:
* **Windows (PowerShell)**:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **Windows (Command Prompt)**:
  ```cmd
  .\venv\Scripts\activate.bat
  ```
* **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Run the Development Server
```powershell
uvicorn main:app --reload
```

The server will start at:
* **API Base URL**: `http://127.0.0.1:8000`
* **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
* **Alternative ReDoc Docs**: `http://127.0.0.1:8000/redoc`

---

## 📡 API Reference & Endpoints

### 1. System Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API welcome message and version |
| `GET` | `/health` | Server health check status (`{"status": "OK"}`) |

---

### 2. Canteens (`/canteens`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/canteens` | List all canteens |
| `GET` | `/canteens/{canteen_id}` | Retrieve details of a specific canteen |
| `POST` | `/canteens` | Register a new canteen |
| `PUT` / `PATCH` | `/canteens/{canteen_id}` | Update canteen information |
| `DELETE` | `/canteens/{canteen_id}` | Delete a canteen (cascades to delete its menu items) |

**Sample Canteen Object:**
```json
{
  "id": 1,
  "name": "Main Campus Canteen",
  "location": "Student Center, Ground Floor",
  "is_open": true
}
```

---

### 3. Menu Items (`/menu-items`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/menu-items` | Retrieve all menu items across all canteens |
| `GET` | `/menu-items?canteen_id={id}` | Filter menu items belonging to a specific canteen |
| `GET` | `/menu-items/{item_id}` | Retrieve a specific menu item |
| `POST` | `/menu-items` | Add a new menu item (validates `canteen_id` exists) |
| `PUT` / `PATCH` | `/menu-items/{item_id}` | Update item details, price, or availability |
| `DELETE` | `/menu-items/{item_id}` | Delete a menu item |

**Sample Menu Item Object:**
```json
{
  "id": 1,
  "name": "Veg Burger",
  "description": "Crispy vegetable patty with lettuce and cheese",
  "price": 60.0,
  "available": true,
  "canteen_id": 1
}
```

---

### 4. Orders (`/orders`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/orders` | List all placed orders |
| `GET` | `/orders/{order_id}` | Retrieve details for a specific order |
| `POST` | `/orders` | Place a new order (calculates total and checks stock) |
| `PATCH` / `PUT` | `/orders/{order_id}/status` | Update order progress status |
| `DELETE` | `/orders/{order_id}` | Cancel / remove an order |

#### Order Status Lifecycle:
```text
pending ──► confirmed ──► preparing ──► ready ──► completed
   │
   └──► cancelled
```

---

## 🧪 Testing Examples (Swagger / cURL)

### 1. Create a Canteen
```bash
curl -X POST "http://127.0.0.1:8000/canteens" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Library Cafe",
       "location": "Central Library 2nd Floor",
       "is_open": true
     }'
```

### 2. Add a Menu Item to a Canteen
```bash
curl -X POST "http://127.0.0.1:8000/menu-items" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Grilled Cheese Sandwich",
       "description": "Toasted sourdough with cheddar cheese",
       "price": 75.0,
       "available": true,
       "canteen_id": 1
     }'
```

### 3. Place an Order
```bash
curl -X POST "http://127.0.0.1:8000/orders" \
     -H "Content-Type: application/json" \
     -d '{
       "items": [
         {
           "menu_item_id": 1,
           "quantity": 2
         },
         {
           "menu_item_id": 3,
           "quantity": 1
         }
       ]
     }'
```
**Response (`201 Created`):**
```json
{
  "id": 1,
  "items": [
    {
      "menu_item_id": 1,
      "name": "Veg Burger",
      "price": 60.0,
      "quantity": 2,
      "subtotal": 120.0
    },
    {
      "menu_item_id": 3,
      "name": "Cold Coffee",
      "price": 50.0,
      "quantity": 1,
      "subtotal": 50.0
    }
  ],
  "total_amount": 170.0,
  "status": "pending",
  "created_at": "2026-10-07T01:05:00.000000+00:00"
}
```

### 4. Update Order Status
```bash
curl -X PATCH "http://127.0.0.1:8000/orders/1/status" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "preparing"
     }'
```

### 5. Out-of-Stock Validation Test
Attempting to order an unavailable item (e.g., ID 4 - Masala Dosa, which has `available: false`):
```json
{
  "items": [
    {
      "menu_item_id": 4,
      "quantity": 1
    }
  ]
}
```
**Response (`400 Bad Request`):**
```json
{
  "detail": "Menu item 'Masala Dosa' (ID: 4) is currently unavailable"
}
```

---

## 🔮 Upcoming Phases

1. **Persistent Database**: Integration with PostgreSQL / SQLite using SQLAlchemy or SQLModel.
2. **Authentication & Roles**: Student, Canteen Admin, and Super Admin access control with JWT/OAuth.
3. **Payments**: Seamless campus payment gateway or wallet integration.
4. **Real-time Order Updates**: WebSockets or SSE for live order kitchen tracking.
5. **Frontend Application**: Interactive React/Vue/HTML5 ordering UI.

---

## 📄 License
This project is developed for educational and campus canteen automation purposes.

