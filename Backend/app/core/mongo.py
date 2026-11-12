"""
CareerTrack BD — Dual Database Gateway (MongoDB Atlas + SQLite fallback).
If MONGODB_URI is provided, data reads/writes operate on MongoDB Atlas.
Otherwise, falls back to SQLite.
"""

import os
from typing import Optional, Dict, Any
from pymongo import MongoClient
from app.core.config import settings

mongo_client: Optional[MongoClient] = None
mongo_db = None

def get_mongodb_database():
    global mongo_client, mongo_db
    if mongo_db is not None:
        return mongo_db

    # Check settings or environment
    uri = os.getenv("MONGODB_URI") or getattr(settings, "MONGODB_URI", "")
    if uri:
        try:
            # Ensure query parameters for Atlas
            if "retryWrites" not in uri:
                sep = "&" if "?" in uri else "?"
                uri = f"{uri}{sep}retryWrites=true&w=majority"
            mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            mongo_db = mongo_client["careertrack_bd"]
            print(" Connected to MongoDB Atlas: careertrack_bd")
            return mongo_db
        except Exception as e:
            print(f"⚠️ MongoDB Atlas connection warning: {e}")
            return None
    return None
