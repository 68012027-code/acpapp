from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import database

# Change prefix to include /inventory
router = APIRouter(prefix="/inventory", tags=["Inventory"])

class InventoryCreate(BaseModel):
    name: str
    category: str
    quantity: int
    unit_price: float
    user_email: Optional[str] = "demo@example.com"

# Support both / and empty path
@router.get("", status_code=200)
@router.get("/", status_code=200)
async def get_all_items():
    query = "SELECT * FROM inventory_items ORDER BY id DESC"
    items = await database.fetch_all(query)
    return items

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_item(item: InventoryCreate):
    if item.user_email:
        user = await database.fetch_one(
            "SELECT tier FROM users WHERE email = :email",
            {"email": item.user_email}
        )
        if user and user["tier"] == "Free":
            count = await database.fetch_val("SELECT COUNT(*) FROM inventory_items")
            if count >= 5:
                raise HTTPException(
                    status_code=403,
                    detail="Free Tier limit reached (Max 5 items). Please upgrade to Pro!"
                )

    query = """
        INSERT INTO inventory_items (name, category, quantity, unit_price)
        VALUES (:name, :category, :quantity, :unit_price)
        RETURNING id, name, category, quantity, unit_price, created_at
    """
    new_item = await database.fetch_one(
        query,
        {
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
        },
    )
    return new_item

@router.delete("/{item_id}", status_code=200)
async def delete_item(item_id: int):
    query = "DELETE FROM inventory_items WHERE id = :id RETURNING id"
    deleted = await database.fetch_one(query, {"id": item_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}