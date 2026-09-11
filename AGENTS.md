<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Directriz Maestra: Lujo Boutique y Diseño Editorial (Anti-AI Look)

El objetivo es llevar la interfaz a un estándar premium (estilo Plum Guide o Airbnb Luxe). Tienes estrictamente prohibido usar guiones (-), barras o líneas divisorias (como border-t, border-b, divide-y) para separar componentes o listas. Elimina cualquier rastro de la estética matemática de "plantilla dashboard". Aplica estas reglas innegociables para resolver el layout usando fundamentos puros de diseño:

El Aire es el Divisor Único: Reemplaza todos los separadores visuales por márgenes generosos y asimétricos (ej. mb-12, mt-16). En las vistas de catálogo, aumenta el margen inferior entre filas de tarjetas al menos un 20% para lograr una cadencia de galería de arte.

Sombras Orgánicas y Levitación: Prohibido usar shadow-md, shadow-lg o bordes de 1px genéricos. Para despegar elementos del fondo, como el widget sticky de reserva, utiliza sombras ultra dispersas y casi invisibles (ej. shadow-[0_40px_80px_rgba(0,0,0,0.03)] o 0 20px 40px rgba(0,0,0,0.05)) en lugar de líneas duras.

Contraste Tipográfico y Asimetría: Estructura la jerarquía con diferencias dramáticas de tamaño y opacidad (ej. números grandes en stone-900 Serif contra descripciones pequeñas en stone-400 Sans). Usa limitadores de ancho (max-w-prose, max-w-2xl) para alinear bloques de forma natural y evitar rectángulos perfectos. En el footer, reduce el tamaño de los textos legales y aumenta el letter-spacing (0.05em) para un acabado de revista de moda.

Navegación e Inmersión Visual: Implementa un header flotante con glassmorphism (desenfoque) al hacer scroll en lugar de un fondo blanco sólido. En la galería de propiedades, reduce el gap a 4px u 8px máximo, con fotos más juntas y bordes sutilmente redondeados.

Iconografía y Estados Vacíos: Reemplaza viñetas estándar y tildes (✓) por íconos SVG minimalistas a medida. En los estados vacíos (ej. comparador sin propiedades), evita cuadros grises inactivos; usa una ilustración lineal elegante de baja opacidad y un botón sólido ("Explorar catálogo") para devolver al usuario a la acción.

Jerarquía de Acción por Color: Reserva el botón verde exclusivamente para acciones de comunicación directa ("Hablar por WhatsApp con el equipo"). Para formularios internos (ej. "Sumá tu casa"), utiliza el color terracota de la marca.
