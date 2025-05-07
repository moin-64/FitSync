
/**
 * Optimize image loading for improved performance
 */
export function optimizeImageLoading(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    
    // Use cache control for better performance
    img.src = `${imageUrl}?t=${Date.now()}`;
  });
}
