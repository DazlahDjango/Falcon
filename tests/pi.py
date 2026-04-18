import requests

BASE_URL = "http://localhost:8000/api/kpis/"
TOKEN = "your_access_token_here"  # Replace with your real token

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

for kpi_id in range(1, 101):  # 1 to 100
    url = f"{BASE_URL}{kpi_id}/"
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        
        print(f"KPI ID {kpi_id} -> Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   Data: {response.json()}")
        elif response.status_code == 404:
            print("   Not Found")
        elif response.status_code == 403:
            print("   Forbidden (Check permissions)")
        else:
            print(f"   Unexpected response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"KPI ID {kpi_id} -> Request failed: {e}")