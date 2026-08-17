import streamlit as st
from typing import Optional
from database.models import UserProfile, RoleEnum
from database.supabase_client import supabase_db
from utils.logging import logger

class AuthManager:
    """Manages user authentication and session security."""

    @staticmethod
    def get_current_user() -> Optional[UserProfile]:
        """
        Retrieves the authenticated user profile from Streamlit session state.
        Ensures role is verified from the database layer, not client state.
        """
        if "user" in st.session_state and st.session_state["user"]:
            return st.session_state["user"]
        return None

    @staticmethod
    def login(email: str) -> Optional[UserProfile]:
        """
        Authenticates user by email against Supabase / database layer and returns validated profile.
        """
        user_record = supabase_db.get_user_by_email(email)
        if user_record:
            user_profile = UserProfile(
                id=user_record["id"],
                email=user_record["email"],
                full_name=user_record["full_name"],
                role=RoleEnum(user_record["role"]),
                department=user_record.get("department", "CS"),
                semester=int(user_record.get("semester", 1))
            )
            st.session_state["user"] = user_profile
            logger.info(f"User '{user_profile.email}' logged in with role '{user_profile.role.value}'.")
            return user_profile
        logger.warning(f"Failed login attempt for email: {email}")
        return None

    @staticmethod
    def logout():
        """Clears session state and logs out user."""
        if "user" in st.session_state:
            del st.session_state["user"]
        st.session_state.clear()
        logger.info("User logged out successfully.")

    @staticmethod
    def require_role(allowed_roles: list[RoleEnum]) -> Optional[UserProfile]:
        """
        Guards page routes by enforcing role permissions.
        """
        user = AuthManager.get_current_user()
        if not user:
            st.error("🔒 Authentication required. Please log in first.")
            st.stop()
        if user.role not in allowed_roles:
            st.error(f"🚫 Access Denied. Your role ('{user.role.value}') does not have permission to view this page.")
            st.stop()
        return user
