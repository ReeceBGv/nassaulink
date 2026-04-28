import requests
import json
import time
import re
import sys
from urllib.parse import quote

# Google Maps scraping via Outscraper API
# Free tier: 500 requests/month
# Sign up: https://outscraper.com/

OUTSCRAPER_API_KEY = "YOUR_OUTSCRAPER_API_KEY"  # Replace with your key

def search_google_maps(query, location="Nassau, Bahamas", limit=20):
    """
    Search Google Maps for businesses using Outscraper API
    """
    if OUTSCRAPER_API_KEY == "YOUR_OUTSCRAPER_API_KEY":
        print("⚠️  Please set your Outscraper API key")
        print("Get one free at: https://outscraper.com/")
        return []
    
    url = "https://api.app.outscraper.com/maps/search-v3"
    headers = {"X-API-KEY": OUTSCRAPER_API_KEY}
    params = {
        "query": f"{query} in {location}",
        "limit": limit,
        "async": "false",
        "fields": "name,phone,address,website,description,category,reviews_rating,reviews_count"
    }
    
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        
        businesses = []
        for item in data.get("data", []):
            biz = {
                "business_name": item.get("name", ""),
                "phone": item.get("phone", ""),
                "address": item.get("address", ""),
                "website": item.get("website", ""),
                "description": item.get("description", ""),
                "category": item.get("category", ""),
                "rating": item.get("reviews_rating", ""),
                "review_count": item.get("reviews_count", ""),
                "source": "scraper"
            }
            if biz["business_name"]:
                businesses.append(biz)
        
        return businesses
    except Exception as e:
        print(f"Error: {e}")
        return []


def generate_slug(name):
    """Generate URL-friendly slug"""
    base = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return f"{base}-{str(int(time.time()))[-4:]}"


def insert_to_supabase(claims, supabase_url, supabase_key):
    """Insert scraped businesses into business_claims table"""
    supabase = create_client(supabase_url, supabase_key)
    
    inserted = 0
    for biz in claims:
        biz["slug"] = generate_slug(biz["business_name"])
        biz["status"] = "pending"
        biz["contact_email"] = "scraped@placeholder.com"  # Placeholder - will need real contact
        
        try:
            supabase.table("business_claims").insert(biz).execute()
            inserted += 1
            print(f"✅ Inserted: {biz['business_name']}")
        except Exception as e:
            print(f"❌ Failed: {biz['business_name']} - {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    return inserted


def main():
    """Scrape multiple categories and insert into Supabase"""
    
    # Categories to search
    searches = [
        "pool services",
        "air conditioning repair",
        "landscaping",
        "auto repair",
        "marine services",
        "plumber",
        "electrician",
        "catering",
        "cleaning services",
        "restaurant",
    ]
    
    all_claims = []
    
    print("🔍 Scraping Nassau businesses from Google Maps...")
    for search in searches:
        print(f"\nSearching: {search}...")
        results = search_google_maps(search, limit=10)
        all_claims.extend(results)
        print(f"Found {len(results)} businesses")
        time.sleep(2)  # Be nice to the API
    
    print(f"\n📊 Total found: {len(all_claims)}")
    
    # Save to JSON for review before inserting
    with open("nassau_businesses_scraped.json", "w") as f:
        json.dump(all_claims, f, indent=2)
    
    print("💾 Saved to nassau_businesses_scraped.json")
    print("\nReview the file, then run insert_to_supabase() to add to database.")
    print("\n⚠️  IMPORTANT: These are SCRAPED listings with placeholder contact emails.")
    print("You must reach out to real business owners to verify and claim.")


if __name__ == "__main__":
    # For direct Supabase insertion, install supabase-py:
    # pip install supabase
    try:
        from supabase import create_client
    except ImportError:
        print("Installing supabase client...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase"])
        from supabase import create_client
    
    main()
