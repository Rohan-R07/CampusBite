from typing import List
from fastapi import APIRouter, HTTPException, status
from database import canteens, menu_items, get_next_canteen_id
from schemas import CanteenCreate, CanteenUpdate, CanteenResponse

router = APIRouter()


@router.get("", response_model=List[CanteenResponse])
def get_all_canteens():
    """Retrieve all canteens."""
    return canteens


@router.get("/{canteen_id}", response_model=CanteenResponse)
def get_canteen_by_id(canteen_id: int):
    """Retrieve a specific canteen by its ID."""
    for c in canteens:
        if c["id"] == canteen_id:
            return c
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Canteen with id {canteen_id} not found"
    )


@router.post("", response_model=CanteenResponse, status_code=status.HTTP_201_CREATED)
def create_canteen(canteen_in: CanteenCreate):
    """Create a new canteen."""
    new_canteen = {
        "id": get_next_canteen_id(),
        "name": canteen_in.name,
        "location": canteen_in.location,
        "is_open": canteen_in.is_open,
    }
    canteens.append(new_canteen)
    return new_canteen


@router.put("/{canteen_id}", response_model=CanteenResponse)
@router.patch("/{canteen_id}", response_model=CanteenResponse)
def update_canteen(canteen_id: int, canteen_in: CanteenUpdate):
    """Update an existing canteen's details."""
    canteen = next((c for c in canteens if c["id"] == canteen_id), None)
    if not canteen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Canteen with id {canteen_id} not found"
        )

    update_data = canteen_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            canteen[field] = value

    return canteen


@router.delete("/{canteen_id}")
def delete_canteen(canteen_id: int):
    """Delete a canteen and its associated menu items."""
    for idx, c in enumerate(canteens):
        if c["id"] == canteen_id:
            canteens.pop(idx)
            # Remove menu items belonging to this deleted canteen
            menu_items[:] = [item for item in menu_items if item["canteen_id"] != canteen_id]
            return {"message": f"Canteen {canteen_id} and its menu items deleted successfully"}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Canteen with id {canteen_id} not found"
    )
