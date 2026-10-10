from typing import List
from fastapi import APIRouter, HTTPException, status
from database import supabase, handle_supabase_error
from schemas import CanteenCreate, CanteenUpdate, CanteenResponse

router = APIRouter()


@router.get("", response_model=List[CanteenResponse])
def get_all_canteens():
    """Retrieve all canteens from Supabase."""
    try:
        response = supabase.table("canteens").select("*").order("id").execute()
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.get("/{canteen_id}", response_model=CanteenResponse)
def get_canteen_by_id(canteen_id: int):
    """Retrieve a specific canteen by its ID from Supabase."""
    try:
        response = supabase.table("canteens").select("*").eq("id", canteen_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Canteen with id {canteen_id} not found"
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.post("", response_model=CanteenResponse, status_code=status.HTTP_201_CREATED)
def create_canteen(canteen_in: CanteenCreate):
    """Create a new canteen in Supabase."""
    try:
        data = {
            "name": canteen_in.name,
            "location": canteen_in.location,
            "is_open": canteen_in.is_open,
        }
        response = supabase.table("canteens").insert(data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create canteen in database"
            )
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.put("/{canteen_id}", response_model=CanteenResponse)
@router.patch("/{canteen_id}", response_model=CanteenResponse)
def update_canteen(canteen_id: int, canteen_in: CanteenUpdate):
    """Update an existing canteen's details in Supabase."""
    try:
        existing = supabase.table("canteens").select("*").eq("id", canteen_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Canteen with id {canteen_id} not found"
            )

        update_data = canteen_in.model_dump(exclude_unset=True)
        if not update_data:
            return existing.data[0]

        response = supabase.table("canteens").update(update_data).eq("id", canteen_id).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)


@router.delete("/{canteen_id}")
def delete_canteen(canteen_id: int):
    """Delete a canteen and its associated menu items from Supabase."""
    try:
        existing = supabase.table("canteens").select("id").eq("id", canteen_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Canteen with id {canteen_id} not found"
            )

        # Remove menu items belonging to this deleted canteen
        supabase.table("menu_items").delete().eq("canteen_id", canteen_id).execute()
        supabase.table("canteens").delete().eq("id", canteen_id).execute()
        return {"message": f"Canteen {canteen_id} and its menu items deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        handle_supabase_error(e)
