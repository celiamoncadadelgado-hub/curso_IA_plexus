# PowerShell script to create GitHub issues for each implementation task
# Requires GitHub CLI (`gh`) and that you're authenticated (gh auth login).
# Run from repo root.

$owner = "celiamoncadadelgado-hub"
$repo = "curso_IA_plexus"

# Define tasks (title and description)
# tasks defined sequentially using gh issue create to avoid encoding issues
$taskDefinitions = @(
    @{ title="Tarea 1 - Setup del proyecto y estructura base"; body="Objetivo: Tener un proyecto React + TypeScript funcionando con la estructura mínima alineada con la arquitectura definida. Incluye: Crear proyecto con Vite (template React + TS); Configurar Material Design y tema basico; Crear estructura de carpetas principal; Implementar AppLayout, Navbar y Footer estatcios; Conectar App.tsx y main.tsx para mostrar pantalla principal vacia." },
    @{ title="Tarea 2 - Modelado de dominio y servicios puros"; body="Objetivo: Definir claramente el modelo de datos y las funciones puras de negocio. Incluye: Crear tipos en src/types/task.ts; Implementar iceService con calculateIce; Definir storageService o useLocalStorage; Mantener esta capa sin dependencias de React." },
    @{ title="Tarea 3 - Contexto de tareas y gestion de estado global"; body="Objetivo: Centralizar el estado de las tareas y la persistencia. Incluye: Crear TasksContext y TasksProvider; Estado global tasks, loading, error; Acciones addTask, updateTask, deleteTask con calculateIce; Leer/escribir en localStorage; Hook useTasks; Integrar TasksProvider en App.tsx." },
    @{ title="Tarea 4 - Pantalla principal y estado de UI de dialogos"; body="Objetivo: Construir la pantalla principal y separar estado de UI. Incluye: Crear TasksScreen; Usar useTasks; Estado local para modales; Conectar con AppLayout; Preparar huecos para TaskForm, TaskList, TaskPriorityDialog, TaskDeleteDialog." },
    @{ title="Tarea 5 - Implementar TaskForm con integracion de IA y calculo ICE en vivo"; body="Objetivo: Permitir crear tareas segun el flujo del diagrama, con IA opcional. Incluye: Crear TaskForm con campos de descripcion, I/C/E, explicacion; Mostrar Score ICE en vivo; Botones Analizar con IA y Guardar; Implementar aiService para Gemini; Rellenar valores IA y conectar con useTasks.addTask." },
    @{ title="Tarea 6 - Lista de tareas y tarjetas priorizadas"; body="Objetivo: Mostrar las tareas ordenadas por score ICE con acciones basicas. Incluye: Crear TaskList y TaskCard; Ordenar tasks; Mostrar chips y acciones; Conectar con estado local de TasksScreen." },
    @{ title="Tarea 7 - Dialogo de prioridad y edicion de tareas"; body="Objetivo: Revisar y editar tarea completa incluyendo explicacion IA. Incluye: Crear TaskPriorityDialog; Campos editables, score ICE recalculado; (Opcional) boton IA; Integrar con TasksScreen y updateTask." },
    @{ title="Tarea 8 - Dialogo de eliminacion, pulido y pruebas manuales"; body="Objetivo: Completar interacciones de eliminacion, UX y validar flujos. Incluye: Crear TaskDeleteDialog; Integrar con TasksScreen y deleteTask; Ajustar estados vacios, mensajes, feedback; Realizar pruebas manuales." }
)


# Get authenticated user to assign issues
$user = gh api user --jq .login

foreach ($task in $taskDefinitions) {
    Write-Host "Creating issue: $($task.title)"
    gh issue create --repo $owner/$repo --title "$($task.title)" `
        --body "$($task.body)" `
        --label todo --label doing --label done `
        --assignee $user
}

Write-Host "All issues created."