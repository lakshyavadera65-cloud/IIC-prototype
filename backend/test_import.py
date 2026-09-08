import io
import csv
import openpyxl
from copy import deepcopy

from app.core.factory_state import factory_state
from app.services.import_parser import FactoryImportParser
from app.models.import_model import ImportType, DuplicateStrategy, ImportConfirmRequest
from app.engines.pulse_engine import PulseEngine
from app.engines.impact_engine import ImpactEngine


def test_import_feature():
    print("=================================================================")
    print("PULSE - FACTORY DATA IMPORT ENGINE VERIFICATION SUITE")
    print("=================================================================\n")

    # Clean starting baseline
    factory_state.reset(hard_reset=True)
    baseline_machine_count = len(factory_state.machines)
    baseline_order_count = len(factory_state.orders)
    baseline_schedule_count = len(factory_state.schedule)
    parser = FactoryImportParser(factory_state)

    print(f"--- [TEST 1] Baseline Verified: {baseline_machine_count} machines, {baseline_order_count} orders, {baseline_schedule_count} tasks ---")
    assert baseline_machine_count == 7
    assert baseline_order_count == 7
    assert baseline_schedule_count == 17
    print("  [OK] Baseline state clean.\n")

    # ----------------------------------------------------
    # TEST 2: Valid Machines CSV Preview
    # ----------------------------------------------------
    print("--- [TEST 2] Parsing Valid Machines CSV ---")
    csv_machines = (
        "machine_id,machine_name,machine_type,department,status,capacity,capabilities,utilization,overtime_available,overtime_cost_per_hour\n"
        "CNC-03,CNC Machine 03,Precision CNC,Precision Machining,OPERATIONAL,60,Milling;Drilling;Gear Machining,65,true,2000\n"
        "CNC-04,CNC Machine 04,CNC Lathe,Precision Machining,OPERATIONAL,45,Turning;Boring,70,true,1800\n"
        "FIN-02,Precision Polish Station,Surface Finishing,Finishing,OPERATIONAL,50,Polishing;Deburring,60,false,0\n"
    )
    file_bytes = csv_machines.encode("utf-8")
    preview = parser.generate_preview(file_bytes, "new_machines.csv", ImportType.MACHINES)

    assert preview.total_detected == 3
    assert preview.valid_count == 3
    assert preview.error_count == 0
    assert preview.can_import is True
    print(f"  [OK] Valid machines CSV parsed: {preview.valid_count}/3 valid, 0 errors.\n")

    # ----------------------------------------------------
    # TEST 3: Validation & Error Detection
    # ----------------------------------------------------
    print("--- [TEST 3] Testing Error Detection on Invalid Machines CSV ---")
    csv_invalid = (
        "machine_id,machine_name,machine_type,status,capacity\n"
        "CNC-02,Duplicate of Baseline,Precision CNC,operational,30\n"  # duplicate of existing baseline
        "BAD-01,Negative Capacity,CNC Machine,operational,-10\n"     # capacity <= 0
        "BAD-02,Bad Status,CNC Machine,exploding,25\n"               # invalid status
        "DUP-01,Duplicate in File,CNC Machine,operational,25\n"      # duplicate in file 1
        "DUP-01,Duplicate in File Again,CNC Machine,operational,25\n"# duplicate in file 2
    )
    prev_err = parser.generate_preview(csv_invalid.encode("utf-8"), "invalid.csv", ImportType.MACHINES)
    print(f"  * Total Detected: {prev_err.total_detected}")
    print(f"  * Valid: {prev_err.valid_count}")
    print(f"  * Duplicates: {prev_err.duplicate_count}")
    print(f"  * Errors: {prev_err.error_count}")
    print(f"  * Warnings: {prev_err.warning_count}")

    # Should detect CNC-02 as duplicate warning, BAD-01 negative cap as error, BAD-02 as error, DUP-01 duplicate as error
    error_msgs = [e.message for e in prev_err.errors]
    assert any("already exists in factory" in m for m in error_msgs)
    assert any("greater than 0" in m for m in error_msgs)
    assert any("Invalid status" in m for m in error_msgs)
    assert any("Duplicate machine_id 'DUP-01'" in m for m in error_msgs)
    assert prev_err.can_import is False
    print("  [OK] All data errors and duplicates properly flagged!\n")

    # ----------------------------------------------------
    # TEST 4: Valid Machines Excel (.xlsx)
    # ----------------------------------------------------
    print("--- [TEST 4] Parsing Valid Machines Excel (.xlsx) ---")
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Machines"
    ws.append(["machine_id", "machine_name", "machine_type", "capacity", "capabilities"])
    ws.append(["CNC-05", "5-Axis Machining Center", "Precision CNC", 80, "5-Axis Milling;CNC Machining"])
    ws.append(["ASM-C", "High-Speed Assembly Cell", "Assembly", 35, "Assembly;Fastening"])
    buf = io.BytesIO()
    wb.save(buf)
    xlsx_bytes = buf.getvalue()

    preview_xlsx = parser.generate_preview(xlsx_bytes, "machinery.xlsx", ImportType.MACHINES)
    assert preview_xlsx.total_detected == 2
    assert preview_xlsx.valid_count == 2
    assert preview_xlsx.can_import is True
    print(f"  [OK] Excel .xlsx parsed: {preview_xlsx.valid_count}/2 valid records detected.\n")

    # ----------------------------------------------------
    # TEST 5: Confirm Import Machines & Duplicate Strategies
    # ----------------------------------------------------
    print("--- [TEST 5] Confirming Machine Imports & Strategy Handling ---")
    # 5.1: Import new machines (CNC-03, CNC-04)
    added, updated, skipped = factory_state.import_machines(preview.parsed_data["machines"], strategy="skip")
    assert added == 3
    assert len(factory_state.machines) == baseline_machine_count + 3
    print(f"  [OK] Added {added} new machines. Live count: {len(factory_state.machines)}")

    # 5.2: Test SKIP duplicate strategy
    dup_test = [
        {"id": "CNC-03", "name": "CNC Machine 03 - New Info", "capacity_per_hour": 99, "type": "CNC", "capabilities": ["Milling"]},
        {"id": "CNC-06", "name": "Brand New CNC 06", "capacity_per_hour": 40, "type": "CNC", "capabilities": ["Turning"]}
    ]
    added, updated, skipped = factory_state.import_machines(dup_test, strategy="skip")
    assert added == 1  # CNC-06
    assert skipped == 1  # CNC-03 skipped
    cnc03 = factory_state.get_machine("CNC-03")
    assert cnc03["capacity_per_hour"] == 60  # unchanged
    print("  [OK] 'skip' strategy preserved existing machine without overwriting.")

    # 5.3: Test UPDATE duplicate strategy
    update_test = [
        {"id": "CNC-03", "name": "CNC Machine 03 Updated", "capacity_per_hour": 75, "type": "Precision CNC", "capabilities": ["Gear Machining"]}
    ]
    added, updated, skipped = factory_state.import_machines(update_test, strategy="update")
    assert updated == 1
    cnc03_up = factory_state.get_machine("CNC-03")
    assert cnc03_up["capacity_per_hour"] == 75
    assert cnc03_up["name"] == "CNC Machine 03 Updated"
    print("  [OK] 'update' strategy correctly updated existing machine.")

    # 5.4: Test REJECT duplicate strategy
    try:
        factory_state.import_machines(update_test, strategy="reject")
        assert False, "Should have thrown ValueError for reject strategy"
    except ValueError as e:
        assert "already exists" in str(e)
        print("  [OK] 'reject' strategy successfully prevented import on conflict.\n")

    # ----------------------------------------------------
    # TEST 6: Production Orders CSV Import
    # ----------------------------------------------------
    print("--- [TEST 6] Parsing & Confirming Production Orders CSV ---")
    csv_orders = (
        "order_id,product,quantity,priority,deadline,customer,value\n"
        "ORD-108,AX-100,350,High,24,Apex Mobility,250000\n"
        "ORD-109,AX-200,120,Critical,14,AeroTech Systems,320000\n"
    )
    prev_ord = parser.generate_preview(csv_orders.encode("utf-8"), "orders.csv", ImportType.ORDERS)
    assert prev_ord.valid_count == 2
    o_add, o_up, o_sk = factory_state.import_orders(prev_ord.parsed_data["orders"], strategy="skip")
    assert o_add == 2
    assert len(factory_state.orders) == baseline_order_count + 2
    ord109 = factory_state.get_order("ORD-109")
    assert ord109 is not None
    assert ord109["priority"] == "Critical"
    assert ord109["priority_weight"] == 4
    print(f"  [OK] Added {o_add} orders. Live order count: {len(factory_state.orders)}\n")

    # ----------------------------------------------------
    # TEST 7: Production Schedule CSV Import
    # ----------------------------------------------------
    print("--- [TEST 7] Parsing & Confirming Production Schedule CSV ---")
    csv_schedule = (
        "task_id,order_id,machine_id,operation,start_time,end_time\n"
        "SCH-018,ORD-108,CNC-03,CNC_MACHINING,0,4\n"
        "SCH-019,ORD-109,CNC-03,CNC_MACHINING,4,8\n"
    )
    prev_sch = parser.generate_preview(csv_schedule.encode("utf-8"), "schedule.csv", ImportType.SCHEDULE)
    assert prev_sch.valid_count == 2
    s_add, s_up, s_sk = factory_state.import_schedule(prev_sch.parsed_data["schedule"], strategy="skip")
    assert s_add == 2
    assert len(factory_state.schedule) == baseline_schedule_count + 2
    print(f"  [OK] Added {s_add} schedule tasks. Live schedule count: {len(factory_state.schedule)}\n")

    # ----------------------------------------------------
    # TEST 8: Complete Factory Excel (.xlsx) Multi-Sheet Workbook
    # ----------------------------------------------------
    print("--- [TEST 8] Parsing Complete Factory Multi-Sheet Excel Workbook ---")
    wb_complete = openpyxl.Workbook()
    wb_complete.remove(wb_complete.active)

    ws_m = wb_complete.create_sheet(title="Machines")
    ws_m.append(["machine_id", "machine_name", "machine_type", "capacity", "capabilities"])
    ws_m.append(["CNC-99", "Special CNC 99", "Precision CNC", 90, "Milling;Turning;Gear Machining"])

    ws_o = wb_complete.create_sheet(title="Orders")
    ws_o.append(["order_id", "product", "quantity", "priority", "deadline"])
    ws_o.append(["ORD-199", "AX-200", 50, "Critical", 18])

    ws_s = wb_complete.create_sheet(title="Schedule")
    ws_s.append(["task_id", "order_id", "machine_id", "operation", "start_time", "end_time"])
    ws_s.append(["SCH-199", "ORD-199", "CNC-99", "CNC_MACHINING", 0, 4])

    buf_comp = io.BytesIO()
    wb_complete.save(buf_comp)
    comp_bytes = buf_comp.getvalue()

    prev_comp = parser.generate_preview(comp_bytes, "complete_plant.xlsx", ImportType.COMPLETE_FACTORY)
    assert len(prev_comp.sheets_detected) == 3
    print(f"  * Detected Sheets: {[s.sheet_name for s in prev_comp.sheets_detected]}")
    assert prev_comp.total_detected == 3
    assert prev_comp.valid_count == 3
    assert prev_comp.error_count == 0

    # Confirm complete factory import
    res_comp = factory_state.import_complete_dataset(
        machines=prev_comp.parsed_data["machines"],
        orders=prev_comp.parsed_data["orders"],
        schedule=prev_comp.parsed_data["schedule"],
        strategy="skip"
    )
    assert res_comp["machines"]["added"] == 1
    assert res_comp["orders"]["added"] == 1
    assert res_comp["schedule"]["added"] == 1
    print("  [OK] Complete factory multi-sheet Excel dataset imported successfully!\n")

    # ----------------------------------------------------
    # TEST 9: Dynamic Factory Intelligence Integration
    # ----------------------------------------------------
    print("--- [TEST 9] Dynamic Intelligence Integration (CNC-99 as Alternative) ---")
    # CNC-99 has capacity 90 (higher than CNC-01 capacity 25) and has Gear Machining capability
    impact_engine = ImpactEngine(factory_state)
    sim_event = {
        "event_id": "EVT-TEST",
        "event_type": "machine_failure",
        "entity_id": "CNC-02",
        "duration_hours": 6.0
    }
    impact_result = impact_engine.analyze_event(sim_event)
    selected_alt = impact_result.get("capacity_impact", {}).get("alternative_machine_id")
    print(f"  * Failed: CNC-02")
    print(f"  * Dynamically Selected Best Alternative: {selected_alt}")
    assert selected_alt == "CNC-99", f"Expected CNC-99 (capacity 90) to be selected as best alternative, got: {selected_alt}"
    print("  [OK] Factory Intelligence Model dynamically prioritized imported workstation CNC-99!\n")

    # ----------------------------------------------------
    # TEST 10: Persistence & Reset Handling
    # ----------------------------------------------------
    print("--- [TEST 10] Testing Persistence & Reset Behavior ---")
    # Soft reset preserves custom machines, orders, schedule
    factory_state.reset(hard_reset=False)
    assert factory_state.get_machine("CNC-99") is not None
    assert factory_state.get_order("ORD-199") is not None
    print("  [OK] Soft reset preserved imported custom entities while clearing disruption state.")

    # Hard reset wipes all custom entities
    factory_state.reset(hard_reset=True)
    assert len(factory_state.machines) == baseline_machine_count
    assert len(factory_state.orders) == baseline_order_count
    assert len(factory_state.schedule) == baseline_schedule_count
    assert factory_state.get_machine("CNC-99") is None
    print("  [OK] Hard reset restored pristine 7-machine baseline.\n")

    # ----------------------------------------------------
    # TEST 11: Template Downloads
    # ----------------------------------------------------
    print("--- [TEST 11] Testing Pre-formatted Template Generation ---")
    for t_type in ("machines", "orders", "schedule", "complete_factory"):
        csv_b, c_type, fname = FactoryImportParser.get_template(t_type, "csv")
        assert len(csv_b) > 0
        assert "csv" in c_type or "text" in c_type
        xlsx_b, x_type, xname = FactoryImportParser.get_template(t_type, "xlsx")
        assert len(xlsx_b) > 0
        assert "spreadsheet" in x_type
    print("  [OK] Templates generated for all 4 types in CSV and Excel formats.\n")

    print("=================================================================")
    print("ALL IMPORT ENGINE TESTS PASSED WITH 100% SUCCESS!")
    print("=================================================================")


if __name__ == "__main__":
    test_import_feature()
