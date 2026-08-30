import http.server
import socketserver
import os
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = ("?" + parsed.query) if parsed.query else ""
        
        # Build local filesystem path
        local_path = os.path.join(DIRECTORY, path.lstrip("/").replace("/", os.sep))
        
        # If file or folder exists as-is
        if os.path.exists(local_path):
            return super().do_GET()
        
        # Try path.html
        if os.path.exists(local_path + ".html"):
            self.path = path + ".html" + query
            return super().do_GET()
        
        # Try path/index.html
        if os.path.exists(os.path.join(local_path, "index.html")):
            self.path = path.rstrip("/") + "/index.html" + query
            return super().do_GET()

        return super().do_GET()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
        print(f"Dev server running at http://localhost:{PORT} with clean URLs enabled.")
        httpd.serve_forever()
