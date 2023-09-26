# The Boring JavaScript Stack contributing guidelines

Thank you for taking the time to contribute to our project. We appreciate you! 🫶🏽 Please take a moment to read the following guidelines before contributing:

> ⚠️IMPORTANT **Note**
>
> **Pull Requests having no issue associated with them will not be accepted. Firstly get an issue assigned, whether it's already opened or raised by you, and then create a Pull Request.**

## Prerequisites

Before you contribute to The Boring JavaScript Stack, make sure you have the following prerequisites:

- Open Source Etiquette: If you've never contributed to an open source project before, have a read of [Basic etiquette](https://developer.mozilla.org/en-US/docs/MDN/Community/Open_source_etiquette) for open source projects.

- Basic familiarity with Git and GitHub: If you are also new to these tools, visit [GitHub for complete beginners](https://developer.mozilla.org/en-US/docs/MDN/Contribute/GitHub_beginners) for a comprehensive introduction to them

- [Node.js](https://nodejs.org/) is installed.

---

## How to Contribute 🤔

To contribute to The Boring JavScript Stack, follow these steps:

- Look at the existing [**Issues**](https://github.com/sailscastshq/boring-stack/issues) or create a new issue if you haven't found a suitable one.
- [**Fork the Repo**](https://github.com/sailscastshq/boring-stack/issues) and create a branch for the specific issue you are working on. Let's start making a difference together! 😊
- Create a **[Pull Request](https://github.com/sailscastshq/boring-stack)** (_PR_), which will be reviewed and given suggestions for improvements by the maintainer.
- If applicable, include screenshots or screen captures in your Pull Request to help us better understand the impact of your proposed changes.

---

## Submission Guidelines 📝

### Branch Organization

At The Boring JavaScript Stack, we use the [Gitflow branching model](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) where we use a `develop` branch as the main branch for active development. Therefore, all Pull Requests should be directed towards the `develop` branch instead of the `main` branch. This helps us maintain a stable `main` branch while allowing continuous development on the `develop` branch.

### Good First Issue

If you're new to our project, we recommend starting with the [_Good first issue_](https://github.com/sailscastshq/boring-stack/issues?q=is:open+is:issue+label:%22good+first+issue%22)label. These issues are ideal for getting familiar with the project and making your first contribution. Before starting work, please confirm with the maintainers that the issue is still relevant. Feel free to comment on the issue to express your intention and avoid duplicate efforts.

### Sending a Pull Request

To ensure a smooth review process, please follow these guidelines:

- Fork (https://help.github.com/articles/fork-a-repo) the repository into your own account.
- In your forked repository, create a new branch: `git checkout -b my-branch develop`
- Make your changes/fixes.
- Commit your code with a good commit message [using "Conventionalcommits"](https://www.conventionalcommits.org/en/v1.0.0/).
- Push your branch to GitHub: `git push origin my-branch`
- [Open a Pull Request](https://help.github.com/articles/using-pull-requests/) with a clear title and description matching the issue you intend to solve.

> ⚠️IMPORTANT **Note**
>
> ** To ensure a better review experience, we kindly request that you use the following format for the PR title: `[chore]`, `[feat]`, or `[fix]`, followed by a descriptive title. For example, a chore-related change could have a title like `[chore] Update contributing guidelines`. This helps us categorize and understand the nature of the changes made in each PR..**

- Link the issue you have resolved in the Pull Request Template using the following syntax:
- If your Pull Request fixes issue #25, add `Fixes #25` or `Closes #25` to the description.
- If your Pull Request addresses multiple issues, list them using the same syntax (`Fixes #23, Fixes #15`).

This helps us track and automatically close the relevant issue when your Pull Request is merged.

### Commits

We highly encourage the use of conventional commits.

Your commit messages should contain one of these keywords based on the changes your make:

| Commit Type | Title                    | Description                                                                                                 | Emoji(Optional)  |
| ----------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |:------:|
| `feat`      | Features                 | A new feature                                                                                               | ✨     |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   | 🐛     |
| `docs`      | Documentation            | Documentation only changes                                                                                  | 📚     |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      | 💎     |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   | 📦     |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     | 🚀     |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           | 🚨     |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         | 🛠     |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) | ⚙️     |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           | ♻️     |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   | 🗑     |
[Source](https://github.com/pvdlg/conventional-commit-types)

Here are some examples:

- `feat: Implement user authentication feature`
- `fix: Null pointer exception when accessing user profile`
- `chore: Add 'Privacy Policy' link in footer`
- Please keep your commit messages concise and clear.
- Write commit messages in the present tense, as they represent the current state of the codebase after the changes have been applied.

For additional reference, check out [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

## First-time Contributor's Guide 📹

If you're a first-time contributor to open source projects, we recommend watching this [YouTube video](https://www.youtube.com/watch?v=Vqjzl9f3lGM). It provides valuable insights and guidance for getting started.

## Your Feedback Matters! 💬

- If you notice any missing information or feel that something is not adequately described, please don't hesitate to create a pull request (PR) or [raise an issue](https://github.com/sailscastshq/boring-stack/issues). Your input helps us improve our guidelines and make the Boring-Stack project even more awesome!

We're thrilled to have you on board. Let's make a difference together! 🚀
