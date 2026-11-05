# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## HomeConnect onboarding

The app includes a front-end onboarding preview for email sign-up, client/provider role selection, and provider identity/contact verification steps. Authentication, Google OAuth, email/WhatsApp verification, and identity-document uploads are not connected to a backend; the preview does not save or transmit submitted information. Do not enter real identity documents or sensitive details until secure authentication and storage are configured.

Provider package tiers and pricing are not yet implemented.

Run the app locally with `npm install` and `npm run dev`. Use `npm run build` to create a production build.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
