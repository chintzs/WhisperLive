let ws;
let mediaRecorder;
let audioContext;
let processor;
let audioStream;
let transcript = [];
let uid;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const transcriptDiv = document.getElementById('transcript');

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function resampleTo16k(buffer, sampleRate) {
    const targetLength = Math.round(buffer.length * (16000 / sampleRate));
    const resampled = new Float32Array(targetLength);
    const step = (buffer.length - 1) / (targetLength - 1);
    resampled[0] = buffer[0];
    resampled[targetLength - 1] = buffer[buffer.length - 1];
    for (let i = 1; i < targetLength - 1; i++) {
        const idx = i * step;
        const left = Math.floor(idx);
        const right = Math.ceil(idx);
        const frac = idx - left;
        resampled[i] = buffer[left] + (buffer[right] - buffer[left]) * frac;
    }
    return resampled;
}

function initWebSocket() {
    uid = uuidv4();
    ws = new WebSocket(`wss://${SERVER_HOST}:${SERVER_PORT}/`);
    ws.onopen = () => {
        ws.send(JSON.stringify({
            uid: uid,
            language: 'en',
            task: 'transcribe',
            model: 'small',
            use_vad: true
        }));
    };
    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        if (data.uid !== uid) return;
        if (data.segments) {
            data.segments.forEach(seg => {
                if (seg.text && (!transcript.length || transcript[transcript.length-1] !== seg.text)) {
                    transcript.push(seg.text);
                    transcriptDiv.textContent = transcript.join(' ');
                }
            });
        }
    };
}

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioStream = stream;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        processor = audioContext.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = e => {
            const inputData = e.inputBuffer.getChannelData(0);
            const data16k = resampleTo16k(inputData, audioContext.sampleRate);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(data16k);
            }
        };
        source.connect(processor);
        processor.connect(audioContext.destination);
        initWebSocket();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    }).catch(err => {
        alert('Microphone access denied: ' + err);
    });
}

function stopRecording() {
    if (processor) processor.disconnect();
    if (audioStream) audioStream.getTracks().forEach(t => t.stop());
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('END_OF_AUDIO');
        ws.close();
    }
    stopBtn.disabled = true;
    startBtn.disabled = false;
    downloadBtn.disabled = false;
}

function downloadTranscript() {
    const blob = new Blob([transcript.join(' ')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    a.click();
    URL.revokeObjectURL(url);
}

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
downloadBtn.addEventListener('click', downloadTranscript);

