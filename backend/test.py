from services.landing_page_fetcher import fetch_landing_page
from ai.agents import landing_page_agent


page_data = fetch_landing_page(
    "https://launch-pilot-flax.vercel.app/"
)

result = landing_page_agent(
    page_data,
    None,
)

print(result)