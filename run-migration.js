const { Client } = require('pg')

const sql = require('fs').readFileSync(require('path').join(__dirname, 'supabase/migrations/002_create_reviews_table.sql'), 'utf8')

const client = new Client({
  host: 'db.cdheueobyfqskigeytss.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SHZ8G^H^6ubmm^a9y^zHDgbsW9',
  ssl: { rejectUnauthorized: false }
})

async function run() {
  try {
    await client.connect()
    console.log('Connected to Supabase database!')
    
    // Execute each statement separately
    const statements = sql.split(';').filter(s => s.trim().length > 0)
    for (const stmt of statements) {
      try {
        await client.query(stmt)
        console.log('✓ Executed:', stmt.substring(0, 60).replace(/\n/g, ' '))
      } catch (e) {
        console.error('✗ Failed:', stmt.substring(0, 60).replace(/\n/g, ' '))
        console.error('  Error:', e.message)
      }
    }
    console.log('\nMigration completed!')
  } catch (e) {
    console.error('Connection error:', e.message)
  } finally {
    await client.end()
  }
}

run()
