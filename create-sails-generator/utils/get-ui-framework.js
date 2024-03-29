module.exports = function getUIFramework(packageJSON) {
  if (!packageJSON.dependencies)
    throw new Error('Package.json do not have dependencies')
  if (packageJSON.dependencies['@inertiajs/vue3']) {
    return 'vue'
  } else if (packageJSON.dependencies['@inertiajs/react']) {
    return 'react'
  } else if (packageJSON.dependencies['@inertiajs/svelte']) {
    return svelte
  } else {
    throw new Error('Could not get UI framework from package.json.')
  }
}
