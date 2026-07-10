'use client'

import { useTransition } from 'react'

export default function DeleteButton({ bookId, deleteAction }: { bookId: string, deleteAction: (formData: FormData) => void }) {
  const [isPending, startTransition] = useTransition()

  return (
    <form action={(formData) => {
      if (window.confirm('¿Seguro que deseas eliminar este libro permanentemente?')) {
        startTransition(() => {
          deleteAction(formData)
        })
      }
    }}>
      <input type="hidden" name="bookId" value={bookId} />
      <button 
        type="submit" 
        className="btn btn-secondary" 
        disabled={isPending}
        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: '#dc2626', borderColor: '#fca5a5', opacity: isPending ? 0.5 : 1 }} 
      >
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
    </form>
  )
}
