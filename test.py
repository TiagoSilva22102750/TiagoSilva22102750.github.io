import numpy as np
import pandas as pd

# Number of points for the equidistant distribution
n_points = 10

# Define the center of the distribution (can be the center of the purple box, for example)
center_x = 16  # Center X-coordinate
center_y = 13  # Center Y-coordinate

# Define the radius of the circle
radius = 2

# Generate the points in a circular distribution with equal spacing
angles = np.linspace(0, 2 * np.pi, n_points, endpoint=False)
x_coords = center_x + radius * np.cos(angles)
y_coords = center_y + radius * np.sin(angles)

# Add small random noise to the points to make them less perfect if needed
noise_x = np.random.uniform(-0.1, 0.1, n_points)
noise_y = np.random.uniform(-0.1, 0.1, n_points)

x_coords += noise_x
y_coords += noise_y

# Convert to DataFrame
df = pd.DataFrame({'x': x_coords, 'y': y_coords})

# Save to CSV
df.to_csv("equidistant-distribution.csv", index=False)

print("Equidistant distribution saved to 'equidistant-distribution.csv'.")