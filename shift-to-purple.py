import pandas as pd
import numpy as np

# Load the given points
data = pd.DataFrame({
    'x': [17.990296473316054, 17.69410319784902, 16.614525984867722, 15.46052263266045,
          14.282870316410628, 13.946028241551499, 14.472713947440809, 15.404610262688331,
          16.592670917176267, 17.708910519469356],
    'y': [12.99462910988086, 14.21772887250382, 14.873729818298344, 14.81477299859538,
          14.211389249284858, 12.920275347399622, 11.870809774397088, 11.100391845828506,
          11.041413761328876, 11.859440122126667]
})

# Calculate the center of the current distribution
current_center_x = data['x'].mean()
current_center_y = data['y'].mean()

# Define the purple box bounds
box_left = 9
box_width = 4
box_bottom = 0
box_top = 9

# Calculate the center of the purple box
box_center_x = box_left + box_width / 2
box_center_y = box_bottom + (box_top - box_bottom) / 2

# Calculate the shift vector
shift_x = box_center_x - current_center_x
shift_y = box_center_y - current_center_y

# Shift the points
data['x'] = data['x'] + shift_x
data['y'] = data['y'] + shift_y

# Ensure points fit within the purple box by clamping them to the box bounds
data['x'] = np.clip(data['x'], box_left, box_left + box_width)
data['y'] = np.clip(data['y'], box_bottom, box_top)

# Save the shifted distribution to a new CSV
data.to_csv("shifted-distribution-inside-purple-box.csv", index=False)

print(f"Shifted distribution saved to 'shifted-distribution-inside-purple-box.csv'.")
