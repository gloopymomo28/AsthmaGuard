import urllib.request, urllib.error, json
req = urllib.request.Request('http://127.0.0.1:8000/api/auth/send-magic-link', data=json.dumps({'email':'mohitmisra146@gmail.com'}).encode(), headers={'Content-Type': 'application/json'})
try:
    print(urllib.request.urlopen(req).read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
