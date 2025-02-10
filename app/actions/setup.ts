'use server'

import { neon } from '@neondatabase/serverless'

export async function setupDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Create shares table
    await sql`
      CREATE TABLE IF NOT EXISTS shares (
        id TEXT PRIMARY KEY,
        aura_user TEXT NOT NULL,
        aura_subject TEXT NOT NULL,
        user_score INTEGER NOT NULL,
        subject_score INTEGER NOT NULL,
        result TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS shares_id_idx ON shares(id)
    `

    return { success: true, message: 'Database setup complete' }
  } catch (error) {
    console.error('Database setup error:', error)
    throw new Error('Failed to setup database')
  }
} 