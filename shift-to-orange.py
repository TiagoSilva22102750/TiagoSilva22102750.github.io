import pandas as pd
import numpy as np

# Load the given points
data = pd.DataFrame({
    'x': [8.977000000000002, 9.397, 9.957, 10.527000000000001,
          11.097000000000001, 11.637, 12.197000000000001,
          12.507000000000001, 11.567, 12.277000000000001],
    'y': [0.5030000000000001, 1.7630000000000003, 2.543, 3.383,
          4.603, 5.243, 5.763, 6.4830000000000005,
          6.963, 7.753]
})

# Calculate the center of the current distribution
current_center_x = data['x'].mean()
current_center_y = data['y'].mean()

# Define the orange box bounds
box_left = 14
box_width = 4
box_bottom = 9
box_top = 18

# Calculate the center of the orange box
box_center_x = box_left + box_width / 2
box_center_y = box_bottom + (box_top - box_bottom) / 2

# Calculate the shift vector
shift_x = box_center_x - current_center_x
shift_y = box_center_y - current_center_y

# Shift the points
data['x'] = data['x'] + shift_x
data['y'] = data['y'] + shift_y

# Ensure points fit within the orange box by clamping them to the box bounds
data['x'] = np.clip(data['x'], box_left, box_left + box_width)
data['y'] = np.clip(data['y'], box_bottom, box_top)

# Save the shifted distribution to a new CSV
data.to_csv("shifted-distribution-inside-orange-box.csv", index=False)

print(f"Shifted distribution saved to 'shifted-distribution-inside-orange-box.csv'.")
