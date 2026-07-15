'use server'

import { createClient } from '@/utils/supabase/server'

export interface LeaderboardUser {
  id: string
  full_name: string
  avatar_url: string | null
  total_reading_minutes: number
  current_streak: number
  completed_books: number
  score: number
  rank: number
}

export async function getLeaderboard(): Promise<{ top50: LeaderboardUser[], currentUserRank: LeaderboardUser | null, isHidden: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url, total_reading_minutes, current_streak, is_leaderboard_public')

  if (profileError || !profiles) {
    console.error('Error fetching profiles for leaderboard:', profileError)
    return { top50: [], currentUserRank: null, isHidden: false }
  }

  // Fetch completed reading progress to count completed books
  // Doing a head count for every user is heavy, so we fetch all completions and aggregate.
  const { data: completions, error: compError } = await supabase
    .from('reading_progress')
    .select('user_id')
    .eq('is_completed', true)

  const completedBooksCount: Record<string, number> = {}
  if (completions) {
    for (const c of completions) {
      if (!completedBooksCount[c.user_id]) completedBooksCount[c.user_id] = 0
      completedBooksCount[c.user_id]++
    }
  }

  // Calculate scores
  const allUsers: LeaderboardUser[] = profiles.map(p => {
    const completed = completedBooksCount[p.id] || 0
    const mins = p.total_reading_minutes || 0
    const streak = p.current_streak || 0
    
    // Puntos = (Libros Terminados × 500) + (Minutos Leídos × 1) + (Días de Racha × 50)
    const score = (completed * 500) + mins + (streak * 50)

    return {
      id: p.id,
      full_name: p.username ? `@${p.username}` : (p.full_name || 'Lector Anónimo'),
      avatar_url: p.avatar_url,
      total_reading_minutes: mins,
      current_streak: streak,
      completed_books: completed,
      score,
      rank: 0, // Will set below
      _is_public: p.is_leaderboard_public !== false // treat null as true
    }
  })

  // Sort descending by score
  allUsers.sort((a, b) => b.score - a.score)

  // Assign ranks (handling ties simply by array index for now)
  allUsers.forEach((u, index) => {
    u.rank = index + 1
  })

  // Filter public for the main board
  const publicUsers = allUsers.filter(u => (u as any)._is_public)
  const top50 = publicUsers.slice(0, 50)

  // Find current user stats
  let currentUserRank = null
  let isHidden = false

  if (user) {
    const userStats = allUsers.find(u => u.id === user.id)
    if (userStats) {
      currentUserRank = userStats
      isHidden = !(userStats as any)._is_public
    }
  }

  // Remove the private field from the final payload to avoid leaking
  const cleanTop50 = top50.map(({ _is_public, ...rest }: any) => rest as LeaderboardUser)
  
  if (currentUserRank) {
    delete (currentUserRank as any)._is_public
  }

  return {
    top50: cleanTop50,
    currentUserRank,
    isHidden
  }
}

export async function toggleLeaderboardPrivacy(isPublic: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not logged in' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_leaderboard_public: isPublic })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating privacy:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
