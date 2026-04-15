#!/usr/bin/env python
"""
Test WebSocket connection to organisations app
"""

import websocket
import json
import time
import threading

def on_message(ws, message):
    """Handle incoming messages"""
    data = json.loads(message)
    print(f"📩 Received: {data}")

def on_error(ws, error):
    """Handle errors"""
    print(f"❌ Error: {error}")

def on_close(ws, close_status_code, close_msg):
    """Handle connection close"""
    print("🔌 Connection closed")
    

def on_open(ws):
    """Handle connection open"""
    print("✅ Connected to WebSocket!")
    
    # Send a ping
    ws.send(json.dumps({"type": "ping"}))
    
    # Send a get_status request after 2 seconds
    def send_status():
        time.sleep(2)
        ws.send(json.dumps({"type": "get_status"}))
    
    threading.Thread(target=send_status).start()

if __name__ == "__main__":
    # Replace with your actual organisation ID
    ORGANISATION_ID = "your-organisation-id-here"  # Change this!
    
    websocket.enableTrace(False)
    ws_url = f"ws://localhost:8000/ws/organisations/{ORGANISATION_ID}/updates/"
    
    ws = websocket.WebSocketApp(
        ws_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    
    print(f"🔌 Connecting to {ws_url}...")
    ws.run_forever()