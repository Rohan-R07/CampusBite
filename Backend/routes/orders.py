from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, status
from database import orders, menu_items, get_next_order_id
from schemas import (
    OrderCreate,
    OrderStatusUpdate,
    OrderResponse,
    OrderItemResponse,
    OrderStatus
)

router = APIRouter()


@router.get("", response_model=List[OrderResponse])
def get_all_orders():
    """Retrieve all placed orders."""
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(order_id: int):
    """Retrieve a specific order by ID."""
    for order in orders:
        if order["id"] == order_id:
            return order
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Order with id {order_id} not found"
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(order_in: OrderCreate):
    """
    Create a new order without authentication.
    Validates item existence and availability, and calculates the total amount.
    """
    processed_items = []
    total_amount = 0.0

    for item_req in order_in.items:
        # Check menu item exists
        menu_item = next((m for m in menu_items if m["id"] == item_req.menu_item_id), None)
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with id {item_req.menu_item_id} not found"
            )

        # Check menu item availability
        if not menu_item.get("available", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{menu_item['name']}' (ID: {menu_item['id']}) is currently unavailable"
            )

        subtotal = round(menu_item["price"] * item_req.quantity, 2)
        total_amount += subtotal

        processed_items.append({
            "menu_item_id": menu_item["id"],
            "name": menu_item["name"],
            "price": menu_item["price"],
            "quantity": item_req.quantity,
            "subtotal": subtotal
        })

    new_order = {
        "id": get_next_order_id(),
        "items": processed_items,
        "total_amount": round(total_amount, 2),
        "status": OrderStatus.PENDING,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    orders.append(new_order)
    return new_order


@router.patch("/{order_id}/status", response_model=OrderResponse)
@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderStatusUpdate):
    """
    Update the status of an existing order.
    Allowed statuses: pending -> confirmed -> preparing -> ready -> completed -> cancelled
    """
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found"
        )

    order["status"] = status_update.status
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int):
    """Delete or cancel an order by ID."""
    for idx, order in enumerate(orders):
        if order["id"] == order_id:
            orders.pop(idx)
            return {"message": f"Order {order_id} deleted successfully"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Order with id {order_id} not found"
    )
