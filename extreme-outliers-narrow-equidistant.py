import numpy as np
import pandas as pd
from scipy.stats import iqr

# Load the existing data
existing_data = pd.read_csv("data--0043.csv")

# Calculate IQR for x and y using scipy
iqr_x = iqr(existing_data['x'])
iqr_y = iqr(existing_data['y'])

# Calculate Q1 and Q3
q1_x = existing_data['x'].quantile(0.25)
q3_x = existing_data['x'].quantile(0.75)
q1_y = existing_data['y'].quantile(0.25)
q3_y = existing_data['y'].quantile(0.75)

# Define the extreme outlier bounds
x_lower_bound = q1_x - 3 * iqr_x
x_upper_bound = q3_x + 3 * iqr_x
y_lower_bound = q1_y - 3 * iqr_y
y_upper_bound = q3_y + 3 * iqr_y

# Orange box bounds in the data's range
box_left = 14
box_width = 4
box_bottom = 9
box_top = 18

# Calculate the center of the box
box_center_x = box_left + box_width / 2
box_center_y = box_bottom + (box_top - box_bottom) / 2

# Set mean and covariance for the distribution
mean = [box_center_x, box_center_y]
covariance = [[(box_width / 6) ** 2, 0], [0, ((box_top - box_bottom) / 6) ** 2]]

# Number of points to generate
n_outliers = 10

# Generate points using a multivariate normal distribution
outliers = np.random.multivariate_normal(mean, covariance, n_outliers)

# Convert to DataFrame
outliers_df = pd.DataFrame(outliers, columns=['x', 'y'])

# Filter to retain only extreme outliers
extreme_outliers_df = outliers_df[
    (outliers_df['x'] < x_lower_bound) | (outliers_df['x'] > x_upper_bound) |
    (outliers_df['y'] < y_lower_bound) | (outliers_df['y'] > y_upper_bound)
]

# Save extreme outliers to CSV
extreme_outliers_df.to_csv("extreme-outliers-narrow-equidistant.csv", index=False)

print(f"{len(extreme_outliers_df)} extreme outliers narrow equidistant saved to 'extreme-outliers-narrow-equidistant.csv'.")
