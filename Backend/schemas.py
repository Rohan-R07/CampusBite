"""
Pydantic schemas for request validation and response serialization.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------
# CANTEEN SCHEMAS
# ---------------------------------------------------------

class CanteenBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the canteen")
    location: str = Field(..., min_length=1, max_length=200, description="Location on campus")
    is_open: bool = Field(default=True, description="Whether the canteen is currently open")


class CanteenCreate(CanteenBase):
    pass


class CanteenUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    is_open: Optional[bool] = None


class CanteenResponse(CanteenBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# MENU ITEM SCHEMAS
# ---------------------------------------------------------

class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the menu item")
    description: Optional[str] = Field(None, max_length=300, description="Short description of the item")
    price: float = Field(..., gt=0, description="Price in currency units (must be greater than 0)")
    available: bool = Field(default=True, description="Availability status of the item")
    canteen_id: int = Field(..., description="ID of the canteen this item belongs to")


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=300)
    price: Optional[float] = Field(None, gt=0)
    available: Optional[bool] = None
    canteen_id: Optional[int] = None


class MenuItemResponse(MenuItemBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# ORDER SCHEMAS
# ---------------------------------------------------------

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class OrderItemRequest(BaseModel):
    menu_item_id: int = Field(..., description="ID of the menu item to order")
    quantity: int = Field(..., gt=0, description="Quantity to order (must be at least 1)")


class OrderItemResponse(BaseModel):
    menu_item_id: int
    name: str
    price: float
    quantity: int
    subtotal: float


class OrderCreate(BaseModel):
    items: List[OrderItemRequest] = Field(
        ...,
        min_length=1,
        description="List of menu items and quantities (minimum 1 item required)"
    )


class OrderStatusUpdate(BaseModel):
    status: OrderStatus = Field(..., description="Updated order status")


class OrderResponse(BaseModel):
    id: int
    items: List[OrderItemResponse]
    total_amount: float
    status: OrderStatus
    created_at: str

    class Config:
        from_attributes = True
