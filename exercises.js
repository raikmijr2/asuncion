'use strict';

/* Momentos de la rutina diaria */
const MOMENTS = [
  { id: 'manana', label: 'Por la mañana' },
  { id: 'dia', label: 'Durante el día' },
  { id: 'noche', label: 'Antes de dormir' },
];

/*
 * Definición de los ejercicios.
 * {p} se sustituye por el nombre de la persona de la etapa (o «ella»); {P}, igual pero con mayúscula.
 * Tipos de campo: text, textarea, lines (una idea por línea), chips (varias opciones),
 * choice (una opción), note (texto fijo), timer (cuenta atrás, no se guarda).
 */
const EX = {
  /* ---------- Ejercicios de la etapa ---------- */
  afirmaciones: {
    title: 'Mis afirmaciones',
    moment: 'manana',
    icon: '✦',
    intro: 'Tus tres afirmaciones principales están siempre arriba. Aquí puedes escribir y guardar otras afirmaciones que te ayuden en esta etapa.',
    fields: [
      { k: 'texto', type: 'textarea', rows: 3, label: 'Afirmación', placeholder: 'En presente, como si ya fuera real…' },
    ],
  },
  motivos: {
    title: 'Por qué {p} me elegiría',
    moment: 'manana',
    icon: '✧',
    intro: 'Reconoce tu propio valor y las cualidades que tienes como pareja.',
    tips: ['Mi personalidad', 'Mi forma de querer', 'Mi sentido del humor', 'Mi capacidad de escuchar', 'Mi evolución personal', 'Mi forma de apoyarla', 'Las experiencias que hemos vivido', 'Lo que puedo aportar a una relación'],
    fields: [
      { k: 'motivos', type: 'lines', rows: 8, label: 'Motivos por los que me elegiría', placeholder: 'Me elige porque…' },
    ],
  },
  'cosas-buenas': {
    title: 'Lo bueno que he aportado',
    sub: 'Cosas buenas que he hecho por {p}',
    moment: 'dia',
    icon: '♡',
    intro: 'Deja de centrarte solo en tus errores. Recuerda también todo lo bueno que has aportado a la relación.',
    tips: ['Cosas que he hecho por ella', 'Momentos en los que la he apoyado', 'Situaciones en las que he estado a su lado', 'Detalles que he tenido con ella', 'Momentos en los que la he hecho feliz', 'Veces que la he escuchado y comprendido', 'Experiencias bonitas que hemos compartido'],
    fields: [
      { k: 'lista', type: 'lines', rows: 8, label: 'Lo que recuerdo hoy', placeholder: 'Cuando…' },
    ],
  },
  'como-la-hice-sentir': {
    title: 'Cómo he hecho sentir a {p}',
    moment: 'dia',
    icon: '❀',
    intro: 'Recuerda momentos en los que ella te expresó que se sintió feliz, querida, comprendida o especial contigo.',
    fields: [
      { k: 'titulo', type: 'text', label: 'El recuerdo', placeholder: 'Ej.: Cuando me dijo lo feliz que la hacía' },
      { k: 'ocurrio', type: 'textarea', rows: 4, label: '¿Qué ocurrió?' },
      { k: 'palabras', type: 'textarea', rows: 3, label: '¿Qué me dijo o cómo lo expresó?' },
      { k: 'sintio', type: 'chips', label: 'Cómo se sintió ella', options: ['Feliz', 'Querida', 'Comprendida', 'Especial', 'Escuchada', 'Cómoda', 'Segura', 'Agradecida'] },
    ],
    preview: (d) => d.titulo || d.ocurrio || '',
  },
  percepcion: {
    title: 'Cambiar mi percepción de {p}',
    moment: 'dia',
    icon: '↻',
    intro: 'Cuando la notes distante o poco cariñosa, escribe el pensamiento que te ha generado inseguridad y reescríbelo con una interpretación más positiva y equilibrada. Es la revisión aplicada al día a día.',
    fields: [
      { k: 'pensamiento', type: 'textarea', rows: 3, label: 'El pensamiento que me ha generado inseguridad', ideas: ['Está fría.', 'Está distante.', 'No tiene ganas de hablar conmigo.', 'Ya no siente lo mismo.', 'No quiere volver.'] },
      { k: 'alternativa', type: 'textarea', rows: 5, label: 'Una interpretación más positiva y equilibrada', ideas: ['También ha tenido iniciativas para acercarse a mí.', 'Puede existir cariño aunque hoy no sea especialmente expresiva.', 'Es posible que también me eche de menos.', 'Nuestra historia tiene muchos momentos positivos.', 'Las cosas pueden evolucionar favorablemente.'] },
    ],
    preview: (d) => (d.pensamiento && d.alternativa ? `${d.pensamiento} → ${d.alternativa}` : d.pensamiento || d.alternativa || ''),
  },
  reciprocidad: {
    title: 'Asumir reciprocidad',
    moment: 'dia',
    icon: '⇄',
    intro: 'Cuando sientas nostalgia o ansiedad por saber de ella, recuerda que es posible que ella también te eche de menos.',
    fields: [
      { k: 'nota', type: 'note', text: 'Mi nostalgia no es una señal de que esté perdiendo la relación. Es posible que, ahora mismo, ella también me eche de menos.' },
      { k: 'siento', type: 'textarea', rows: 3, label: '¿Qué estoy sintiendo ahora?' },
      { k: 'asumo', type: 'textarea', rows: 4, label: 'Lo que elijo asumir', ideas: ['Ella también piensa en mí.', 'Es posible que ella también me eche de menos ahora mismo.', 'Echarla de menos no significa que la esté perdiendo.', 'Lo que siento por ella también está volviendo hacia mí.'] },
    ],
    preview: (d) => d.asumo || d.siento || '',
  },
  scripting: {
    title: 'Scripting',
    sub: 'Le cuento a un amigo que hemos vuelto',
    moment: 'noche',
    icon: '✎',
    serif: true,
    intro: 'Escribe desde el final: ya ha ocurrido. Cuéntaselo a un amigo con todo detalle y siente la alegría de contarlo.',
    tips: ['Cómo ocurrió la reconciliación', 'Qué me dijo {p}', 'Cómo me sentí', 'Qué ha cambiado entre nosotros', 'Cómo es nuestra nueva relación', 'Qué planes estamos haciendo juntos', 'Qué felicidad me produce esta nueva etapa'],
    fields: [
      { k: 'texto', type: 'textarea', rows: 14, label: 'Mi historia', placeholder: '«¡No te lo vas a creer! Hemos vuelto…»' },
    ],
  },
  llamada: {
    title: 'Llamada imaginaria',
    moment: 'noche',
    icon: '☏',
    serif: true,
    intro: 'Imagina una llamada breve en la que {p} te dice que quiere volver a intentarlo contigo. También puedes imaginar que se lo cuentas a un amigo.',
    fields: [
      { k: 'escena', type: 'choice', label: 'La escena', options: ['{P} me llama', 'Se lo cuento a un amigo'] },
      { k: 'dialogo', type: 'textarea', rows: 10, label: 'El diálogo', placeholder: '{P}: Hola… He estado pensando mucho en nosotros.\nYo: …' },
    ],
    preview: (d) => d.dialogo || '',
  },
  visualizacion: {
    title: 'Visualización',
    moment: 'noche',
    icon: '◉',
    intro: 'Una escena corta, de 5 a 10 segundos, que implique que tu deseo ya se ha cumplido. Hazla relajado, justo antes de dormir (SATS), y repítela hasta que se sienta real.',
    fields: [
      { k: 'tipo', type: 'choice', label: 'Qué visualizo', options: ['{P} me dice que quiere volver', 'Una escena cotidiana juntos'] },
      { k: 'escena', type: 'textarea', rows: 5, label: 'La escena', placeholder: '{P}, delante de mí, sonriendo: «Te echo de menos. He reflexionado y quiero construir algo nuevo contigo.»' },
      { k: 'timer', type: 'timer', secs: 10, label: 'Vívela durante 10 segundos' },
      { k: 'emociones', type: 'chips', label: 'Lo que siento', options: ['Felicidad', 'Ilusión', 'Tranquilidad', 'Amor', 'Seguridad'] },
    ],
    preview: (d) => d.escena || '',
  },

  /* ---------- Autoconcepto (común a todas las etapas) ---------- */
  creencias: {
    title: 'Mis nuevas creencias',
    moment: 'manana',
    icon: '◇',
    intro: 'Escribe nuevas creencias sobre ti, en presente. Tu autoconcepto es la base de todo lo demás.',
    fields: [
      { k: 'creencias', type: 'lines', rows: 7, label: 'Hoy elijo creer que…', placeholder: 'Soy suficiente tal y como soy.', ideas: ['Soy suficiente tal y como soy.', 'Soy una persona divertida y agradable.', 'Aporto cosas valiosas a quienes me rodean.', 'Me siento cómodo siendo yo mismo.', 'Merezco una relación sana y feliz.'] },
    ],
  },
  inseguridades: {
    title: 'Cuestionar mis inseguridades',
    moment: 'dia',
    icon: '?',
    intro: 'Coge un pensamiento negativo sobre ti y ponlo a prueba con estas siete preguntas.',
    fields: [
      { k: 'pensamiento', type: 'textarea', rows: 2, label: '1. ¿Qué pensamiento estoy teniendo?', ideas: ['No soy gracioso.', 'Molesto a los demás.', 'No soy suficiente.', 'No soy atractivo.', 'Los demás son mejores que yo.'] },
      { k: 'porque', type: 'textarea', rows: 3, label: '2. ¿Por qué creo que esto es cierto?' },
      { k: 'pruebas', type: 'textarea', rows: 3, label: '3. ¿Qué pruebas reales tengo?' },
      { k: 'contrario', type: 'textarea', rows: 3, label: '4. ¿Qué pruebas tengo de lo contrario?' },
      { k: 'generalizo', type: 'textarea', rows: 3, label: '5. ¿Estoy generalizando una experiencia concreta?' },
      { k: 'amigo', type: 'textarea', rows: 3, label: '6. ¿Qué le diría a un amigo que pensase esto?' },
      { k: 'creencia', type: 'textarea', rows: 3, label: '7. ¿Cuál sería una creencia más realista y positiva?' },
    ],
    preview: (d) => (d.pensamiento && d.creencia ? `${d.pensamiento} → ${d.creencia}` : d.pensamiento || d.creencia || ''),
  },
  'chico-seguro': {
    title: '¿Qué haría un chico seguro?',
    moment: 'dia',
    icon: '▲',
    intro: 'Cuando sientas inseguridad, pregúntate cómo actuaría tu versión más segura.',
    fields: [
      { k: 'situacion', type: 'textarea', rows: 3, label: 'La situación que estoy viviendo' },
      { k: 'version', type: 'textarea', rows: 5, label: 'Cómo actuaría mi versión segura', ideas: ['Seguiría con mi día con tranquilidad.', 'Hablaría con ella sin necesitar una respuesta concreta.', 'No reaccionaría impulsivamente.', 'Expresaría lo que siento con calma.', 'No necesitaría comprobar si le gusto.'] },
    ],
    preview: (d) => (d.situacion && d.version ? `${d.situacion} → ${d.version}` : d.situacion || d.version || ''),
  },
  'lo-mejor': {
    title: '¿Qué es lo mejor que puede pasar?',
    moment: 'dia',
    icon: '☼',
    intro: 'Cuando aparezca el miedo al futuro, dale la vuelta a la pregunta.',
    fields: [
      { k: 'preocupa', type: 'textarea', rows: 3, label: '¿Qué me preocupa?' },
      { k: 'mejor', type: 'textarea', rows: 3, label: '¿Qué es lo mejor que podría pasar?' },
      { k: 'posibilidades', type: 'textarea', rows: 3, label: '¿Qué posibilidades positivas existen?' },
      { k: 'sentiria', type: 'textarea', rows: 3, label: '¿Cómo me sentiría si todo saliese bien?' },
    ],
    preview: (d) => d.mejor || d.preocupa || '',
  },
};

/* Ejercicios que puede tener una etapa, en orden */
const STAGE_EX_ALL = ['afirmaciones', 'motivos', 'cosas-buenas', 'como-la-hice-sentir', 'percepcion', 'reciprocidad', 'scripting', 'llamada', 'visualizacion'];
/* Ejercicios de autoconcepto, presentes en todas las etapas */
const SELF_EX = ['creencias', 'inseguridades', 'chico-seguro', 'lo-mejor'];

/* «El hombre que soy»: texto inicial editable desde la app */
const SEED_IDENTITY = [
  'Soy un hombre seguro de mí mismo.',
  'Tengo una autoestima sana y reconozco mi propio valor.',
  'No necesito validación constante.',
  'No me comparo con otros hombres: sigo mi propio camino.',
  'Sé escuchar.',
  'Expreso mis sentimientos con tranquilidad.',
  'Soy cariñoso y atento.',
  'No necesito tener siempre la razón.',
  'No actúo desde el miedo a perder a nadie.',
  'Disfruto de mi vida pase lo que pase.',
];
