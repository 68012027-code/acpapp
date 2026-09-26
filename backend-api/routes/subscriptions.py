from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import database, get_user_by_email

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

class UpgradeRequest(BaseModel):
    user_email: str
    plan_name: str  # "Pro"
    amount: float   # e.g., 499.00

@router.post("/upgrade")
async def upgrade_subscription(payload: UpgradeRequest):
    user = await get_user_by_email(payload.user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 1. Record payment simulation
    payment_query = """
        INSERT INTO payments (user_email, amount, status)
        VALUES (:email, :amount, 'Completed')
        RETURNING id, amount, status, created_at
    """
    payment = await database.fetch_one(
        payment_query,
        {"email": payload.user_email, "amount": payload.amount}
    )

    # 2. Update user tier to Pro
    await database.execute(
        "UPDATE users SET tier = :tier WHERE email = :email",
        {"tier": payload.plan_name, "email": payload.user_email}
    )

    # 3. Insert or update subscription status
    sub_query = """
        INSERT INTO subscriptions (user_email, plan_name, status)
        VALUES (:email, :plan_name, 'Active')
        RETURNING id, plan_name, status, updated_at
    """
    subscription = await database.fetch_one(
        sub_query,
        {"email": payload.user_email, "plan_name": payload.plan_name}
    )

    return {
        "message": f"Successfully upgraded {payload.user_email} to {payload.plan_name} plan!",
        "tier": payload.plan_name,
        "payment": payment,
        "subscription": subscription
    }

@router.get("/status/{email}")
async def get_subscription_status(email: str):
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    payments = await database.fetch_all(
        "SELECT * FROM payments WHERE user_email = :email ORDER BY created_at DESC",
        {"email": email}
    )
    
    return {
        "email": user["email"],
        "role": user["role"],
        "tier": user["tier"],
        "payment_history": payments
    }