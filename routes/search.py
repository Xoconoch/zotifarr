from flask import Blueprint, Response, request, jsonify
import subprocess
import json
from utils.commands import zotify_command_builder

search_blueprint = Blueprint('search', __name__)

@search_blueprint.route('/search')
def search():
    account = request.args.get('account')
    query = request.args.get('query')

    if not all([account, query]):
        return jsonify({"error": "Missing 'account' or 'query'"}), 400

    cmd = zotify_command_builder(account, 'search', query)

    try:
        # Execute command and capture all output
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=30  # Increase timeout if needed for large results
        )
    except subprocess.TimeoutExpired:
        return jsonify({"error": "Search operation timed out"}), 504

    # Handle command errors
    if result.returncode != 0:
        return jsonify({
            "error": "Search failed",
            "details": result.stderr.strip() or "Unknown error"
        }), 500

    # Parse and return JSON response
    try:
        output = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        return jsonify({
            "error": "Invalid JSON response",
            "output": result.stdout,
            "parse_error": str(e)
        }), 500

    return jsonify(output)