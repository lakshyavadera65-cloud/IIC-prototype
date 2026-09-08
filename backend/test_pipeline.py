"""
End-to-End Pipeline Verification Test for PULSE
Tests the entire lifecycle of Scenario A:
Baseline Healthy Factory -> CNC-02 Failure -> Multi-Agent Pipeline -> Plan Ranking -> Execution -> Rebound -> Grounded Chat
"""

import sys
from app.core.factory_state import factory_state
from app.agents.sentinel import SentinelAgent
from app.agents.orchestrator import AgentOrchestrator
from app.engines.pulse_engine import PulseEngine
from app.engines.chat_engine import GroundedChatEngine


def run_test():
    print("=================================================================")
    print("PULSE - MULTI-AGENT FACTORY OPERATIONS INTELLIGENCE TEST PIPELINE")
    print("=================================================================\n")

    # Ensure factory starts in clean state
    factory_state.reset()
    pulse_engine = PulseEngine(factory_state)
    chat_engine = GroundedChatEngine(factory_state)
    orchestrator = AgentOrchestrator(factory_state)
    sentinel = SentinelAgent(factory_state)

    # -----------------------------------------------------------------
    # TEST 1: SENTINEL RULE-BASED PARSING & ROOT CAUSE CATEGORIZATION
    # -----------------------------------------------------------------
    print("--- [TEST 1] Testing Sentinel Agent Rule-Based Parsing & Root Cause Taxonomy ---")
    raw_alert = "URGENT MACHINE ALERT: CNC-02 gearbox vibration exceeded safe operating limits. Machine shut down automatically. Estimated repair time: 6 hours."
    parsed = sentinel.parse_event(raw_alert, event_id="EVT-001")
    assert parsed["event_id"] == "EVT-001", "Event ID mismatch"
    assert parsed["event_type"] == "machine_failure", f"Expected machine_failure, got {parsed['event_type']}"
    assert parsed["entity_id"] == "CNC-02", f"Expected CNC-02, got {parsed['entity_id']}"
    assert parsed["duration_hours"] == 6.0, f"Expected 6.0 hours, got {parsed['duration_hours']}"
    assert parsed["severity"] == "critical", f"Expected critical, got {parsed['severity']}"
    assert parsed["root_cause_category"] == "equipment_failure", f"Expected equipment_failure, got {parsed.get('root_cause_category')}"
    print(f"  [OK] Machine failure parsed successfully: {parsed['entity_id']} ({parsed['duration_hours']}h, {parsed['severity']}, category={parsed['root_cause_category']})")

    supplier_alert = "SUPPLIER DELAY: Shipment of M-AL from MetalCore Supplies delayed by 24 hours."
    parsed_sup = sentinel.parse_event(supplier_alert)
    assert parsed_sup["event_type"] == "supplier_delay"
    assert parsed_sup["entity_id"] == "M-AL"
    assert parsed_sup["root_cause_category"] == "supply_chain", f"Expected supply_chain, got {parsed_sup.get('root_cause_category')}"
    print(f"  [OK] Supplier delay parsed successfully: {parsed_sup['entity_id']} ({parsed_sup['duration_hours']}h, category={parsed_sup['root_cause_category']})")

    shortage_alert = "MATERIAL SHORTAGE: Precision Seals M-SEAL below safety stock limit."
    parsed_mat = sentinel.parse_event(shortage_alert)
    assert parsed_mat["event_type"] == "material_shortage"
    assert parsed_mat["entity_id"] == "M-SEAL"
    assert parsed_mat["root_cause_category"] == "supply_chain"
    print(f"  [OK] Material shortage parsed successfully: {parsed_mat['entity_id']} (category={parsed_mat['root_cause_category']})")

    it_alert = "CRITICAL IT ALERT: MES database synchronization failure on Assembly Line A (ASM-A). Automated dispatch halted for 4 hours."
    parsed_it = sentinel.parse_event(it_alert)
    assert parsed_it["root_cause_category"] == "it_software", f"Expected it_software, got {parsed_it.get('root_cause_category')}"
    print(f"  [OK] IT/Software failure parsed successfully: category={parsed_it['root_cause_category']}")

    human_alert = "OPERATOR ERROR: Setup parameter misconfiguration on FIN-01 by operator caused surface roughness defect."
    parsed_human = sentinel.parse_event(human_alert)
    assert parsed_human["root_cause_category"] == "human_error", f"Expected human_error, got {parsed_human.get('root_cause_category')}"
    print(f"  [OK] Human error parsed successfully: category={parsed_human['root_cause_category']}")
    print("  [OK] All Sentinel tests and root cause categorizations passed!\n")

    # -----------------------------------------------------------------
    # TEST 2: BASELINE HEALTHY FACTORY PULSE
    # -----------------------------------------------------------------
    print("--- [TEST 2] Verifying Baseline Healthy Factory Pulse ---")
    baseline_pulse = pulse_engine.calculate_pulse()
    print(f"  * Pulse Score: {baseline_pulse.pulse_score}/100")
    print(f"  * Status: {baseline_pulse.status}")
    print(f"  * Components: Machine={baseline_pulse.components.machine_health}%, Stability={baseline_pulse.components.schedule_stability}%, Risk={baseline_pulse.components.order_risk}%, Inventory={baseline_pulse.components.inventory_health}%")
    assert baseline_pulse.pulse_score >= 88.0, f"Expected healthy pulse >= 88, got {baseline_pulse.pulse_score}"
    assert baseline_pulse.status == "STABLE", f"Expected STABLE, got {baseline_pulse.status}"
    print("  [OK] Baseline healthy pulse verified!\n")

    # -----------------------------------------------------------------
    # TEST 3: TRIGGER SCENARIO A (MULTI-AGENT PIPELINE)
    # -----------------------------------------------------------------
    print("--- [TEST 3] Triggering Scenario A via Agent Orchestrator ---")
    pipeline_result = orchestrator.trigger_scenario_a()

    assert pipeline_result["event_id"] == "EVT-001"
    assert pipeline_result["event"]["root_cause_category"] == "equipment_failure", f"Expected equipment_failure, got {pipeline_result['event'].get('root_cause_category')}"
    print(f"  * Root Cause Category: {pipeline_result['event']['root_cause_category']}")
    print("  * Agent Execution Logs:")
    for log in pipeline_result["agent_logs"]:
        print(f"    [{log['agent']}] ({log['status']}): {log['message']}")
    assert len(pipeline_result["agent_logs"]) == 4, "Expected 4 agent execution log steps"
    print("  [OK] Multi-agent pipeline executed completely!\n")

    # -----------------------------------------------------------------
    # TEST 4: VERIFY IMPACT ANALYSIS
    # -----------------------------------------------------------------
    print("--- [TEST 4] Verifying Impact Engine Results ---")
    impact = pipeline_result["impact"]
    assert "CNC-02" in impact["affected_resources"], "CNC-02 should be in affected resources"
    assert impact["capacity_impact"]["lost_capacity_units"] == 180.0, f"Expected 180 units lost, got {impact['capacity_impact']['lost_capacity_units']}"
    assert impact["capacity_impact"]["alternative_machine_id"] == "CNC-01", "Alternative machine should be CNC-01"

    affected_orders = impact["affected_order_ids"]
    assert "ORD-103" in affected_orders, "ORD-103 should be affected"
    assert "ORD-104" in affected_orders, "ORD-104 should be affected"
    print(f"  * Affected Orders: {affected_orders}")
    print(f"  * Lost Capacity: {impact['capacity_impact']['lost_capacity_units']} units")
    print(f"  * Alternative Machine: {impact['capacity_impact']['alternative_machine_id']}")
    print(f"  * Downstream Stations Starved: {[d['resource'] for d in impact['downstream_impact']]}")
    print("  [OK] Impact analysis accurate and complete!\n")

    # -----------------------------------------------------------------
    # TEST 5: VERIFY RECOVERY PLANS & ORACLE SIMULATION
    # -----------------------------------------------------------------
    print("--- [TEST 5] Verifying Recovery Plans and Oracle Simulation ---")
    plans = pipeline_result["recovery_plans"]
    sims = pipeline_result["simulation_results"]
    rec_id = pipeline_result["recommended_plan_id"]
    reasoning = pipeline_result["reasoning"]

    plan_ids = [p["plan_id"] for p in plans]
    assert "PLAN-A" in plan_ids and "PLAN-B" in plan_ids and "PLAN-C" in plan_ids, "Plans A, B, and C must be generated"
    print(f"  * Generated Plans: {plan_ids}")

    for sim in sims:
        print(f"    - {sim['plan_id']}: Score={sim['score']:.2f}, Cost=${sim['estimated_cost']:,.0f}, Delay={sim['delay_hours']}h, Violations={sim['deadline_violations']}")

    assert rec_id == "PLAN-B", f"Expected PLAN-B to be recommended, got {rec_id}"
    print(f"\n  * Recommended Plan: {rec_id}")
    print("  * Explainable Rationale:")
    for r in reasoning:
        print(f"    - {r}")
    print("  [OK] Oracle plan ranking and explainable recommendation verified!\n")

    # -----------------------------------------------------------------
    # TEST 6: VERIFY FACTORY PULSE DEGRADATION
    # -----------------------------------------------------------------
    print("--- [TEST 6] Verifying Degraded Factory Pulse ---")
    degraded_pulse = pulse_engine.calculate_pulse()
    print(f"  * Degraded Pulse Score: {degraded_pulse.pulse_score}/100")
    print(f"  * Degraded Status: {degraded_pulse.status}")
    print(f"  * Components: Machine={degraded_pulse.components.machine_health}%, Stability={degraded_pulse.components.schedule_stability}%, Risk={degraded_pulse.components.order_risk}%")
    assert 60.0 <= degraded_pulse.pulse_score <= 75.0, f"Expected degraded pulse between 60 and 75, got {degraded_pulse.pulse_score}"
    assert degraded_pulse.status in ("CRITICAL ATTENTION", "DEGRADED"), f"Expected degraded status, got {degraded_pulse.status}"
    print("  [OK] Factory pulse realistically degraded during incident!\n")

    # -----------------------------------------------------------------
    # TEST 7: EXECUTE RECOVERY PLAN (PLAN-B)
    # -----------------------------------------------------------------
    print("--- [TEST 7] Executing Recovery Plan (PLAN-B) ---")
    exec_result = factory_state.apply_recovery_plan("PLAN-B")
    assert exec_result["status"] == "success"
    print(f"  * Execution Message: {exec_result['message']}")
    print(f"  * Applied Actions:")
    for act in exec_result["applied_actions"]:
        print(f"    - {act}")

    # Check updated schedule
    rerouted_tasks = [t for t in factory_state.schedule if t.get("order_id") == "ORD-103" and t.get("resource_id") == "CNC-01"]
    assert len(rerouted_tasks) > 0, "ORD-103 tasks should now be assigned to CNC-01"
    print("  [OK] Schedule successfully updated and reallocated!\n")

    # -----------------------------------------------------------------
    # TEST 8: VERIFY REBOUNDED FACTORY PULSE
    # -----------------------------------------------------------------
    print("--- [TEST 8] Verifying Rebounded Factory Pulse Post-Execution ---")
    recovered_pulse = pulse_engine.calculate_pulse()
    print(f"  * Recovered Pulse Score: {recovered_pulse.pulse_score}/100")
    print(f"  * Recovered Status: {recovered_pulse.status}")
    print(f"  * Components: Machine={recovered_pulse.components.machine_health}%, Stability={recovered_pulse.components.schedule_stability}%, Risk={recovered_pulse.components.order_risk}%")
    assert recovered_pulse.pulse_score >= 86.0, f"Expected recovered pulse >= 86, got {recovered_pulse.pulse_score}"
    assert recovered_pulse.pulse_score > degraded_pulse.pulse_score, "Recovered pulse must be strictly higher than degraded"
    assert recovered_pulse.status == "STABLE", f"Expected STABLE status, got {recovered_pulse.status}"
    print("  [OK] Factory pulse successfully recovered after executing PLAN-B!\n")

    # -----------------------------------------------------------------
    # TEST 9: GROUNDED FACTORY CHAT
    # -----------------------------------------------------------------
    print("--- [TEST 9] Testing Grounded Factory Chat Queries ---")

    test_queries = [
        "What happened to CNC-02?",
        "Why is Line 2 delayed?",
        "Which orders are currently at risk?",
        "Why was PLAN-B recommended?",
        "How many hours of downtime are expected?",
        "What is the weather in Tokyo?"
    ]

    for q in test_queries:
        resp = chat_engine.answer_query(q)
        print(f"\n  Q: \"{q}\"")
        print(f"  Intent: {resp.intent} (Confidence: {resp.confidence})")
        print(f"  A: {resp.answer.splitlines()[0]}...")
        if "Tokyo" in q:
            assert resp.answer == "I don't have enough factory data to answer that.", "Unknown question should trigger fallback"
        else:
            assert resp.answer != "I don't have enough factory data to answer that.", "Valid factory question should have grounded answer"

    print("\n  [OK] Grounded chat answered all factory questions correctly without hallucinating!\n")

    # -----------------------------------------------------------------
    # TEST 10: MULTI-CATEGORY SCENARIO COVERAGE (B, C, D)
    # -----------------------------------------------------------------
    print("--- [TEST 10] Verifying Scenarios B, C, and D Real-World Categories ---")
    
    # Scenario B: Supplier Delay
    factory_state.reset()
    res_b = orchestrator.trigger_scenario_b()
    assert res_b["event"]["root_cause_category"] == "supply_chain", f"Expected supply_chain for Scenario B, got {res_b['event'].get('root_cause_category')}"
    print(f"  * Scenario B: {res_b['event']['entity_id']} -> category={res_b['event']['root_cause_category']} (~12% share)")

    # Scenario C: Material Shortage
    factory_state.reset()
    res_c = orchestrator.trigger_scenario_c()
    assert res_c["event"]["root_cause_category"] == "supply_chain", f"Expected supply_chain for Scenario C, got {res_c['event'].get('root_cause_category')}"
    print(f"  * Scenario C: {res_c['event']['entity_id']} -> category={res_c['event']['root_cause_category']} (~12% share)")

    # Scenario D: IT / Software Failure
    factory_state.reset()
    res_d = orchestrator.trigger_scenario_d()
    assert res_d["event"]["root_cause_category"] == "it_software", f"Expected it_software for Scenario D, got {res_d['event'].get('root_cause_category')}"
    print(f"  * Scenario D: {res_d['event']['entity_id']} -> category={res_d['event']['root_cause_category']} (~8% share)")
    print("  [OK] All 4 real-world categories successfully tested across Scenarios A, B, C, D!\n")

    print("=================================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! FULL PIPELINE READY FOR DEMO.")
    print("=================================================================")


if __name__ == "__main__":
    run_test()
