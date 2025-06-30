from flask import Flask, render_template
import os

app = Flask(__name__)

SERVER_HOST = os.environ.get("WHISPER_SERVER_HOST", "localhost")
SERVER_PORT = os.environ.get("WHISPER_SERVER_PORT", "9090")

@app.route('/')
def index():
    return render_template('index.html', server_host=SERVER_HOST, server_port=SERVER_PORT)

if __name__ == '__main__':
    # Use adhoc certificate to allow https without extra setup
    app.run(host='0.0.0.0', port=5000, ssl_context='adhoc')
