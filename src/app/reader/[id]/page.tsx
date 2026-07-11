import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import EpubViewer from './EpubViewer'
import PdfViewer from './PdfViewer'

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

  let isSample = false;

  if (!user) {
    // If not logged in, they can only read full if it's free, otherwise it's a sample
    if (book.price > 0) {
      isSample = true;
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
        isSample = true;
      }
    }
  }

  let epubSignedUrl = ''

  // If the book has an epub file, generate a temporary signed URL to download it securely
  if (book.epub_file_url) {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: signedData, error: signedError } = await supabaseAdmin
      .storage
      .from('epubs')
      .createSignedUrl(book.epub_file_url, 60 * 60) // valid for 1 hour

    if (!signedError && signedData) {
      epubSignedUrl = signedData.signedUrl
    } else {
      console.error('Error generating signed URL:', signedError)
    }
  }

  if (!epubSignedUrl) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Error: No se pudo cargar el archivo del libro.</h2>
      </div>
    )
  }

  // Decide which viewer to use based on the file extension
  // In the database, epub_file_url might be "uuid-timestamp.pdf" or "uuid-timestamp.epub"
  const isPdf = book.epub_file_url && book.epub_file_url.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return (
      <PdfViewer 
        bookId={book.id} 
        bookTitle={book.title} 
        epubUrl={epubSignedUrl}
        isSample={isSample}
      />
    )
  }

  return (
    <EpubViewer 
      bookId={book.id} 
      bookTitle={book.title} 
      epubUrl={epubSignedUrl}
      isSample={isSample}
    />
  )
}
