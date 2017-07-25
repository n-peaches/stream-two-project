from flask import Flask
from flask import render_template
from pymongo import MongoClient
import json


app = Flask(__name__)

# Local
MONGODB_HOST = 'localhost'
MONGODB_PORT = 27017
DBS_NAME = 'unitedstatesDonations'
COLLECTION_NAME = 'usdonations'

# The fields I've chosen (from donations data) for my project
FIELDS = {
    'funding_status': True, 'school_state': True,
    'resource_type': True, 'poverty_level': True, 'date_posted': True,
    'total_donations': True, 'school_metro': True, 'primary_focus_area': True, '_id': False
}


@app.route('/')
def home():
    # Home Page
    return render_template('home.html')


@app.route('/statistics')
def stats():
    # Statistics Page
    return render_template('stats.html')


@app.route('/contact')
def contact():
    # Contact and Donation Page
    return render_template('contact.html')


@app.route('/privacy-policy')
def policy():
    # Privacy Policy Page
    return render_template('privacy-policy.html')


@app.route('/unitedstatesDonations/usdonations')
def donation_project():

    # Configurations to Run Locally
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)

    collection = connection[DBS_NAME][COLLECTION_NAME]
    usdonations = collection.find(projection=FIELDS, limit=30000)

    json_projects = []
    for project in usdonations:
        json_projects.append(project)
    json_projects = json.dumps(json_projects)
    # Remember to Close the Connection
    connection.close()
    return json_projects


if __name__ == '__main__':
    app.run(debug=True)
