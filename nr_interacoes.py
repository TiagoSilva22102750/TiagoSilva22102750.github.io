import json
from collections import defaultdict

# Path to your final_elements.json
input_path = "final_elements.json"

# Load JSON data
with open(input_path, "r", encoding="utf-8") as f:
    elements = json.load(f)

# Count interactions per scatterplot
interaction_counts = defaultdict(int)
for element in elements:
    scatterplot = element.get("scatterplot", "unknown_file")
    if element.get("type") in {"hover", "dragStart", "dragEnd"}:
        interaction_counts[scatterplot] += 1

# Map your logical order to actual filenames
order_map = {
    "-0,7500 normal top": "top-round-uniform/data_-0,7500_normal_round_uniform_top.csv",
    "-0,7500 normal bottom": "bottom-round-uniform/data_-0,7500_normal_round_uniform_bottom.csv",
    "-0,7500 extreme top": "top-round-uniform/data_-0,7500_extreme_round_uniform_top.csv",
    "-0,7500 extreme bottom": "bottom-round-uniform/data_-0,7500_extreme_round_uniform_bottom.csv",

    "-0,5000 normal top": "top-round-uniform/data_-0,5000_normal_round_uniform_top.csv",
    "-0,5000 normal bottom": "bottom-round-uniform/data_-0,5000_normal_round_uniform_bottom.csv",
    "-0,5000 extreme top": "top-round-uniform/data_-0,5000_extreme_round_uniform_top.csv",
    "-0,5000 extreme bottom": "bottom-round-uniform/data_-0,5000_extreme_round_uniform_bottom.csv",

    "-0,2500 normal top": "top-round-uniform/data_-0,2500_normal_round_uniform_top.csv",
    "-0,2500 normal bottom": "bottom-round-uniform/data_-0,2500_normal_round_uniform_bottom.csv",
    "-0,2500 extreme top": "top-round-uniform/data_-0,2500_extreme_round_uniform_top.csv",
    "-0,2500 extreme bottom": "bottom-round-uniform/data_0,2500_extreme_round_uniform_bottom.csv",

    "0,0000 normal top": "top-round-uniform/data_0,0000_normal_round_uniform_top.csv",
    "0,0000 normal bottom": "bottom-round-uniform/data_0,0000_normal_round_uniform_bottom.csv",
    "0,0000 extreme top": "top-round-uniform/data_0,0000_extreme_round_uniform_top.csv",
    "0,0000 extreme bottom": "bottom-round-uniform/data_0,0000_extreme_round_uniform_bottom.csv",

    "0,2500 normal top": "top-round-uniform/data_0,2500_normal_round_uniform_top.csv",
    "0,2500 normal bottom": "bottom-round-uniform/data_0,2500_normal_round_uniform_bottom.csv",
    "0,2500 extreme top": "top-round-uniform/data_0,2500_extreme_round_uniform_top.csv",
    "0,2500 extreme bottom": "bottom-round-uniform/data_0,2500_extreme_round_uniform_bottom.csv",

    "0,5000 normal top": "top-round-uniform/data_0,5000_normal_round_uniform_top.csv",
    "0,5000 normal bottom": "bottom-round-uniform/data_0,5000_normal_round_uniform_bottom.csv",
    "0,5000 extreme top": "top-round-uniform/data_0,5000_extreme_round_uniform_top.csv",
    "0,5000 extreme bottom": "bottom-round-uniform/data_0,5000_extreme_round_uniform_bottom.csv",

    "0,7500 normal top": "top-round-uniform/data_0,7500_normal_round_uniform_top.csv",
    "0,7500 normal bottom": "bottom-round-uniform/data_0,7500_normal_round_uniform_bottom.csv",
    "0,7500 extreme top": "top-round-uniform/data_0,7500_extreme_round_uniform_top.csv",
    "0,7500 extreme bottom": "bottom-round-uniform/data_0,7500_extreme_round_uniform_bottom.csv",
}

# Define the logical order
logical_order = list(order_map.keys())

# Print counts following the logical order
for logical_name in logical_order:
    filename = order_map[logical_name]
    count = interaction_counts.get(filename, 0)
    print(f"{filename}: {count}")
