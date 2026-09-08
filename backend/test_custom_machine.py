"""
Test suite for Custom Machine Management & Dynamic Intelligence Integration
"""

from app.core.factory_state import factory_state
from app.api.factory import create_machine, update_machine, delete_machine, get_machines, reset_factory
from app.models.machine import MachineCreate, MachineUpdate
from app.agents.orchestrator import AgentOrchestrator
from app.engines.impact_engine import ImpactEngine


def run_custom_machine_tests():
    print("=================================================================")
    print("PULSE - CUSTOM WORKSTATION & DYNAMIC INTELLIGENCE VERIFICATION")
    print("=================================================================\n")

    # Start with clean factory
    reset_factory(hard=True)
    initial_machines = get_machines()
    assert len(initial_machines) == 7, f"Expected 7 baseline machines, got {len(initial_machines)}"
    print(f"--- [TEST 1] Baseline Verified ({len(initial_machines)} machines) ---")

    # 1. ADD CNC-03
    print("\n--- [TEST 2] Adding High-Capacity Workstation CNC-03 ---")
    new_mach_req = MachineCreate(
        id="CNC-03",
        name="CNC Machine 03",
        type="Precision CNC",
        department="Precision Machining",
        status="operational",
        capacity_per_hour=50.0,
        capabilities=["Precision Cutting", "Gear Machining"],
        utilization=70.0,
        overtime_available=True,
        overtime_cost_per_hour=2500.0,
        notes="High-speed dynamic buffer cell for emergency workload absorption."
    )
    res = create_machine(new_mach_req)
    assert res["status"] == "success"
    assert res["machine"]["id"] == "CNC-03"
    assert res["machine"]["capacity_per_hour"] == 50.0

    current_machines = get_machines()
    assert len(current_machines) == 8, f"Expected 8 machines, got {len(current_machines)}"
    assert any(m["id"] == "CNC-03" for m in current_machines), "CNC-03 must be in live machines list"
    print(f"  [OK] Successfully created and registered CNC-03 (Live count: {len(current_machines)})")

    # 2. DUPLICATE CHECK
    print("\n--- [TEST 3] Verifying Duplicate Prevention ---")
    duplicate_prevented = False
    try:
        create_machine(new_mach_req)
    except Exception as e:
        duplicate_prevented = True
        print(f"  [OK] Duplicate machine correctly rejected: {e.detail if hasattr(e, 'detail') else e}")
    assert duplicate_prevented, "Duplicate machine should have been rejected"

    # 3. DYNAMIC INTELLIGENCE & RECOVERY INTEGRATION
    print("\n--- [TEST 4] Testing Dynamic Alternative Selection for CNC-02 Failure ---")
    orchestrator = AgentOrchestrator(factory_state)
    impact_engine = ImpactEngine(factory_state)

    failure_event = {
        "event_id": "EVT-TEST-01",
        "event_type": "machine_failure",
        "entity_id": "CNC-02",
        "duration_hours": 6.0,
        "severity": "critical"
    }
    impact = impact_engine.analyze_event(failure_event)
    alt_id = impact["capacity_impact"]["alternative_machine_id"]
    alt_cap = impact["capacity_impact"]["alternative_capacity_available"]
    print(f"  * Failed Machine: CNC-02")
    print(f"  * Dynamically Selected Alternative: {alt_id}")
    print(f"  * Alternative Capacity Available: {alt_cap} units")
    assert alt_id == "CNC-03", f"Expected CNC-03 (capacity 50) to be chosen over CNC-01 (capacity 25), got {alt_id}"
    assert alt_cap == 300.0, f"Expected 300.0 capacity units, got {alt_cap}"
    print("  [OK] Intelligence system dynamically routed workload to newly added CNC-03!")

    # 4. MULTI-AGENT PIPELINE WITH CNC-03
    print("\n--- [TEST 5] Testing Multi-Agent Pipeline Plans with CNC-03 ---")
    pipeline_res = orchestrator.process_event(failure_event)
    plans = pipeline_res["recovery_plans"]
    assert len(plans) == 3
    plan_b = next(p for p in plans if p["plan_id"] == "PLAN-B")
    # Verify actions route to CNC-03
    rerouted_targets = [a["resource_to"] for a in plan_b["actions"] if a["action_type"] == "reroute_task"]
    print(f"  * Plan B Reroute Targets: {rerouted_targets}")
    assert all(t == "CNC-03" for t in rerouted_targets), f"Expected all reroutes to go to CNC-03, got {rerouted_targets}"
    print("  [OK] Strategist Agent generated plans specifically utilizing CNC-03!")

    # 5. UPDATE MACHINE STATUS
    print("\n--- [TEST 6] Updating Machine Status & Configuration ---")
    update_res = update_machine("CNC-03", MachineUpdate(status="maintenance", capacity_per_hour=48.0))
    assert update_res["status"] == "success"
    assert update_res["machine"]["status"] == "maintenance"
    assert update_res["machine"]["capacity_per_hour"] == 48.0
    print(f"  [OK] Successfully updated CNC-03 status to {update_res['machine']['status']}")

    # 6. DELETE PROTECTION CHECK
    print("\n--- [TEST 7] Testing Deletion Safety on Scheduled Machine ---")
    baseline_protected = False
    try:
        delete_machine("CNC-01")
    except Exception as e:
        baseline_protected = True
        print(f"  [OK] Core scheduled machine protected from deletion: {e.detail if hasattr(e, 'detail') else e}")
    assert baseline_protected, "Scheduled/baseline machine should be protected"

    # 7. CLEAN DELETE OF CNC-03
    print("\n--- [TEST 8] Deleting Workstation CNC-03 ---")
    del_res = delete_machine("CNC-03")
    assert del_res["status"] == "success"
    final_machines = get_machines()
    assert len(final_machines) == 7
    assert not any(m["id"] == "CNC-03" for m in final_machines)
    print(f"  [OK] Successfully deleted CNC-03 (Remaining: {len(final_machines)})")

    # 8. VERIFY RESTORATION OF ORIGINAL ALTERNATIVE (CNC-01)
    print("\n--- [TEST 9] Verifying Fallback to CNC-01 After CNC-03 Removal ---")
    impact_after = impact_engine.analyze_event(failure_event)
    assert impact_after["capacity_impact"]["alternative_machine_id"] == "CNC-01"
    print(f"  [OK] Alternative machine cleanly reverted to CNC-01")

    print("\n=================================================================")
    print("ALL CUSTOM WORKSTATION & INTELLIGENCE TESTS PASSED SUCCESSFULLY!")
    print("=================================================================")


if __name__ == "__main__":
    run_custom_machine_tests()
