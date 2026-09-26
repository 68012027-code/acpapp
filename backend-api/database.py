from contextlib import asynccontextmanager
import os
import bcrypt
from databases import Database

POSTGRES_USER = os.getenv("POSTGRES_USER", "temp")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "temp")
POSTGRES_DB = os.getenv("POSTGRES_DB", "advcompro")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "db")

DATABASE_URL = (
    f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
    f"@{POSTGRES_HOST}/{POSTGRES_DB}"
)

database = Database(DATABASE_URL)

async def connect_db():
    await database.connect()

async def disconnect_db():
    await database.disconnect()

async def setup_db():
    # 1. ตาราง Users (เพิ่ม role และ tier สำหรับ Business Logic / Feature Gating)
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            email VARCHAR(255) PRIMARY KEY,
            password TEXT NOT NULL,
            token TEXT,
            role VARCHAR(50) DEFAULT 'Customer', -- Admin, Staff, Customer
            tier VARCHAR(50) DEFAULT 'Free',     -- Free, Pro
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    # 2. ตาราง Inventory Items (ระบบจัดการคลังเวชภัณฑ์)
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS inventory_items (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            quantity INT DEFAULT 0,
            unit_price NUMERIC(10, 2) DEFAULT 0.00,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    # 3. ตาราง Stock Transactions (เบิก/เข้าคลังยา)
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS stock_transactions (
            id SERIAL PRIMARY KEY,
            item_id INT REFERENCES inventory_items(id) ON DELETE CASCADE,
            user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
            transaction_type VARCHAR(20) NOT NULL, -- IN, OUT
            quantity INT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    # 4. ตาราง Subscriptions (จัดการสถานะแพ็กเกจ)
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS subscriptions (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
            plan_name VARCHAR(50) NOT NULL, -- Free, Pro
            status VARCHAR(50) DEFAULT 'Active',
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    # 5. ตาราง Payments (ประวัติการชำระเงินจำลอง)
    await database.execute(
        """
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
            amount NUMERIC(10, 2) NOT NULL,
            status VARCHAR(50) DEFAULT 'Completed',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    # สร้าง Seed Admin / Demo Users
    demo_password = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode("utf-8")
    
    # Create Admin User
    await database.execute(
        """
        INSERT INTO users (email, password, role, tier)
        VALUES (:email, :password, 'Admin', 'Pro')
        ON CONFLICT (email) DO NOTHING
        """,
        {"email": "admin@example.com", "password": demo_password}
    )

    # Create Normal User
    await database.execute(
        """
        INSERT INTO users (email, password, role, tier)
        VALUES (:email, :password, 'Customer', 'Free')
        ON CONFLICT (email) DO NOTHING
        """,
        {"email": "demo@example.com", "password": demo_password}
    )

async def get_user_by_email(email: str):
    return await database.fetch_one(
        "SELECT email, password, token, role, tier, created_at FROM users WHERE email = :email",
        {"email": email},
    )

async def create_user(email: str, password_hash: str, role: str = "Customer", tier: str = "Free"):
    await database.execute(
        "INSERT INTO users (email, password, role, tier) VALUES (:email, :password, :role, :tier)",
        {"email": email, "password": password_hash, "role": role, "tier": tier},
    )