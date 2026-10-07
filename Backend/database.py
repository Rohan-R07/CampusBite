"""
In-memory database for the Campus Canteen backend.
Provides simple list storage and auto-increment ID helpers.
"""

from typing import Dict, List, Any

# Initial sample canteens
canteens: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "Main Campus Canteen",
        "location": "Student Center, Ground Floor",
        "is_open": True,
    },
    {
        "id": 2,
        "name": "North Block Food Corner",
        "location": "North Academic Block, 1st Floor",
        "is_open": True,
    },
]

# Initial sample menu items
menu_items: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "Veg Burger",
        "description": "Crispy vegetable patty with lettuce and cheese",
        "price": 60.0,
        "available": True,
        "canteen_id": 1,
    },
    {
        "id": 2,
        "name": "Paneer Roll",
        "description": "Spiced cottage cheese wrapped in a paratha",
        "price": 80.0,
        "available": True,
        "canteen_id": 1,
    },
    {
        "id": 3,
        "name": "Cold Coffee",
        "description": "Chilled blended coffee with chocolate syrup",
        "price": 50.0,
        "available": True,
        "canteen_id": 1,
    },
    {
        "id": 4,
        "name": "Masala Dosa",
        "description": "Crispy crepe served with sambar and coconut chutney",
        "price": 55.0,
        "available": False,  # Sample item marked unavailable for testing
        "canteen_id": 1,
    },
    {
        "id": 5,
        "name": "Hot Chocolate",
        "description": "Rich hot cocoa with steamed milk",
        "price": 45.0,
        "available": True,
        "canteen_id": 2,
    },
]

# In-memory orders store
orders: List[Dict[str, Any]] = []

# ID tracking counters
_canteen_id_counter = 2
_menu_item_id_counter = 5
_order_id_counter = 0


def get_next_canteen_id() -> int:
    global _canteen_id_counter
    _canteen_id_counter += 1
    return _canteen_id_counter


def get_next_menu_item_id() -> int:
    global _menu_item_id_counter
    _menu_item_id_counter += 1
    return _menu_item_id_counter


def get_next_order_id() -> int:
    global _order_id_counter
    _order_id_counter += 1
    return _order_id_counter
