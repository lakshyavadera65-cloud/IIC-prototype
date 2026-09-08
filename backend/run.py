import socket
import sys
import uvicorn
from app.main import app

def run_server(port: int = 8000):
    sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    try:
        # Disable IPV6_V6ONLY to accept both IPv4 and IPv6 on macOS/Linux
        sock.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
    except (AttributeError, OSError):
        pass
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("::", port))
    sock.listen(128)
    
    print(f"\n=======================================================")
    print(f" PULSE Backend running (Dual-Stack IPv4/IPv6)")
    print(f" -> http://localhost:{port}")
    print(f" -> http://127.0.0.1:{port}")
    print(f" -> API Docs: http://localhost:{port}/docs")
    print(f"=======================================================\n")
    
    uvicorn.run(app, fd=sock.fileno(), log_level="info")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
