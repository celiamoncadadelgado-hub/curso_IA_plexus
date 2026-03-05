## Plan de implementación – Gestor de Tareas ICE (8 tareas)

Basado en:
- `ARQUITECTURA_REACT_GESTOR_ICE.md` (estructura, componentes y hooks propuestos).
- Diagramas y mockups de la carpeta `design/` (`ux_flows.md`, `ux_flows_es.png`, `ui_screens_es.png`).

Pensado para automatizar más adelante la generación de tareas de desarrollo en un proyecto React + TypeScript sin librerías de estado externas (solo hooks personalizados).

---

### Tarea 1 – Bootstrapping y estructura mínima de carpetas

- **Objetivo**: Crear el esqueleto de la app según la arquitectura propuesta.
- **Incluye**:
  - Generar proyecto Vite con plantilla React + TypeScript.
  - Instalar y configurar herramientas de calidad de código:
    - Prettier (formateo automático).
    - ESLint con reglas básicas para React + TypeScript.
  - Añadir dependencia de librería de componentes Material Design (por ejemplo MUI) y su adaptador para React.
  - Crear la estructura de carpetas indicada en `ARQUITECTURA_REACT_GESTOR_ICE.md`:
    - `src/components/`
    - `src/hooks/`
    - `src/services/`
    - `src/utils/`
    - `src/types/`
    - `src/constants/`
  - Crear archivos vacíos para los componentes clave:
    - `Navbar.tsx`, `FormCrearTarea.tsx`, `TaskList.tsx`, `TaskCard.tsx`, `PriorityModal.tsx`.
  - Configurar `App.tsx` y `main.tsx` para renderizar `Navbar` y un placeholder de contenido.

---

### Tarea 2 – Definición de tipos y utilidades del modelo ICE

- **Objetivo**: Modelar el dominio de tareas y encapsular la lógica del modelo ICE en funciones puras.
- **Incluye**:
  - Definir tipos en `src/types/index.ts`:
    - `TaskStatus`, `Task`, `GeminiAnalysis` según `ARQUITECTURA_REACT_GESTOR_ICE.md`.
  - Implementar `src/utils/ice.ts` con funciones puras:
    - `calcularScore(impact, confidence, ease)` que NO dependa de React.
    - `validarTarea(task)` con las reglas mínimas (rangos 1–10, descripción no vacía, etc.).
  - Añadir cualquier constante relacionada (límites ICE, claves de storage) a `src/constants/index.ts`.
  - Asegurar que `scoreICE` es un dato derivado (no se almacena en `Task`).

---

### Tarea 3 – Hook `useLocalStorage` y hook de dominio `useTareas`

- **Objetivo**: Implementar la fuente de verdad de las tareas y su persistencia en `localStorage`.
- **Incluye**:
  - Implementar `src/hooks/useLocalStorage.ts` como hook genérico:
    - Firma `useLocalStorage<T>(key: string, initialValue: T)`.
    - Lectura inicial desde `localStorage` y escritura en cada actualización.
  - Implementar `src/hooks/useTareas.ts`:
    - Estado interno `tasks: Task[]` inicializado con `useLocalStorage`.
    - Acciones:
      - `addTask(taskInput: Omit<Task, 'id'>)` (genera `id` y persiste).
      - `updateTask(id, changes)` (actualiza y persiste).
      - `deleteTask(id)` (elimina y persiste).
    - Utilizar `calcularScore` solo para ordenar o para exponer un selector de tareas ordenadas, sin guardar el score.
  - Exponer API clara para que `App` y componentes consuman `useTareas`.

---

### Tarea 4 – Hook de UI `useModal` y composición en `App`

- **Objetivo**: Separar el estado de la UI (modal de prioridad) del estado de dominio.
- **Incluye**:
  - Implementar `src/hooks/useModal.ts`:
    - Estado `open: boolean`, `selectedTask: Task | null`.
    - Métodos `openModal(task)`, `closeModal()`.
  - Componer todo en `App.tsx`:
    - Usar `useTareas` para obtener `tasks` y acciones CRUD.
    - Usar `useModal` para controlar `PriorityModal`.
    - Renderizar el árbol básico descrito en la arquitectura:
      - `Navbar`
      - `FormCrearTarea`
      - `TaskList`
      - `PriorityModal`
    - Pasar por props únicamente los datos y callbacks necesarios (sin introducir Context ni Redux).

---

### Tarea 5 – Implementación de `FormCrearTarea` con integración de `gemini.ts`

- **Objetivo**: Implementar el flujo de creación de tareas, incluyendo la llamada opcional a IA.
- **Incluye**:
  - Implementar `src/services/gemini.ts`:
    - Función `analyzeTask(description: string): Promise<GeminiAnalysis>`.
    - Encapsular allí cualquier parsing del JSON de Gemini.
  - Implementar `components/FormCrearTarea.tsx`:
    - Estado local para:
      - `description`, `impact`, `confidence`, `ease`, `explanation`.
      - `loadingIA`, `errorIA`.
    - Usar `calcularScore` para mostrar el Score ICE en vivo.
    - Botón “Analizar con IA”:
      - Llama a `analyzeTask`.
      - Actualiza I, C, E y explanation con la respuesta.
    - Botón “Añadir tarea”:
      - Valida los datos con `validarTarea`.
      - Llama a `useTareas.addTask`.
      - Resetea el formulario si todo sale bien.

---

### Tarea 6 – Implementación de `TaskList` y `TaskCard`

- **Objetivo**: Representar la lista priorizada de tareas según los diseños.
- **Incluye**:
  - Implementar `components/TaskList.tsx`:
    - Recibir por props el array de tareas (idealmente ya ordenadas).
    - Mostrar estado vacío cuando la lista esté vacía.
    - Renderizar una `TaskCard` por cada tarea.
  - Implementar `components/TaskCard.tsx`:
    - Mostrar:
      - Descripción truncada.
      - Chips I, C, E.
      - Score calculado con `calcularScore`.
      - Fragmento de la explicación.
      - Estado de la tarea (pending / in_progress / done) si se usa.
    - Exponer un único callback `onAction({ type, taskId })` para:
      - `type: 'edit'`, `type: 'view'`, `type: 'delete'` (según los botones pulsados).
  - Conectar `TaskList` con `App`:
    - Para que `onAction` active `useModal` o llame a `useTareas.deleteTask` según corresponda.

---

### Tarea 7 – Implementación de `PriorityModal` (edición y explicación)

- **Objetivo**: Permitir revisar, editar y entender la prioridad ICE de una tarea en un único modal.
- **Incluye**:
  - Implementar `components/PriorityModal.tsx` según la arquitectura:
    - Recibir `open`, `task`, `onClose`, `onSave`.
    - Internamente:
      - Copiar los campos de la tarea a estado local para edición (description, impact, confidence, ease, explanation).
      - Recalcular Score ICE en vivo con `calcularScore`.
    - Mostrar:
      - Descripción.
      - Inputs numéricos I, C, E.
      - Score grande + etiqueta de prioridad.
      - Campo de explicación completo.
    - Al pulsar “Guardar”:
      - Validar con `validarTarea`.
      - Llamar a `onSave` con los cambios.
      - Cerrar modal.
  - Conectar `PriorityModal` con `useTareas.updateTask` y `useModal` desde `App`.

---

### Tarea 8 – Refinamiento, eliminación y pruebas contra los flujos de diseño

- **Objetivo**: Completar la UX, manejar la eliminación de tareas y validar que la implementación sigue los diagramas de flujo.
- **Incluye**:
  - Implementar la acción de eliminación en `App` usando `useTareas.deleteTask`.
    - Confirmación simple (por ejemplo `window.confirm`) o un pequeño `Dialog` adicional, según se desee.
  - Ajustar estilos y comportamiento de todos los componentes:
    - Coherencia con los mockups `ui_screens_es.png`.
    - Estados de error, loading y vacíos claros.
  - Probar manualmente los flujos descritos en `design/ux_flows.md`:
    - Crear tarea con y sin IA.
    - Editar tarea desde el modal.
    - Ver explicación completa.
    - Eliminar tarea.
    - Recargar la página y comprobar que las tareas se cargan desde `localStorage` y se ordenan correctamente.

