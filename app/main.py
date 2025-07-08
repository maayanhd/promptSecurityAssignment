from fastapi import FastAPI
from app.api.endpoints import router
from fastapi.middleware.cors import CORSMiddleware
from app.core import logging_config

app = FastAPI(title="PDF Prompt Inspector")
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "chrome-extension://gjfblfegajdlhakocmmoimepdlodafpd"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
