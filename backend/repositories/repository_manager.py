from database.supabase_fetcher import supabase

from repositories.user_repository import UserRepository
from repositories.audit_repository import AuditRepository

user_repository = UserRepository(supabase)
audit_repository = AuditRepository(supabase)