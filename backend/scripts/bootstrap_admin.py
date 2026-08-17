import sys
import uuid
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from database.supabase_client import supabase_db
from database.models import AccountStatusEnum, RoleEnum
from utils.logging import logger

def bootstrap_admin():
    admin_email = "viswaravindren@gmail.com"
    admin_password = "viswacool21"
    
    logger.info(f"Checking for Super Admin account: '{admin_email}'...")
    
    existing = supabase_db.get_user_by_email(admin_email)
    if existing:
        logger.info(f"Admin account '{admin_email}' already exists.")
        return existing
        
    admin_profile = {
        "id": str(uuid.uuid4()),
        "email": admin_email,
        "password": admin_password,
        "full_name": "Viswa Ravindren (Super Admin)",
        "university_id": "ADM-0001",
        "role": RoleEnum.ADMIN.value,
        "status": AccountStatusEnum.APPROVED.value,
        "department": "ALL",
        "course": "ALL",
        "semester": 0,
        "section": "A"
    }
    
    created = supabase_db.create_user_profile(admin_profile)
    logger.info(f"Super Admin account successfully created for '{admin_email}'.")
    return created

if __name__ == "__main__":
    bootstrap_admin()
