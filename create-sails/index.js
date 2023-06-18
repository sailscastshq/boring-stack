#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const minimist = require("minimist");
const prompts = require("prompts");
const { red, green, bold } = require("kolorist");

const renderTemplate = require("./helpers/render-template");
const isValidPackageName = require("./helpers/to-valid-package-name");
const canSafelyOverwrite = require("./helpers/can-safely-overwrite");
// const { postOrderDirectoryTraverse, preOrderDirectoryTraverse } = require('./helpers/directory-traverse')
const generateReadme = require("./helpers/generate-readme");
const getCommand = require("./helpers/get-command");
const banner = require("./helpers/banner");
const emptyDir = require("./helpers/empty-dir");

async function init() {
  console.log(`\n${banner}\n`);
  const cwd = process.cwd();

  // possible options:
  // --default / --d
  // --japa
  // --prettier
  // --force (for force overwriting)
  const argv = minimist(process.argv.slice(2), {
    // all arguments are treated as booleans
    boolean: true,
  });

  let targetDir = argv._[0];
  const defaultProjectName = !targetDir ? "sails-project" : targetDir;

  const forceOverwrite = argv.force;

  let result = {};
  try {
    result = await prompts(
      [
        {
          name: "projectName",
          type: targetDir ? null : "text",
          message: "Project name:",
          initial: defaultProjectName,
          onState: (state) =>
            (targetDir = String(state.value).trim() || defaultProjectName),
        },
        {
          name: "shouldOverwrite",
          type: () =>
            canSafelyOverwrite(targetDir) || forceOverwrite ? null : "confirm",
          message: () => {
            const dirForPrompt =
              targetDir === "."
                ? "Current directory"
                : `Target directory "${targetDir}"`;

            return `${dirForPrompt} is not empty. Remove existing files and continue?`;
          },
        },
        {
          name: "overwriteChecker",
          type: (prev, values) => {
            if (values.shouldOverwrite === false) {
              throw new Error(red("✖") + " Operation cancelled");
            }
            return null;
          },
        },
        {
          name: "packageName",
          type: () => (isValidPackageName(targetDir) ? null : "text"),
          message: "Package name:",
          initial: () => toValidPackageName(targetDir),
          validate: (dir) =>
            isValidPackageName(dir) || "Invalid package.json name",
        },
        {
          type: "multiselect",
          name: "frontend",
          message: "Choose frontend framework",
          hint: "- Space to select. Return to submit",
          min: 1,
          max: 1,
          choices: [
            { title: "Vue", value: "vue" },
            { title: "React", value: "react" },
            { title: "Svelte", value: "svelte" },
          ],
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    process.exit(1);
  }

  const {
    projectName,
    packageName = projectName ?? defaultProjectName,
    shouldOverwrite = argv.force,
    buildTool = "webpack",
    css = "tailwind",
    frontend = argv.frontend ?? "vue",
  } = result;

  const root = path.join(cwd, targetDir);

  if (fs.existsSync(root) && shouldOverwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root);
  }

  console.log(`\nScaffolding project in ${root}...`);

  const pkg = { name: packageName, version: "0.0.0" };

  fs.writeFileSync(
    path.resolve(root, "package.json"),
    JSON.stringify(pkg, null, 2)
  );

  const templateRoot = path.resolve(__dirname, "template");
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName);
    renderTemplate(templateDir, root);
  };

  // Render base template
  render("base");

  // Add configs.
  render(`config/${buildTool}`);
  render(`config/${css}`);
  render(`config/${frontend}`);

  // Instructions:
  // Supported package managers: pnpm > yarn > npm
  // Note: until <https://github.com/pnpm/pnpm/issues/3505> is resolved,
  // it is not possible to tell if the command is called by `pnpm init`.
  const userAgent = process.env.npm_config_user_agent ?? "";
  const packageManager = /pnpm/.test(userAgent)
    ? "pnpm"
    : /yarn/.test(userAgent)
    ? "yarn"
    : "npm";

  // README generation
  fs.writeFileSync(
    path.resolve(root, "README.md"),
    generateReadme({
      projectName: result.projectName ?? defaultProjectName,
      packageManager,
      css,
      buildTool,
      frontend,
    })
  );

  // Inject default DEK
  const generateDefaultDEK = require("./helpers/generate-default-dek");
  const modelsConfigPath = path.resolve(root, "config/models.js");
  const modelsConfigContent = fs.readFileSync(modelsConfigPath, "utf8");
  fs.writeFileSync(
    modelsConfigPath,
    modelsConfigContent.replace("$defaultDEK", generateDefaultDEK())
  );

  // Inject session secret
  const generateSessionSecret = require("./helpers/generate-session-secret");
  const sessionConfigPath = path.resolve(root, "config/session.js");
  const sessionConfigContent = fs.readFileSync(sessionConfigPath, "utf8");
  fs.writeFileSync(
    sessionConfigPath,
    sessionConfigContent.replace("$secret", generateSessionSecret())
  );

  console.log(`\nDone. Now run:\n`);

  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${path.relative(cwd, root)}`))}`);
  }

  console.log(`  ${bold(green(getCommand(packageManager, "install")))}`);

  console.log(`  ${bold(green("sails lift"))}`);
  console.log();
}

init().catch((e) => {
  console.error(e);
});
