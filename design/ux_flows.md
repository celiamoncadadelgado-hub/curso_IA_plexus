## Diagrama de flujo – Proceso de crear tareas

**Objetivo**: Guiar al usuario desde que piensa una tarea hasta que la ve priorizada en la lista.

1. **Inicio**
   - Usuario abre la app.
   - Ve `Navbar` con título y `TaskForm` + `TaskList` (vacía o con tareas).

2. **Entrada de tarea**
   - Acción: Usuario escribe la descripción en el campo “Descripción de la tarea”.
   - Acción opcional: Usuario rellena manualmente los inputs numéricos `Impact`, `Confidence`, `Ease`.
   - La app calcula y muestra **Score ICE** en tiempo real cuando hay valores válidos para I, C, E.

3. **Decisión: ¿usar IA para sugerir ICE?**
   - Opción A: Usuario pulsa **“Analizar con IA”**.
   - Opción B: Usuario no pulsa el botón y decide trabajar solo con valores manuales.

4A. **Flujo con IA**
   - App valida que hay descripción suficiente.
   - Si falta descripción → muestra mensaje de error en el formulario y vuelve a paso 2.
   - Si todo OK → llama a la API de IA.
   - Muestra estado de carga en el botón y mensaje “Analizando con IA…”.
   - **Respuesta IA correcta**:
     - Rellena inputs `Impact`, `Confidence`, `Ease` con los valores sugeridos.
     - Rellena el campo de texto “Explicación de la priorización” con la explicación de la IA.
     - Recalcula y muestra el `Score ICE` actualizado.
     - Vuelve al estado de edición del formulario (valores visibles, todos editables).
   - **Respuesta IA con error**:
     - Muestra mensaje de error en el formulario.
     - Mantiene la descripción escrita por el usuario.
     - Permite que el usuario:
       - Reintente “Analizar con IA”.
       - O rellene I, C, E y la explicación manualmente (flujo 4B).

4B. **Flujo sin IA (manual)**
   - Usuario rellena / ajusta manualmente:
     - `Impact`, `Confidence`, `Ease`.
     - Campo “Explicación de la priorización” (texto libre).
   - App recalcula `Score ICE` en tiempo real en cada cambio.

5. **Revisión antes de guardar**
   - Usuario ve simultáneamente:
     - Descripción.
     - Valores I, C, E.
     - `Score ICE` calculado.
     - Explicación (IA o manual).
   - Puede ajustar cualquiera de estos campos (I, C, E, explicación) hasta estar conforme.

6. **Confirmación / guardado de tarea**
   - Usuario pulsa botón **“Guardar tarea”** en el formulario.
   - App valida:
     - Que hay descripción.
     - Que I, C, E son números válidos en sus rangos.
   - Si hay errores → resalta inputs problemáticos con mensajes claros y permanece en el formulario.
   - Si todo OK:
     - Crea el objeto tarea con `id`, `descripcion`, `impact`, `confidence`, `ease`, `scoreICE`, `explanation`.
     - Persiste en `localStorage`.
     - Inserta la nueva tarea en la `TaskList` y reordena por `scoreICE` descendente.
     - Limpia los campos del `TaskForm` (o deja un estado listo para una nueva tarea).

7. **Resultado**
   - El usuario ve la nueva `TaskCard` en la parte superior de la lista (si tiene mayor score).
   - Opciones siguientes:
     - Crear otra tarea (volver al paso 2).
     - Editar o eliminar tareas desde la lista.

---

## Diagrama de flujo – Navegación del usuario

**Nota**: La app funciona como una single-page app con estados y modales, más que con múltiples rutas de página.

1. **Entrada inicial**
   - Vista: `MainLayout`.
     - `Navbar` fija arriba.
     - Zona central con:
       - `TaskForm` (columna izquierda o superior).
       - `TaskList` (columna derecha o inferior).
     - `Footer` discreto al final.

2. **Estado: lista vacía vs lista con tareas**
   - Si no hay tareas:
     - `TaskList` muestra mensaje de estado vacío y CTA a crear la primera tarea.
   - Si hay tareas:
     - `TaskList` muestra múltiples `TaskCard` ordenadas por `Score ICE`.

3. **Acciones de navegación desde la vista principal**
   - **Crear tarea**:
     - Interacción con `TaskForm` (flujo descrito antes).
   - **Editar tarea**:
     - Usuario hace clic en botón “Editar” dentro de una `TaskCard`.
     - → Se abre `PriorityModal` (Dialog) centrado, sobre el `MainLayout`.
   - **Ver explicación**:
     - Usuario hace clic en “Ver explicación” en una `TaskCard`.
     - → Se abre el mismo `PriorityModal`, enfocado en la sección de explicación (pero con campos ICE igualmente editables).
   - **Eliminar tarea**:
     - Usuario pulsa icono/botón de eliminación en una `TaskCard`.
     - → Se abre un pequeño `Dialog` de confirmación.

4. **Navegación con `PriorityModal` (Dialog) abierto**
   - **Contenido del modal**:
     - Descripción (editable).
     - Inputs numéricos I, C, E (editables).
     - `Score ICE` calculado en vivo.
     - Campo de texto grande con la “Explicación de la priorización”.
   - **Acciones dentro del modal**:
     - “Guardar cambios”:
       - Valida campos, recalcula `Score ICE`.
       - Actualiza la tarea en la lista y reordena por score.
       - Persiste cambios en `localStorage`.
       - Cierra el modal → vuelve a la vista principal con `TaskList` actualizada.
     - “Cancelar” o cerrar (`X`):
       - Descarta cambios no guardados.
       - Cierra el modal → vuelve a la vista principal sin modificaciones.
     - Opcional: botón “Recalcular con IA” (solo al editar descripción):
       - Llama a IA de nuevo para actualizar I, C, E, explanation, manteniendo los campos editables.

5. **Navegación con `Dialog` de eliminación**
   - Pregunta simple: “¿Seguro que quieres eliminar esta tarea?”
   - Acciones:
     - “Eliminar”:
       - Borra la tarea seleccionada.
       - Reordena lista.
       - Cierra el diálogo → vuelve a la vista principal.
     - “Cancelar”:
       - Cierra el diálogo sin cambios.

6. **Recarga o retorno a la app**
   - Usuario recarga el navegador o vuelve más tarde.
   - Al montar la app:
     - Se carga el estado desde `localStorage`.
     - Se reconstruye `TaskList` respetando el orden por `Score ICE`.
   - El usuario aterriza siempre en la **misma vista principal**, pero con:
     - `TaskForm` listo para nuevas tareas.
     - `TaskList` poblada con tareas previas.

---

## Pantallas que componen la app (visión funcional y visual)

### 1. Pantalla principal – Lista vacía

- **Contexto**: Usuario entra por primera vez, sin tareas creadas.
- **Layout (Material Design)**
  - `AppBar`:
    - Título “Gestor de Tareas ICE”.
    - Subtítulo o chip “Powered by IA”.
  - `Container` central:
    - `Card` o `Paper` superior: `TaskForm`.
      - `TextField` multiline de descripción.
      - Tres `TextField` numéricos para I, C, E.
      - Campo destacado con `Score ICE`.
      - Botones “Analizar con IA” (primario) y “Guardar tarea”.
    - Debajo: `Paper`/`Card` para `TaskList`.
      - Ilustración/ícono vacío.
      - Mensaje tipo “Aún no tienes tareas” y texto guía.
      - CTA textual que apunta al formulario (“Empieza creando una tarea arriba”).
  - `Footer`:
    - Texto pequeño con versión, info de API, etc.

### 2. Pantalla principal – Lista con tareas

- **Contexto**: Usuario ya ha creado una o más tareas.
- **Layout**
  - `AppBar` igual que en la pantalla vacía.
  - `Container`:
    - `TaskForm` permanece arriba para creación rápida de nuevas tareas.
    - Debajo:
      - Título “Tus tareas priorizadas” (Typography).
      - Lista de `TaskCard` (`Card` dentro de `List` o `Stack`), cada una con:
        - Descripción (Typography).
        - Chips con I, C, E.
        - Chip grande o etiqueta para `Score ICE` (color según prioridad).
        - Fragmento de la explicación IA (“Explicación: …”).
        - Botones “Editar”, “Ver explicación” y `IconButton` de eliminar.
  - Estados visuales:
    - Animación suave al añadir o reordenar tareas.
    - Diferente color o icono para rangos de prioridad (por score).

### 3. Pantalla modal – PriorityModal (Crear/Editar/Detalle)

- **Contexto**: Se superpone sobre la pantalla principal.
- **Estructura**
  - `Dialog` centrado con:
    - `DialogTitle`:
      - Texto “Revisar prioridad de la tarea” (en creación) o “Editar tarea” (en edición/detalle).
    - `DialogContent`:
      - `TextField` de descripción (puede ser read-only en detalle, pero los campos ICE siempre editables según tu requisito).
      - Tres `TextField` numéricos para I, C, E (alineados horizontalmente en desktop, apilados en móvil).
      - Visualización grande del `Score ICE` (tipografía grande y chip de prioridad).
      - Área de texto grande:
        - Label “Explicación de la priorización”.
        - Contenido: explicación devuelta por la IA (editable para que el usuario pueda matizarla).
      - (Opcional) botón pequeño “Recalcular con IA” si la descripción se ha modificado.
    - `DialogActions`:
      - Botón texto “Cancelar”.
      - Botón principal “Guardar cambios” / “Confirmar tarea”.
  - Fondo (`Backdrop`) oscurecido para centrar la atención en el modal.

### 4. Pantalla modal – Confirmación de eliminación

- **Contexto**: Usuario intenta eliminar una tarea.
- **Estructura**
  - `Dialog` pequeño:
    - Título: “Eliminar tarea”.
    - Texto: “¿Seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer.”
    - Acciones:
      - Botón texto “Cancelar”.
      - Botón de peligro “Eliminar” (color de advertencia).

---

### Referencia para imagen de pantallas (mockup)

Para un mockup visual (por ejemplo `design/ui_screens.png`), la imagen debería incluir:

- Vista completa de la **pantalla principal con lista de tareas**, usando componentes Material Design (AppBar, Cards, TextFields, Buttons, Chips).
- Un zoom o segundo panel con el **`PriorityModal`** abierto mostrando:
  - Descripción.
  - Inputs para I, C, E.
  - Score ICE grande.
  - Área con la explicación de la IA.
- Paleta limpia y moderna, con:
  - Fondo claro.
  - AppBar en color primario.
  - Chips de prioridad en distintos tonos según score.

