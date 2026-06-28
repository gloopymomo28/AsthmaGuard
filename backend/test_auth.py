import urllib.request; import urllib.error; import json, time
req = urllib.request.Request('https://asthmaguard-4ss6.onrender.com/api/auth/send-magic-link', data=json.dumps({'email':'mohitmisra146@gmail.com'}).encode(), headers={'Content-Type': 'application/json'})
for i in range(10):
    try:
        print(urllib.request.urlopen(req).read().decode())
        break
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "Server error" in body:
            print(f"Code: {e.code}")
            print(f"Body: {body}")
            break
        print(f"Still deploying... {e.code} {body}")
        time.sleep(10)
