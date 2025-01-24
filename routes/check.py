from flask import Blueprint, jsonify
import os

check_blueprint = Blueprint('check', __name__)

@check_blueprint.route('/check')
def check_accounts():
    credentials_dir = './credentials'
    
    try:
        # Get all directory entries in credentials path
        entries = os.listdir(credentials_dir)
        
        # Filter out only directories
        accounts = [
            entry for entry in entries
            if os.path.isdir(os.path.join(credentials_dir, entry))
        ]
        
    except FileNotFoundError:
        # Directory doesn't exist
        accounts = []
    
    return jsonify({"accounts": accounts})