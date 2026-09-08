import urllib.request
import json
import uuid

# 1. Test multipart preview over live FastAPI server
boundary = f"WebKitBoundary{uuid.uuid4().hex}"
file_path = "sample_import_files/valid_machines.csv"
with open(file_path, "rb") as f:
    file_bytes = f.read()

parts = [
    f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"valid_machines.csv\"\r\nContent-Type: text/csv\r\n\r\n".encode("utf-8"),
    file_bytes,
    f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"import_type\"\r\n\r\nmachines\r\n--{boundary}--\r\n".encode("utf-8")
]
body = b"".join(parts)

req = urllib.request.Request(
    "http://127.0.0.1:8000/api/import/preview",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    method="POST"
)

resp = urllib.request.urlopen(req)
preview_json = json.loads(resp.read().decode())
print("[LIVE HTTP PREVIEW OK]")
print("Total detected:", preview_json["total_detected"])
print("Valid records:", preview_json["valid_count"])
print("Can import:", preview_json["can_import"])

# 2. Test confirm import over live HTTP
confirm_payload = json.dumps({
    "import_type": "machines",
    "duplicate_strategy": "skip",
    "data": preview_json["parsed_data"]
}).encode("utf-8")

req_conf = urllib.request.Request(
    "http://127.0.0.1:8000/api/import/confirm",
    data=confirm_payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)

resp_conf = urllib.request.urlopen(req_conf)
conf_json = json.loads(resp_conf.read().decode())
print("\n[LIVE HTTP CONFIRM OK]")
print("Message:", conf_json["message"])
print("Machines added:", conf_json["machines_added"])
print("New Factory Pulse:", conf_json["pulse_score"])

# 3. Verify updated state over GET /api/factory/machines
req_machs = urllib.request.urlopen("http://127.0.0.1:8000/api/factory/machines")
all_machs = json.loads(req_machs.read().decode())
print("\n[LIVE DIGITAL TWIN VERIFICATION]")
print("Updated total machines in live state:", len(all_machs))
custom_ids = [m["id"] for m in all_machs if m.get("is_custom")]
print("New custom machine IDs present:", custom_ids)
assert "CNC-03" in custom_ids
assert "CNC-04" in custom_ids
assert "ASM-C" in custom_ids
print("\nALL LIVE HTTP IMPORT WORKFLOWS CONFIRMED WORKING PERFECTLY!")
