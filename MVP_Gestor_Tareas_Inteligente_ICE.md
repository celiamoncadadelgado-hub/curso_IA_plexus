# MVP: Gestor de Tareas Inteligente con Modelo ICE

## 📋 Resumen Ejecutivo

**TaskICE** es una aplicación React minimalista para priorizar tareas usando IA.
- ✅ Crear tareas: descripción (max 200 chars) + análisis automático con Gemini
- ✅ Score ICE: 0-100 sin decimales  
- ✅ 3 estados: **Esperando** → **En Curso** → **Hecha** (sin filtros)
- ✅ 100% frontend, localStorage, completamente gratuita

**Público:** Sin experiencia técnica  
**Stack:** React 18 + Vite + TailwindCSS + Google Gemini API (gratuita)

---

## 🎯 Decisiones Arquitectónicas (Recomendaciones Senior)

### 1. Score ICE: 0-100 Sin Decimales
**Why:** Público sin experiencia entiende "60/100" mejor que "6.67"

**Fórmula:**
```javascript
score = Math.round((impact * confidence * ease) / 10)
// Ejemplos: I:8 C:7 E:6 → 34 | I:9 C:5 E:2 → 9
```

### 2. Descripción: Max 200 Caracteres
**Why:** Fuerza claridad, IA procesa más rápido, UI simple

### 3. 3 Estados Solo, Sin Filtros
**Why:** Transparencia máxima, público sin experiencia NO sabe filtrar, reduce UI 50%

```
[Esperando] → "Iniciar" → [En Curso] → "Completar" → [Hecha]
```

### 4. 100% Frontend, Sin Backend
**Why:** Setup trivial (1 API key), privacidad total, ideal para curso puro

### 5. Sin Paginación, Filtros, Tags, Usuarios
**Why:** Simplicidad extrema. Max ~50-100 tareas (localStorage natural)

---

## ✨ Especificación Funcional

### Features Incluidas

| Feature | Descripción | Prioridad |
|---------|-------------|-----------|
| **Crear tarea** | Textarea 200 chars + botón Analizar | MUST |
| **IA genera scores** | Gemini calcula Impact, Confidence, Ease | MUST |
| **Score ICE (0-100)** | Sin decimales, prominente | MUST |
| **Listar tareas** | Ordenadas por score (descendente) | MUST |
| **3 estados** | Esperando → En Curso → Hecha | MUST |
| **Cambiar estado** | Botones Iniciar/Completar | MUST |
| **Eliminar** | Botón X para borrar | MUST |
| **Persistencia** | localStorage automático | MUST |

### Excluidas Explícitamente

❌ Filtros de estado  
❌ Búsqueda  
❌ Tags/categorías  
❌ Paginación  
❌ Usuarios/login  
❌ Sincronización multi-dispositivo  
❌ Notas/comentarios  

---

## 📊 Estructura de Datos

### Tarea (JSON)
```javascript
{
  id: "1709472000",
  descripcion: "Completar tutorial React", // max 200 chars
  impact: 8,        // 0-10, sugerido por IA
  confidence: 7,    // 0-10, sugerido por IA
  ease: 6,          // 0-10, sugerido por IA
  scoreICE: 34,     // 0-100, SIN DECIMALES
  estado: "esperando", // "esperando" | "en_curso" | "hecha"
  createdAt: 1709472000
}
```

### Estado Global (React useContext)
```javascript
{
  tareas: [Tarea],
  cargando: false,
  error: null
}
```

---

## 🧩 Componentes React

```
<App/>
├── <Header/>
├── <FormCrearTarea/>
│   ├── Textarea (200 chars, contador)
│   ├── Botón "Analizar"
│   └── Estado cargando
├── <ListaTareas/>
│   └── <TareaCard/> × N
│       ├── Descripción
│       ├── I C E (badges 0-10)
│       ├── Score ICE (0-100, prominente)
│       ├── Estado (badge color)
│       ├── Botón estado
│       ├── Botón "Editar"
│       └── Botón "Eliminar"
└── <Footer/>
```

### 2. Cálculo de ICE Asistido por IA (Google Gemini)

- **Integración Google Gemini API:**
  - API Gratuita: ~60 requests/minuto
  - NO usar fallbacks - mostrar error real si Gemini falla
  - Sin validación local de inputs

- **Nueva Fórmula ICE (0-100, sin decimales):**
  ```javascript
  const scoreICE = Math.round((impact * confidence * ease) / 10)
  // Ejemplo: (9 * 8 * 7) / 10 = 504 / 10 = 50.4 → redondea a 50
  ```

- **Prompt de IA:**
  ```
  Eres un experto en gestión de tareas con scoring ICE.
  
  Analiza: "[DESCRIPCIÓN - máximo 200 caracteres]"
  
  Devuelve puntuaciones 0-10 para:
  - impact: impacto en objetivos
  - confidence: seguridad en completarla
  - ease: dificultad (facilidad)
  
  Responde SOLO JSON: {"impact": X, "confidence": Y, "ease": Z}
  ```

- **Manejo de Errores:**
  - SOLO mostrar mensajes de error de Gemini API o network
  - NO validaciones locales
  - Usuario ve error real y puede reintentar

### 3. Estados de Tarea (3 únicamente, SIN Filtros)

| Estado | Descripción | Badge Color |
|--------|-----------|-------------|
| **esperando** | Nueva, no iniciada | Gris |
| **en_curso** | Actualmente trabajando | Azul |
| **hecha** | Completada | Verde |

- Transiciones: esperando → en_curso → hecha (unidireccional, excepto reset)
- NO hay filtros UI, se ven todos los estados siempre
- Botón único "Cambiar Estado" avanza al siguiente

### 4. Persistencia de Datos

- **localStorage:**
  - Clave: `taskice_tareas`
  - Guardar automáticamente al cambiar cualquier tarea
  - Cargar al iniciar app

### 5. Interfaz de Usuario (Minimalista)

- **Componentes:**
  - `App.jsx` - Componente principal
  - `Header.jsx` - Título y descripción
  - `FormCrearTarea.jsx` - Entrada de tarea (200 char contador)
  - `ListaTareas.jsx` - Grid de tarjetas
  - `TareaCard.jsx` - Tarjeta individual con botones de estado
  - `Footer.jsx` - Información y créditos

- **Colores por Score:**
  - 🟢 Verde: 60-100 (Alto)
  - 🟡 Amarillo: 30-59 (Medio)
  - 🔴 Rojo: 0-29 (Bajo)

---

## 💻 Stack Tecnológico

| Componente | Herramienta |
|---|---|
| **Framework** | React 18+ |
| **Build Tool** | Vite |
| **Estilos** | Tailwind CSS + App.css |
| **Almacenamiento** | localStorage |
| **API IA** | Google Gemini API (gratuita) |

---

## 💻 Código Crítico

### 1. useTareas.js - Hook de Estado Global

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const TareasContext = createContext();

export function TareasProvider({ children }) {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar del localStorage al iniciar
  useEffect(() => {
    const guardadas = localStorage.getItem('taskice_tareas');
    if (guardadas) {
      try {
        setTareas(JSON.parse(guardadas));
      } catch (e) {
        console.error('Error cargando tareas:', e);
      }
    }
    setCargando(false);
  }, []);

  // Guardar al cambiar
  useEffect(() => {
    localStorage.setItem('taskice_tareas', JSON.stringify(tareas));
  }, [tareas]);

  const agregarTarea = (tarea) => {
    const nueva = {
      ...tarea,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      estado: 'esperando'
    };
    setTareas([...tareas, nueva]);
    return nueva;
  };

  const actualizarTarea = (id, cambios) => {
    setTareas(tareas.map(t => 
      t.id === id ? { ...t, ...cambios } : t
    ));
  };

  const eliminarTarea = (id) => {
    setTareas(tareas.filter(t => t.id !== id));
  };

  return (
    <TareasContext.Provider 
      value={{ tareas, cargando, agregarTarea, actualizarTarea, eliminarTarea }}
    >
      {children}
    </TareasContext.Provider>
  );
}

export function useTareas() {
  return useContext(TareasContext);
}
```

### 2. aiService.js - Análisis Gemini

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('VITE_GEMINI_API_KEY no definida');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analizarConGemini(descripcion) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Eres experto en scoring ICE para tareas.

Analiza: "${descripcion}"

Devuelve puntuaciones 0-10:
- impact: impacto en objetivos
- confidence: seguro de completarla
- ease: qué tan fácil es

Responde SOLO JSON: {"impact": X, "confidence": Y, "ease": Z}`;

  const resultado = await model.generateContent(prompt);
  const texto = resultado.response.text();
  
  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Respuesta IA no válida');
  }
  
  const parsed = JSON.parse(match[0]);
  
  const impact = Math.min(Math.max(parseInt(parsed.impact), 0), 10);
  const confidence = Math.min(Math.max(parseInt(parsed.confidence), 0), 10);
  const ease = Math.min(Math.max(parseInt(parsed.ease), 0), 10);
  
  const scoreICE = Math.round((impact * confidence * ease) / 10);
  
  return { impact, confidence, ease, scoreICE };
}
```

### 3. FormCrearTarea.jsx

```javascript
import { useState } from 'react';
import { analizarConGemini } from '../services/aiService';
import { useTareas } from '../hooks/useTareas';

export default function FormCrearTarea() {
  const { agregarTarea } = useTareas();
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const maxChars = 200;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!descripcion.trim()) {
      setError('Describe una tarea');
      return;
    }

    setCargando(true);
    try {
      const scores = await analizarConGemini(descripcion);
      agregarTarea({
        descripcion,
        impact: scores.impact,
        confidence: scores.confidence,
        ease: scores.ease,
        scoreICE: scores.scoreICE
      });
      setDescripcion('');
    } catch (err) {
      setError(err.message || 'Error en análisis');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-crear-tarea">
      <div className="form-group">
        <label>Nueva Tarea ({descripcion.length}/{maxChars})</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value.slice(0, maxChars))}
          placeholder="Describe una tarea para analizar..."
          maxLength={maxChars}
          disabled={cargando}
          rows="3"
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={cargando || !descripcion.trim()}>
        {cargando ? '⏳ Analizando...' : '📊 Analizar'}
      </button>
    </form>
  );
}
```

### 4. TareaCard.jsx - Tarjeta con 3 Estados

```javascript
import { useTareas } from '../hooks/useTareas';

const ESTADOS = ['esperando', 'en_curso', 'hecha'];
const LABELS = {
  esperando: '⏳ Esperando',
  en_curso: '⚡ En Curso',
  hecha: '✅ Hecha'
};
const COLORES = {
  esperando: 'gris',
  en_curso: 'azul',
  hecha: 'verde'
};

export default function TareaCard({ tarea }) {
  const { actualizarTarea, eliminarTarea } = useTareas();

  const getMostrarColor = (score) => {
    if (score >= 60) return 'alto';
    if (score >= 30) return 'medio';
    return 'bajo';
  };

  const handleCambiarEstado = () => {
    const indiceActual = ESTADOS.indexOf(tarea.estado);
    const nuevoEstado = ESTADOS[(indiceActual + 1) % ESTADOS.length];
    actualizarTarea(tarea.id, { estado: nuevoEstado });
  };

  const scoreColor = getMostrarColor(tarea.scoreICE);

  return (
    <div className={`tarea-card estado-${tarea.estado}`}>
      <div className="tarea-contenido">
        <p className="tarea-descripcion">{tarea.descripcion}</p>
        
        <div className="tarea-badges">
          <span className="badge">I: {tarea.impact}</span>
          <span className="badge">C: {tarea.confidence}</span>
          <span className="badge">E: {tarea.ease}</span>
        </div>

        <div className={`score-ice score-${scoreColor}`}>
          {tarea.scoreICE}
        </div>

        <div className={`estado-badge estado-${tarea.estado}`}>
          {LABELS[tarea.estado]}
        </div>
      </div>

      <div className="tarea-acciones">
        <button 
          onClick={handleCambiarEstado}
          className="btn-estado"
        >
          Cambiar
        </button>
        <button 
          onClick={() => eliminarTarea(tarea.id)}
          className="btn-eliminar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

### 5. App.css - Estilos Minimalista

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f8f9fa;
  color: #333;
}

.app {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
  color: #222;
}

.header p {
  color: #666;
  font-size: 1.1rem;
}

/* Formulario */
.form-crear-tarea {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.form-group textarea:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.error {
  background: #fee;
  color: #c33;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-crear-tarea button {
  width: 100%;
  background: #333;
  color: white;
}

.form-crear-tarea button:hover:not(:disabled) {
  background: #555;
}

/* Lista de Tareas */
.lista-tareas {
  display: grid;
  gap: 12px;
}

.lista-vacia {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 1.1rem;
}

/* Tarjeta de Tarea */
.tarea-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-left: 4px solid #ddd;
}

.tarea-card.estado-esperando {
  border-left-color: #aaa;
}

.tarea-card.estado-en_curso {
  border-left-color: #2196f3;
}

.tarea-card.estado-hecha {
  border-left-color: #4caf50;
}

.tarea-contenido {
  flex: 1;
}

.tarea-descripcion {
  font-weight: 500;
  margin-bottom: 10px;
  line-height: 1.4;
  word-break: break-word;
}

.tarea-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.badge {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 500;
}

.score-ice {
  display: inline-block;
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.3rem;
  margin-bottom: 8px;
}

.score-alto {
  background: #d4edda;
  color: #155724;
}

.score-medio {
  background: #fff3cd;
  color: #856404;
}

.score-bajo {
  background: #f8d7da;
  color: #721c24;
}

.estado-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 600;
}

.estado-badge.estado-esperando {
  background: #e9ecef;
  color: #495057;
}

.estado-badge.estado-en_curso {
  background: #cfe2ff;
  color: #084298;
}

.estado-badge.estado-hecha {
  background: #d1e7dd;
  color: #0f5132;
}

.tarea-acciones {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-estado {
  background: #333;
  color: white;
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-estado:hover:not(:disabled) {
  background: #555;
}

.btn-eliminar {
  background: #999;
  color: white;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.btn-eliminar:hover:not(:disabled) {
  background: #bbb;
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 640px) {
  .app {
    padding: 12px;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .tarea-card {
    flex-direction: column;
  }

  .tarea-acciones {
    justify-content: flex-start;
  }

  .score-ice {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
}
```

---

```
src/
├── App.jsx                 # Componente principal
├── components/
│   ├── TaskForm.jsx        # Formulario de entrada
│   ├── TaskList.jsx        # Listado de tareas
│   └── TaskCard.jsx        # Tarjeta individual
├── services/
│   └── aiService.js        # Lógica de llamadas Gemini API
├── App.css                 # Estilos únicos
└── utils/
    └── ice.js              # Cálculo puntuación ICE
```

---

## 🤖 Integración con API de IA

### Google Gemini API (Recomendado)

**Pros:**
- Gratuita (hasta ciertos límites generosos)
- Google API excelente y documentada
- Modelo poderoso y rápido
- Fácil integración en navegador

**Setup:**

1. **Obtener API Key:**
   - Ir a [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Crear una API key gratuita
   - Guardar en `.env.local`: `VITE_GEMINI_API_KEY=tu_key_aqui`

2. **Instalación:**
   ```bash
   npm install @google/generative-ai
   ```

3. **Código de Integración:**
   ```javascript
   import { GoogleGenerativeAI } from "@google/generative-ai";

   const genAI = new GoogleGenerativeAI(
     import.meta.env.VITE_GEMINI_API_KEY
   );

   async function analyzeTask(description) {
     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
     
     const prompt = `Eres un experto en gestión de tareas y priorización con framework ICE.
   
   Analiza esta tarea y proporciona puntuaciones de 1-10 para:
   - Impact (Impacto): ¿Cuánto impactará esta tarea?
   - Confidence (Confianza): ¿Qué tan seguro estás de poder completarla?
   - Ease (Facilidad): ¿Qué tan fácil es completarla?
   
   Tarea: "${description}"
   
   Responde SOLO en formato JSON válido, sin explicaciones adicionales:
   {"impact": X, "confidence": Y, "ease": Z}`;

     const result = await model.generateContent(prompt);
     const text = result.response.text();
     const parsed = JSON.parse(text);
     
     return {
       impact: Math.min(Math.max(parsed.impact, 1), 10),
       confidence: Math.min(Math.max(parsed.confidence, 1), 10),
       ease: Math.min(Math.max(parsed.ease, 1), 10),
     };
   }
   ```

---

## 📊 Estructura de Datos

### Tarea
```javascript
{
  id: "uuid-generado",
  description: "Implementar componente de login",
  impact: 8,
  confidence: 7,
  ease: 6,
  iceScore: 7.0,  // (8+7+6)/3
  completed: false
}
```

---

## 🔑 Decisiones Arquitectónicas (Scope Control)

### Decisi​ón 1: Flujo de Edición
**SELECCIONADO:** Opción B - Editar descripción Y regenerar scores automáticamente

| Opción | Ventajas | Desventajas |
|--------|----------|-----------|
| **A:** Readonly | Minimal | Poco flexible |
| **B:** Edit + Regenerar | Flexible, didáctico, muestra async | +edición state |

**Explicación:** Opción B es ideal para curso React porque enseña:
- Estado complejo (editar mientras persiste)
- Llamadas IA reutilizables
- Re-render en tiempo real
- Manejo de loading en contexto real

### Decisión 2: Fallbacks de Error
**SELECCIONADO:** Error explícito, NO valores por defecto (5,5,5)

❌ Fallar silenciosamente sed confunde al usuario y sesga datos
✅ Mostrar error visible, permitir retry manual

### Decisión 3: Arquitectura CSS
**SELECCIONADO:** 1 archivo CSS (App.css), no 3 separados

---

## 🎓 Casos de Uso

### Caso 1: Crear Nueva Tarea
1. Usuario ingresa: "Aprender React Hooks"
2. Sistema envía a IA
3. IA devuelve: {impact: 9, confidence: 6, ease: 5}
4. Se calcula score: 6.67
5. Tarea aparece en la lista ordenada

### Caso 2: Editar Puntuaciones Manualmente
1. Usuario puede ajustar valores propuestos por IA
2. Score se recalcula automáticamente

### Caso 3: Completar Tarea
1. Usuario hace clic en checkbox
2. Tarea se marca visualmente como completada

---

## ✅ Criterios de Aceptación del MVP

- [ ] App carga sin errores en <2s (sin tareas guardadas)
- [ ] Primera tarea se crea en <5s (incluida latencia Gemini)
- [ ] Puedo crear 10 tareas en menos de 1 minuto (SSD)
- [ ] localStorage persiste tras F5 reload
- [ ] Score ICE calcula correctamente: (I+C+E)/3
- [ ] No hay errores en consola (React Strict Mode)
- [ ] Interfaz funciona en 320px (mobile) y 1024px (desktop)
- [ ] Manejo explícito de fallos Gemini (no silent fallback)

---

## � Notas de Diseño

**Validación vs Errores:**
No validamos input localmente. Si se envía algo vacío o corto a Gemini → que falle la API y mostremos su error. Es más simple y enseña que los errores vienen del API, no del cliente.

**Por qué Opción B de edición:**
Habilita enseñar async en contexto real: el usuario edita descripción, hace clic "Regenerar", ve loading state, luego aparecen nuevos scores. Experiencia pedagógica rica para un curso React.

**Persistencia localStorage:**
Guardamos automáticamente tras cada cambio. No hay "guardar" explícito. localStorage es suficiente para MVP.

---

## 🚀 Roadmap Futuro (POST-MVP v1.1+)

**Phase 2 (si MVP tiene éxito):**
- Backend proxy para API key segura
- Autenticación y multi-usuario
- Exportar CSV con tareas
- Análisis histórico

**NO INCLUIR EN MVP:**
- PDF reports
- Calendario integration
- Machine learning
- Real-time collaboration

---

## 📝 Consideraciones Críticas

### Seguridad
1. **API Key en `.env.local`** — NO subir a Git
2. ⚠️ **RIESGO:** Exposición en navegador es débil. Para producción → backend proxy
3. Validar que `VITE_GEMINI_API_KEY` existe antes de iniciar

### Manejo de Errores (No Silencioso)
1. **Rate limit alcanzado** → Mostrar: "Límite de análisis por minuto. Intenta en 30s"
2. **JSON parse fail** → Mostrar: "Respuesta inválida de IA. Reintentando..."
3. **No internet** → Mostrar: "Sin conexión. Guarda localmente"
4. **localStorage corrupt** → Resetear con confirmación del usuario

### Performance
1. No cargar localStorage en cada render (useEffect + dependency array)
2. Ordenamiento al agregar tarea (evita UX confusa)
3. Debounce búsqueda si se agrega después

### Testing MVP
- Unit: `analyzTaskWithGemini()` logic
- Unit: ICE score calculation `(I+C+E)/3`
- Integration: localStorage save/restore
- E2E: Crear tarea → guardar → reload → persiste

---

## 📱 Pantallas Principales

### Pantalla 1: Principal
- Formulario de entrada tarea
- Tabla/Lista de tareas ordenadas por ICE
- Botones de acción (editar, completar, eliminar)

---

## 🎯 Conclusión

Este MVP proporciona una base sólida y simple para enseñar React mientras se integra IA moderna. El alcance es controlado, permitiendo que los estudiantes entiendan los conceptos sin sobrecargarse.

**Tiempo estimado de desarrollo:** 6-8 horas  
**Dificultad:** Intermedia-Baja  
**Requisitos previos:** React hooks + async/await + API calls  
**Conocimiento de Gemini API:** ~30 minutos setup