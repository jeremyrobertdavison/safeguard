# Safeguard

Safeguard is a system-agnostic **Foundry Virtual Tabletop** module for collecting player scene preferences, genre/tone preferences, and **Lines & Veils** through an intentionally anonymous GM-facing dashboard.

Safeguard is designed to give players a quiet, persistent place to communicate what they want more of—and what they do not want brought into play—without turning those preferences into a public table discussion.

## Features

- A **Safeguard** control available from Foundry's scene controls.
- Players may select any number of preferred scene types:
  - Roleplay
  - Combat
  - Puzzle
  - Downtime
  - Story
  - Travel
- Players may select any number of preferred genres/tones:
  - High Fantasy
  - Low Fantasy
  - Dark Fantasy
  - Light Hearted
  - Serious
  - General Blend
- Dedicated free-text fields for **Lines** and **Veils**.
- Players can update their answers at any time.
- The GM sees aggregate preference counts and an anonymous collection of Lines and Veils.
- The GM dashboard does **not** display player names, portraits, characters, colors, or individual submission status.
- A configurable minimum-response threshold hides results until enough players have submitted to reduce identification by elimination.
- Responses persist in the Foundry world across sessions and server restarts.
- System-agnostic: no D&D-specific dependency is required.

## Anonymity and Privacy

Safeguard provides **application-level anonymity**, not cryptographic anonymity. The GM-facing interface intentionally avoids associating displayed answers with player identities, but a Foundry administrator controls the world and server and may be able to inspect stored module/world data directly.

For that reason, Safeguard should not be represented to players as a system capable of protecting information from the server administrator. Its purpose is to prevent ordinary GM-facing use of the module from revealing who submitted a particular preference, Line, or Veil.

By default, the dashboard waits for at least three player responses before displaying collected results. The GM can adjust this threshold in Module Settings.

## Installation

### Foundry Manifest URL

Once a GitHub release has been published, install Safeguard in Foundry using:

`https://github.com/jeremyrobertdavsion/safeguard/releases/latest/download/module.json`

In Foundry VTT, open **Add-on Modules → Install Module**, paste the manifest URL into the Manifest URL field, and install it. Enable **Safeguard** for the desired world under **Manage Modules**.

### Manual Installation

Download the release archive, extract it into Foundry's `Data/modules/` directory as a folder named `safeguard`, restart Foundry if necessary, and enable the module in your world.

## Usage

Players select the **Safeguard** shield control, choose any scene and genre preferences that apply, enter optional Lines and Veils, and save. Returning to Safeguard allows the player to revise the same response.

GMs use the same control to open the **GM Dashboard**. The dashboard displays response totals, aggregate preference counts, and anonymous Lines and Veils once the configured anonymity threshold has been reached.

The GM can clear the complete response set when beginning a new campaign, arc, or safety/preferences check-in.

## Lines & Veils

A **Line** is content a player does not want included in the game.

A **Veil** is content that may exist in the fiction but should occur off-screen or without detailed description.

Safeguard is a communication aid. It does not replace good judgment, table discussion, or other safety practices that a group finds useful.

## Compatibility

The initial release targets **Foundry VTT v13** and is designed to be game-system independent.

## Repository

Project repository: `https://github.com/jeremyrobertdavsion/safeguard`

Issues and feature requests are welcome through the GitHub issue tracker.

## Building a Release

GitHub releases should contain both `module.json` and `safeguard.zip` as release assets. The ZIP should contain the module files at the root of the archive rather than an additional parent directory.

Example from the repository root:

```bash
zip -r safeguard.zip module.json README.md LICENSE scripts templates styles lang icons
```

Create a GitHub release/tag such as `v1.0.0`, then attach `module.json` and `safeguard.zip`. The manifest and download URLs in `module.json` point to the `latest` release assets so Foundry can install and update the module directly from GitHub.

## License

Safeguard is released under the MIT License. See [LICENSE](LICENSE).

## Author

Created by **Jeremy Davison**.

GitHub: `jeremyrobertdavsion`
