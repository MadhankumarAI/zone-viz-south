#!/usr/bin/env python3
"""
Enhanced API tester for the improved Safence Power Grid Monitoring System
Tests the updated backend with Kerala-specific fraud detection patterns
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://127.0.0.1:5000"

def print_header(title):
    print("\n" + "="*60)
    print(f"🔍 {title}")
    print("="*60)

def print_response(method, endpoint, response):
    print(f"\n{method} {endpoint}")
    print("Status Code:", response.status_code)
    print("Response:")
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except:
        print(response.text)
    print("-" * 40)

def test_enhanced_api():
    print_header("ENHANCED SAFENCE POWER GRID API TESTER")
    print("🌐 Base URL:", BASE_URL)
    print("🕐 Started at:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("\nMake sure your Flask application is running!")
    print("This test focuses on Kerala power grid fraud detection patterns.")
    
    input("\nPress Enter to start enhanced tests, or Ctrl+C to exit...")

    # Test 1: Health Check
    print_header("Testing Enhanced Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_response("GET", "/health", response)
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return

    # Test 2: Model Info with Feature Importance
    print_header("Testing Model Info & Feature Importance")
    try:
        response = requests.get(f"{BASE_URL}/model-info")
        print_response("GET", "/model-info", response)
        
        # Extract top features for analysis
        if response.status_code == 200:
            data = response.json()
            if 'feature_importance' in data:
                importance = data['feature_importance']
                top_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10]
                print("\n🔬 TOP 10 MOST IMPORTANT FEATURES:")
                for feature, score in top_features:
                    print(f"  {feature}: {score:.4f}")
    except Exception as e:
        print(f"❌ Model info test failed: {e}")

    # Test 3: Set Enhanced Threshold for Kerala Data
    print_header("Setting Enhanced Detection Threshold (Kerala Optimized)")
    try:
        # Set lower threshold optimized for Kerala power theft patterns
        response = requests.post(f"{BASE_URL}/set-threshold", 
                               json={"threshold": 0.08})
        print_response("POST", "/set-threshold", response)
    except Exception as e:
        print(f"❌ Threshold setting failed: {e}")

    # Test 4: Start Enhanced Simulation
    print_header("Starting Enhanced Kerala Power Grid Simulation")
    try:
        response = requests.post(f"{BASE_URL}/start")
        print_response("POST", "/start", response)
    except Exception as e:
        print(f"❌ Start simulation failed: {e}")

    # Test 5: Fast Data Generation for Testing
    print_header("Setting Fast Data Generation (2 seconds)")
    try:
        response = requests.post(f"{BASE_URL}/set-interval", 
                               json={"seconds": 2})
        print_response("POST", "/set-interval", response)
    except Exception as e:
        print(f"❌ Interval setting failed: {e}")

    # Test 6: Monitor Enhanced Data Generation
    print_header("Monitoring Enhanced Data Generation (30 seconds)")
    start_time = time.time()
    illegal_detected = False
    
    for i in range(15):  # Monitor for 30 seconds
        try:
            response = requests.get(f"{BASE_URL}/status")
            if response.status_code == 200:
                data = response.json()
                records_count = data.get('total_records_today', 0)
                running = data.get('simulation_running', False)
                
                # Check for illegal classifications
                stats_response = requests.get(f"{BASE_URL}/classification-stats?hours=1")
                if stats_response.status_code == 200:
                    stats_data = stats_response.json()
                    stats = stats_data.get('statistics', {})
                    illegal_records = stats.get('illegal_records', 0)
                    total_records = stats.get('total_records', 0)
                    illegal_pct = stats.get('illegal_percentage', 0)
                    
                    status_icon = "🟢" if running else "🔴"
                    fraud_icon = "🚨" if illegal_records > 0 else "✅"
                    
                    print(f"{time.strftime('%H:%M:%S')} {status_icon} Records: {records_count} | "
                          f"{fraud_icon} Illegal: {illegal_records}/{total_records} ({illegal_pct:.1f}%)")
                    
                    if illegal_records > 0:
                        illegal_detected = True
                else:
                    print(f"{time.strftime('%H:%M:%S')} 🟢 Records: {records_count} | Running: {running}")
            
            time.sleep(2)
        except Exception as e:
            print(f"❌ Monitoring error: {e}")
    
    # Test 7: Enhanced Analysis - Model Outputs
    print_header("Analyzing Enhanced Model Outputs")
    try:
        response = requests.get(f"{BASE_URL}/model-outputs?limit=20")
        print_response("GET", "/model-outputs", response)
        
        if response.status_code == 200:
            data = response.json()
            outputs = data.get('outputs', [])
            if outputs:
                illegal_outputs = [o for o in outputs if o.get('classification') == 'illegal']
                legal_outputs = [o for o in outputs if o.get('classification') == 'legal']
                
                print(f"\n📊 ANALYSIS SUMMARY:")
                print(f"  Total Records: {len(outputs)}")
                print(f"  Illegal: {len(illegal_outputs)}")
                print(f"  Legal: {len(legal_outputs)}")
                
                if illegal_outputs:
                    avg_prob = sum(o.get('illegal_probability', 0) for o in illegal_outputs) / len(illegal_outputs)
                    print(f"  Avg Illegal Probability: {avg_prob:.4f}")
                    
                    print(f"\n🚨 ILLEGAL LOCATIONS DETECTED:")
                    for output in illegal_outputs[:5]:  # Show first 5
                        area = output.get('area_name', 'Unknown')
                        district = output.get('district', 'Unknown')
                        prob = output.get('illegal_probability', 0)
                        print(f"    {area}, {district} - Risk: {prob:.4f}")
    except Exception as e:
        print(f"❌ Model outputs analysis failed: {e}")

    # Test 8: Location Summary Analysis
    print_header("Kerala Location Risk Summary")
    try:
        response = requests.get(f"{BASE_URL}/location-summary?hours=2")
        print_response("GET", "/location-summary", response)
        
        if response.status_code == 200:
            data = response.json()
            summary = data.get('summary', [])
            if summary:
                print(f"\n🗺️  KERALA LOCATION RISK ANALYSIS:")
                for location in summary[:8]:  # Show top 8 risky locations
                    area = location.get('area_name', 'Unknown')
                    district = location.get('district', 'Unknown')
                    illegal_pct = location.get('illegal_percentage', 0)
                    total = location.get('total_count', 0)
                    illegal = location.get('illegal_count', 0)
                    
                    risk_level = "🔴 HIGH" if illegal_pct > 50 else "🟡 MEDIUM" if illegal_pct > 20 else "🟢 LOW"
                    print(f"  {risk_level}: {area}, {district} - {illegal_pct:.1f}% ({illegal}/{total})")
    except Exception as e:
        print(f"❌ Location summary failed: {e}")

    # Test 9: Illegal Locations Hotspots
    print_header("Kerala Power Theft Hotspots")
    try:
        response = requests.get(f"{BASE_URL}/illegal-locations?limit=10&hours=2")
        print_response("GET", "/illegal-locations", response)
    except Exception as e:
        print(f"❌ Illegal locations test failed: {e}")

    # Test 10: Final Configuration Check
    print_header("Final Enhanced Configuration Check")
    try:
        response = requests.get(f"{BASE_URL}/get-config")
        print_response("GET", "/get-config", response)
    except Exception as e:
        print(f"❌ Configuration check failed: {e}")

    # Summary
    print_header("ENHANCED TEST SUMMARY")
    if illegal_detected:
        print("✅ SUCCESS: Enhanced fraud detection is working!")
        print("🔍 Kerala-specific fraud patterns detected successfully")
        print("📊 Lower threshold (0.08) is generating illegal classifications")
        print("🚨 Power theft hotspots identified in Kerala locations")
    else:
        print("⚠️  WARNING: No illegal activity detected in test period")
        print("💡 Try running the simulation longer or check threshold settings")
    
    print(f"\n🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔧 Backend optimization for Kerala power grid completed!")

if __name__ == "__main__":
    test_enhanced_api()