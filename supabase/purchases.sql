-- Tabla para registrar las compras de libros
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  book_id uuid REFERENCES public.books(id) NOT NULL,
  stripe_session_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, book_id)
);

-- Habilitar RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias compras
CREATE POLICY "Users can view their own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = user_id);
