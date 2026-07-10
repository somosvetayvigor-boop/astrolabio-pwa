import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EpubViewer from './EpubViewer'

export default async function ReaderPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // Fetch book details
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !book) {
    notFound()
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If not logged in, they can only read if it's free
    if (book.price > 0) {
      return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
          <h2>Este libro requiere compra.</h2>
          <p>Inicia sesión y compra el libro para leerlo.</p>
        </div>
      )
    }
  } else {
    // If logged in, check if author, free, or purchased
    const isAuthor = book.author_id === user.id;
    const isFree = book.price === 0;

    if (!isAuthor && !isFree) {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .single();

      if (!purchase) {
        return (
          <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>Este libro requiere compra.</h2>
            <p>Debes comprar este libro antes de poder leerlo.</p>
          </div>
        )
      }
    }
  }

  let epubSignedUrl = ''

  // If the book has an epub file, generate a temporary signed URL to download it securely
  if (book.epub_file_url) {
    const { data: signedData, error: signedError } = await supabase
      .storage
      .from('epubs')
      .createSignedUrl(book.epub_file_url, 60 * 60) // valid for 1 hour

    if (!signedError && signedData) {
      epubSignedUrl = signedData.signedUrl
    }
  }

  if (!epubSignedUrl) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Error: No se pudo cargar el archivo del libro.</h2>
      </div>
    )
  }

  return (
    <EpubViewer 
      bookId={book.id} 
      bookTitle={book.title} 
      epubUrl={epubSignedUrl} 
    />
  )
}
