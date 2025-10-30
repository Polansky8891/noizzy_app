# 🎧 Noizzy — Frontend (React + Vite + Tailwind)

Interfaz moderna del proyecto **Noizzy**, un reproductor de música full-stack con favoritos, estadísticas y autenticación de usuario.

---

## ✨ Demo

- 🌐 **Deploy:** [https://noizzy.app](https://noizzy.app) <!-- 🔧 cambia por tu URL real -->
- ⚙️ **Backend:** [Noizzy Backend](../noizzy_app_backend)

---

## 🧰 Tech Stack

- ⚛️ **React 18** + **Vite**
- 🎨 **Tailwind CSS**
- 🧩 **Redux Toolkit** (slices + thunks)
- 🔥 **Firebase Auth** (email/password y Google Sign-In)
- 🧪 **Vitest** + **React Testing Library**
- 🎧 **React Icons**
- 🪄 Alias de import: `@ → src/`

---

## 🧭 Características principales

- 🎵 **Reproductor de música** (`MusicPlayer`)
  - Controles: Play / Pause / Skip ±10s / Seek bar
  - Control de volumen y mute accesibles (`aria-*`)
  - Estado global mediante `PlayerContext`
- 💟 **Favoritos**
  - Botón `FavButton` conectado a `/api/favorites`
  - Sincronización inmediata con el backend
- 👤 **Autenticación**
  - Registro y login (con Firebase o API JWT)
  - Renovación automática de token
- 📊 **Estadísticas**
  - `/api/stats/summary` con minutos, géneros top, tracks únicos y daily
  - Página `Stats` con visualización simple y responsive
- ⚡ **UI/UX**
  - Responsive completo (mobile → desktop)
  - Diseño **cyber-neon** con tonos `#0A84FF`
  - Imágenes `lazy-loaded` con fallback automático
  - Accesibilidad (A11y) validada con Testing Library

---


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

