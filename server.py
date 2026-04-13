from __future__ import annotations

import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urlparse
from urllib.request import Request, urlopen


HOST = "127.0.0.1"
PORT = 8000
CORE_API_KEY = os.environ.get("CORE_API_KEY", "")
PROJECT_ROOT = Path(__file__).resolve().parent


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/status":
            self.handle_status()
            return

        if parsed.path == "/api/core-search":
            self.handle_core_search(parsed.query)
            return

        super().do_GET()

    def handle_status(self):
        self.send_json(
            {
                "coreConfigured": bool(CORE_API_KEY),
            },
            status=200,
        )

    def handle_core_search(self, query_string: str):
        params = parse_qs(query_string)
        query = params.get("q", [""])[0].strip()
        year_floor = params.get("year_floor", ["2024"])[0].strip()
        limit = params.get("limit", ["12"])[0].strip()

        if not query:
            self.send_json({"results": []}, status=200)
            return

        if not CORE_API_KEY:
            self.send_json(
                {
                    "results": [],
                    "warning": "CORE_API_KEY is not configured on the backend.",
                },
                status=200,
            )
            return

        core_url = "https://api.core.ac.uk/v3/search/works?" + urlencode(
            {
                "q": f"{query} year:{year_floor}-*",
                "limit": limit,
            }
        )

        request = Request(
            core_url,
            headers={
                "Authorization": f"Bearer {CORE_API_KEY}",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=20) as response:
                payload = response.read().decode("utf-8")
        except HTTPError as error:
            self.send_json(
                {
                    "error": "CORE request failed",
                    "status": error.code,
                },
                status=error.code,
            )
            return
        except URLError:
            self.send_json(
                {
                    "error": "CORE request could not be completed",
                },
                status=502,
            )
            return

        self.send_json(json.loads(payload), status=200)

    def send_json(self, payload: dict, status: int = 200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main():
    os.chdir(PROJECT_ROOT)
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Serving LocalAcademic on http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
