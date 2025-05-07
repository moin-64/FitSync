
// This new file optimizes loading of 3D models for BodyScan
import { useState, useEffect } from 'react';
import { TextureLoader } from 'three';

// Model cache to avoid duplicate loading
const modelCache = new Map<string, any>();
const textureCache = new Map<string, any>();

export const useOptimizedBodyModel = (modelUrl: string, textureUrl?: string) => {
  const [model, setModel] = useState<any>(null);
  const [texture, setTexture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function loadModel() {
      // Check cache first
      if (modelUrl && modelCache.has(modelUrl)) {
        setModel(modelCache.get(modelUrl));
        
        if (textureUrl) {
          if (textureCache.has(textureUrl)) {
            setTexture(textureCache.get(textureUrl));
          } else {
            loadTexture(textureUrl);
          }
        }
        
        setLoading(false);
        return;
      }
      
      // If not in cache, load it
      try {
        setLoading(true);
        
        // Dynamic import for code splitting
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        
        const loader = new GLTFLoader();
        
        // Load with timeout to prevent hanging
        const loadPromise = new Promise<any>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Model loading timed out'));
          }, 10000); // 10 second timeout
          
          loader.load(
            modelUrl,
            (gltf) => {
              clearTimeout(timeoutId);
              resolve(gltf);
            },
            (xhr) => {
              // Progress: xhr.loaded / xhr.total * 100
              console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
            },
            (error) => {
              clearTimeout(timeoutId);
              reject(error);
            }
          );
        });
        
        const gltf = await loadPromise;
        
        // Cache the loaded model
        modelCache.set(modelUrl, gltf);
        setModel(gltf);
        
        // Load texture if URL provided
        if (textureUrl) {
          loadTexture(textureUrl);
        }
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown model loading error');
        console.error('Error loading model:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    
    async function loadTexture(url: string) {
      try {
        const loader = new TextureLoader();
        const texture = await new Promise<any>((resolve, reject) => {
          loader.load(
            url,
            resolve,
            undefined,
            reject
          );
        });
        
        // Cache the texture
        textureCache.set(url, texture);
        setTexture(texture);
      } catch (err) {
        console.error('Error loading texture:', err);
      }
    }
    
    loadModel();
  }, [modelUrl, textureUrl]);
  
  return { model, texture, loading, error };
};

// Clean cache periodically to avoid memory leaks
export const cleanModelCache = () => {
  modelCache.clear();
  textureCache.clear();
  console.log('3D model cache cleared');
};

// For browser optimization
export const preloadCommonModels = async () => {
  // Function to preload commonly used models when the app is idle
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      // Models could be preloaded here when browser is idle
      console.log('Preloading common models during idle time');
    });
  }
};

// Export a default optimization that can be applied globally
export default {
  useOptimizedBodyModel,
  cleanModelCache,
  preloadCommonModels
};
