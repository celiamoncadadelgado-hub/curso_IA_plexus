# MVP: Gestor de Tareas Inteligente con Modelo ICE
## Documento de Alcance Funcional

**Versión:** 1.0  
**Fecha:** 3 de Marzo de 2026  
**Audiencia:** Curso React - Desarrollo de Aplicaciones con IA  

---

## 1. Visión General

Un **Gestor de Tareas Inteligente** basado en React que:
- Permite crear tareas con descripción natural
- **Calcula automáticamente** el score ICE (Impact, Confidence, Ease) usando IA
- Prioriza tareas inteligentemente
- Persiste datos en `localStorage`
- **Sin backend externo** - todo corre en el navegador

**Objetivo pedagógico:** Enseñar React + integración con APIs de IA en tiempo real.

---

## 2. Stack Tecnológico

```
Frontend:
├── React 18+ (Vite)
├── React Hooks (useState, useContext, useEffect)
├── TailwindCSS (estilos rápidos)
├── Fetch API (HTTP)
└── localStorage (persistencia)

IA/APIs:
├── Google Gemini API (gratuita, sin tarjeta)
└── 60 solicitudes/minuto incluidas

Herramientas:
├── Chrome DevTools
└── .env para variables
```

---

## 3. Alcance Funcional del MVP

### ✅ **Funcionalidades Core (INCLUIDAS)**

| # | Funcionalidad | Descripción | Complejidad | Story Points |
|---|---|---|---|---|
| 1 | **Crear Tarea** | Formulario con descripción en lenguaje natural | ⭐ | 3 |
| 2 | **Análisis IA (ICE)** | Enviar descripción a API IA, recibir valores I, C, E | ⭐⭐⭐ | 8 |
| 3 | **Cálculo Score ICE** | Formula: `(I × C) / E`, mostrar resultado | ⭐ | 2 |
| 4 | **Listar Tareas** | Mostrar tareas ordenadas por score ICE | ⭐ | 3 |
| 5 | **Editar Tarea** | Modificar descripción y/o ajustar valores I,C,E manualmente | ⭐⭐ | 5 |
| 6 | **Eliminar Tarea** | Borrar tarea con confirmación | ⭐ | 2 |
| 7 | **Persistencia** | Guardar/cargar tareas en localStorage | ⭐ | 2 |
| 8 | **Vista de Detalle** | Mostrar explicación del razonamiento IA para los valores ICE | ⭐ | 3 |

**Total Story Points: 28** (Sprint de 1-2 semanas)

### ❌ **Funcionalidades EXCLUIDAS (MVP)**

- [ ] Backend/Base de datos
- [ ] Autenticación de usuarios
- [ ] Colaboración en equipo
- [ ] Integración con calendario
- [ ] Recordatorios/notificaciones
- [ ] Exportación PDF
- [ ] Modo offline avanzado
- [ ] Análisis de patrones históricos

---

## 4. Flujo de Usuario (Happy Path)

```
1. Usuario abre la app
   ↓
2. Ve lista vacía de tareas
   ↓
3. Escribe descripción: "Completar proyecto React para curso"
   ↓
4. Click "Analizar con IA"
   ├─ La app envía descripción a API IA
   ├─ IA responde con valores ICE sugeridos
   └─ App muestra: I=8, C=7, E=6 → Score=9.33
   ↓
5. Usuario puede ajustar manualmente valores I,C,E (opcional)
   ↓
6. Tarea se agrega a la lista (ordenada por score)
   ↓
7. Usuario ve el listado con tareas priorizadas
   ↓
8. Puede editar (descripción/valores), eliminar o expandir explicación IA
   ↓
9. Al recargar, datos persisten en localStorage
```

---

## 5. Estructura de Datos

### **Objeto Tarea**

```json
{
  "id": "task_1709472000000",
  "descripcion": "Completar proyecto React para curso",
  "impact": 8,
  "confidence": 7,
  "ease": 6,
  "scoreICE": 9.33,
  "explanation": "Tarea crítica para completar educación, factible con recursos disponibles"
}
```

### **Estado Global (Context API)**

```javascript
{
  tareas: [TareaObject],
  cargando: boolean,
  error: string | null
}
```

---

## 6. Componentes React

```
App/
├── Header
│   └── Título "Gestor de Tareas Inteligente"
│
├── FormCrearTarea
│   ├── Input descripción
│   ├── Botón "Analizar con IA"
│   └── Feedback de carga
│
├── ListaTareas
│   └── TareaCard (repetido por cada tarea)
│       ├── Descripción
│       ├── Indicadores I, C, E (0-10)
│       ├── Score ICE prominente
│       ├── Botones: Editar, Eliminar, Ver Explicación
│       └── [Opcional] Sliders para ajustar I,C,E en edición
│
├── TareaDetalle (Modal/Expandido)
│   ├── Explicación del razonamiento IA
│   ├── Valores I, C, E con contexto
│   └── Botón cerrar/volver
│
└── Footer
    └── Info API, versión, etc.
```

---

## 7. Integración con API IA Gratuita: Google Gemini

### **Setup Google Gemini**

```javascript
// .env
VITE_GEMINI_API_KEY=AIzaSy...

// Función en iaService.js
async function calcularICE(descripcion) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const prompt = `Eres un asistente especializado en productividad. 
Analiza esta tarea y proporciona valores ICE (0-10):

Tarea: "${descripcion}"

Responde SOLO en JSON (sin markdown, sin explicaciones adicionales):
{
  "impact": <número 0-10>,
  "confidence": <número 0-10>,
  "ease": <número 1-10>,
  "explanation": "Breve explicación del razonamiento"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) throw new Error("No response from API");
    
    // Extraer JSON de la respuesta
    const jsonMatch = content.match(/\{[^}]+\}/);
    if (!jsonMatch) throw new Error("JSON no encontrado en respuesta");
    
    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (error) {
    console.error("Error al calcular ICE:", error);
    throw error;
  }
}
```

**Pasos de setup:**
1. Ir a [Google AI Studio](https://aistudio.google.com/apikey)
2. Crear API Key (gratis, sin tarjeta de crédito)
3. Copiar a `.env` como `VITE_GEMINI_API_KEY`
4. ✅ Listo - 60 solicitudes/minuto gratis

---

## 8. Criterios de Aceptación

### **User Story 1: Crear Tarea**

```gherkin
Given: Usuario en la página principal
When: Ingresa descripción "Estudiar React Hooks"
And: Presiona "Analizar con IA"
Then: App llama API IA
And: Muestra valores I, C, E propuestos
And: Calcula Score ICE automáticamente
```

### **User Story 2: Listar y Ordenar**

```gherkin
Given: Múltiples tareas en el sistema
When: Usuario abre la app
Then: Tareas están ordenadas por Score ICE (descendente)
And: Se muestra el score prominentemente
And: Los datos persisten si recarga
```

### **User Story 3: Editar Tarea**

```gherkin
Given: Tarea con I=8, C=7, E=6
When: Usuario modifica descripción o ajusta valores I,C,E
And: Presiona "Guardar cambios"
Then: Si cambió descripción: API IA recalcula valores
And: Si cambió valores manualmente: se respetan los nuevos
And: Score ICE se recalcula con valores finales
```

---

## 9. Prototipo de Prompt para IA

```
Sistema (en el código):
Eres un asistente especializado en productividad y priorización.
Tu tarea es analizar descripciones de tareas y asignar valores ICE.

Impact (0-10): ¿Cuánto impacto tiene completar esta tarea?
  0-2: Ninguno o mínimo
  3-5: Impacto moderado
  6-8: Impacto significativo
  9-10: Crítico y transformador

Confidence (0-10): ¿Qué tan seguro estás de poder completarla?
  0-2: Muy incierto, muchas dependencias
  3-5: Algo incierto
  6-8: Bastante seguro
  9-10: Completamente factible

Ease (1-10): ¿Qué tan fácil es completarla?
  1-2: Extremadamente difícil
  3-5: Moderadamente difícil
  6-8: Relativamente fácil
  9-10: Muy fácil (automatizado)

Ejemplos:
- "Corregir typo en README" → I:3, C:9, E:9 (Score: 3)
- "Aprender Machine Learning" → I:9, C:5, E:2 (Score: 22.5)
- "Completar sprint semanal" → I:8, C:8, E:6 (Score: 10.67)
```

---

## 10. Arquitectura de Carpetas

```
gestor-tareas-ice/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── FormCrearTarea.jsx
│   │   ├── ListaTareas.jsx
│   │   ├── TareaCard.jsx
│   │   ├── TareaDetalle.jsx
│   │   └── Footer.jsx
│   │
│   ├── hooks/
│   │   └── useTareas.js (estado global + localStorage)
│   │
│   ├── services/
│   │   └── api.js (llamadas a IA + cálculo ICE)
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 11. Dependencias npm

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "tailwindcss": "^3.3.0"
  }
}
```

---

## 12. Guía de Desarrollo (Step by Step)

### **Fase 1: Setup (30 min)**
```bash
npm create vite@latest gestor-tareas -- --template react
cd gestor-tareas
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### **Fase 2: Componentes Base (2h)**
- [ ] Header estático
- [ ] FormCrearTarea con input
- [ ] ListaTareas vacía
- [ ] TareaCard dummy

### **Fase 3: Lógica Local (2h)**
- [ ] Hook useTareas para estado global + localStorage
- [ ] CRUD básico de tareas
- [ ] Cálculo y ordenamiento por score ICE

### **Fase 4: Integración IA (3h)**
- [ ] Setup Google Gemini API key
- [ ] Crear `services/api.js`
- [ ] Llamada desde componente
- [ ] Parsear respuesta JSON + explicación
- [ ] Manejo de errores básico

### **Fase 5: Edición y Vista Detalle (2h)**
- [ ] Modal de edición con sliders I,C,E
- [ ] Función `calcularScoreICE(i, c, e)`
- [ ] Vista detalle con explicación IA
- [ ] Reordenamiento automático por score

### **Fase 6: Polish (1h)**
- [ ] Estilos con TailwindCSS
- [ ] Loading states
- [ ] Validaciones
- [ ] Test manual

**Tiempo Total: ~10-11 horas**

---

## 13. Casos de Uso de Ejemplo

### **Caso 1: Académico**
```
Descripción: "Estudiar para examen de algoritmos"
IA responde:
  I: 9 (decisivo para la nota)
  C: 8 (sé dónde estudiar)
  E: 5 (tema complejo)
  
Score: (9×8)/5 = 14.4 ⭐ MUY PRIORITARIO
```

### **Caso 2: Trabajo**
```
Descripción: "Revisar email de marca personal"
IA responde:
  I: 3 (bajo impacto)
  C: 9 (tarea simple)
  E: 9 (muy fácil)
  
Score: (3×9)/9 = 3.0 ⚪ BAJA PRIORIDAD
```

### **Caso 3: Proyecto**
```
Descripción: "Implementar autenticación con JWT"
IA responde:
  I: 8 (necesario para prod)
  C: 6 (tema técnico complejo)
  E: 4 (requiere investigación)
  
Score: (8×6)/4 = 12.0 🟠 ALTA PRIORIDAD
```

---

## 14. Limitaciones Conocidas (MVP)

⚠️ **Por diseño (pueden ser features futuras):**

1. **Sin sincronización multi-dispositivo** - solo localStorage local
2. **Sin colaboración** - usuario único
3. **Sin historial de versiones** - solo dato actual
4. **Límite de velocidad API IA** - Hugging Face es compartida
5. **Sin validación offline** - requiere conexión para IA
6. **Análisis simple** - prompts no optimizados

---

## 15. Testing Manual (Checklist)

```
✅ CREAR TAREA
  [ ] Ingresar descripción + click Analizar
  [ ] Esperar respuesta IA (2-5 sec)
  [ ] Ver valores I, C, E > 0
  [ ] Ver score ICE calculado
  [ ] Tarea aparece en lista

✅ PERSISTENCIA
  [ ] Crear tarea
  [ ] Recargar página (F5)
  [ ] Tarea sigue ahí
  [ ] score ICE correcto

✅ EDITAR
  [ ] Click en editar
  [ ] Cambiar descripción o ajustar valores I,C,E
  [ ] Guardar cambios
  [ ] Ver score ICE actualizado
  [ ] Lista se reordena

✅ ELIMINAR
  [ ] Click en X/Eliminar
  [ ] Confirmación y borrado
  [ ] Lista se actualiza

✅ ORDENAMIENTO
  [ ] Crear varias tareas
  [ ] Verificar ordenadas por score descendente
  [ ] Editar tarea → score cambia → lista se reordena
```

---

## 16. Métricas de Éxito

| Métrica | Objetivo | Cómo medir |
|---|---|---|
| Tiempo de carga inicial | < 3s | Chrome DevTools |
| Tiempo respuesta IA | < 5s | Console logs |
| Tasa de acierto ICE | 70%+ | Manual testing |
| Persistencia datos | 100% | Reload + verificar |
| Usabilidad | Intuitivo | Beta testing |

---

## 17. Roadmap Post-MVP (Futuro)

### **Fase 2: Mejoras UX**
- Analytics dashboard (top tareas)
- Notificaciones push
- Dark mode
- Exportar a CSV

### **Fase 3: IA Avanzada**
- Descomposición automática de tareas
- Sugerencias de horarios
- Detección de dependencias
- Análisis de tendencias

### **Fase 4: Backend & Escala**
- Backend Node/Python
- Base de datos PostgreSQL
- Autenticación
- Multi-usuario
- Sincronización en tiempo real

---

## 18. Recursos Adicionales

- **Google Gemini API:** https://ai.google.dev
- **React Context:** https://react.dev/reference/react/useContext
- **localStorage:** https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **TailwindCSS:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev

---

## 19. FAQ

**P: ¿Funciona sin internet?**  
R: No, necesita conexión para llamar a la API IA. Sin embargo, el listado de tareas sí funciona offline.

**P: ¿Qué pasa si la API IA cae?**  
R: Muestra mensaje de error en el formulario. Usuario puede intentar nuevamente o crear tarea ingresando valores I,C,E manualmente en la vista de edición.

**P: ¿Puedo usar otro modelo IA?**  
R: Sí, cambiar el endpoint y prompt en `iaService.js`. Ejemplos: Groq, Replicate, Ollama local.

**P: ¿Cómo protejo la API key?**  
R: En Vite, usar `VITE_` prefix y `.env` (NO commitir). En producción, usar proxy backend.

**P: ¿Es escalable a producción?**  
R: El MVP no, pero la arquitectura es modular. Agregar backend es el siguiente paso.

---

## 20. Conclusión

Este MVP es un **proyecto educativo perfecto para React** porque incluye:
✅ Gestión de estado (Context API)
✅ Hooks (useState, useEffect, custom hooks)
✅ Componentes reutilizables
✅ Async/Await (llamadas API)
✅ localStorage (persistencia)
✅ Lógica de negocio (cálculo ICE)
✅ UX moderna (TailwindCSS)

**Además: Integración con IA genera un proyecto "WOW!" de portafolio.**

---

**Autor:** Gestor de Tareas Inteligente v1.0  
**Licencia:** MIT  
**Última actualización:** 3 de Marzo de 2026
