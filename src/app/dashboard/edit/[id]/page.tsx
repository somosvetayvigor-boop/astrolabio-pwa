import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditBookForm from './EditBookForm'

export default async function EditBookPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch book details to pre-fill the form
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !book) {
    notFound()
  }

  // Verify ownership
  if (book.author_id !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Editar Libro</h1>
      <EditBookForm book={book} />
    </div>
  )
}
