"""
Transit.IN - Python REST API & Static Mobility Server
Run: python server.py
"""

import http.server
import socketserver
import json
import urllib.parse
import os

PORT = int(os.environ.get("PORT", 5000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class TransitAPIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def send_json(self, status_code, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Health API
        if path == '/api/health':
            return self.send_json(200, {
                "status": "online",
                "connected": True,
                "server": "Transit.IN Python Mobility Backend",
                "version": "3.0.0",
                "port": PORT,
                "activeCities": ["Delhi", "Mumbai", "Bangalore", "Bagalkot", "Hyderabad", "Chennai", "Pune"]
            })

        # Routes API
        if path == '/api/routes':
            city = query.get('city', ['Delhi'])[0]
            return self.send_json(200, {
                "success": True,
                "city": city,
                "message": f"Connected to {city} transit network."
            })

        # Static files fallback
        super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), TransitAPIHandler) as httpd:
        print(f"=======================================================")
        print(f"🚆 Transit.IN Python Server is RUNNING on port {PORT}")
        print(f"🔗 URL: http://localhost:{PORT}/index.html")
        print(f"=======================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
