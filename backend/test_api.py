"""
FastAPI Route Integration Verification (Standard Library / Direct Route Execution)
"""

from app.api.factory import get_factory_state, get_machines, get_orders, get_schedule, reset_factory
from app.api.events import trigger_demo_scenario, get_alerts, create_event
from app.api.intelligence import get_impact_analysis, get_agent_execution_log, get_factory_pulse
from app.api.recovery import get_recovery_recommendations, execute_recovery_plan
from app.api.chat import handle_factory_chat
from app.models.chat import ChatRequest
from app.models.events import EventCreateRequest


def test_api_routes():
    print("--- Testing Core & Factory Endpoints ---")
    reset_factory()

    state = get_factory_state()
    assert "machines" in state and "pulse" in state
    print(f"  [OK] /api/factory/state -> {len(state['machines'])} machines, Pulse: {state['pulse']['pulse_score']}")

    machines = get_machines()
    assert len(machines) == 7
    print(f"  [OK] /api/factory/machines -> {len(machines)} machines")

    orders = get_orders()
    assert len(orders) == 7
    print(f"  [OK] /api/factory/orders -> {len(orders)} orders")

    schedule = get_schedule()
    assert len(schedule) == 17
    print(f"  [OK] /api/factory/schedule -> {len(schedule)} tasks")

    pulse = get_factory_pulse()
    assert pulse["pulse_score"] >= 90.0
    print(f"  [OK] /api/pulse -> {pulse['pulse_score']} ({pulse['status']})")

    print("\n--- Testing Demo Trigger Scenario A ---")
    demo_res = trigger_demo_scenario("scenario-a")
    assert demo_res["event_id"] == "EVT-001"
    assert demo_res["recommended_plan_id"] == "PLAN-B"
    print(f"  [OK] /api/demo/trigger/scenario-a -> {demo_res['event_id']}, Recommended: {demo_res['recommended_plan_id']}")
    print(f"  [OK] Agent Logs Count: {len(demo_res['agent_logs'])}")

    print("\n--- Testing Intelligence & Recovery Endpoints ---")
    impact = get_impact_analysis("EVT-001")
    assert impact["capacity_impact"]["lost_capacity_units"] == 180.0
    print(f"  [OK] /api/impact/EVT-001 -> Lost capacity: {impact['capacity_impact']['lost_capacity_units']} units")

    agent_logs = get_agent_execution_log("EVT-001")
    assert len(agent_logs["agent_logs"]) == 4
    print(f"  [OK] /api/agents/EVT-001 -> {len(agent_logs['agent_logs'])} log entries")

    recovery = get_recovery_recommendations("EVT-001")
    assert len(recovery["plans"]) == 3
    print(f"  [OK] /api/recovery/EVT-001 -> {len(recovery['plans'])} candidate plans")

    alerts = get_alerts()
    assert len(alerts) >= 1
    print(f"  [OK] /api/alerts -> {len(alerts)} alerts active")

    print("\n--- Testing Recovery Plan Execution ---")
    exec_res = execute_recovery_plan("PLAN-B")
    assert exec_res["status"] == "success"
    print(f"  [OK] /api/recovery/PLAN-B/execute -> New Pulse: {exec_res['pulse']['pulse_score']} ({exec_res['pulse']['status']})")

    print("\n--- Testing Grounded Chat Endpoint ---")
    chat_queries = [
        "Why was PLAN-B recommended?",
        "What happened to CNC-02?",
        "Why is Line 2 delayed?",
        "How many hours of downtime are expected?"
    ]
    for q in chat_queries:
        req = ChatRequest(query=q)
        ans = handle_factory_chat(req)
        print(f"  [OK] /api/chat (\"{q}\") -> [{ans.intent}] {ans.answer[:60]}...")

    print("\n--- Testing Raw Event Ingestion Endpoint ---")
    raw_req = EventCreateRequest(message="URGENT MACHINE ALERT: CNC-01 vibration warning. Needs 2 hours maintenance.")
    event_res = create_event(raw_req)
    assert event_res["event"]["event_type"] == "machine_failure"
    print(f"  [OK] /api/events (Raw alert) -> Event: {event_res['event_id']}, Type: {event_res['event']['event_type']}")

    print("\n=================================================================")
    print("ALL ROUTE FUNCTIONS VERIFIED AND PASSING SUCCESSFULLY!")
    print("=================================================================")


if __name__ == "__main__":
    test_api_routes()
