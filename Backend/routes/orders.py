from typing import List
from fastapi import APIRouter, HTTPException, status
from database import supabase, handle_supabase_error
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
    """Retrieve all placed orders from Supabase."""
    try:
        response = supabase.table("orders").select("*, order_items(*)").order("id", desc=True).execute()
        result = []
        for o in response.data:
            items = o.get("order_items") or []
            result.append({
                "id": o["id"],
                "items": [
                    {
                        "menu_item_id": it["menu_item_id"],
                        "name": it["name"],
                        "price": float(it["price"]),
                        "quantity": it["quantity"],
                        "subtotal": float(it["subtotal"])
                    }
                    for it in items
                ],
                "total_amount": float(o["total_amount"]),
                "status": o["status"],
                "created_at": str(o["created_at"])
            })
        return result
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(order_id: int):
    """Retrieve a specific order by ID from Supabase."""
    try:
        response = supabase.table("orders").select("*, order_items(*)").eq("id", order_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )
        o = response.data[0]
        items = o.get("order_items") or []
        return {
            "id": o["id"],
            "items": [
                {
                    "menu_item_id": it["menu_item_id"],
                    "name": it["name"],
                    "price": float(it["price"]),
                    "quantity": it["quantity"],
                    "subtotal": float(it["subtotal"])
                }
                for it in items
            ],
            "total_amount": float(o["total_amount"]),
            "status": o["status"],
            "created_at": str(o["created_at"])
        }
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(order_in: OrderCreate):
    """
    Create a new order in Supabase without authentication.
    Validates item existence and availability, snapshots prices, and calculates the total amount.
    """
    try:
        processed_items = []
        total_amount = 0.0

        for item_req in order_in.items:
            # Check menu item exists in Supabase
            m_res = supabase.table("menu_items").select("*").eq("id", item_req.menu_item_id).execute()
            if not m_res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Menu item with id {item_req.menu_item_id} not found"
                )

            menu_item = m_res.data[0]

            # Check menu item availability
            if not menu_item.get("available", True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Menu item '{menu_item['name']}' (ID: {menu_item['id']}) is currently unavailable"
                )

            item_price = float(menu_item["price"])
            subtotal = round(item_price * item_req.quantity, 2)
            total_amount += subtotal

            processed_items.append({
                "menu_item_id": menu_item["id"],
                "name": menu_item["name"],
                "price": item_price,
                "quantity": item_req.quantity,
                "subtotal": subtotal,
                "canteen_id": menu_item.get("canteen_id")
            })

        # Insert order record
        canteen_id = processed_items[0].get("canteen_id") if processed_items else None
        order_insert_payload = {
            "canteen_id": canteen_id,
            "user_id": None,
            "total_amount": round(total_amount, 2),
            "status": OrderStatus.PENDING.value
        }

        order_res = supabase.table("orders").insert(order_insert_payload).execute()
        if not order_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order record in database"
            )

        new_order = order_res.data[0]
        order_id = new_order["id"]

        # Insert order items snapshots
        order_items_payload = [
            {
                "order_id": order_id,
                "menu_item_id": it["menu_item_id"],
                "name": it["name"],
                "price": it["price"],
                "quantity": it["quantity"],
                "subtotal": it["subtotal"]
            }
            for it in processed_items
        ]
        supabase.table("order_items").insert(order_items_payload).execute()

        return {
            "id": order_id,
            "items": [
                {
                    "menu_item_id": it["menu_item_id"],
                    "name": it["name"],
                    "price": it["price"],
                    "quantity": it["quantity"],
                    "subtotal": it["subtotal"]
                }
                for it in processed_items
            ],
            "total_amount": round(total_amount, 2),
            "status": new_order["status"],
            "created_at": str(new_order["created_at"])
        }
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.patch("/{order_id}/status", response_model=OrderResponse)
@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderStatusUpdate):
    """
    Update the status of an existing order in Supabase.
    Allowed statuses: pending -> confirmed -> preparing -> ready -> completed -> cancelled
    """
    try:
        existing = supabase.table("orders").select("id").eq("id", order_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )

        supabase.table("orders").update({"status": status_update.status.value}).eq("id", order_id).execute()
        return get_order_by_id(order_id)
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.delete("/{order_id}")
def delete_order(order_id: int):
    """Delete an order and its items from Supabase."""
    try:
        existing = supabase.table("orders").select("id").eq("id", order_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found"
            )

        supabase.table("order_items").delete().eq("order_id", order_id).execute()
        supabase.table("orders").delete().eq("id", order_id).execute()
        return {"message": f"Order {order_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)
