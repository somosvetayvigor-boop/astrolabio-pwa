import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EpubViewer from './EpubViewer'

export default async function ReaderPage({ params }: { params: { id: string } }) {
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
