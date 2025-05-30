import mysql.connector
from datetime import datetime

# Sample data you want to send (replace with real data collection logic)
data = {
    'user_id': 123,
    'file_name': 'testfile.csv',
    'slope': 12.34,
    'timestamp': datetime.now(),
    'start_position_left': 10.25,
    'end_position_left': 12.75,
    'start_position_right': 11.00,
    'end_position_right': 13.50,
    'displacement_left': 2.50,
    'displacement_right': 2.50
}

# Connect to remote MariaDB
conn = mysql.connector.connect(
    host='193.136.128.108',
    user='ist1111187',
    password='zisz0175',
    database='ist1111187'
)

cursor = conn.cursor()

# Insert query
query = """
INSERT INTO trials (
    user_id, file_name, slope, timestamp,
    start_position_left, end_position_left,
    start_position_right, end_position_right,
    displacement_left, displacement_right
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

values = (
    data['user_id'], data['file_name'], data['slope'], data['timestamp'],
    data['start_position_left'], data['end_position_left'],
    data['start_position_right'], data['end_position_right'],
    data['displacement_left'], data['displacement_right']
)

cursor.execute(query, values)
conn.commit()

print(f"Inserted ID: {cursor.lastrowid}")

cursor.close()
conn.close()