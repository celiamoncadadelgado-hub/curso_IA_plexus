# Arquitectura React + TypeScript — Gestor de Tareas ICE

Propuesta de **estructura de carpetas**, **división en componentes** y **gestión del estado** sin librerías externas. Basada en el flujo definido en `design/` (diagramas de crear tareas y navegación) y en el alcance del MVP.

---

## 1. Estructura de carpetas

```
gestor-tareas-ice/
├── public/
├── src/
│   ├── components/           # Plano: un archivo por componente (agrupar solo >10)
│   │   ├── Navbar.tsx
│   │   ├── FormCrearTarea.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   └── PriorityModal.tsx
│   ├── hooks/                # Un hook por responsabilidad
│   │   ├── useTareas.ts      # Estado + acciones CRUD
│   │   ├── useLocalStorage.ts# Persistencia genérica y reutilizable
│   │   └── useModal.ts       # open/close + task seleccionada (estado UI)
│   ├── services/             # Llamadas externas (API IA)
│   │   └── gemini.ts         # fetch + loading + error propios de la llamada
│   ├── utils/                # Pure functions sin dependencias de React
│   │   └── ice.ts            # calcularScore(), validarTarea()
│   ├── types/                # Tipos e interfaces TypeScript
│   │   └── index.ts
│   ├── constants/            # Constantes (límites, keys localStorage)
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── design/                   # Diagramas y wireframes (PNG, MD)
├── docs/
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Criterios:**
- **components/** plano mientras no supere 10 componentes; aplanar primero, agrupar solo cuando la escala lo justifique.
- **hooks/** un hook por responsabilidad: `useTareas` (CRUD), `useLocalStorage` (persistencia), `useModal` (estado UI del dialog).
- **services/gemini.ts** concentra el `loading` y `error` reales (los únicos asíncronos: la llamada a la IA).
- **types/** en inglés y sin datos derivados (`scoreICE` no se almacena).
- **utils/ice.ts** sin dependencias de React: `calcularScore(i,c,e)` y `validarTarea()`.

---

## 2. División en componentes

Jerarquía alineada con el flujo de navegación y con las pantallas descritas en `design/pantallas-app.md`.

### 2.1 Árbol de componentes

```
App
├── Navbar
│   └── (Typography, Badge o contador de tareas)
│
├── FormCrearTarea
│   ├── TextField descripción (+ contador 0/200)
│   ├── TextField numéricos: Impacto, Confianza, Facilidad
│   ├── Score en vivo (derivado de I,C,E)
│   ├── TextField/Textarea explicación
│   └── Botones: Analizar, Añadir tarea
│
├── TaskList
│   ├── Estado vacío (mensaje + CTA opcional)
│   └── TaskCard × N (ordenadas por score ICE desc)
│       ├── Chip/ Badge score (color por rango)
│       ├── Descripción (truncada)
│       ├── Chip estado (Esperando | En curso | Hecha)
│       └── Acciones: Ver por qué, Editar ICE, Eliminar
│
└── PriorityModal (un solo modal, contenido según contexto)
    ├── DialogTitle: "Prioridad ICE"
    ├── Score + TextField I, C, E (siempre editables)
    ├── TextField/Textarea explicación
    └── DialogActions: Cancelar, Guardar
```

### 2.2 Responsabilidades por componente

| Componente        | Ubicación           | Responsabilidad |
|-------------------|---------------------|------------------|
| **App**           | `src/App.tsx`       | Solo composición visual: renderiza Navbar, FormCrearTarea, TaskList y PriorityModal. Consume `useTareas` y `useModal`; no tiene lógica propia. |
| **Navbar**        | `components/Navbar.tsx` | Solo presentacional; recibe `totalTasks: number`. |
| **FormCrearTarea**| `components/FormCrearTarea.tsx` | Estado local del form. Llama a `gemini.analyzeTask()` al pulsar «Analizar»; el servicio controla su propio `loading/error`. Recalcula score con `calcularScore()`. Llama a `addTask()` del hook al guardar. |
| **TaskList**      | `components/TaskList.tsx` | Recibe la lista ya ordenada por score (ordenación en el util) y renderiza TaskCards. Muestra estado vacío. |
| **TaskCard**      | `components/TaskCard.tsx` | Presentacional. Dispara un único callback `onAction({ type, taskId })` (event delegation). Score calculado en render con `calcularScore()`, no almacenado ni recibido como prop. |
| **PriorityModal** | `components/PriorityModal.tsx` | Dialog Material. Recibe la tarea seleccionada de `useModal`. Sus campos I,C,E tienen estado local. Al guardar llama a `updateTask()` del hook y `closeModal()`. |

### 2.3 Relación con los diagramas

- **Flujo crear tareas** (`design/flujo-crear-tareas.md`): lo implementan **FormCrearTarea** (entrada, Analizar, validación, Añadir) + **useTareas** (CRUD + localStorage vía `useLocalStorage`) + **services/gemini.ts** (loading/error de la IA).
- **Flujo navegación** (`design/flujo-navegacion.md`): **Navbar**, **FormCrearTarea**, **TaskList** son la "Pantalla principal"; **PriorityModal** es el "Overlay". El estado del modal (abierto/cerrado + tarea seleccionada) vive **siempre en `useModal`**, consumido en App — nunca mezclado en el hook de dominio `useTareas`.

---

## 3. Gestión del estado (sin librerías externas)

Solo **React (useState)** y tres **custom hooks** con responsabilidad única. Sin Context ni Redux: con 2 niveles de árbol (App → hijos) pasar props es suficiente y más explícito.

### 3.1 Dónde vive el estado

| Estado                              | Dónde                                                    | Motivo |
|-------------------------------------|----------------------------------------------------------|--------|
| Lista de tareas                     | **useTareas**                                            | Fuente única de verdad. Sin `loading/error` — el CRUD es síncrono. |
| Persistencia en localStorage        | **useLocalStorage**                                      | Hook genérico consumido internamente por `useTareas`. No expone nada al exterior. |
| loading + error de la llamada a IA  | **services/gemini.ts** + estado local en FormCrearTarea  | El único estado realmente asíncrono; lo gestiona quien lo causa. |
| Apertura del modal + tarea activa   | **useModal** (consumido en App)                          | Estado de UI puro, separado del dominio. Expone `open`, `selectedTask`, `openModal(task)`, `closeModal()`. |
| Valores del formulario de creación  | **FormCrearTarea** (useState local)                      | Solo importan al crear; no hay razón para elevarlos. |
| Valores editados en el modal (I,C,E)| **PriorityModal** (useState local)                       | Edición temporal; al confirmar llama a `updateTask()`. |

### 3.2 Los tres hooks

#### `useTareas` — estado de dominio

- **Estado:** `tasks: Task[]` (solo la lista, sin loading ni error).
- **Inicialización:** delega en `useLocalStorage` para leer el estado inicial.
- **Persistencia:** tras cada mutación llama a `useLocalStorage`; no opera `localStorage` directamente.
- **Acciones:**
  - `addTask(task: Omit<Task, 'id'>)` — genera id, añade y persiste.
  - `updateTask(id: string, changes: Partial<Omit<Task, 'id'>>)` — actualiza. Tipo restrictivo: no permite mutar el `id`.
  - `deleteTask(id: string)` — borra y persiste.

#### `useLocalStorage<T>` — persistencia genérica

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]
```

Lee en la inicialización, escribe en cada actualización. Reutilizable para cualquier dato persistido.

#### `useModal` — estado de UI del dialog

```typescript
function useModal(): {
  open: boolean
  selectedTask: Task | null
  openModal: (task: Task) => void
  closeModal: () => void
}
```

Estado de UI puro, completamente ajeno al dominio de tareas. Consumido en App.

---

#### `services/gemini.ts` — loading y error de la IA

No es un hook, es un módulo de servicio:

```typescript
async function analyzeTask(description: string): Promise<{
  impact: number; confidence: number; ease: number; explanation: string
}>
```

`FormCrearTarea` llama a esta función y gestiona su propio estado local `{ loading, error }`. El loading de la IA nunca contamina el hook de tareas.

### 3.3 Flujo de datos (resumen)

- **Crear tarea:** `FormCrearTarea` (estado local) → `validarTarea()` del util → `addTask()` de `useTareas` → hook actualiza lista + delega persistencia en `useLocalStorage` → App re-renderiza → TaskList muestra la nueva tarea.
- **Analizar con IA:** `FormCrearTarea` → llama a `gemini.analyzeTask()` → activa su `loading` local → recibe `{ impact, confidence, ease, explanation }` → rellena el form → score se recalcula en render con `calcularScore()`.
- **Ver / Editar en modal:** TaskCard dispara `onAction({ type: 'edit', taskId })` → App llama a `openModal(task)` de `useModal` → `PriorityModal` recibe la tarea, gestiona I,C,E con estado local → Guardar llama a `updateTask(id, changes)` + `closeModal()` → lista actualizada.
- **Cambiar estado / Eliminar:** TaskCard `onAction({ type: 'delete'|'changeStatus', taskId })` → `deleteTask()` / `updateTask()` → re-render.

### 3.4 Tipos (types/index.ts)

Todo en inglés para consistencia con el código:

```typescript
// scoreICE NO se almacena — es un dato derivado calculado en render
type TaskStatus = 'pending' | 'in_progress' | 'done'

interface Task {
  id: string
  description: string   // max 200 chars
  impact: number        // 1-10
  confidence: number    // 1-10
  ease: number          // 1-10
  status: TaskStatus
  explanation: string   // generada por IA o escrita a mano
}

// Respuesta del servicio Gemini
interface GeminiAnalysis {
  impact: number
  confidence: number
  ease: number
  explanation: string
}
```

**Por qué `scoreICE` no está en `Task`:** es completamente derivable con `(impact × confidence × 10) / ease`. Almacenarlo crearía dos fuentes de verdad. Se calcula en render con `calcularScore(i, c, e)` del util.

---

## 4. Resumen

- **Carpetas:** `components/` plano (5 componentes, un archivo cada uno); `hooks/` con tres hooks de responsabilidad única; `services/gemini.ts`; `utils/ice.ts`; `types/`; `constants/`.
- **Componentes:** App solo compone — sin lógica propia; Navbar, FormCrearTarea, TaskList, TaskCard (con event delegation vía `onAction({ type, taskId })`), PriorityModal.
- **Hooks:**
  - `useTareas` → CRUD de tareas (sin loading/error).
  - `useLocalStorage` → persistencia genérica, consumida internamente por `useTareas`.
  - `useModal` → estado de UI del dialog (open, selectedTask). Consumido en App.
- **Loading/error de IA:** exclusivos de `services/gemini.ts`; `FormCrearTarea` los gestiona como estado local del formulario.
- **Tipos:** todos en inglés; `scoreICE` no se persiste — se calcula en render con `calcularScore()`.
- **Sin Redux, sin Context:** 2 niveles de props son suficientes y más explícitos.

Documentos de referencia: `design/flujo-crear-tareas.md`, `design/flujo-navegacion.md`, `design/pantallas-app.md`, `MVP_Gestor_Tareas_Inteligente_ICE.md`.
