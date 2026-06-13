import asyncio
import websockets
import json

async def test():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc5ODg0NzMzLCJpYXQiOjE3Nzk4ODI5MzMsImp0aSI6IjRlMzgzMjU1YjU3ZjRlODg5MTlhNTFiNGUyZTU1MGM3IiwidXNlcl9pZCI6IjFiNTZkYTBkLWRhMzAtNDZlYy1iYjc0LTdlNGI2YmRiYTYzNSIsImVtYWlsIjoiYXJlZW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiYmYzNmQ3YzItMGFlZS00ZjQ0LWI0ZDAtMDA1YTExZGRjMmQ4IiwiaXNzIjoiRmFsY29uUE1TIn0.eluvxagymUVQd6t7JmF5kpFg_82VpeldG4LkyQV3AQU"
    user_id = "1b56da0d-da30-46ec-bb74-7e4b6bdba635"
    tenant_id = "bf36d7c2-0aee-4f44-b4d0-005a11ddc2d8"
    
    # Test the exact patterns (no leading slash)
    paths = [
        f"ws://localhost:8000/ws/auth/?token={token}",
        f"ws://localhost:8000/ws/notifications/?token={token}",
        f"ws://localhost:8000/ws/presence/?token={token}",
        f"ws://localhost:8000/ws/notifications/{user_id}/?token={token}",
        f"ws://localhost:8000/ws/presence/{tenant_id}/?token={token}",
    ]
    
    for path in paths:
        print(f"\n📡 Testing: {path}")
        try:
            async with websockets.connect(path) as ws:
                print(f"✅ SUCCESS! Connected to WebSocket!")
                print(f"📡 Real-time channel ready")
                
                # Send a test message
                await ws.send(json.dumps({"type": "ping"}))
                print("📤 Ping sent")
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(ws.recv(), timeout=2)
                    print(f"📥 Response: {response[:100]}")
                except asyncio.TimeoutError:
                    print("⏰ No response (timeout) - connection is active")
                
                print(f"\n🎉 WebSocket is WORKING for: {path}")
                return
                
        except Exception as e:
            print(f"❌ Failed: {str(e)[:80]}")

asyncio.run(test())
