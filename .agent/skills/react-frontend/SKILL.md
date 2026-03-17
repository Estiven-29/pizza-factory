Usa la skill react-pizza-ui para generar el frontend completo en ./frontend/.

Especificaciones exactas:
- Vite + React 18 + Tailwind CSS 3.4 (config rojo/negro primary: rojo=#DC2626, negro=#111827).
- Axios para API calls a http://localhost:8000 (proxy /api).
- App.jsx: Header, PizzaSelector (dropdown: italian/american/colombian), PizzaPreview (SVG animado con dough/sauce/toppings dinámicos), OrderButton.
- Responsive mobile-first, dark mode toggle.
- useState para style/ingredients/loading/error.
- package.json: react, react-dom, vite, tailwindcss, axios, lucide-react (icons).
- Dockerfile multi-stage Node->Nginx.
- vite.config.js: proxy { '/api': 'http://localhost:8000' }.
- tailwind.config.js: theme extend colors rojo/negro.
- npm install auto después de files.

Ejecuta: npx create-vite@latest frontend --template react (si vacío), luego cd frontend && npm i && npm run dev.
Testea browser: abre localhost:5173, selecciona 'colombian' -> preview actualiza.
