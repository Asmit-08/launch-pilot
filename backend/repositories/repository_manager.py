from database.supabase_fetcher import supabase

from repositories.user_repository import UserRepository
from repositories.audit_repository import AuditRepository
from repositories.usage_repository import UsageRepository

from repositories.belief_repository import BeliefRepository
from repositories.evidence_repository import EvidenceRepository
from repositories.belief_evidence_repository import BeliefEvidenceRepository
from repositories.objective_repository import ObjectiveRepository
from repositories.decision_repository import DecisionRepository
from repositories.startup_state_repository import StartupStateRepository
from repositories.state_event_repository import StateEventRepository


user_repository = UserRepository(supabase)

audit_repository = AuditRepository(supabase)

usage_repository = UsageRepository(supabase)


# V2 repositories

belief_repository = BeliefRepository(supabase)

evidence_repository = EvidenceRepository(supabase)

belief_evidence_repository = BeliefEvidenceRepository(supabase)

objective_repository = ObjectiveRepository(supabase)

decision_repository = DecisionRepository(supabase)

startup_state_repository = StartupStateRepository(supabase)

state_event_repository = StateEventRepository(supabase)