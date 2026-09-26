from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import database

router = APIRouter()

# 1. Define Pydantic models
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    created_at: Optional[datetime] = None

# 2. Implement a row formatter function
def format_product_row(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "price": float(row["price"]),  # Convert Decimal to float
        "stock": row["stock"],
        "created_at": row["created_at"]
    }

# 3. Implement endpoints
@router.get("/products", response_model=list[ProductResponse])
async def list_products():
    query = "SELECT * FROM products ORDER BY id ASC"
    rows = await database.fetch_all(query=query)
    return [format_product_row(row) for row in rows]

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int):
    query = "SELECT * FROM products WHERE id = :id"
    row = await database.fetch_one(query=query, values={"id": product_id})
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product_row(row)

@router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(payload: ProductCreate):
    query = """
        INSERT INTO products (name, description, price, stock) 
        VALUES (:name, :description, :price, :stock) 
        RETURNING id, name, description, price, stock, created_at
    """
    row = await database.fetch_one(query=query, values=payload.dict())
    return format_product_row(row)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, payload: ProductUpdate):
    # Check if product exists
    existing = await database.fetch_one("SELECT * FROM products WHERE id = :id", {"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Dynamically build update query for non-null fields
    update_data = payload.dict(exclude_unset=True)
    if not update_data:
        return format_product_row(existing)
        
    set_clauses = [f"{key} = :{key}" for key in update_data.keys()]
    query = f"""
        UPDATE products 
        SET {', '.join(set_clauses)} 
        WHERE id = :product_id 
        RETURNING id, name, description, price, stock, created_at
    """
    values = {**update_data, "product_id": product_id}
    row = await database.fetch_one(query=query, values=values)
    return format_product_row(row)

@router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    query = "DELETE FROM products WHERE id = :id RETURNING id"
    row = await database.fetch_one(query=query, values={"id": product_id})
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully", "id": product_id}

@router.post("/products/{product_id}/buy", response_model=ProductResponse, status_code=201)
async def buy_product(product_id: int):
    # Verify product exists
    query_check = "SELECT * FROM products WHERE id = :id"
    row = await database.fetch_one(query=query_check, values={"id": product_id})
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check stock
    if row["stock"] <= 0:
        raise HTTPException(status_code=400, detail="Product is out of stock")
        
    # Decrement stock by 1
    query_update = """
        UPDATE products 
        SET stock = stock - 1 
        WHERE id = :id 
        RETURNING id, name, description, price, stock, created_at
    """
    updated_row = await database.fetch_one(query=query_update, values={"id": product_id})
    return format_product_row(updated_row)
