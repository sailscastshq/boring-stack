import { useState, useRef } from 'react'
import { Button } from 'primereact/button'

export default function ImageUpload({
  currentImageUrl,
  onImageSelect,
  accept = 'image/*',
  className = ''
}) {
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Pass file to parent component
      if (onImageSelect) {
        onImageSelect(file)
      }
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`image-upload-container ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="relative inline-block">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile picture"
            className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <i className="pi pi-camera text-2xl text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">No image</span>
          </div>
        )}

        {/* Edit button overlay */}
        <div className="absolute -right-4 -top-2 overflow-hidden rounded-full bg-white shadow-md">
          <Button
            icon="pi pi-pencil"
            size="small"
            type="button"
            text
            rounded
            severity="secondary"
            onClick={openFileDialog}
            tooltip="Change image"
          />
        </div>
      </div>
    </div>
  )
}
