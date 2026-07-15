import { getLeaderboard } from '@/app/actions/leaderboard'
import Link from 'next/link'

export const metadata = {
  title: 'La Montaña del Lector - Astrolabio',
  description: 'Muro de honor de los lectores más asiduos de Astrolabio.',
}

export default async function LeaderboardPage() {
  const { top50, currentUserRank, isHidden } = await getLeaderboard()

  const TopUserCard = ({ user, position }: { user: any, position: number }) => {
    const isGold = position === 1
    const isSilver = position === 2
    const isBronze = position === 3
    
    let color = 'var(--bg-secondary)'
    let crown = ''
    if (isGold) { color = 'rgba(250, 204, 21, 0.1)'; crown = '👑' }
    if (isSilver) { color = 'rgba(148, 163, 184, 0.1)'; crown = '🥈' }
    if (isBronze) { color = 'rgba(180, 83, 9, 0.1)'; crown = '🥉' }

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '1.5rem', backgroundColor: color, borderRadius: 'var(--radius-lg)',
        border: `1px solid ${isGold ? '#facc15' : isSilver ? '#94a3b8' : isBronze ? '#b45309' : 'var(--border-color)'}`,
        flex: isGold ? '1 1 300px' : '1 1 200px',
        position: 'relative',
        transform: isGold ? 'scale(1.05)' : 'scale(1)',
        zIndex: isGold ? 10 : 1
      }}>
        <div style={{ position: 'absolute', top: '-15px', fontSize: '2rem' }}>{crown}</div>
        <div style={{ width: isGold ? '100px' : '80px', height: isGold ? '100px' : '80px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', marginBottom: '1rem', overflow: 'hidden', border: `3px solid ${isGold ? '#facc15' : isSilver ? '#94a3b8' : '#b45309'}` }}>
          {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>}
        </div>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: isGold ? '1.5rem' : '1.25rem', textAlign: 'center', color: 'var(--text-primary)' }}>{user.full_name}</h3>
        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Puntos: <strong style={{ color: 'var(--text-primary)' }}>{user.score}</strong></p>
        
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span title="Libros Completados">📚 {user.completed_books}</span>
          <span title="Minutos Leídos">⏱️ {user.total_reading_minutes}m</span>
          <span title="Racha">🔥 {user.current_streak}d</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0' }}>🏔️ La Montaña del Lector</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Los 50 exploradores más asiduos. Lee libros, acumula minutos y mantén tu racha para subir de nivel.
          </p>
        </div>

        {/* Top 3 Podium */}
        {top50.length >= 3 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
            <TopUserCard user={top50[1]} position={2} />
            <TopUserCard user={top50[0]} position={1} />
            <TopUserCard user={top50[2]} position={3} />
          </div>
        )}
        {top50.length > 0 && top50.length < 3 && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
            {top50.map((u, i) => <TopUserCard key={u.id} user={u} position={i + 1} />)}
          </div>
        )}

        {/* The Rest of the Top 50 */}
        {top50.length > 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {top50.slice(3).map((user, index) => (
              <div key={user.id} className="glass hover-glow" style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-md)', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-tertiary)', width: '30px', textAlign: 'center' }}>#{index + 4}</span>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{user.full_name}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                    <span>📚 {user.completed_books}</span>
                    <span>⏱️ {user.total_reading_minutes}m</span>
                    <span>🔥 {user.current_streak}d</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{user.score}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block' }}>pts</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {top50.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Aún no hay lectores en la montaña. ¡Sé el primero!
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Current User */}
      {currentUserRank && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          backgroundColor: 'var(--brand-primary)', color: 'white',
          padding: '1rem', display: 'flex', justifyContent: 'center', zIndex: 100,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.2)'
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%', maxWidth: '900px' }}>
            {isHidden ? (
              <>
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>Estás oculto del ranking 🕵️</span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Nadie puede ver tu progreso. Ve a Ajustes para participar.</span>
                </div>
                <Link href="/dashboard" style={{ background: 'white', color: 'var(--brand-primary)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Ajustes</Link>
              </>
            ) : currentUserRank.rank > 50 ? (
              <>
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>Tu posición: #{currentUserRank.rank}</span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>¡Tienes {currentUserRank.score} puntos! Sigue leyendo para entrar al Top 50.</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>¡Estás en la Montaña! (Posición #{currentUserRank.rank})</span>
                  <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Tienes {currentUserRank.score} puntos acumulados. ¡Sigue así!</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
