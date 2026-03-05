## Plan de desarrollo – Gestor de Tareas ICE (8 tareas)

Este plan parte de los flujos definidos en `ux_flows.md` y de los mockups/diagramas de la carpeta `design` (`ui_screens_es.png`, `ux_flows_es.png`), y está pensado para un proyecto React + TypeScript sin librerías de estado externas.

---

### Tarea 1 – Setup del proyecto y estructura base

- **Objetivo**: Tener un proyecto React + TypeScript funcionando con la estructura mínima alineada con la arquitectura definida.
- **Incluye**:
  - Crear proyecto con Vite (template React + TS).
  - Configurar Material Design (por ejemplo MUI) y tema básico acorde al diseño.
  - Crear estructura de carpetas principal:
    - `src/components/layout`, `src/components/tasks`, `src/context`, `src/hooks`, `src/services`, `src/types`.
  - Implementar `AppLayout`, `Navbar` y `Footer` de forma estática (sin lógica).
  - Conectar `App.tsx` y `main.tsx` para mostrar la pantalla principal vacía.

---

### Tarea 2 – Modelado de dominio y servicios puros

- **Objetivo**: Definir claramente el modelo de datos y las funciones puras de negocio.
- **Incluye**:
  - Crear tipos en `src/types/task.ts`:
    - `Task`, `PriorityLabel`, etc., según el alcance.
  - Implementar `iceService` en `src/services/iceService.ts`:
    - Función `calculateIce(impact, confidence, ease)` que devuelva `scoreICE` y etiqueta de prioridad.
  - Definir `storageService` **o** hook `useLocalStorage` (solo uno) en `src/services`:
    - Funciones para leer/escribir `Task[]` en `localStorage`.
  - Dejar esta capa sin dependencias de React (funciones puras y tipos).

---

### Tarea 3 – Contexto de tareas y gestión de estado global

- **Objetivo**: Centralizar el estado de las tareas (sin mezclar estado de UI) y la persistencia.
- **Incluye**:
  - Crear `TasksContext` y `TasksProvider` en `src/context/TasksContext.tsx`.
  - Estado global:
    - `tasks`, `loading`, `error`.
  - Acciones:
    - `addTask`, `updateTask`, `deleteTask`.
    - Uso de `calculateIce` para mantener siempre `scoreICE` actualizado.
    - Lectura inicial y escritura en `localStorage` usando el servicio definido en la tarea 2.
  - Crear el hook `useTasks` en `src/hooks/useTasks.ts` como API única para el resto de componentes.
  - Integrar `TasksProvider` en `App.tsx`.

---

### Tarea 4 – Pantalla principal y estado de UI de diálogos

- **Objetivo**: Construir la pantalla principal (`TasksScreen`) y separar el estado de UI (modales) del estado de dominio.
- **Incluye**:
  - Crear `TasksScreen` en `src/components/tasks/TasksScreen.tsx` o similar.
  - Usar `useTasks` para leer `tasks` y acciones CRUD.
  - Definir estado local en `TasksScreen` para:
    - `editingTask` / `editingTaskId`.
    - `deletingTask` / `deletingTaskId`.
    - Flags `isPriorityDialogOpen`, `isDeleteDialogOpen`.
  - Conectar esta pantalla con `AppLayout` en `App.tsx`.
  - Dejar preparados los huecos para `TaskForm`, `TaskList`, `TaskPriorityDialog`, `TaskDeleteDialog` (aunque estén inicialmente vacíos).

---

### Tarea 5 – Implementar TaskForm con integración de IA y cálculo ICE en vivo

- **Objetivo**: Permitir crear tareas según el flujo del diagrama de creación, con IA opcional.
- **Incluye**:
  - Crear `TaskForm` en `src/components/tasks/TaskForm.tsx`:
    - Campos:
      - Descripción (multiline).
      - Inputs numéricos: Impacto, Confianza, Facilidad.
      - Campo de texto multiline para “Explicación de la priorización”.
      - Visualización de `Score ICE` usando `calculateIce` en tiempo real.
    - Botones:
      - “Analizar con IA”.
      - “Guardar tarea”.
  - Implementar `aiService` en `src/services/aiService.ts`:
    - Encapsular llamada a Gemini y devolver `{ impact, confidence, ease, explanation }`.
  - Integrar `TaskForm` con `aiService`:
    - Rellenar I, C, E y explanation cuando el usuario pulsa “Analizar con IA”.
  - Integrar `TaskForm` con `useTasks.addTask` para crear la tarea final.

---

### Tarea 6 – Lista de tareas y tarjetas priorizadas

- **Objetivo**: Mostrar las tareas según los diseños, ordenadas por score ICE, con acciones básicas.
- **Incluye**:
  - Crear `TaskList` en `src/components/tasks/TaskList.tsx`:
    - Recibir `tasks` ya ordenadas desde `TasksScreen`.
    - Mostrar `TaskEmptyState` si la lista está vacía.
  - Crear `TaskCard` en `src/components/tasks/TaskCard.tsx`:
    - Mostrar descripción, chips I/C/E, chip de `Score ICE` y etiqueta de prioridad.
    - Mostrar snippet de la explicación IA.
    - Emitir callbacks `onEdit`, `onViewExplanation`, `onDelete`.
  - Conectar `TaskList` con el estado local de `TasksScreen` para abrir los diálogos correspondientes al hacer clic en las acciones.

---

### Tarea 7 – Diálogo de prioridad y edición de tareas

- **Objetivo**: Permitir revisar y editar una tarea completa, incluyendo explicación de la IA, según los mockups.
- **Incluye**:
  - Crear `TaskPriorityDialog` en `src/components/tasks/TaskPriorityDialog.tsx`:
    - Recibir `open`, `task`, `onCancel`, `onSave`.
    - Campos editables:
      - Descripción.
      - Impacto, Confianza, Facilidad (inputs numéricos).
      - Explicación de la priorización (multiline).
    - Mostrar `Score ICE` calculado con `calculateIce` mientras el usuario modifica los valores.
    - (Opcional) botón “Recalcular con IA” que use `aiService` con la nueva descripción.
  - Integrar con `TasksScreen`:
    - Al guardar, llamar a `useTasks.updateTask`.
    - Cerrar el diálogo y limpiar el estado local de selección.

---

### Tarea 8 – Diálogo de eliminación, pulido y pruebas manuales

- **Objetivo**: Completar las interacciones de eliminación, refinar la UX y validar contra los flujos de diseño.
- **Incluye**:
  - Crear `TaskDeleteDialog` en `src/components/tasks/TaskDeleteDialog.tsx`:
    - Recibir `open`, `task`, `onConfirm`, `onCancel`.
    - Mostrar un mensaje claro de confirmación.
  - Integrar con `TasksScreen` y `useTasks.deleteTask`.
  - Ajustar detalles visuales:
    - Estados vacíos, mensajes de error, loading, feedback visual tras acciones.
    - Comprobar consistencia con `ui_screens_es.png`.
  - Realizar pruebas manuales guiadas por:
    - Flujos de `ux_flows.md`.
    - Casos de prueba del documento de alcance (crear, editar, borrar, persistencia, orden por score).

