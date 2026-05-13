#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Daily blog generation runner - executes the daily_auto_generate workflow
"""

import sys
import os

# Add scripts directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the main workflow from daily_auto_generate
# This script assumes daily_auto_generate.py has been completed with main function

if __name__ == "__main__":
    print("[START] Daily blog generation starting...")
    
    # Import the necessary functions
    from daily_auto_generate import pick_unique_seed_topic, generate_post
    from pathlib import Path
    import json
    from datetime import datetime
    
    # Pick a topic
    category, subtopic = pick_unique_seed_topic()
    print(f"[TOPIC] Selected: {category} - {subtopic}")
    
    # Generate the post
    try:
        data = generate_post(category, subtopic)
        print(f"[SUCCESS] Generated: {data['title']}")
        
        # Output to JSON for further processing
        output = {
            "status": "success",
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(output, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(f"[ERROR] Generation failed: {e}")
        sys.exit(1)
