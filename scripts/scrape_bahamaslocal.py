import subprocess
import json
import re
import time
import os

# Firecrawl API key
FIRECRAWL_KEY = "fc-d3e0cf1c7a7f4bf18462dc9f1b4f8b14"

# Category mapping: raw BahamasLocal category names → NassauLink category names
CATEGORY_MAP = {
    'Air Conditioning Refrigeration Contractors & Equipment': 'AC & Cooling',
    'Appliance Repairs': 'Trades & Repairs',
    'Accountants': 'Trades & Repairs',
    'Alarm Systems': 'Home Services',
    'Animal Organizations': 'Veterinary',
    'Auto Repair': 'Auto Repair',
    'Auto Detailing': 'Auto Repair',
    'Car Wash': 'Auto Repair',
    'Tires': 'Auto Repair',
    'Pool': 'Pool Services',
    'Swimming Pool': 'Pool Services',
    'Landscaping': 'Landscaping',
    'Lawn': 'Landscaping',
    'Garden': 'Landscaping',
    'Nursery': 'Landscaping',
    'Marine': 'Marine Services',
    'Boat': 'Marine Services',
    'Yacht': 'Marine Services',
    'Marina': 'Marina',
    'Plumbing': 'Trades & Repairs',
    'Electrician': 'Trades & Repairs',
    'Handyman': 'Trades & Repairs',
    'Contractor': 'Trades & Repairs',
    'Construction': 'Trades & Repairs',
    'Catering': 'Catering',
    'Event Planning': 'Catering',
    'Cleaning': 'Home Services',
    'House': 'Home Services',
    'Security': 'Home Services',
    'Pest Control': 'Home Services',
    'Restaurant': 'Restaurants',
    'Food': 'Restaurants',
    'Bar': 'Bars & Nightlife',
    'Nightclub': 'Bars & Nightlife',
    'Lounge': 'Bars & Nightlife',
    'Spa': 'Spa & Wellness',
    'Massage': 'Spa & Wellness',
    'Wellness': 'Spa & Wellness',
    'Salon': 'Beauty Salon',
    'Beauty': 'Beauty Salon',
    'Hair': 'Beauty Salon',
    'Nail': 'Beauty Salon',
    'Pharmacy': 'Pharmacy',
    'Drugstore': 'Pharmacy',
    'Grocery': 'Grocery & Markets',
    'Supermarket': 'Grocery & Markets',
    'Market': 'Grocery & Markets',
    'Cafe': 'Cafes',
    'Coffee': 'Cafes',
    'Car Rental': 'Car Rental',
    'Rental': 'Car Rental',
    'Gym': 'Gym & Fitness',
    'Fitness': 'Gym & Fitness',
    'Tour': 'Tourism',
    'Travel': 'Tourism',
    'Tourist': 'Tourism',
    'Dental': 'Dental',
    'Dentist': 'Dental',
    'Liquor': 'Liquor Store',
    'Wine': 'Liquor Store',
    'Veterinary': 'Veterinary',
    'Pet': 'Veterinary',
    'Real Estate': 'Real Estate',
    'Property': 'Real Estate',
    'Hardware': 'Hardware',
    'Building': 'Hardware',
    'Laundry': 'Laundry',
    'Dry Cleaning': 'Laundry',
    'Computer': 'IT Services',
    'IT': 'IT Services',
    'Technology': 'IT Services',
    'Internet': 'IT Services',
    'Courier': 'Courier & Delivery',
    'Delivery': 'Courier & Delivery',
    'Shipping': 'Courier & Delivery',
    'Printing': 'Printing',
    'Copy': 'Printing',
    'Bakery': 'Bakery',
    'Pastry': 'Bakery',
}


def firecrawl_scrape(url):
    """Scrape a URL using Firecrawl API"""
    cmd = [
        "curl", "-sS", "-X", "POST", "https://api.firecrawl.dev/v1/scrape",
        "-H", "Content-Type: application/json",
        "-H", f"Authorization: Bearer {FIRECRAWL_KEY}",
        "-d", json.dumps({"url": url, "formats": ["markdown", "html"], "onlyMainContent": False})
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout)
    except:
        return None


def extract_listing_urls(html, markdown):
    """Extract business listing URLs from a category page"""
    links = re.findall(r'href="(https?://www\.bahamaslocal\.com/showlisting/\d+/[^"]+\.html)"', html)
    # Filter out non-business listings
    business_links = [l for l in links if not any(x in l for x in [
        'Election', 'Cash_Quest', 'Fusion_Superplex', 'showlisting/22851/',
        'showlisting/20821/', 'showlisting/22802/'
    ])]
    return list(set(business_links))


def parse_business_listing(data):
    """Parse a business listing page into structured data"""
    markdown = data.get('data', {}).get('markdown', '')
    html = data.get('data', {}).get('html', '')

    result = {
        'name': None,
        'phone': None,
        'address': None,
        'description': None,
        'website': None,
        'email': None,
        'category': None,
        'source_url': None,
    }

    # Extract name - find h2 that isn't a section header
    lines = markdown.split('\n')
    for line in lines:
        if line.startswith('## ') and not any(x in line for x in [
            'Stay Updated', 'Categories', 'Description', 'Address', 'Map',
            'Reviews', 'Actions', 'Search', 'Subscribe', 'Latest Pictures'
        ]):
            name = line[3:].strip()
            if len(name) > 3 and not name.startswith('Bahamas'):
                result['name'] = name
                break

    # Fallback: extract from HTML title
    if not result['name']:
        title_match = re.search(r'<title>([^<|]+)', html)
        if title_match:
            result['name'] = title_match.group(1).strip()

    # Extract phone
    phone_match = re.search(r'\[(\d{3}-\d{3}-\d{4})\]\(tel:', markdown)
    if phone_match:
        result['phone'] = phone_match.group(1)
    else:
        phone_match2 = re.search(r'tel:(\d{3}-\d{3}-\d{4})', markdown)
        if phone_match2:
            result['phone'] = phone_match2.group(1)

    # Extract address
    addr_match = re.search(r'-[\s]*[Aa]ddress[:\s]*([^\n]+)', markdown)
    if addr_match:
        result['address'] = addr_match.group(1).strip()

    # Extract description
    desc_match = re.search(r'### Description\n\n(.+?)(?=\n### |\n## |\n\*\*\*|$)', markdown, re.DOTALL)
    if desc_match:
        desc = desc_match.group(1).strip()
        # Clean up markdown
        desc = re.sub(r'!\[.*?\]\(.*?\)', '', desc)
        desc = re.sub(r'\*\*', '', desc)
        desc = re.sub(r'\n+', ' ', desc)
        desc = desc.strip()
        result['description'] = desc[:400] + ('...' if len(desc) > 400 else '')

    # Extract website
    web_match = re.search(r'[Ww]ebsite[:\s]*\[([^\]]+)\]\((https?://[^\)]+)\)', markdown)
    if web_match:
        result['website'] = web_match.group(2)

    # Extract email — look for mailto in the contact/address section, not site footer
    # First try to find email near the address or phone section
    email_match = re.search(r'[Aa]ddress[:\s]*[^\n]+\n[^\n]*mailto:([^\)\s]+)', markdown)
    if not email_match:
        # Try to find email in a contact info block (after phone, before website)
        email_match = re.search(r'[Tt]el[:\s]*\d{3}-\d{3}-\d{4}[^\n]*\n[^\n]*mailto:([^\)\s]+)', markdown)
    if not email_match:
        # Last resort: find any mailto that isn't the site footer email
        all_emails = re.findall(r'mailto:([^\)\s]+)', markdown)
        for em in all_emails:
            if 'bahamaslocal.com' not in em and len(em) > 5:
                email_match = type('obj', (object,), {'group': lambda x: em})()
                break
    if email_match:
        result['email'] = email_match.group(1)

    # Extract category from Categories section
    cat_match = re.search(r'\[([^\]]+)\]\(https?://www\.bahamaslocal\.com/category/\d+', markdown)
    if cat_match:
        raw_cat = cat_match.group(1)
        # Map to NassauLink category
        for key, val in CATEGORY_MAP.items():
            if key.lower() in raw_cat.lower():
                result['category'] = val
                break
        if not result['category']:
            result['category'] = raw_cat

    return result


def generate_slug(name):
    """Generate URL-friendly slug from business name"""
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug[:60]


def insert_into_supabase(listing):
    """Insert a listing into Supabase using the REST API"""
    supabase_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("Supabase credentials not found in environment")
        return False

    insert_data = {
        'name': listing['name'],
        'slug': generate_slug(listing['name']),
        'category': listing['category'],
        'description': listing['description'] or f"{listing['name']} - {listing['category']} in Nassau, Bahamas",
        'phone': listing['phone'],
        'email': listing['email'],
        'website': listing['website'],
        'address': listing['address'],
        'tier': 'free',
        'status': 'approved',
        'source': 'bahamaslocal_scrape',
        'source_url': listing['source_url'],
    }

    cmd = [
        "curl", "-sS", "-X", "POST",
        f"{supabase_url}/rest/v1/listings",
        "-H", f"apikey: {supabase_key}",
        "-H", "Authorization: Bearer " + supabase_key,
        "-H", "Content-Type: application/json",
        "-H", "Prefer: resolution=merge-duplicates,return=minimal",
        "-d", json.dumps(insert_data)
    ]

    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if r.returncode == 0 and (r.stdout == '' or 'error' not in r.stdout.lower()):
        print(f"  ✓ Inserted: {listing['name']}")
        return True
    else:
        print(f"  ✗ Failed: {listing['name']} - {r.stdout[:200]}")
        return False


def scrape_category(category_url, nassau_link_category):
    """Scrape all listings from a BahamasLocal category page"""
    print(f"\n{'='*60}")
    print(f"Category: {nassau_link_category}")
    print(f"URL: {category_url}")

    data = firecrawl_scrape(category_url)
    if not data:
        print("Failed to scrape category page")
        return []

    html = data.get('data', {}).get('html', '')
    markdown = data.get('data', {}).get('markdown', '')
    listing_urls = extract_listing_urls(html, markdown)

    print(f"Found {len(listing_urls)} business listings")

    listings = []
    for url in listing_urls[:8]:  # Limit to 8 per category
        print(f"\n  Scraping: {url.split('/')[-1]}")
        listing_data = firecrawl_scrape(url)
        if listing_data:
            parsed = parse_business_listing(listing_data)
            parsed['source_url'] = url
            parsed['category'] = parsed['category'] or nassau_link_category

            if parsed['name'] and parsed['phone']:
                listings.append(parsed)
                print(f"    ✓ {parsed['name']}")
                print(f"      Phone: {parsed['phone']}")
                if parsed['address']:
                    print(f"      Address: {parsed['address']}")
            else:
                print(f"    ✗ Skipped (missing name or phone)")
                if parsed['name']:
                    print(f"      Name found: {parsed['name']}")
                if parsed['phone']:
                    print(f"      Phone found: {parsed['phone']}")

        time.sleep(1.5)  # Rate limit

    return listings


def main():
    """Main scraper workflow"""
    # Verified BahamasLocal category URLs mapped to NassauLink categories
    target_categories = [
        ("https://www.bahamaslocal.com/category/40/10/default/1/Air_Conditioning_Refrigeration_Contractors_and_Equipment.html", "AC & Cooling"),
        ("https://www.bahamaslocal.com/category/1488/10/default/1/Appliance_Repairs.html", "Trades & Repairs"),
        ("https://www.bahamaslocal.com/category/1265/10/default/1/Accountants.html", "Trades & Repairs"),
        ("https://www.bahamaslocal.com/category/51/10/default/1/Alarm_Systems.html", "Home Services"),
        ("https://www.bahamaslocal.com/category/1481/10/default/1/Animal_Organizations.html", "Veterinary"),
    ]

    all_listings = []

    for url, category in target_categories:
        listings = scrape_category(url, category)
        all_listings.extend(listings)
        print(f"\nSubtotal: {len(all_listings)} listings collected")
        time.sleep(2)

    # Save to JSON file
    output_file = "/home/claw/projects/nassaulink/scripts/scraped_listings.json"
    with open(output_file, 'w') as f:
        json.dump(all_listings, f, indent=2)

    print(f"\n{'='*60}")
    print(f"SCRAPING COMPLETE")
    print(f"Total listings scraped: {len(all_listings)}")
    print(f"Saved to: {output_file}")
    print(f"{'='*60}")

    # Print summary
    print("\n--- LISTINGS SUMMARY ---")
    for i, l in enumerate(all_listings, 1):
        print(f"{i}. {l['name']} ({l['category']}) - {l['phone']}")

    print("\nTo insert into Supabase:")
    print("  export NEXT_PUBLIC_SUPABASE_URL=your-url")
    print("  export NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key")
    print("  python3 scripts/scrape_bahamaslocal.py --insert")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--insert":
        with open("/home/claw/projects/nassaulink/scripts/scraped_listings.json") as f:
            listings = json.load(f)

        success = 0
        for listing in listings:
            if insert_into_supabase(listing):
                success += 1
            time.sleep(0.5)

        print(f"\nInserted {success}/{len(listings)} listings into Supabase")
    else:
        main()
