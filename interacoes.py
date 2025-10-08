import json

# Replace this with your JSON array (string)
data_json = r''''''

# Parse JSON into Python list
data = json.loads(data_json)

# Filter only items with type == "final"
final_elements = [item for item in data if item.get("type") != "final"]

# Write results to a JSON file
output_path = "final_elements.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(final_elements, f, indent=2, ensure_ascii=False)

print(f"✅ Saved {len(final_elements)} 'final' interactions to {output_path}")