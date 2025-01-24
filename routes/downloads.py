from flask import Blueprint, Response, request, jsonify
import subprocess
import json
from utils.commands import zotify_command_builder

download_blueprint = Blueprint('download', __name__)
ALLOWED_TYPES = {'album', 'artist', 'track'}

@download_blueprint.route('/download')
def download():
    type_param = request.args.get('type')
    id_param = request.args.get('id')
    account = request.args.get('account')

    if not all([type_param, id_param, account]):
        return jsonify({"error": "Missing parameters"}), 400
    
    if type_param.lower() not in ALLOWED_TYPES:
        return jsonify({"error": f"Invalid type. Allowed: {', '.join(ALLOWED_TYPES)}"}), 400

    spotify_url = f"https://open.spotify.com/{type_param}/{id_param}"
    is_artist_download = type_param.lower() == 'artist'

    def generate():
        cmd = zotify_command_builder(account, 'download', spotify_url)
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        try:
            while True:
                line = proc.stdout.readline()
                if not line and proc.poll() is not None:
                    break
                if line:
                    try:
                        data = json.loads(line)
                        # Skip artist_start/artist_complete only for artist type
                        if is_artist_download and data.get('type') in ['artist_start', 'artist_complete']:
                            continue
                        # Re-encode the line to ensure proper formatting
                        yield f"{json.dumps(data)}\n"
                    except json.JSONDecodeError:
                        pass
        except GeneratorExit:
            proc.terminate()
        finally:
            proc.wait()

    return Response(generate(), mimetype='application/x-ndjson')