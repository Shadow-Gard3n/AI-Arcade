from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.contexto_routes import router as contexto_router

app = FastAPI(title="AI Arcade API")

# Setup CORS to allow your React app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # This is the default port for Vite/React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the routes we made
app.include_router(contexto_router, prefix="/api")

# A simple check to make sure the server is alive
@app.get("/")
def read_root():
    return {"message": "AI Arcade API is running!"}