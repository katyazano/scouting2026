import requests
import os

BASE_URL = "http://localhost:8000/api"

def test_upload():
    csv_content = """timestamp,team_num,match_num,match_type,alliance,scouter,start_zone,auto_active,auto_hang,auto_pts,auto_comm,tele_pts,tele_comm,tele_hang,adv_role,adv_broke,adv_fixed,adv_chasis,adv_intake,adv_shooter,adv_climber,adv_hoppercapacity,adv_trench,adv_comments
2026-01-23T12:00:00,9999,1,Qualification,Red,AI,1,1,1,10,,20,,2,none,0,1,3,1,dual,1,41-60,2,
"""
    print(f"Sending POST to {BASE_URL}/scout/upload...")
    response = requests.post(f"{BASE_URL}/scout/upload", data=csv_content.encode('utf-8'))
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Upload successful")
    else:
        print("❌ Upload failed")

def test_teams():
    print(f"Sending GET to {BASE_URL}/teams...")
    response = requests.get(f"{BASE_URL}/teams")
    teams = response.json()
    print(f"Teams found: {teams}")
    
    if any(team['team_num'] == 9999 for team in teams):
        print("✅ New team 9999 found in analysis")
    else:
        print("❌ New team 9999 NOT found in analysis")

if __name__ == "__main__":
    test_upload()
    test_teams()
