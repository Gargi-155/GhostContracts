from fastapi import FastAPI

app = FastAPI(
    title="Ghost Contracts API",
    description="AI-assisted legal document risk analysis",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "Ghost Contracts API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}