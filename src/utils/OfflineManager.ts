// OfflineManager.ts
// Handles caching of book assets (audio, cover) and persistence of storage.

const CACHE_NAME = 'astrolabio-offline-downloads-v1'

export async function requestPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist()
    console.log(`Persisted storage granted: ${isPersisted}`)
    return isPersisted
  }
  return false
}

export async function checkIsPersisted() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    return await navigator.storage.persisted()
  }
  return false
}

export async function downloadFileToCache(url: string, onProgress?: (percent: number) => void): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME)
    const response = await fetch(url)
    
    if (!response.ok) throw new Error('Network response was not ok')

    // Since we can't easily track progress of cache.add or standard fetch response body cloning 
    // in all browsers simply, we will just use cache.put for the whole response.
    // For large files, a custom readable stream is needed for progress, but for simplicity:
    await cache.put(url, response.clone())
    
    if (onProgress) onProgress(100)
    return true
  } catch (error) {
    console.error('Download failed:', error)
    return false
  }
}

export async function removeFileFromCache(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME)
    return await cache.delete(url)
  } catch (error) {
    console.error('Remove from cache failed:', error)
    return false
  }
}

export async function isFileCached(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME)
    const response = await cache.match(url)
    return !!response
  } catch (error) {
    return false
  }
}
