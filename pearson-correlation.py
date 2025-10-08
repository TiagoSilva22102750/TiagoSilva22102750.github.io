# pearson_correlation.py

import csv
import math


def read_points(file_path):
    """Reads points from a CSV file with headers x,y."""
    x_values = []
    y_values = []
    with open(file_path, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            x_values.append(float(row['x']))
            y_values.append(float(row['y']))
    return x_values, y_values


def pearson_correlation(x, y):
    """Computes Pearson correlation coefficient for two lists of numbers."""
    if len(x) != len(y):
        raise ValueError("Lists x and y must have the same length")

    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n

    numerator = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    denominator_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    denominator_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))

    if denominator_x == 0 or denominator_y == 0:
        raise ValueError("Standard deviation is zero, correlation undefined")

    return numerator / (denominator_x * denominator_y)


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python pearson_correlation.py <path_to_csv>")
        sys.exit(1)

    file_path = sys.argv[1]
    x, y = read_points(file_path)
    r = pearson_correlation(x, y)
    print(f"Pearson correlation coefficient: {r}")