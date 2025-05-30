import numpy as np
import pandas as pd
from scipy.stats import pearsonr

mean = [0, 0]  # Mean for x and y
covariance = [[10, -7.5], [-7.5, 10]]  # Covariance matrix with correlation -0.75

n_points = 100

while True:
    data = np.random.multivariate_normal(mean, covariance, n_points)
    df = pd.DataFrame(data, columns=['x', 'y'])

    pearson_corr, _ = pearsonr(df['x'], df['y'])

    if -0.7505 <= pearson_corr <= -0.7495:
        break  # Stop when within the acceptable range

print(f"Pearson correlation: {pearson_corr:.4f}")
df.to_csv("data.csv", index=False)