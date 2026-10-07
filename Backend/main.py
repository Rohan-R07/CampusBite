import sys
from pathlib import Path

# Ensure Backend directory is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.canteens import router as canteens_router
from routes.menu_items import router as menu_items_router
from routes.orders import router as orders_router

app = FastAPI(
    title="Campus Canteen API",
    description="Backend API for Campus Canteen Management (Core Functionality Phase)",
    version="1.0.0"
)

# Enable CORS for browser access and frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def rootEndpoint():
    return {
        "message": "College Canteen API",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {"status": "OK"}


# Include modular routers
app.include_router(canteens_router, prefix="/canteens", tags=["Canteens"])
app.include_router(menu_items_router, prefix="/menu-items", tags=["Menu Items"])
app.include_router(orders_router, prefix="/orders", tags=["Orders"])