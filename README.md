# WonderlandEngine / viverse-example

**Example — Integrating the VIVERSE Avatar SDK with Wonderland Cloud networking**

![Demo](https://img.shields.io/badge/demo-live-brightgreen)

Live demo: https://worlds.viverse.com/k99xkYZ

---

## Overview

This repository is a template project that demonstrates how to integrate the **VIVERSE Avatar SDK** with **Wonderland Cloud** networking. It shows a compact, production-minded workflow to:

- Spawn and persist user data (name, avatar) via the VIVERSE Avatar SDK.
- Relay avatar + presence state to Wonderland Cloud for performant, medium-scale multiplayer sessions.
- Use spatial audio for immersive multiplayer experiences.

> Designed for quick iteration and easy publishing through the VIVERSE / Wonderland tooling.

---

## Features

- VIVERSE Avatar SDK integration (login, avatar spawn, user metadata).
- Wonderland Cloud networking client + server template.
- Simple VIVERSE CLI plugin integration for publishing and previewing.
- Example components showing where to place `appid` and server path.
- Spatial audio + avatar position replication for medium-scale sessions.

---

## Quick setup (editor)

1. **Open** the `viversePublishPlugin` inside the Wonderland Editor.
2. **Log in** with your VIVERSE credentials.
3. Click **Create Application** — this redirects to VIVERSE Studio.
4. In VIVERSE Studio create an app and **copy the App ID**.
5. **Paste the App ID** into the `appid` field of the plugin.

### In the scene (hierarchy)

1. In the hierarchy open: `Avatar -> VrmDynamic`
2. Expand **Viverse Provider** component (or `viverse-provider-component`) in the Inspector.
3. Paste the **App ID** there as well.

---

## Networking setup (Wonderland Cloud)

1. Go to : `https://cloud.wonderland.dev/create-server`
2. Upload the packaged server:  
   `server/wonderland-cloud-example-simple-1.0.0.tgz`
3. Create the server and **copy the server path** that Wonderland Cloud returns.
4. In the hierarchy, select `Player` and find the `simple-example-client` component.
5. Paste the **server path** into the `simple-example-client` → `serverPath` (or equivalent) field.

---

## Publish & Preview (VIVERSE CLI plugin)

1. Use the VIVERSE CLI plugin inside the editor to **publish** the project.
2. From the plugin you can click **Preview URL** to open a preview build.
3. Use **Submit for Review** in the plugin to open the VIVERSE Creator page for your application.
4. Use the **Guest Preview** link from VIVERSE Creator to invite others (multiple devices/accounts) and test multiplayer in production-like conditions.
5. When ready, submit the app for review to list it publicly.

---

## Troubleshooting & Tips

- If avatars don’t appear: verify the **App ID** is set in both the plugin and the `VrmDynamic -> Viverse Provider` component.
- If networking fails: re-check that the uploaded package matches the server entry on `cloud.wonderland.dev` and confirm the server path is pasted correctly in the `simple-example-client` component.
- Use the plugin **Preview URL** to test cross-device connectivity before submitting for review.
- Check browser console logs (F12) for helpful client-side errors (auth / CORS / network).

---

## Contributing

Pull requests welcome — keep changes small and documented. Open an issue for feature requests or bugs.

---

## Contact

If you want help setting up this template for your project, reach out via [Discord](https://discord.gg/a38X5g7m).

---
