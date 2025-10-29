# Noizzy App

## Development steps

1. Rename the field .env.template for .env
2. Make the respective changes in the environment variables


````
VITE_API_URL=https://localhost:4000/api

```
## 🧪 Testing & QA

El frontend de **Noizzy** cuenta con una cobertura completa de tests unitarios y de integración, garantizando una UI estable, accesible y libre de regresiones.

### ⚙️ Stack de pruebas
- 🧰 **Framework:** [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com/)
- 🧩 **Entorno:** `jsdom`
- 🧠 **Cobertura:** componentes, hooks personalizados, slices de Redux, y lógica de UI/UX

### 🧾 Características destacadas
- Mock completo de dependencias: Firebase, Cloudinary, Context Providers, etc.  
- Tests de interacción real con usuario (`userEvent.click`, `fireEvent.change`)  
- Validación de accesibilidad: `aria-labels`, `roles`, `alt`  
- Tests de renderizado condicional, estados de carga y skeletons  

### ▶️ Ejecución
```bash
npx vitest run --reporter=verbose

