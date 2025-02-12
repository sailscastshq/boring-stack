import fs from 'fs'
export default function directoryExists(directory) {
  return fs.existsSync(directory)
}
