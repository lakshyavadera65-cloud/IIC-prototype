from app.core.factory_state import factory_state
from app.engines.impact_engine import ImpactEngine


impact_engine = ImpactEngine(factory_state)


event = {

    "event_id": "EVT-001",

    "event_type": "machine_failure",

    "entity_id": "CNC-02",

    "duration_hours": 6,

    "severity": "critical"
}


result = impact_engine.analyze_event(event)


print("\n--- IMPACT ANALYSIS ---\n")

print("Affected Resources:")
print(result["affected_resources"])


print("\nAffected Orders:")
print(result["affected_orders"])


print("\nRisks:")

for risk in result["risks"]:

    print(
        f"{risk['order_id']} | "
        f"{risk['priority']} | "
        f"{risk['risk_level']}"
    )