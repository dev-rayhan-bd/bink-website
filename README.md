# Binksanders Website

Welcome to the **Binksanders Website** project! This is a modern, high-performance web application built with the latest frontend technologies to deliver a robust and beautiful user experience. It features a public-facing website, a `company` portal, and a `super-admin` dashboard.
 
## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Rich Text Editor:** [Tiptap](https://tiptap.dev/)
- **Charts & Data Viz:** [Recharts](https://recharts.org/)
- **Language:** TypeScript

## 📁 Key Features

- **Public Website:** Showcase for Binksanders services and offerings.
- **Company Portal:** Dedicated workspace and management area for companies.
- **Super-Admin Dashboard:** Comprehensive administrative controls, metrics, and data visualizations.
- **Rich Text Editing:** Advanced content creation using Tiptap.
- **Responsive Design:** Fully optimized for all screen sizes and devices.
- **Dark/Light Mode:** Seamless theme switching with `next-themes`.

## 📂 Folder Structure 

```text
binksanders_website/
├── public/                 # Static assets like images, fonts, and icons
├── src/                    # Main source code
│   ├── app/                # Next.js App Router (pages, routes & layouts)
│   │   ├── (admin-route)/  # Routes for portals
│   │   │   ├── company/    # Company specific pages
│   │   │   └── super-admin/# Super-admin dashboard pages
│   │   ├── (main-route)/   # Main public website pages
│   │   ├── auth/           # Authentication related pages
│   │   └── onboard/        # Onboarding flow pages
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Generic common components
│   │   ├── company/        # Company portal specific components
│   │   ├── home/           # Homepage specific components
│   │   ├── layout/         # Layout wrappers (Header, Sidebar, etc.)
│   │   ├── modules/        # Feature-specific module components
│   │   ├── super-admin/    # Super-admin specific components
│   │   ├── survey/         # Survey/Forms related components
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── config/             # Configuration files
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and shared logic
│   │   ├── seed/           # Mock data and seeders
│   │   ├── types/          # TypeScript types and interfaces
│   │   ├── validations/    # Zod schema definitions
│   │   └── utils.ts        # General utility functions
│   └── providers/          # Context providers (e.g., ThemeProvider)
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies & scripts
└── postcss.config.mjs      # PostCSS configuration
```

## 🛠️ Getting Started

### Prerequisites

Ensure you have Node.js and a package manager (like `npm`, `yarn`, `pnpm`, or `bun`) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sparktechagency/binksanders_website.git
   ```

2. Navigate into the project directory:
   ```bash
   cd binksanders_website
   ```

3. Install the dependencies:
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

### Running the Development Server

Start the development server by running:

```bash
npm run dev
# or yarn dev
# or pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Building for Production

To build the application for production, run:

```bash
npm run build
```

Then, start the production server:

```bash
npm run start
```

## 🌐 Live Links

- **Main Website:** [https://binksanders-website.vercel.app/](https://binksanders-website.vercel.app/)
- **Super Admin Portal:** [https://binksanders-website.vercel.app/super-admin](https://binksanders-website.vercel.app/super-admin)
- **Company Portal:** [https://binksanders-website.vercel.app/company](https://binksanders-website.vercel.app/company)

## 🎨 UI & Design System

This project uses **shadcn/ui** for accessible, customizable components and **Tailwind CSS** for utility-first styling. The `components` directory contains all reusable UI elements.

## 📝 Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the app for production.
- `npm run start`: Starts the built production server.
- `npm run lint`: Runs ESLint to catch and fix code issues.

---

*Developed and maintained by Spark Tech Agency.*
