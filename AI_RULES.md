# AI Rules

## Tech Stack
- React 18 with TypeScript for all UI code.
- React Router for routing; keep all routes in `src/App.tsx`.
- Vite as the build tool and dev server.
- Tailwind CSS for styling and layout utilities.
- shadcn/ui components (built on Radix UI primitives) for reusable UI primitives.
- lucide-react for icons.
- All shadcn/ui dependencies are already installed — do not reinstall them.

## Library Usage Rules
- Use **React Router** for navigation and routing, and keep route definitions in `src/App.tsx`.
- Use **Tailwind CSS** classes for all styling, spacing, colors, and layout.
- Use **shadcn/ui** components for buttons, dialogs, forms, tables, etc. Do not edit their internal files; create new components if you need custom behavior.
- Use **lucide-react** for all icons.
- Keep pages in `src/pages/` and components in `src/components/`.
- The main page is `src/pages/Index.tsx`; update it to include any new components.
- Avoid adding new UI libraries or frameworks beyond those listed above unless explicitly requested.
- Prefer simple, focused solutions over over-engineering.
