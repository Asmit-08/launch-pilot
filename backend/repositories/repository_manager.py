from database.supabase_fetcher import supabase

from repositories.user_repository import UserRepository
from repositories.audit_repository import AuditRepository
from repositories.usage_repository import UsageRepository

user_repository = UserRepository(supabase)
audit_repository = AuditRepository(supabase)
usage_repository = UsageRepository(supabase)