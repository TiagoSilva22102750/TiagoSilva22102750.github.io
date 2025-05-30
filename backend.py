from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector  # This can also be 'import mariadb' if you're using mariadb package

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# Set up DB connection to the remote Sigma server
db_config = {
    'host': '2001:690:2100:4::6',  # IP of the remote Sigma server
    'user': 'ist1111187',       # Replace with your database username
    'password': 'zisz0175',     # Replace with your database password
    'database': 'ist1111187'    # Database name
}

@app.route('/submit', methods=['POST'])
def submit_data():
    data = request.json  # JSON from frontend
    try:
        # Establish connection to the remote database using mysql.connector
        conn = mysql.connector.connect(**db_config)  # You can use mariadb.connect() if you're using mariadb package
        cursor = conn.cursor()

        # Adjusted query based on your table schema
        query = """
        INSERT INTO trials (user_id, file_name, slope, timestamp, 
                            start_position_left, end_position_left, 
                            start_position_right, end_position_right, 
                            displacement_left, displacement_right)
        VALUES (%s, %s, %s, NOW(), %s, %s, %s, %s, %s, %s)
        """

        # Assuming data contains user_id and other relevant fields
        values = (
            data.get('user_id'), data['file_name'], data['slope'],
            data['start_position_left'], data['end_position_left'],
            data['start_position_right'], data['end_position_right'],
            data['displacement_left'], data['displacement_right']
        )

        # Execute the insert query
        cursor.execute(query, values)
        conn.commit()  # Commit the changes to the database
        cursor.close()
        conn.close()

        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
