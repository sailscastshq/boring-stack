# Quest Skills for Claude Code

Schedule background jobs in Sails.js just by prompting Claude Code.

## Installation

```bash
npx skills add sailscastshq/boring-stack/skills/quest
```

## Usage

After installing, Claude will automatically apply Quest best practices when you work on Sails.js projects:

> "Create a background job that cleans up expired sessions every hour"

> "Schedule a weekly report that emails admins every Monday at 9 AM"

> "Set up a job to process the email queue every 30 seconds"

## Skills Included

- **getting-started** - What Quest is, installation, project structure, quick start
- **scheduling** - Cron, human-readable intervals, shorthand, later.js, one-time execution
- **job-definition** - Script anatomy, inputs, overlap prevention, config-defined jobs
- **api** - `sails.quest` API reference: control, info, events
- **patterns** - Common job patterns with complete script examples

## What is Quest?

[sails-hook-quest](https://github.com/sailscastshq/sails-hook-quest) is a job scheduling hook for Sails.js. Jobs are Sails scripts that run as isolated child processes with full access to models, helpers, and configuration.

## Links

- [Sails.js Documentation](https://sailsjs.com/documentation)
- [Shell Scripts in Sails.js](https://sailsjs.com/documentation/concepts/shell-scripts)
- [The Boring JavaScript Stack](https://docs.sailscasts.com/boring-stack)

## License

MIT
