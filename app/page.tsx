'use client'

import { useState, useRef } from 'react'

interface ProcessedResult {
  originalImage: string
  enhancedImage: string
  fashionItems: string[]
  ugcText: string
  ugcAnimation: string
}

export default function Home() {
  const [images, setImages] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<ProcessedResult[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newImages: string[] = []
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string)
            if (newImages.length === files.length) {
              setImages(prev => [...prev, ...newImages])
            }
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const processImages = async () => {
    setProcessing(true)
    setResults([])

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      })

      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error('Error processing images:', error)
      alert('Erreur lors du traitement des images')
    } finally {
      setProcessing(false)
    }
  }

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎨 UGC Fashion Creator</h1>
        <p>Améliorez vos images mode et créez du contenu UGC professionnel</p>
      </div>

      <div className="upload-section">
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon">📸</div>
          <h3>Glissez vos images ici</h3>
          <p>ou cliquez pour sélectionner des fichiers</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <>
            <div className="preview-grid">
              {images.map((img, index) => (
                <div key={index} className="preview-item">
                  <img src={img} alt={`Preview ${index + 1}`} />
                  <button
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                className="btn"
                onClick={processImages}
                disabled={processing}
              >
                {processing ? '⏳ Traitement en cours...' : '✨ Traiter les images'}
              </button>
            </div>
          </>
        )}
      </div>

      {processing && (
        <div className="results-section">
          <div className="loading">
            <div className="spinner"></div>
            <div className="processing-status">
              Amélioration des images et analyse des vêtements...
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-section">
          <h2>🎉 Résultats</h2>

          {results.map((result, index) => (
            <div key={index} className="result-card">
              <div className="result-images">
                <div className="result-image-wrapper">
                  <h3>📷 Image Originale</h3>
                  <img src={result.originalImage} alt="Original" />
                </div>
                <div className="result-image-wrapper">
                  <h3>✨ Image Améliorée</h3>
                  <img src={result.enhancedImage} alt="Enhanced" />
                </div>
              </div>

              <div className="fashion-items">
                <h3>👗 Vêtements identifiés</h3>
                <div className="fashion-tags">
                  {result.fashionItems.map((item, i) => (
                    <span key={i} className="fashion-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ugc-preview">
                <h3>🎬 Aperçu UGC</h3>
                <div className="ugc-video-container">
                  <img
                    src={result.ugcAnimation}
                    alt="UGC Animation"
                    className="ugc-animation"
                  />
                  <div className="ugc-overlay">
                    <h4>Style du jour ✨</h4>
                    <p>{result.ugcText}</p>
                  </div>
                </div>
              </div>

              <div className="download-section">
                <button
                  className="btn"
                  onClick={() => downloadImage(result.enhancedImage, `enhanced_${index + 1}.png`)}
                >
                  💾 Télécharger l'image
                </button>
                <button
                  className="btn"
                  onClick={() => downloadImage(result.ugcAnimation, `ugc_preview_${index + 1}.png`)}
                >
                  📥 Télécharger l'aperçu UGC
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
