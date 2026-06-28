import subprocess
import time
import urllib.request
import urllib.error
import json

# Start uvicorn
proc = subprocess.Popen([".\\.venv\\Scripts\\python.exe", "-m", "uvicorn", "app.main:app", "--port", "8000"])
time.sleep(3) # wait for startup

req = urllib.request.Request('http://127.0.0.1:8000/api/auth/send-magic-link', data=json.dumps({'email':'mohitmisra146@gmail.com'}).encode(), headers={'Content-Type': 'application/json'})
try:
    print(urllib.request.urlopen(req).read().decode())
except urllib.error.HTTPError as e:
    print(f"Code: {e.code}")
    print(f"Body: {e.read().decode()}")

proc.terminate()
