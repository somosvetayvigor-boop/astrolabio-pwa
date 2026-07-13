export function getStreakBadge(streak: number) {
  if (streak >= 180) return { title: 'Maestro Literario', icon: '👑', color: '#fbbf24', nextGoal: null }
  if (streak >= 90) return { title: 'Devorador de Libros', icon: '🐉', color: '#ef4444', nextGoal: 180 }
  if (streak >= 30) return { title: 'Lector Experto', icon: '🦅', color: '#3b82f6', nextGoal: 90 }
  if (streak >= 14) return { title: 'Búho Sabio', icon: '🦉', color: '#8b5cf6', nextGoal: 30 }
  if (streak >= 7) return { title: 'Lector Asiduo', icon: '🦊', color: '#f97316', nextGoal: 14 }
  if (streak >= 3) return { title: 'Lector Curioso', icon: '🐛', color: '#10b981', nextGoal: 7 }
  return { title: 'Lector Semilla', icon: '🌱', color: '#22c55e', nextGoal: 3 }
}

export function getVolumeBadge(booksCompleted: number) {
  if (booksCompleted >= 50) return { title: 'Biblioteca Humana', icon: '🧠', color: '#f43f5e', nextGoal: null }
  if (booksCompleted >= 15) return { title: 'Erudito', icon: '📜', color: '#6366f1', nextGoal: 50 }
  if (booksCompleted >= 5) return { title: 'Coleccionista Literario', icon: '🏛️', color: '#eab308', nextGoal: 15 }
  if (booksCompleted >= 1) return { title: 'Explorador de Historias', icon: '🎒', color: '#14b8a6', nextGoal: 5 }
  return { title: 'Iniciado', icon: '🥚', color: '#9ca3af', nextGoal: 1 }
}
