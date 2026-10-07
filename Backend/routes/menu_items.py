from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from database import canteens, menu_items, get_next_menu_item_id
from schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter()


@router.get("", response_model=List[MenuItemResponse])
def get_all_menu_items(canteen_id: Optional[int] = Query(None, description="Filter by canteen ID")):
    """Retrieve all menu items, optionally filtered by canteen_id."""
    if canteen_id is not None:
        return [item for item in menu_items if item["canteen_id"] == canteen_id]
    return menu_items


@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item_by_id(item_id: int):
    """Retrieve a specific menu item by its ID."""
    for item in menu_items:
        if item["id"] == item_id:
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Menu item with id {item_id} not found"
    )


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_in: MenuItemCreate):
    """Create a new menu item, ensuring the target canteen exists."""
    canteen = next((c for c in canteens if c["id"] == item_in.canteen_id), None)
    if not canteen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cannot create menu item: Canteen with id {item_in.canteen_id} not found"
        )

    new_item = {
        "id": get_next_menu_item_id(),
        "name": item_in.name,
        "description": item_in.description,
        "price": item_in.price,
        "available": item_in.available,
        "canteen_id": item_in.canteen_id,
    }
    menu_items.append(new_item)
    return new_item


@router.put("/{item_id}", response_model=MenuItemResponse)
@router.patch("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(item_id: int, item_in: MenuItemUpdate):
    """Update an existing menu item."""
    item = next((m for m in menu_items if m["id"] == item_id), None)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with id {item_id} not found"
        )

    # If canteen_id is being updated, verify target canteen exists
    if item_in.canteen_id is not None:
        canteen = next((c for c in canteens if c["id"] == item_in.canteen_id), None)
        if not canteen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cannot update menu item: Canteen with id {item_in.canteen_id} not found"
            )

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            item[field] = value

    return item


@router.delete("/{item_id}")
def delete_menu_item(item_id: int):
    """Delete a menu item by ID."""
    for idx, item in enumerate(menu_items):
        if item["id"] == item_id:
            menu_items.pop(idx)
            return {"message": f"Menu item {item_id} deleted successfully"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Menu item with id {item_id} not found"
    )
