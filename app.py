from flask import Flask, send_from_directory
from routes.downloads import download_blueprint
from routes.search import search_blueprint
from routes.check import check_blueprint

app = Flask(__name__, static_folder='frontend', static_url_path='')

# Register API blueprints with prefix
app.register_blueprint(download_blueprint, url_prefix='/api')
app.register_blueprint(search_blueprint, url_prefix='/api')
app.register_blueprint(check_blueprint, url_prefix='/api')

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7070, debug=True, threaded=True)
