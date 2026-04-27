const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const businesses = [
  // Pool Services
  { name: "Island Pool Services", slug: "island-pool-services", category: "Pool Services", description: "Professional pool cleaning, maintenance, and repair services for residential and commercial pools across New Providence. Weekly service plans available.", phone: "(242) 555-0101", whatsapp: "12425550101", email: "info@islandpoolbahamas.com", website: "https://islandpoolbahamas.com", address: "#15 Village Road, Nassau", tier: "featured", status: "approved" },
  { name: "Crystal Clear Pools", slug: "crystal-clear-pools", category: "Pool Services", description: "Family-owned pool service since 1998. Specializing in green pool recovery, equipment installation, and salt water conversions.", phone: "(242) 555-0102", whatsapp: "12425550102", email: "service@crystalclearpools.bs", website: "", address: "East Bay Street, Nassau", tier: "free", status: "approved" },
  { name: "Blue Water Pool Care", slug: "blue-water-pool-care", category: "Pool Services", description: "Full-service pool maintenance including chemical balancing, filter cleaning, pump repairs, and pool resurfacing. Serving Paradise Island and Cable Beach.", phone: "(242) 555-0103", whatsapp: "12425550103", email: "bluewater@batelnet.bs", website: "", address: "Paradise Island Drive", tier: "premium", status: "approved" },
  { name: "Paradise Island Pool & Spa", slug: "paradise-island-pool-spa", category: "Pool Services", description: "Luxury pool design and spa installation for high-end properties. Infinity pools, natural stone waterfalls, and custom lighting. Award-winning designs.", phone: "(242) 555-0104", whatsapp: "12425550104", email: "luxury@pipools.bs", website: "https://pipools.bs", address: "Paradise Island, Nassau", tier: "spotlight", status: "approved" },

  // AC & Cooling
  { name: "Bahamas Air Conditioning", slug: "bahamas-air-conditioning", category: "AC & Cooling", description: "Residential and commercial HVAC installation, repair, and maintenance. Authorized dealer for Carrier and Lennox systems. 24/7 emergency service.", phone: "(242) 555-0201", whatsapp: "12425550201", email: "service@bahamasac.bs", website: "https://bahamasac.bs", address: "#8 Mackey Street, Nassau", tier: "featured", status: "approved" },
  { name: "Cool Breeze HVAC", slug: "cool-breeze-hvac", category: "AC & Cooling", description: "Fast, reliable AC repair and maintenance. Duct cleaning, thermostat installation, and energy-efficient system upgrades. Free estimates.", phone: "(242) 555-0202", whatsapp: "12425550202", email: "coolbreeze@batelnet.bs", website: "", address: "Soldier Road, Nassau", tier: "free", status: "approved" },
  { name: "Arctic Air Bahamas", slug: "arctic-air-bahamas", category: "AC & Cooling", description: "Commercial refrigeration and industrial cooling specialists. Walk-in coolers, ice machines, and large-scale AC systems for hotels and restaurants.", phone: "(242) 555-0203", whatsapp: "12425550203", email: "commercial@arcticair.bs", website: "https://arcticair.bs", address: "#22 Shirley Street, Nassau", tier: "premium", status: "approved" },

  // Landscaping
  { name: "Tropical Gardens Landscaping", slug: "tropical-gardens-landscaping", category: "Landscaping", description: "Complete landscape design, installation, and maintenance. Native Bahamian plants, irrigation systems, and hardscaping. Commercial and residential.", phone: "(242) 555-0301", whatsapp: "12425550301", email: "design@tropicalgardens.bs", website: "https://tropicalgardens.bs", address: "#12 John F. Kennedy Drive, Nassau", tier: "featured", status: "approved" },
  { name: "Green Thumb Bahamas", slug: "green-thumb-bahamas", category: "Landscaping", description: "Lawn care, tree trimming, garden maintenance, and pest control. Weekly and bi-weekly service plans. Serving all of New Providence.", phone: "(242) 555-0302", whatsapp: "12425550302", email: "info@greenthumb.bs", website: "", address: "Carmichael Road, Nassau", tier: "free", status: "approved" },
  { name: "Paradise Landscapes", slug: "paradise-landscapes", category: "Landscaping", description: "High-end landscape architecture for luxury homes and resorts. Water features, outdoor kitchens, lighting design, and sustainable gardening.", phone: "(242) 555-0303", whatsapp: "12425550303", email: "luxury@paradiselandscapes.bs", website: "https://paradiselandscapes.bs", address: "Lyford Cay, Nassau", tier: "spotlight", status: "approved" },

  // Auto Repair
  { name: "Nassau Auto Works", slug: "nassau-auto-works", category: "Auto Repair", description: "Full-service auto repair and maintenance. Engine diagnostics, brake service, transmission repair, and AC service. All makes and models.", phone: "(242) 555-0401", whatsapp: "12425550401", email: "service@nassauautoworks.bs", website: "https://nassauautoworks.bs", address: "#45 Baillou Hill Road, Nassau", tier: "featured", status: "approved" },
  { name: "Island Mechanics", slug: "island-mechanics", category: "Auto Repair", description: "Honest, affordable car repair. Specializing in Japanese and Korean vehicles. Oil changes, tune-ups, suspension work, and electrical diagnostics.", phone: "(242) 555-0402", whatsapp: "12425550402", email: "islandmechanics@batelnet.bs", website: "", address: "Wulff Road, Nassau", tier: "free", status: "approved" },
  { name: "Elite Auto Care", slug: "elite-auto-care", category: "Auto Repair", description: "Premium auto detailing, ceramic coating, paint correction, and luxury vehicle maintenance. Mobile service available for Paradise Island and Cable Beach.", phone: "(242) 555-0403", whatsapp: "12425550403", email: "bookings@eliteautocare.bs", website: "https://eliteautocare.bs", address: "Cable Beach, Nassau", tier: "premium", status: "approved" },
  { name: "Cable Beach Auto Spa", slug: "cable-beach-auto-spa", category: "Auto Repair", description: "Full-service auto spa and detailing center. Ceramic coating, paint protection film, interior restoration, and concierge vehicle pickup.", phone: "(242) 555-0404", whatsapp: "12425550404", email: "spa@cablebeachauto.bs", website: "https://cablebeachauto.bs", address: "Cable Beach, Nassau", tier: "spotlight", status: "approved" },

  // Marine Services
  { name: "Ocean Marine Services", slug: "ocean-marine-services", category: "Marine Services", description: "Boat maintenance, engine repair, hull cleaning, and yacht management. Certified technicians for Yamaha, Mercury, and Volvo Penta engines.", phone: "(242) 555-0501", whatsapp: "12425550501", email: "service@oceanmarine.bs", website: "https://oceanmarine.bs", address: "Bay Street Marina, Nassau", tier: "featured", status: "approved" },
  { name: "Bahamas Boat Care", slug: "bahamas-boat-care", category: "Marine Services", description: "Mobile boat detailing, bottom painting, teak restoration, and canvas work. We come to your dock. Serving all harbors in New Providence.", phone: "(242) 555-0502", whatsapp: "12425550502", email: "mobile@bahamasboatcare.bs", website: "", address: "Harbour Club, Paradise Island", tier: "free", status: "approved" },
  { name: "Yacht Tech Bahamas", slug: "yacht-tech-bahamas", category: "Marine Services", description: "Marine electronics installation and repair. Radar, GPS, autopilot, satellite communications, and AV systems for yachts and superyachts.", phone: "(242) 555-0503", whatsapp: "12425550503", email: "tech@yachttech.bs", website: "https://yachttech.bs", address: "Albany Marina, South Ocean", tier: "premium", status: "approved" },
  { name: "Nassau Yacht Management", slug: "nassau-yacht-management", category: "Marine Services", description: "Complete yacht management services for absentee owners. Crew placement, maintenance scheduling, provisioning, and charter coordination.", phone: "(242) 555-0504", whatsapp: "12425550504", email: "captain@nassauyacht.bs", website: "https://nassauyacht.bs", address: "Harbourfront, Nassau", tier: "spotlight", status: "approved" },

  // Trades & Repairs
  { name: "Master Builders Bahamas", slug: "master-builders-bahamas", category: "Trades & Repairs", description: "General construction, renovations, and repairs. Licensed contractors for residential and commercial projects. Free consultations and estimates.", phone: "(242) 555-0601", whatsapp: "12425550601", email: "build@masterbuilders.bs", website: "https://masterbuilders.bs", address: "#33 Thompson Boulevard, Nassau", tier: "featured", status: "approved" },
  { name: "Fix-It-All Handyman", slug: "fix-it-all-handyman", category: "Trades & Repairs", description: "Reliable handyman services for every home repair. Plumbing, electrical, carpentry, painting, and appliance installation. Same-day service available.", phone: "(242) 555-0602", whatsapp: "12425550602", email: "help@fixitall.bs", website: "", address: "Palmdale, Nassau", tier: "free", status: "approved" },
  { name: "Premier Plumbing & Electric", slug: "premier-plumbing-electric", category: "Trades & Repairs", description: "Licensed plumbers and electricians. Emergency callouts, new installations, renovations, and compliance inspections. 15 years serving Nassau.", phone: "(242) 555-0603", whatsapp: "12425550603", email: "emergency@premierpe.bs", website: "https://premierpe.bs", address: "#19 Collins Avenue, Nassau", tier: "premium", status: "approved" },

  // Catering
  { name: "Island Flavors Catering", slug: "island-flavors-catering", category: "Catering", description: "Authentic Bahamian cuisine for events of all sizes. Weddings, corporate functions, private parties. Conch fritters, peas & rice, guava duff.", phone: "(242) 555-0701", whatsapp: "12425550701", email: "events@islandflavors.bs", website: "https://islandflavors.bs", address: "#7 George Street, Nassau", tier: "featured", status: "approved" },
  { name: "Gourmet Bahamas", slug: "gourmet-bahamas", category: "Catering", description: "Upscale catering with international flair. Chef-prepared menus, full-service staffing, bar service, and event planning. Serving Paradise Island to Lyford Cay.", phone: "(242) 555-0702", whatsapp: "12425550702", email: "chef@gourmetbahamas.bs", website: "https://gourmetbahamas.bs", address: "Paradise Island, Nassau", tier: "premium", status: "approved" },
  { name: "Beach BBQ Catering", slug: "beach-bbq-catering", category: "Catering", description: "Casual beachside BBQ and picnic catering. Jerk chicken, ribs, fresh fish fry. Perfect for family reunions, beach parties, and boat trips.", phone: "(242) 555-0703", whatsapp: "12425550703", email: "bbq@beachcatering.bs", website: "", address: "Love Beach, Nassau", tier: "free", status: "approved" },
  { name: "Royal Events Bahamas", slug: "royal-events-bahamas", category: "Catering", description: "Full-service event planning and luxury catering. Weddings, galas, corporate retreats. White-glove service with Bahamian hospitality.", phone: "(242) 555-0704", whatsapp: "12425550704", email: "royal@royalevents.bs", website: "https://royalevents.bs", address: "#1 Bay Street, Nassau", tier: "spotlight", status: "approved" },

  // Home Services
  { name: "SecureHome Bahamas", slug: "securehome-bahamas", category: "Home Services", description: "Home security systems, CCTV installation, smart home automation, and 24/7 monitoring. Protect your family and property with the latest technology.", phone: "(242) 555-0801", whatsapp: "12425550801", email: "sales@securehome.bs", website: "https://securehome.bs", address: "#25 Madeira Street, Nassau", tier: "featured", status: "approved" },
  { name: "Sparkle Clean Services", slug: "sparkle-clean-services", category: "Home Services", description: "Professional residential and commercial cleaning. Deep cleaning, move-in/move-out, post-construction, and regular housekeeping. Bonded and insured staff.", phone: "(242) 555-0802", whatsapp: "12425550802", email: "clean@sparkle.bs", website: "https://sparkleclean.bs", address: "#14 Independence Drive, Nassau", tier: "free", status: "approved" },
  { name: "Bahamas Pest Control", slug: "bahamas-pest-control", category: "Home Services", description: "Termite, rodent, mosquito, and general pest control. Eco-friendly options available. Residential, commercial, and resort services across New Providence.", phone: "(242) 555-0803", whatsapp: "12425550803", email: "bugs@bahamaspest.bs", website: "https://bahamaspest.bs", address: "#31 Blue Hill Road, Nassau", tier: "premium", status: "approved" },
  { name: "Smart Home Bahamas", slug: "smart-home-bahamas", category: "Home Services", description: "Complete smart home integration. Lighting, climate, security, entertainment, and energy management. Control everything from your phone.", phone: "(242) 555-0804", whatsapp: "12425550804", email: "smart@smarthome.bs", website: "https://smarthome.bs", address: "#9 East Bay Street, Nassau", tier: "spotlight", status: "approved" },
];

async function seed() {
  console.log(`Seeding ${businesses.length} businesses...`);

  for (const biz of businesses) {
    const { data, error } = await supabase
      .from('listings')
      .insert(biz)
      .select('id, name')
      .single();

    if (error) {
      console.error(`❌ ${biz.name}: ${error.message}`);
    } else {
      console.log(`✅ ${biz.name}`);
    }
  }

  console.log('\nDone!');
}

seed().catch(console.error);
