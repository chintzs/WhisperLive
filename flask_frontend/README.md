# WhisperLive Flask Frontend

This directory contains a simple Flask application that can connect to a running WhisperLive server over HTTPS and stream microphone audio for real time transcription.

## Prerequisites

- Python 3.8 or later
- Install server dependencies using `requirements/server.txt`
- Install client dependencies using `requirements/client.txt`

```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements/server.txt
pip install -r requirements/client.txt
pip install flask
```

## Running the Server

1. In the repository root, start the transcription server:

```bash
python3 run_server.py --port 9090 --backend faster_whisper
```

The server will listen on port `9090` for WebSocket connections.

## Running the Flask Client

1. Change to the `flask_frontend` directory:

```bash
cd flask_frontend
```

2. Start the Flask application (it uses an ad-hoc certificate for HTTPS):

```bash
python3 app.py
```

3. Open your browser and navigate to `https://localhost:5000`. Accept the browser security warning for the self-signed certificate.

4. Click **Start** to stream microphone audio. The transcription will appear in the browser. Use **Download Transcript** to save the text as a `.txt` file.

## Configuration

The client assumes the server is running on `localhost:9090`. To change the server address, set the environment variables `WHISPER_SERVER_HOST` and `WHISPER_SERVER_PORT` before launching the Flask app:

```bash
export WHISPER_SERVER_HOST=your.server.address
export WHISPER_SERVER_PORT=9090
python3 app.py
```

The application requires HTTPS access to use the microphone; the built-in ad-hoc certificate is suitable for local development. For production usage, configure Flask with a valid certificate.

