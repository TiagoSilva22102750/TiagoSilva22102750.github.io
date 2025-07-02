import mysql.connector
from datetime import datetime

# Sample data you want to send (replace with real data collection logic)
data = {
    'user_id': 123,
    'file_name': 'testfile.csv',
    'slope': 12.34,
    'timespent': 5.123,
    'start_position_left': 10.25,
    'end_position_left': 12.75,
    'start_position_right': 11.00,
    'end_position_right': 13.50
}

# Connect to remote MariaDB
conn = mysql.connector.connect(
    host='db.tecnico.ulisboa.pt',
    user='ist1111187',
    password='zisz0175',
    database='ist1111187',
    ssl_disabled=True
)

cursor = conn.cursor()

# Insert query
query = """
INSERT INTO trials (
    user_id, file_name, slope, timespent,
    start_position_left, end_position_left,
    start_position_right, end_position_right
) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
"""

values = (
    data['user_id'], data['file_name'], data['slope'], data['timespent'],
    data['start_position_left'], data['end_position_left'],
    data['start_position_right'], data['end_position_right']
)

cursor.execute(query, values)
conn.commit()

print(f"Inserted ID: {cursor.lastrowid}")

cursor.close()
conn.close()