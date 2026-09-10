import FileUpload from '@/components/ui/file-upload/FileUpload.jsx'
import Button from '@/components/ui/button/Button.jsx'
import Camera from '@/components/ui/icons/Camera.jsx'
import Edit from '@/components/ui/icons/Edit.jsx'
export default function ImageUpload({
  currentImageUrl,
  onImageSelect,
  accept = 'image/*',
  className = ''
}) {
  return (
    <FileUpload accept={accept} onChange={onImageSelect} className={className}>
      {({ previewUrl, choose }) => (
        <div className="relative inline-block">
          {previewUrl || currentImageUrl ? (
            <img
              src={previewUrl || currentImageUrl}
              alt="Profile picture"
              className="h-32 w-32 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
          ) : (
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
              <Camera className="h-6 w-6 text-gray-400" />
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                No image
              </span>
            </div>
          )}
          <div className="absolute -right-4 -top-2 overflow-hidden rounded-full bg-white shadow-none dark:bg-gray-900">
            <Button
              className="min-h-8 min-w-8 rounded-full bg-transparent p-2 text-gray-600 hover:bg-gray-100 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Change image"
              onClick={choose}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </FileUpload>
  )
}
