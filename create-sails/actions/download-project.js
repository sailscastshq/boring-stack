export default async function downloadProject(projectName, frontend) {}

function getTemplate(template = 'mellow', frontend) {
  return `${template}-${frontend}`
}
