from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from database import supabase, handle_supabase_error
from schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter()


@router.get("", response_model=List[MenuItemResponse])
def get_all_menu_items(canteen_id: Optional[int] = Query(None, description="Filter by canteen ID")):
    """Retrieve all menu items from Supabase, optionally filtered by canteen_id."""
    try:
        query = supabase.table("menu_items").select("*").order("id")
        if canteen_id is not None:
            query = query.eq("canteen_id", canteen_id)
        response = query.execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item_by_id(item_id: int):
    """Retrieve a specific menu item by its ID from Supabase."""
    try:
        response = supabase.table("menu_items").select("*").eq("id", item_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with id {item_id} not found"
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_in: MenuItemCreate):
    """Create a new menu item in Supabase, ensuring the target canteen exists."""
    try:
        canteen_res = supabase.table("canteens").select("id").eq("id", item_in.canteen_id).execute()
        if not canteen_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cannot create menu item: Canteen with id {item_in.canteen_id} not found"
            )

        data = {
            "name": item_in.name,
            "description": item_in.description,
            "price": float(item_in.price),
            "available": item_in.available,
            "canteen_id": item_in.canteen_id,
        }
        response = supabase.table("menu_items").insert(data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create menu item in database"
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.put("/{item_id}", response_model=MenuItemResponse)
@router.patch("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, item_in: MenuItemUpdate):
    """Update an existing menu item in Supabase."""
    try:
        existing = supabase.table("menu_items").select("*").eq("id", item_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with id {item_id} not found"
            )

        # If canteen_id is being updated, verify target canteen exists
        if item_in.canteen_id is not None:
            canteen_res = supabase.table("canteens").select("id").eq("id", item_in.canteen_id).execute()
            if not canteen_res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Cannot update menu item: Canteen with id {item_in.canteen_id} not found"
                )

        update_data = item_in.model_dump(exclude_unset=True)
        if not update_data:
            return existing.data[0]

        if "price" in update_data and update_data["price"] is not None:
            update_data["price"] = float(update_data["price"])

        response = supabase.table("menu_items").update(update_data).eq("id", item_id).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.delete("/{item_id}")
def delete_menu_item(item_id: int):
    """Delete a menu item from Supabase by ID."""
    try:
        existing = supabase.table("menu_items").select("id").eq("id", item_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with id {item_id} not found"
            )

        supabase.table("menu_items").delete().eq("id", item_id).execute()
        return {"message": f"Menu item {item_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)
