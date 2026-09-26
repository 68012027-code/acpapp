from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_db, disconnect_db, setup_db
from routes.auth import router as auth_router
from routes.inventory import router as inventory_router
from routes.subscriptions import router as subscriptions_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await setup_db()
    yield
    await disconnect_db()

# Set redirect_slashes=False to prevent CORS issues on redirection
app = FastAPI(title="MedStock API", lifespan=lifespan, redirect_slashes=False)

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(inventory_router, prefix="/api")
app.include_router(subscriptions_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "MedStock Management API"}