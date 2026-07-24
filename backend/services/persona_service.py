from ai.agents import persona_agent


class PersonaService:

    @staticmethod
    def generate_persona(data):

        try:
            return persona_agent(data)

        except Exception as e:
            print("Persona Error:", e)

            return {
                "executive_summary": "",
                "ideal_customer_profile": "",
                "persona": {},
                "pain_points": [],
                "goals": [],
                "motivations": [],
                "buying_triggers": [],
                "buying_behaviour": "",
                "common_objections": [],
                "marketing_channels": [],
                "messaging_recommendations": [],
                "content_ideas": [],
                "confidence_score": 0,
                "error": str(e)
            }