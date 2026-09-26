from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from database import database, get_user_by_email, create_user

router = APIRouter(prefix="/api")

SECRET_KEY = "acp-secret-jwt-key"
ALGORITHM = "HS256"

class AuthRequest(BaseModel):
    email: str
    password: str

def create_access_token(email: str, role: str, tier: str):
    payload = {
        "sub": email,
        "role": role,
        "tier": tier,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", status_code=201)
async def register(payload: AuthRequest):
    if len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    existing_user = await get_user_by_email(payload.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    await create_user(payload.email, hashed_password, role="Customer", tier="Free")
    
    token = create_access_token(payload.email, role="Customer", tier="Free")
    await database.execute(
        "UPDATE users SET token = :token WHERE email = :email",
        {"token": token, "email": payload.email}
    )
    
    return {
        "email": payload.email,
        "role": "Customer",
        "tier": "Free",
        "token": token,
        "message": "User registered successfully"
    }

@router.post("/login")
async def login(payload: AuthRequest):
    user = await get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not bcrypt.checkpw(payload.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token(user['email'], user['role'], user['tier'])
    await database.execute(
        "UPDATE users SET token = :token WHERE email = :email",
        {"token": token, "email": user['email']}
    )
    
    return {
        "email": user['email'],
        "role": user['role'],
        "tier": user['tier'],
        "token": token
    }