import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import Home from '@/app/page'

interface SharePageProps {
  params: {
    id: string
  }
}

async function getSharedData(id: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const result = await sql`
      SELECT * FROM shares 
      WHERE id = ${id}
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error('Error fetching shared data:', error)
    return null
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const sharedData = await getSharedData(params.id)

  if (!sharedData) {
    notFound()
  }

  // Add search params to pass initial state to the client component
  const searchParams = new URLSearchParams({
    auraUser: sharedData.aura_user,
    auraSubject: sharedData.aura_subject,
    result: sharedData.result,
    reasoning: sharedData.reasoning,
    userScore: sharedData.user_score.toString(),
    subjectScore: sharedData.subject_score.toString(),
  })

  // Redirect to home with search params
  return <Home searchParams={searchParams.toString()} />
} 