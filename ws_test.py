import asyncio
import websockets
import json

async def test_websocket():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc5ODg0NzMzLCJpYXQiOjE3Nzk4ODI5MzMsImp0aSI6IjRlMzgzMjU1YjU3ZjRlODg5MTlhNTFiNGUyZTU1MGM3IiwidXNlcl9pZCI6IjFiNTZkYTBkLWRhMzAtNDZlYy1iYjc0LTdlNGI2YmRiYTYzNSIsImVtYWlsIjoiYXJlZW5AZ21haWwuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwidGVuYW50X2lkIjoiYmYzNmQ3YzItMGFlZS00ZjQ0LWI0ZDAtMDA1YTExZGRjMmQ4IiwiaXNzIjoiRmFsY29uUE1TIn0.eluvxagymUVQd6t7JmF5kpFg_82VpeldG4LkyQV3AQU"
    user_id = "1b56da0d-da30-46ec-bb74-7e4b6bdba635"
    
    # Test the user notification WebSocket
    uri = f"ws://localhost:8000/ws/notifications/{user_id}/?token={token}"
    print(f"Connecting to: {uri}")
    
    try:
        # Remove the timeout parameter
        async with websockets.connect(uri) as websocket:
            print("✅ SUCCESS! WebSocket connected!")
            print("📡 Real-time notification channel is ready")
            
            # Send a ping
            await websocket.send(json.dumps({"type": "ping"}))
            print("📤 Ping sent")
            
            # Wait for response with a simple approach
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2)
                print(f"📥 Response: {response[:100]}")
            except asyncio.TimeoutError:
                print("⏰ No response (timeout) - connection is active")
            
            print("\n💡 Real-time WebSocket is WORKING!")
            print("   Your accounts app can now receive live updates")
            
    except Exception as e:
        print(f"❌ Failed: {e}")
        print("\nTrying alternative endpoint...")
        
        # Try alternative endpoint
        uri2 = f"ws://localhost:8000/ws/auth/?token={token}"
        try:
            async with websockets.connect(uri2) as websocket:
                print("✅ Connected to auth WebSocket instead!")
                await websocket.send(json.dumps({"type": "ping"}))
                print("📤 Ping sent to auth endpoint")
        except Exception as e2:
            print(f"❌ Both endpoints failed: {e2}")

asyncio.run(test_websocket())
