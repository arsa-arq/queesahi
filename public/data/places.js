/**
 * Capa de persistencia (sección 5.5 de ARCHITECTURE.md).
 *
 * Es un archivo .js y no .json por una razón concreta: el navegador bloquea
 * `fetch` cuando la página se abre con doble clic (protocolo file://), pero sí
 * ejecuta un <script> normal. Guardar los datos aquí es lo que permite que la
 * herramienta se abra sin servidor ni instalación. Ver docs/adr/0005.
 *
 * El contenido es un objeto JSON puro: para exportarlo a places.json de verdad
 * —para cargarlo en Supabase, por ejemplo— basta `npm run export:json`.
 *
 * NO edites la estructura sin leer antes docs/product/criterios-editoriales.md
 * y AGENTS.md. Después de cualquier cambio: `npm run check`.
 */

globalThis.__QEA_PLACES__ = {
  "schemaVersion": 1,
  "updatedAt": "2026-09-08",
  "places": [
    {
      "id": "plaza-de-bolivar",
      "slug": "plaza-de-bolivar",
      "name": "Plaza de Bolívar",
      "emoji": "🏛️",
      "color": "#C74A2C",
      "summary": "El corazón político e histórico de Bogotá y de Colombia.",
      "description": "Plaza principal fundacional de la ciudad, rodeada por el Capitolio Nacional, la Catedral Primada, el Palacio Liévano (Alcaldía Mayor), el Palacio de Justicia y el edificio del antiguo Cabildo. Es un rectángulo despejado de piso duro donde confluyen el poder legislativo, judicial, ejecutivo local y eclesiástico.",
      "whyItMatters": "Aquí se concentra la vida cívica del país: marchas, conciertos, posesiones presidenciales, mercados y celebraciones. El monumento a Simón Bolívar, inaugurado en 1846, fue la primera estatua pública de Bogotá.",
      "lookCloser": "Observa el choque de estilos alrededor de la plaza: el Capitolio neoclásico de fachada dórica, el Palacio de Justicia moderno reconstruido tras 1985, la Catedral neoclásica y el Palacio Liévano de aire francés.",
      "historicalContext": "En este solar estuvo la plaza mayor de la Santa Fe colonial desde 1539. Fue mercado público, plaza de toros y sitio de ejecuciones. Se llamó Plaza de la Constitución antes de tomar el nombre del Libertador.",
      "curiosity": "El diseño actual, sobrio y sin jardines, es de 1960, obra del arquitecto Fernando Martínez Sanabria. Antes la plaza tenía prados, árboles y una reja perimetral.",
      "latitude": 4.59808,
      "longitude": -74.07605,
      "location": "La Candelaria, Bogotá D.C.",
      "categories": [
        "Historia",
        "Política",
        "Espacio público"
      ],
      "images": [
        {
          "src": "public/fotos/plaza-de-bolivar.svg",
          "alt": "Marcador de posición: fondo rojo ladrillo con el emoji de un edificio clásico y el nombre del lugar.",
          "credit": "Marcador de posición generado por el proyecto. Pendiente de fotografía real."
        }
      ],
      "sources": [
        "Instituto Distrital de Patrimonio Cultural (IDPC)",
        "Banco de la República — Red Cultural"
      ],
      "status": "published",
      "createdAt": "2026-08-29",
      "updatedAt": "2026-09-08"
    },
    {
      "id": "museo-del-oro",
      "slug": "museo-del-oro",
      "name": "Museo del Oro",
      "emoji": "🪙",
      "color": "#E0951E",
      "summary": "La mayor colección de orfebrería prehispánica del mundo, al alcance de nuestras manos.",
      "description": "Museo del Banco de la República que reúne unas 34.000 piezas de oro y tumbaga y cerca de 25.000 objetos en cerámica, piedra, concha, hueso y textil, de culturas como Muisca, Quimbaya, Calima, Zenú, Tairona, Tolima y Nariño.",
      "whyItMatters": "Transformó la manera en que Colombia entiende su pasado indígena: el oro deja de leerse como riqueza y pasa a entenderse como un lenguaje simbólico, ritual y político de las sociedades prehispánicas.",
      "lookCloser": "Busca la Balsa Muisca, hallada en 1969 en una cueva en Pasca. Representa la ceremonia de El Dorado: el cacique cubierto de polvo de oro navegando la laguna de Guatavita con sus sacerdotes.",
      "historicalContext": "El Banco de la República compró en 1939 su primera pieza, el poporo Quimbaya, para frenar la fundición y la exportación del patrimonio arqueológico. Esa compra dio origen a la colección.",
      "curiosity": "La sala llamada «La Ofrenda» es un recinto oscuro y circular que se ilumina poco a poco, recreando la entrada ritual a un espacio sagrado lleno de piezas votivas.",
      "latitude": 4.60193,
      "longitude": -74.07216,
      "location": "Carrera 6 con calle 16, La Candelaria, Bogotá D.C.",
      "categories": [
        "Museo",
        "Arqueología",
        "Cultura"
      ],
      "images": [
        {
          "src": "public/fotos/museo-del-oro.svg",
          "alt": "Marcador de posición: fondo naranja ámbar con el emoji de una moneda y el nombre del lugar.",
          "credit": "Marcador de posición generado por el proyecto. Pendiente de fotografía real."
        }
      ],
      "sources": [
        "Museo del Oro — Banco de la República",
        "ICANH"
      ],
      "status": "published",
      "createdAt": "2026-08-29",
      "updatedAt": "2026-09-08"
    },
    {
      "id": "cerro-de-monserrate",
      "slug": "cerro-de-monserrate",
      "name": "Cerro de Monserrate",
      "emoji": "⛰️",
      "color": "#7C8B4A",
      "summary": "El cerro tutelar de Bogotá, a unos 3.152 m sobre el nivel del mar.",
      "description": "En la cima está el santuario del Señor Caído, meta de peregrinación. Se sube por funicular, por teleférico o por un camino peatonal empedrado. Desde el mirador se abarca casi toda la sabana de Bogotá.",
      "whyItMatters": "Es el principal lugar de peregrinación de la ciudad y una referencia visual permanente: se ve desde casi cualquier punto de Bogotá y orienta a quien camina por el centro.",
      "lookCloser": "Desde el mirador se distingue la retícula del centro histórico, la línea de los cerros orientales y, en días despejados, el páramo de Sumapaz hacia el sur.",
      "historicalContext": "La ermita empezó a construirse hacia 1650. El funicular funciona desde 1929 y el teleférico desde 1955; antes solo se subía a pie o a lomo de mula.",
      "curiosity": "El sendero de subida tiene cerca de 1.500 escalones. Los fines de semana lo recorren miles de personas, muchas rezando el vía crucis a lo largo del camino.",
      "latitude": 4.6057,
      "longitude": -74.0562,
      "location": "Cerros orientales, Bogotá D.C.",
      "categories": [
        "Religión",
        "Mirador",
        "Naturaleza"
      ],
      "images": [
        {
          "src": "public/fotos/cerro-de-monserrate.svg",
          "alt": "Marcador de posición: fondo verde oliva con el emoji de una montaña y el nombre del lugar.",
          "credit": "Marcador de posición generado por el proyecto. Pendiente de fotografía real."
        }
      ],
      "sources": [
        "Corporación Cerro de Monserrate",
        "IDPC"
      ],
      "status": "published",
      "createdAt": "2026-08-29",
      "updatedAt": "2026-09-08"
    },
    {
      "id": "teatro-colon",
      "slug": "teatro-colon",
      "name": "Teatro Colón",
      "emoji": "🎭",
      "color": "#3C5393",
      "summary": "El teatro nacional de Colombia, una joya del siglo XIX.",
      "description": "Teatro de ópera de estilo neoclásico inaugurado en 1892, obra del arquitecto italiano Pietro Cantini, sobre la calle 10 del centro histórico. Es la sala patrimonial más importante del país.",
      "whyItMatters": "Sede de las temporadas nacionales de ópera, danza y música sinfónica, y escenario de actos oficiales de Estado. Concentra buena parte de la memoria escénica del país.",
      "lookCloser": "El telón de boca, pintado por Annibale Gatti, es una alegoría teatral. En el plafón del techo hay medallones con Calderón de la Barca, Shakespeare, Molière y otros dramaturgos.",
      "historicalContext": "Se levantó sobre el antiguo Teatro Maldonado (1792) y se inauguró para el cuarto centenario del viaje de Cristóbal Colón, de donde viene su nombre.",
      "curiosity": "Tiene capacidad para unas 900 personas y su acústica es considerada una de las mejores de América Latina.",
      "latitude": 4.59723,
      "longitude": -74.07444,
      "location": "Calle 10 # 5-32, La Candelaria, Bogotá D.C.",
      "categories": [
        "Patrimonio",
        "Arte",
        "Música"
      ],
      "images": [
        {
          "src": "public/fotos/teatro-colon.svg",
          "alt": "Marcador de posición: fondo índigo con el emoji de dos máscaras de teatro y el nombre del lugar.",
          "credit": "Marcador de posición generado por el proyecto. Pendiente de fotografía real."
        }
      ],
      "sources": [
        "Ministerio de las Culturas — Teatro Colón",
        "IDPC"
      ],
      "status": "published",
      "createdAt": "2026-08-29",
      "updatedAt": "2026-09-08"
    },
    {
      "id": "chorro-de-quevedo",
      "slug": "chorro-de-quevedo",
      "name": "Chorro de Quevedo",
      "emoji": "⛲",
      "color": "#05707F",
      "summary": "La plazoleta donde la tradición ubica la fundación de Bogotá.",
      "description": "Pequeña plaza empedrada de La Candelaria, con una capilla y una fuente. Es punto de encuentro de cuenteros, músicos, artesanos y estudiantes, sobre todo al caer la tarde.",
      "whyItMatters": "La tradición sostiene que aquí Gonzalo Jiménez de Quesada fundó Santa Fe el 6 de agosto de 1538, con doce chozas y una misa. Es un lugar simbólico del origen de la ciudad.",
      "lookCloser": "La capilla que se ve hoy es una reconstrucción de 1969. El «chorro» es una fuente que recuerda el antiguo pilar de agua que abastecía al barrio.",
      "historicalContext": "El nombre viene del fraile agustino Agustín de Quevedo y Zea, propietario del pilar de agua en el siglo XVIII.",
      "curiosity": "Por el callejón del Embudo, junto a la plaza, se vende chicha en totuma: una bebida de maíz fermentado de raíz muisca.",
      "latitude": 4.59662,
      "longitude": -74.0713,
      "location": "Callejón del Embudo, La Candelaria, Bogotá D.C.",
      "categories": [
        "Historia",
        "Fundación",
        "Vida urbana"
      ],
      "images": [
        {
          "src": "public/fotos/chorro-de-quevedo.svg",
          "alt": "Marcador de posición: fondo teal con el emoji de una fuente y el nombre del lugar.",
          "credit": "Marcador de posición generado por el proyecto. Pendiente de fotografía real."
        }
      ],
      "sources": [
        "IDPC",
        "Alcaldía Local de La Candelaria"
      ],
      "status": "published",
      "createdAt": "2026-08-29",
      "updatedAt": "2026-09-08"
    },
    {
      "id": "academia-colombiana-de-historia",
      "slug": "academia-colombiana-de-historia",
      "name": "Academia Colombiana de Historia",
      "emoji": "📚",
      "color": "#04437F",
      "summary": "La corporación que estudia y custodia la historia de Colombia desde 1902.",
      "description": "Corporación de derecho privado, sin ánimo de lucro y con personería jurídica, dedicada al estudio, la investigación y la divulgación de la historia de Colombia. Su sede en La Candelaria reúne una biblioteca especializada, un archivo documental y las salas donde sesionan sus miembros.",
      "whyItMatters": "Estudia la historia del país desde los tiempos prehispánicos hasta la actualidad, y trabaja junto con otras instituciones en la conservación del patrimonio documental y en la defensa del patrimonio histórico y cultural.",
      "lookCloser": "A diferencia de un museo, la Academia no se recorre de paso: su vida ocurre en la biblioteca, en las sesiones de sus miembros y en las publicaciones que produce. Conviene consultar horarios y condiciones de consulta antes de ir.",
      "historicalContext": "Fue fundada en 1902 y es una de las corporaciones académicas más antiguas del país. Su biblioteca se organizó hacia 1910, en el marco del centenario de la Independencia, a partir de donaciones de obras de historia americana.",
      "curiosity": "Escribe la historia de Colombia de manera silenciosa y casi invisible: buena parte de lo que hoy se estudia del pasado del país pasó antes por sus sesiones y sus publicaciones.",
      "latitude": 4.598117,
      "longitude": -74.077428,
      "location": "Calle 10, La Candelaria, Bogotá D.C.",
      "categories": [
        "Historia",
        "Patrimonio",
        "Investigación"
      ],
      "images": [
        {
          "src": "public/fotos/academia-colombiana-de-historia.svg",
          "alt": "Marcador de posición: fondo azul con el emoji de unos libros y el nombre del lugar.",
          "credit": "Marcador de posición generado por el proyecto. Pendiente de fotografía real."
        }
      ],
      "sources": [
        "Academia Colombiana de Historia"
      ],
      "status": "published",
      "createdAt": "2026-08-29",
      "updatedAt": "2026-09-08"
    }
  ]
};
