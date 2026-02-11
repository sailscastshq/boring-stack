---
name: file-uploads
description: Sails.js file uploads - sails.uploadOne, Skipper, avatar uploads, file storage, cloud uploads
metadata:
  tags: uploads, files, skipper, uploadOne, avatar, storage, multipart
---

# File Uploads

Sails uses Skipper for handling multipart file uploads. Files are streamed (not buffered in memory), making it safe for large uploads.

## Basic Upload Pattern

### 1. Declare File Inputs in the Action

File inputs are NOT declared in `inputs:`. Instead, use the `files` array:

```js
// api/controllers/setting/update-profile.js
module.exports = {
  files: ['avatar'], // Declare which fields accept file uploads

  inputs: {
    fullName: { type: 'string' },
    avatar: {
      type: 'ref' // Use 'ref' type for file inputs
    }
  },

  exits: {
    success: { responseType: 'redirect' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function ({ fullName, avatar }) {
    // Upload the file
    const avatarInfo = await sails.uploadOne(avatar, {
      maxBytes: 5 * 1024 * 1024 // 5MB limit
    })

    if (avatarInfo) {
      await User.updateOne({ id: this.req.session.userId }).set({
        avatarUrl: avatarInfo.fd,
        avatarMime: avatarInfo.type
      })
    }

    return '/settings/profile'
  }
}
```

### 2. Frontend Form (React with Inertia)

```jsx
// assets/js/pages/setting/profile.jsx
import { useForm } from '@inertiajs/react'

function ProfileForm() {
  const { data, setData, post, errors } = useForm({
    fullName: '',
    avatar: null
  })

  function handleSubmit(e) {
    e.preventDefault()
    post('/settings/profile')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={data.fullName}
        onChange={(e) => setData('fullName', e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setData('avatar', e.target.files[0])}
      />
      <button type="submit">Save</button>
    </form>
  )
}
```

## sails.uploadOne()

Upload a single file. Returns the file metadata or `undefined` if no file was provided:

```js
const fileInfo = await sails.uploadOne(avatar)
```

The returned `fileInfo` object:

```js
{
  fd: '.tmp/uploads/abc123-def456.jpg',  // Path to uploaded file
  size: 245760,                           // File size in bytes
  type: 'image/jpeg',                     // MIME type
  filename: 'profile-photo.jpg',          // Original filename
  status: 'bufferingOrWriting',           // Upload status
  field: 'avatar'                         // Form field name
}
```

### Upload Options

```js
const fileInfo = await sails.uploadOne(avatar, {
  maxBytes: 10 * 1024 * 1024, // 10MB max (default: unlimited)
  dirname: require('path').resolve(sails.config.appPath, '.tmp/uploads/avatars')
  // saveAs: 'custom-filename.jpg'  // Custom filename (rare)
})
```

## Uploading Multiple Files

Use `sails.upload()` (without `One`) for multiple file uploads:

```js
module.exports = {
  files: ['documents'],

  inputs: {
    documents: { type: 'ref' }
  },

  fn: async function ({ documents }) {
    const uploadedFiles = await sails.upload(documents, {
      maxBytes: 50 * 1024 * 1024 // 50MB total
    })

    // uploadedFiles is an array of file info objects
    for (const file of uploadedFiles) {
      await Document.create({
        filePath: file.fd,
        originalName: file.filename,
        mimeType: file.type,
        size: file.size,
        owner: this.req.session.userId
      })
    }

    return '/documents'
  }
}
```

## Deleting Uploaded Files

Use `sails.rm()` to delete files from the default upload storage:

```js
// Delete old avatar before uploading new one
const existingUser = await User.findOne({ id: userId })
if (existingUser.avatarUrl) {
  await sails.rm(existingUser.avatarUrl)
}
```

## Cloud Storage (S3, Google Cloud, Azure)

Install a Skipper adapter for cloud storage:

```bash
npm install skipper-s3
```

```js
const fileInfo = await sails.uploadOne(avatar, {
  adapter: require('skipper-s3'),
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.S3_BUCKET,
  region: process.env.AWS_REGION
})
// fileInfo.fd will be the S3 key (path within the bucket)
// fileInfo.extra.Location will be the full URL
```

Available adapters:

| Adapter         | Storage                            |
| --------------- | ---------------------------------- |
| (built-in)      | Local filesystem (`.tmp/uploads/`) |
| `skipper-s3`    | Amazon S3                          |
| `skipper-gcs`   | Google Cloud Storage               |
| `skipper-azure` | Azure Blob Storage                 |

## Avatar Upload Pattern (Complete Example)

A production-ready pattern from the Boring Stack:

```js
// api/controllers/setting/update-profile.js
module.exports = {
  files: ['avatar'],

  inputs: {
    fullName: { type: 'string', maxLength: 120 },
    avatar: { type: 'ref' }
  },

  exits: {
    success: { responseType: 'inertiaRedirect' },
    badRequest: { responseType: 'badRequest' }
  },

  fn: async function ({ fullName, avatar }) {
    const userId = this.req.session.userId
    const updateData = {}

    if (fullName) {
      updateData.fullName = fullName
    }

    if (avatar) {
      // Upload new avatar
      const avatarInfo = await sails.uploadOne(avatar, {
        maxBytes: 5 * 1024 * 1024
      })

      if (avatarInfo) {
        // Delete old avatar if exists
        const existingUser = await User.findOne({ id: userId })
        if (existingUser.avatarUrl) {
          await sails.rm(existingUser.avatarUrl)
        }

        updateData.avatarUrl = avatarInfo.fd
      }
    }

    if (Object.keys(updateData).length > 0) {
      await User.updateOne({ id: userId }).set(updateData)
    }

    // Refresh the cached user prop
    sails.inertia.refreshOnce('loggedInUser')
    sails.inertia.flash('success', 'Profile updated successfully.')

    return '/settings/profile'
  }
}
```

## File Validation

Validate file type and size before processing:

```js
fn: async function ({ avatar }) {
  if (avatar) {
    const fileInfo = await sails.uploadOne(avatar, {
      maxBytes: 5 * 1024 * 1024
    })

    if (fileInfo) {
      // Validate MIME type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(fileInfo.type)) {
        // Delete the uploaded file
        await sails.rm(fileInfo.fd)
        throw {
          badRequest: {
            problems: [{ avatar: 'Only JPEG, PNG, and WebP images are allowed.' }]
          }
        }
      }
    }
  }
}
```

## Default Upload Location

By default, files are saved to `.tmp/uploads/` in the app directory. This path is **not publicly accessible** -- you need to serve files through an action or use cloud storage for production.

```js
// Serving uploaded files through an action
// config/routes.js
'GET /uploads/:filename': 'serve-upload'

// api/controllers/serve-upload.js
module.exports = {
  inputs: {
    filename: { type: 'string', required: true }
  },
  fn: async function ({ filename }) {
    const filePath = require('path').resolve(
      sails.config.appPath, '.tmp/uploads', filename
    )
    this.res.sendFile(filePath)
  }
}
```
