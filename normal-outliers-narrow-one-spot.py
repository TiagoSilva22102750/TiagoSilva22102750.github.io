import numpy as np
import pandas as pd
from scipy.stats import iqr

existing_data = pd.read_csv("data--0043.csv")

iqr_x = iqr(existing_data['x'])
iqr_y = iqr(existing_data['y'])

q1_x = existing_data['x'].quantile(0.25)
q3_x = existing_data['x'].quantile(0.75)
q1_y = existing_data['y'].quantile(0.25)
q3_y = existing_data['y'].quantile(0.75)

x_lower_bound = q1_x - 1.5 * iqr_x
x_upper_bound = q3_x + 1.5 * iqr_x
y_lower_bound = q1_y - 1.5 * iqr_y
y_upper_bound = q3_y + 1.5 * iqr_y

box_left = 9
box_width = 4
box_bottom = 0
box_top = 9

box_center_x = box_left + box_width / 2
box_center_y = box_bottom + (box_top - box_bottom) / 2

mean = [box_center_x, box_center_y]
covariance = [[(box_width / 6) ** 2, 0], [0, (box_top / 6) ** 2]]

n_outliers = 10

outliers = np.random.multivariate_normal(mean, covariance, n_outliers)

# Convert to DataFrame
outliers_df = pd.DataFrame(outliers, columns=['x', 'y'])

normal_outliers_df = outliers_df[
    ((outliers_df['x'] > x_lower_bound) & (outliers_df['x'] < x_upper_bound)) |
    ((outliers_df['y'] > y_lower_bound) & (outliers_df['y'] < y_upper_bound))
]

# Save mild outliers to CSV
normal_outliers_df.to_csv("normal-outliers-narrow-one-spot.csv", index=False)

print(f"{len(normal_outliers_df)} normal outliers saved to 'normal-outliers-narrow-one-spot.csv'.")