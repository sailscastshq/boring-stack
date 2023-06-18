const getCommand = require("./get-command");

module.exports = function generateReadme({
  projectName,
  packageManager,
  buildTool,
  css,
  frontend,
}) {
  let readme = `# ${projectName}

This template should help get you started developing with a modern Sails fullstack application with Inertia and Vue 3.

This scaffold contains:
* ${buildTool}
* ${css}
* ${frontend}
`;
  return readme;
};
