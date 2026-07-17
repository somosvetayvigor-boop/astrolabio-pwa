'use server'

import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Utility to check and enforce rate limits for the AI features.
 */
async function checkAndLogRateLimit(supabase: any, userId: string, featureType: 'librarian' | 'reader_assistant', bookId?: string) {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .single()

  const isSubscribed = userProfile?.subscription_status === 'active'

  if (featureType === 'librarian') {
    // LIBRARIAN RULES: Only for subscribed users. 2 questions per day.
    if (!isSubscribed) {
      return { allowed: false, reason: 'El Bibliotecario Virtual es exclusivo para usuarios con suscripción activa.' }
    }

    // Check usage in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature_type', 'librarian')
      .gte('created_at', yesterday.toISOString())

    if (count !== null && count >= 2) {
      return { allowed: false, reason: 'Has alcanzado tu límite de 2 preguntas al Bibliotecario por hoy.' }
    }
  }

  if (featureType === 'reader_assistant') {
    // READER ASSISTANT RULES
    if (!bookId) return { allowed: false, reason: 'Falta el ID del libro.' }

    if (isSubscribed) {
      // Subscribed users: 3 questions per book per day
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count } = await supabase
        .from('ai_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature_type', 'reader_assistant')
        .eq('book_id', bookId)
        .gte('created_at', yesterday.toISOString())

      if (count !== null && count >= 3) {
        return { allowed: false, reason: 'Has alcanzado tu límite de 3 preguntas de IA para este libro por hoy.' }
      }
    } else {
      // Non-subscribed users (Must have bought the book): 5 questions lifetime per book
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single()

      // Also allow if they are the author
      const { data: book } = await supabase
        .from('books')
        .select('author_id')
        .eq('id', bookId)
        .single()
        
      const isAuthor = book?.author_id === userId;

      if (!purchase && !isAuthor) {
         return { allowed: false, reason: 'Para usar el Asistente de Lectura debes comprar el libro o tener una suscripción activa.' }
      }

      const { count } = await supabase
        .from('ai_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature_type', 'reader_assistant')
        .eq('book_id', bookId)

      if (count !== null && count >= 5) {
        return { allowed: false, reason: 'Has alcanzado tu límite total de 5 preguntas gratuitas de IA para este libro.' }
      }
    }
  }

  // If allowed, log the usage immediately to prevent race conditions
  await supabase.from('ai_usage_logs').insert({
    user_id: userId,
    feature_type: featureType,
    book_id: bookId
  })

  return { allowed: true }
}

/**
 * Ask the Virtual Librarian (Store Chatbot)
 */
export async function askLibrarian(message: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'La Inteligencia Artificial está en mantenimiento (Falta API Key).' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Debes iniciar sesión.' }

  const limitCheck = await checkAndLogRateLimit(supabase, user.id, 'librarian')
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = `Eres el Bibliotecario Virtual de Astrolabio (una plataforma de libros independientes). 
    Un usuario te dice: "${message}". 
    Responde de manera amable, corta y concisa (máximo 3 párrafos). Actúa como un experto en libros. Si no sabes qué recomendar, sugiere temas filosóficos, novela negra o ciencia ficción que podrían estar en nuestro catálogo.`
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { success: true, text: response.text() }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { success: false, error: 'Hubo un error de conexión con la IA. Inténtalo más tarde.' }
  }
}

/**
 * Ask the Reading Assistant (In-book explanation)
 */
export async function askReadingAssistant(bookId: string, selectedText: string, userQuestion: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'La Inteligencia Artificial está en mantenimiento (Falta API Key).' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Debes iniciar sesión.' }

  const limitCheck = await checkAndLogRateLimit(supabase, user.id, 'reader_assistant', bookId)
  if (!limitCheck.allowed) {
    return { success: false, error: limitCheck.reason }
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = `El usuario está leyendo un libro y ha seleccionado este extracto:
    "${selectedText}"
    
    El usuario tiene esta duda sobre el texto:
    "${userQuestion}"
    
    Por favor, actúa como un profesor de literatura o un experto en la materia. Explícale al usuario de manera clara, didáctica y en español. Mantén tu respuesta concisa.`
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { success: true, text: response.text() }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { success: false, error: 'Hubo un error de conexión con la IA. Inténtalo más tarde.' }
  }
}
