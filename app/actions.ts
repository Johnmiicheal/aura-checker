'use server'

import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import { neon } from '@neondatabase/serverless'

const auraSchema = z.object({
  scores: z.object({
    user: z.number().min(0).max(100),
    subject: z.number().min(0).max(100),
  }),
})

const shareSchema = z.object({
  auraUser: z.string(),
  auraSubject: z.string(),
  scores: z.object({
    user: z.number(),
    subject: z.number()
  }),
  result: z.string(),
  reasoning: z.string()
})

export async function getAuraScores(message: string) {
  try {
    const { object } = await generateObject({
      model: groq('deepseek-r1-distill-llama-70b'),
      schema: auraSchema,
      temperature: 0.5,
      prompt: `Based on this comparison analysis: "${message}", generate aura compatibility scores between 0-100 for both users. You can be biased too. Consider the described attributes, engagement styles, and overall presence. The first user mentioned should be the "user" score, and the second user should be the "subject" score.`,
    })

    return {
      user: object.scores.user,
      subject: object.scores.subject
    }
  } catch (error) {
    console.error('Error generating aura scores:', error)
    return {
      user: 75,
      subject: 90
    }
  }
}

export async function createShareableLink(data: z.infer<typeof shareSchema>) {
  // Validate the data before proceeding
  const validatedData = shareSchema.parse(data)
  
  try {
    const sql = neon(process.env.DATABASE_URL!)
    
    // Create shares table if it doesn't exist
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

    // Generate a random 6 character ID
    const shareId = Math.random().toString(36).substring(2, 8)

    // Insert the share data
    await sql`
      INSERT INTO shares (
        id, 
        aura_user, 
        aura_subject, 
        user_score, 
        subject_score, 
        result, 
        reasoning
      ) VALUES (
        ${shareId},
        ${data.auraUser},
        ${data.auraSubject},
        ${data.scores.user},
        ${data.scores.subject},
        ${data.result},
        ${data.reasoning}
      )
    `

    return { shareId }
  } catch (error) {
    console.error('Error creating shareable link:', error)
    throw new Error('Failed to create shareable link')
  }
} 