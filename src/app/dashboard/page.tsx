import Link from "next/link";

export default function Dashboard() {
  const authorStats = {
    totalSales: "$1,240.50",
    pagesRead: "45,230",
    royalties: "$345.80",
    booksPublished: 3
  };

  const myBooks = [
    { id: 1, title: "El Eco del Tiempo", sales: 120, pagesRead: 15400, price: "$4.99" },
    { id: 2, title: "Sombras en la Ciudad", sales: 85, pagesRead: 9200, price: "$3.50" },
    { id: 3, title: "Más Allá del Sol", sales: 230, pagesRead: 20630, price: "$5.99" },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Panel de Autor</h1>
        <Link href="/dashboard/upload" className="btn btn-primary">+ Subir Nuevo Libro (ePub)</Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ventas Totales</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{authorStats.totalSales}</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Páginas Leídas (KENPC)</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{authorStats.pagesRead}</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Regalías Estimadas</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{authorStats.royalties}</p>
        </div>
      </div>

      {/* Books List */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Mis Libros Publicados</h2>
      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Título</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Precio</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Ventas</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Págs. Leídas</th>
              <th style={{ padding: '1rem', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {myBooks.map((book) => (
              <tr key={book.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{book.title}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{book.price}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{book.sales}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{book.pagesRead}</td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/book/${book.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', marginRight: '0.5rem' }}>Ver</Link>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--brand-accent)' }}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
