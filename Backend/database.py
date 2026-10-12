"""
Database connection and Supabase client initialization.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import HTTPException
from supabase import create_client, Client

# Resolve .env from Backend/ or project root
backend_env = Path(__file__).resolve().parent / ".env"
root_env = Path(__file__).resolve().parent.parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing Supabase credentials! Please ensure SUPABASE_URL and SUPABASE_KEY are defined in your .env file."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def handle_supabase_error(e: Exception):
    """
    Translates common Supabase / PostgREST exceptions into clear HTTPExceptions.
    """
    err_str = str(e)
    if "PGRST205" in err_str or "schema cache" in err_str or "Could not find the table" in err_str:
        raise HTTPException(
            status_code=500,
            detail=(
                "Supabase table not found in schema cache. "
                "Please run the SQL schema from 'Backend/supabase_schema.sql' in your Supabase SQL Editor."
            )
        )
    raise HTTPException(status_code=500, detail=f"Database error: {err_str}")
