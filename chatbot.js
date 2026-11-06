/*!
 * FH Detailing · Asistente virtual (chatbot)
 * ------------------------------------------------------------------
 * Funciona 100% en el navegador: no necesita servidor, API ni pagos.
 * Responde preguntas frecuentes, muestra precios, recomienda servicios
 * y deja la reserva o cotización lista para enviarla por WhatsApp.
 *
 * Cómo se instala: una sola línea antes de </body> en index.html
 *   <script src="chatbot.js" defer></script>
 *
 * Precios: el asistente lee los precios de autos, SUV y motos
 * directamente de la sección "Servicios" de index.html (las listas
 * interior, exterior, packs y MOTO). Si cambias un precio ahí, el
 * asistente lo muestra actualizado sin tocar este archivo.
 * Los datos que NO están en esas listas (Off Road, horario, cuenta,
 * respuestas) se editan en la sección 1 de este archivo.
 */
(function () {
  "use strict";
  if (window.FHChat) return;

  /* =================================================================
   * 1. DATOS DEL NEGOCIO Y RESPUESTAS  ·  (edita aquí)
   * ================================================================= */

  const NEGOCIO = {
    nombre: "FH Detailing",
    whatsapp: "56998415265",                 // sin +, sin espacios
    telefono: "+56 9 9841 5265",
    email: "contacto@fhdetailing.cl",
    zonaHoraria: "America/Santiago",
    horario: {
      texto: "lunes a sábado, de 09:00 a 18:00 hrs",
      dias: [1, 2, 3, 4, 5, 6],              // 0 = domingo, 1 = lunes … 6 = sábado
      abre: 9,
      cierra: 18
    },
    cobertura: "Antofagasta y alrededores",
    google: "https://maps.app.goo.gl/SFREE2XpSWtFrQf29",
    instagram: "https://instagram.com/fhdetailing__",
    tiktok: "https://tiktok.com/@fhdetailing__",
    solicitudCondominio: "/solicitud-condominio.pdf",
    banco: [
      ["Titular", "FH DETAILING SPA"],
      ["RUT", "78.376.999-9"],
      ["Banco", "Banco Estado"],
      ["Tipo", "Chequera Electrónica (Vista)"],
      ["N° cuenta", "91270053390"],
      ["Correo", "contacto@fhdetailing.cl"]
    ],
    // Línea final de los mensajes de WhatsApp (déjala "" para quitarla)
    firmaWhatsApp: "(Mensaje armado en el asistente de la web)"
  };

  // Off Road: estos precios están escritos en el HTML de la página,
  // por eso se repiten aquí. Si los cambias allá, cámbialos también acá.
  const OFFROAD = [
    { clave: "or-cross", nombre: "Moto cross / enduro", precio: 40000, tiempo: "2 horas",
      desc: "Desbarrado, suspensión y las zonas donde la tierra se acumula.",
      incluye: ["Desbarrado", "Suspensión", "Chasis superior expuesto", "Cadena y piñones"],
      ideal: "Enduro o cross después de terreno." },
    { clave: "or-atv", nombre: "ATV / cuatrimoto", precio: 50000, tiempo: "2 horas",
      desc: "Lavado completo después de terreno.",
      incluye: ["Plásticos", "Neumáticos con tacos", "Chasis superior expuesto"],
      ideal: "Cuatro neumáticos cargados de arena, plásticos por todos lados y chasis expuesto." },
    { clave: "or-utv2", nombre: "UTV 2 plazas", precio: 65000, tiempo: "3 a 4 horas",
      desc: "Interior y exterior completo.",
      incluye: ["Habitáculo y butacas", "Jaula y plásticos", "Chasis superior expuesto", "Neumáticos"],
      ideal: "Para la máquina que vuelve de la duna." },
    { clave: "or-utv4", nombre: "UTV 4 plazas", precio: 80000, tiempo: "3 a 4 horas",
      desc: "Interior y exterior completo, con segunda corrida de butacas.",
      incluye: ["Habitáculo y dos corridas de butacas", "Jaula y plásticos", "Chasis superior expuesto", "Neumáticos"],
      ideal: "Suma una segunda corrida de butacas y más puntos donde la arena se aloja." }
  ];

  // Trabajos que se cotizan caso a caso (sección "Otros trabajos que evaluamos").
  const OTROS = {
    "Pintura y exterior": ["Corrección de barniz", "Pulido y abrillantado", "Descontaminación profunda",
      "Pulido de faros", "Limpieza de llantas y pasarruedas", "Restauración de plásticos exteriores"],
    "Interior en profundidad": ["Limpieza de tapiz con extracción", "Lavado de asientos",
      "Limpieza de cielo o techo", "Limpieza y acondicionado de cuero", "Alfombras y maletero",
      "Cinturones de seguridad", "Neutralización de olores", "Rejillas y ductos de ventilación"],
    "Motor y mecánica a la vista": ["Lavado de motor", "Limpieza de compartimento y mangueras",
      "Abrillantado de plásticos del vano"],
    "Protección y accesorios": ["PPF en paneles piano black", "PPF en pantalla multimedia",
      "Polarizado de vidrios", "Sellado de llantas"]
  };

  // Respuestas fijas. Puedes usar <b>negrita</b> y <br> para saltos de línea.
  const TXT = {
    saludo: "¡Hola! Soy el asistente virtual de <b>FH Detailing</b>. Te ayudo con precios, servicios y a dejar tu reserva lista para enviarla por WhatsApp. ¿Qué necesitas?",
    agua_luz: "No necesitas nada. Trabajamos con un <b>equipo 100% autónomo</b>: llevamos nuestra propia agua, energía y herramientas. No conectamos nada a tu casa u oficina y no ocupamos tu llave de agua.",
    donde: "Vamos donde esté el vehículo: <b>tu casa, tu oficina, el estacionamiento del edificio o la faena</b>. Solo necesitamos espacio para abrir las puertas y rodear el auto. En estacionamientos subterráneos también trabajamos sin problema.",
    espacio: "Solo necesitamos espacio suficiente para <b>abrir las puertas y rodear el vehículo</b>. En edificios y condominios se requieren <b>dos estacionamientos consecutivos</b>, coordinados previamente.",
    cobertura: "Atendemos en <b>Antofagasta y alrededores</b>. ¿Estás fuera del radio habitual? Escríbenos igual y lo evaluamos.",
    quedarse: "No es necesario. Muchos clientes nos dejan el vehículo y siguen con su día. Solo coordinamos contigo la <b>entrega de llaves</b> y te avisamos cuando esté listo.",
    dif_interior: "<b>Interior Esencial</b> es mantención: aspirado completo, superficies, plásticos, puertas y vidrios.<br><b>Restauración Interior</b> es un tratamiento intensivo para interiores deteriorados: todo lo del Esencial más limpieza profunda de butacas y tapices con extracción, manchas difíciles, rieles y costuras, y neutralización de olores.",
    dif_exterior: "<b>Lavado Express</b> es un lavado rápido por fuera, sin detallado de rincones.<br><b>Lavado detallado exterior</b> suma espuma activa de pH neutro, llantas con químicos específicos y abrillantado de neumáticos.<br><b>Lavado de mantención cerámica</b> es exclusivo para vehículos con sellado cerámico vigente.",
    precios_finales: "Son <b>valores referenciales con IVA incluido</b>, según el tipo de vehículo (sedán/hatchback o SUV/camioneta). Si el vehículo está muy deteriorado o requiere trabajo adicional, te lo conversamos <b>antes</b> de comenzar: nunca cobramos algo que no hayas aprobado.<br>Vehículos fuera de estándar tienen un recargo del 30% sobre la tarifa SUV en servicios de interior.",
    pago: "Pagas <b>al terminar</b>, después de revisar el resultado. Aceptamos <b>débito y crédito</b> (llevamos POS BancoEstado en la van), <b>Google Pay, Apple Pay, efectivo y transferencia</b>.<br>Nunca pedimos transferencia antes de hacer el trabajo.",
    cuotas: "Sí. Con <b>tarjeta de crédito</b> en nuestro POS BancoEstado puedes pagar <b>hasta en 48 cuotas</b>. BancoEstado tiene promociones de cuotas sin interés con sus propias tarjetas; si tu tarjeta es de otro banco, consulta con tu emisor si aplica interés.",
    transferencia: "Estos son nuestros datos de transferencia. Recuerda que <b>pagas al terminar</b>: nunca pedimos transferencia antes del servicio.",
    transferencia_fin: "Envíanos el comprobante por WhatsApp y te emitimos la boleta o factura.",
    factura: "Sí. Emitimos <b>boleta o factura electrónica</b>. Si necesitas <b>factura con RUT de empresa</b>, avísanos antes de emitir y la generamos a nombre de tu compañía.",
    empresas: "Mantenemos tu flota lista <b>sin interrumpir tu operación</b>. Vamos a tu empresa, al estacionamiento o al lugar que necesites, sin traslados ni horas perdidas de tus vehículos.",
    empresas_lista: [
      "<b>Lavado en seco</b> para flotas: sin agua corriendo ni residuos líquidos en el piso.",
      "<b>Un solo contacto</b> para coordinar días, horarios y cantidad de vehículos.",
      "<b>Plan mensual</b> a medida, con valor cerrado al mes.",
      "<b>Servicio recurrente</b> para que tu flota siempre represente bien."
    ],
    condominio: "Algunas administraciones piden un permiso previo para que ingrese un servicio externo. <b>Ya preparamos el documento</b>: lo descargas, completas tus datos (edificio, departamento, fecha y horario) y lo entregas a la administración.",
    condominio_lista: [
      "No usamos agua ni electricidad del edificio: la unidad es autónoma.",
      "Lavado en seco, sin escurrimiento hacia desagües ni estacionamientos vecinos.",
      "Productos biodegradables y de pH neutro, no corrosivos.",
      "Generador inverter insonorizado de 64 dB.",
      "Se requieren dos estacionamientos consecutivos, coordinados previamente."
    ],
    condominio_fin: "Si la administración no autoriza el ingreso, coordinamos el servicio en otro punto.",
    anticipacion: "Mientras antes mejor, sobre todo para servicios largos como la <b>Restauración</b> o los <b>packs completos</b>, que ocupan gran parte del día. Al enviar tu reserva te confirmamos la disponibilidad del bloque que elegiste.",
    anticipacion_hoy: "Si lo necesitas para hoy, escríbenos por WhatsApp y vemos si queda un bloque libre.",
    cancelar: "Sin problema. Avísanos por WhatsApp con la mayor anticipación posible y <b>reagendamos sin costo</b>.",
    detailing: "El detailing no es un lavado más caro: <b>es un criterio distinto</b>. Un lavado convencional toma 20 a 30 minutos y usa un solo producto para todo el vehículo. En detailing, <b>cada superficie se trabaja con su producto y su proceso</b>: se revisa el vehículo antes de empezar y se trabajan costuras, rieles y rincones que un lavado rápido no alcanza.<br>Los rodillos y túneles de lavado, en cambio, arrastran la tierra del auto anterior y la usan como lija sobre tu barniz.",
    productos: "Usamos <b>producto profesional</b>: línea Vonixx y químicos específicos para cada superficie, no multiuso. Son <b>biodegradables y de pH neutro</b>, no corrosivos, elegidos para proteger pintura y tapices.",
    ruido: "Usamos un <b>generador inverter insonorizado de 64 dB</b>, con aislamiento acústico dual. Llevamos nuestra propia energía: no usamos tus enchufes.",
    lavado_seco: "Sí. Ofrecemos <b>lavado en seco</b>, ideal para edificios y flotas. Un lavado convencional ocupa entre 150 y 300 litros de agua por vehículo; nuestro método usa una fracción de ese volumen (<b>90% menos líquido residual</b>), sin charcos ni escurrimiento a desagües o estacionamientos vecinos.",
    unidad: "Llegamos en una <b>Volkswagen Transporter</b> equipada con todo: generador, estanque de agua, aspiradora, hidrolavadora, herramientas de taller y productos profesionales. Abrimos, conectamos y empezamos, sin usar nada tuyo.",
    resenas: "Lo que dicen nuestros clientes está en nuestro <b>perfil de Google</b>, siempre actualizado. En Instagram y TikTok también publicamos trabajos reales.",
    redes: "Nos encuentras como <b>@fhdetailing__</b> en Instagram y TikTok.",
    ubicacion: "No tenemos local: somos un servicio <b>100% móvil</b>. Llevamos el taller hasta donde esté tu vehículo, en Antofagasta y alrededores: tu casa, oficina, edificio o faena.",
    quienes: "FH Detailing nació en Antofagasta de una observación simple: nadie deja de cuidar su auto porque no le importe, sino porque no tiene cuándo. Por eso <b>movimos el taller, no al cliente</b>: una unidad que trabaja en cualquier parte con su propia agua, energía y herramientas.<br>En lo que no transamos: <b>puntualidad, transparencia, cuidado y discreción</b>.",
    reclamo: "Lamentamos que algo no haya salido como esperabas. Escríbenos por WhatsApp con el detalle (y fotos, si puedes) para revisarlo directamente. También puedes escribir a <b>contacto@fhdetailing.cl</b>.",
    denuncia: "Puedes reportar una conducta indebida de forma directa en nuestro <b>canal de denuncias</b>: contacto@fhdetailing.cl, con el asunto “Canal de denuncias”.",
    tienda: "Nuestra tienda de productos para mantener el resultado en casa está <b>en preparación</b>. ¡Pronto!",
    frecuencia: "Como mantención, recomendamos el <b>Lavado detallado exterior cada dos o tres semanas</b>. Para el interior, el <b>Interior Esencial</b> es el servicio base si el vehículo está razonablemente cuidado.<br>Si tienes sellado cerámico, usa el <b>Lavado de mantención cerámica</b>: el shampoo común y los lavaderos corrientes atacan la capa.",
    fotos: "¡Sí! Mándanos fotos por WhatsApp y te decimos qué necesita realmente tu vehículo. Si no hace falta un servicio más avanzado, te lo vamos a decir.",
    bot: "Soy el <b>asistente virtual</b> de FH Detailing: respondo al instante sobre precios, servicios y reservas. Si prefieres hablar con una persona del equipo, escríbenos por WhatsApp.",
    gracias: "¡De nada! Si necesitas algo más, aquí estoy.",
    despedida: "¡Que estés muy bien! Cuando quieras cuidar tu vehículo, aquí estamos.",
    ceramico: "El <b>sellado cerámico</b> es nuestro servicio estrella: la pintura se corrige primero y se sella después, con una capa que la protege del sol, la sal y la contaminación <b>hasta por 3 años</b>.",
    ceramico_pasos: [
      "Descontaminación química y mecánica de la pintura",
      "Pulido de 3 pasos: corrección, refinado y abrillantado",
      "Eliminación de rayas superficiales y marcas de lavadero",
      "Sellado cerámico de grado profesional"
    ],
    ceramico_fin: "Toma <b>1 a 2 días</b> e incluye sin costo el <b>Interior Esencial</b> (sujeto a evaluación). El valor depende del tamaño y del estado de la pintura, así que <b>te cotizamos con fotos</b>. Puedes pagarlo hasta en 48 cuotas con tarjeta de crédito.",
    ceramico_despues: "Un sellado cerámico mal mantenido se degrada antes de tiempo. Lavarlo con shampoo común o en un lavadero corriente ataca la capa que pagaste: para eso existe el <b>Lavado de mantención cerámica</b>.",
    otros: "También hacemos trabajos específicos que se cotizan <b>caso a caso</b>, después de ver el vehículo (no hay dos iguales):",
    otros_fin: "Mándanos fotos por WhatsApp y te decimos qué necesita realmente.",
    offroad: "Una moto que vuelve del cerro o una UTV que vuelve de la duna <b>no se lavan como un auto</b>. Precios con IVA incluido; el valor final depende del estado de la máquina: mándanos una foto y te confirmamos antes de agendar.",
    moto_nota: "Precios con IVA incluido para moto de calle o pistera. Si tu moto es cross o enduro, mira los servicios Off Road.",
    grande_nota: "Para vans y vehículos fuera de estándar te mostramos la tarifa SUV como referencia: los servicios de interior tienen un recargo del 30% sobre esa tarifa. Te confirmamos el valor final por WhatsApp.",
    iva: "Valores referenciales con IVA incluido. El servicio va donde estés.",
    fallback: "No tengo esa respuesta a mano, pero el equipo te la puede responder por WhatsApp. ¿Quieres escribirles con tu pregunta?",
    fallback2: "Sigo sin entenderte, perdona. Prueba con una de estas opciones o escríbenos por WhatsApp:"
  };

  // Mensajes de WhatsApp prellenados (mismos textos que usa la página).
  const MSG = {
    consulta: "Hola FH Detailing, quiero hacer una consulta.",
    empresa: "Hola FH Detailing, represento a una empresa y quiero una propuesta para nuestra flota de vehículos.",
    condominio: "Hola FH Detailing, mi edificio pide autorización para el servicio y necesito ayuda con el documento.",
    cancelar: "Hola FH Detailing, necesito cambiar o cancelar mi hora agendada.",
    pagar: "Hola FH Detailing, les envío el comprobante de pago de mi servicio.",
    fotos: "Hola FH Detailing, les envío fotos de mi vehículo para que me digan qué servicio necesita.",
    hoy: "Hola FH Detailing, ¿tienen disponibilidad para hoy?",
    reclamo: "Hola FH Detailing, quiero comentarles un problema con un servicio."
  };

  /* =================================================================
   * 2. UTILIDADES
   * ================================================================= */

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = n => "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const waURL = msg => "https://wa.me/" + NEGOCIO.whatsapp + "?text=" + encodeURIComponent(msg);

  function norm(s) {
    return String(s || "").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  const slug = s => norm(s).replace(/ /g, "-");

  // "2-3 HRS" → "2 a 3 horas" · "1 HR" → "1 hora"
  function fmtTiempo(t) {
    const s = String(t || "").trim();
    if (!/hrs?$/i.test(s)) return s;
    const base = s.replace(/\s*hrs?$/i, "").trim().replace(/\s*-\s*/g, " a ");
    return base + (base === "1" ? " hora" : " horas");
  }

  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const DIAS_C = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
    "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  // Fecha y hora actuales en Chile (aunque el visitante esté en otra zona).
  function ahora() {
    const d = new Date();
    try {
      const p = {};
      new Intl.DateTimeFormat("en-US", {
        timeZone: NEGOCIO.zonaHoraria, year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(d).forEach(x => { p[x.type] = x.value; });
      const y = +p.year, m = +p.month, dd = +p.day;
      return { y, m, d: dd, h: (+p.hour) % 24, min: +p.minute,
        dow: new Date(Date.UTC(y, m - 1, dd, 12)).getUTCDay() };
    } catch (e) {
      return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(),
        h: d.getHours(), min: d.getMinutes(), dow: d.getDay() };
    }
  }

  function abiertoAhora() {
    const t = ahora(), H = NEGOCIO.horario;
    return H.dias.indexOf(t.dow) !== -1 && t.h >= H.abre && t.h < H.cierra;
  }
  const estadoTexto = () => abiertoAhora()
    ? "Ahora estamos en horario de atención."
    : "Ahora estamos fuera de horario: te respondemos apenas abramos (" + NEGOCIO.horario.texto + ").";

  // Fecha a `dias` días de hoy (calendario de Chile).
  function fechaEn(dias) {
    const t = ahora();
    const dt = new Date(Date.UTC(t.y, t.m - 1, t.d, 12) + dias * 864e5);
    const dow = dt.getUTCDay();
    return { dow, largo: cap(DIAS[dow]) + " " + dt.getUTCDate() + " de " + MESES[dt.getUTCMonth()],
      corto: DIAS_C[dow] + " " + dt.getUTCDate() };
  }

  // Próximos días hábiles para ofrecer en la reserva.
  function proximosDias(n) {
    const t = ahora(), out = [];
    for (let i = 0; out.length < n && i < 14; i++) {
      const f = fechaEn(i);
      if (NEGOCIO.horario.dias.indexOf(f.dow) === -1) continue;
      if (i === 0 && t.h >= NEGOCIO.horario.cierra - 4) continue; // hoy solo si queda jornada
      out.push({
        corto: i === 0 ? "Hoy" : i === 1 ? "Mañana" : f.corto,
        largo: (i === 0 ? "Hoy, " : i === 1 ? "Mañana, " : "") + (i < 2 ? f.largo.toLowerCase() : f.largo)
      });
    }
    return out;
  }

  // Interpreta "hoy", "mañana", "el viernes"… Si no lo reconoce, guarda el texto tal cual.
  function interpretarDia(texto) {
    const n = norm(texto), raw = String(texto).trim().slice(0, 60);
    if (!n) return undefined;
    if (/^(lo antes posible|cuanto antes|lo mas pronto|apenas puedan|asap)/.test(n)) return "Lo antes posible";
    if (/^(hoy|hoy dia|hoy mismo)$/.test(n)) return "Hoy, " + fechaEn(0).largo.toLowerCase();
    if (/^pasado manana$/.test(n)) return fechaEn(2).largo;
    if (/^(manana|para manana)$/.test(n)) return "Mañana, " + fechaEn(1).largo.toLowerCase();
    const m = n.match(/^(el |este |para el )?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)$/);
    if (m) {
      const objetivo = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].indexOf(m[2]);
      for (let i = 1; i <= 7; i++) { const f = fechaEn(i); if (f.dow === objetivo) return f.largo; }
    }
    return cap(raw);
  }

  /* =================================================================
   * 3. CATÁLOGO (lee los precios publicados en la página)
   * ================================================================= */

  const VEH = {
    sedan:   { nombre: "Auto", sub: "sedán / hatchback" },
    suv:     { nombre: "SUV", sub: "camioneta / 4x4" },
    grande:  { nombre: "Van o vehículo grande", sub: "fuera de estándar" },
    moto:    { nombre: "Moto", sub: "pistera / de ciudad" },
    offroad: { nombre: "Off Road", sub: "cross, ATV o UTV" }
  };
  const vehTxt = v => VEH[v] ? VEH[v].nombre + " (" + VEH[v].sub + ")" : "";
  const esAuto = v => v === "sedan" || v === "suv" || v === "grande";

  function listaPagina(nombre) {
    let v = null;
    try {
      if (nombre === "interior" && typeof interior !== "undefined") v = interior;
      else if (nombre === "exterior" && typeof exterior !== "undefined") v = exterior;
      else if (nombre === "packs" && typeof packs !== "undefined") v = packs;
      else if (nombre === "MOTO" && typeof MOTO !== "undefined") v = MOTO;
      else if (nombre === "PPF" && typeof PPF !== "undefined") v = PPF;
    } catch (e) { v = null; }
    return Array.isArray(v) ? v : null;
  }

  function desdePagina(x, grupo, clave) {
    const it = {
      clave, grupo,
      nombre: x.name,
      desc: grupo === "pack" && x.iN ? x.iN + " + " + x.eN : (x.desc || ""),
      tiempo: fmtTiempo(x.time),
      horas: typeof x.dur === "number" ? x.dur : null,
      incluye: x.tech || x.items || [],
      ideal: x.ideal || x.emo || "",
      tag: x.tag || "",
      cotiza: !!x.cotiza || (!x.sedan && !x.suv)
    };
    if (it.cotiza) return it;
    if (grupo === "moto") { it.precio = x.sedan; it.veh = "moto"; }
    else {
      it.precios = { sedan: x.sedan, suv: x.suv };
      if (x.oS) it.antes = { sedan: x.oS, suv: x.oSuv };
    }
    return it;
  }

  let CACHE = null;
  function catalogo() {
    if (CACHE) return CACHE;
    const I = listaPagina("interior"), E = listaPagina("exterior"), P = listaPagina("packs");
    const M = listaPagina("MOTO"), F = listaPagina("PPF");
    const items = [];
    (P || []).forEach(x => items.push(desdePagina(x, "pack", "pack-" + x.id)));
    (I || []).forEach(x => items.push(desdePagina(x, "interior", "int-" + x.id)));
    (E || []).forEach(x => items.push(desdePagina(x, "exterior", "ext-" + x.id)));
    (M || []).forEach(x => items.push(desdePagina(x, "moto", "moto-" + slug(x.name))));
    items.push({ clave: "ceramico", grupo: "avanzado", nombre: "Sellado cerámico",
      desc: "Corrección de pintura y sellado de larga duración.", tiempo: "1 a 2 días", cotiza: true,
      incluye: TXT.ceramico_pasos,
      ideal: "Protección de hasta 3 años. Incluye sin costo el Interior Esencial (sujeto a evaluación)." });
    (F || []).forEach(x => items.push({ clave: "ppf-" + slug(String(x.name).replace(/^ppf/i, "")),
      grupo: "ppf", nombre: x.name, desc: x.desc || "", tiempo: x.time || "", cotiza: true,
      incluye: x.tech || [], ideal: x.ideal || "" }));
    OFFROAD.forEach(x => items.push({ clave: x.clave, grupo: "offroad", nombre: x.nombre, desc: x.desc,
      tiempo: x.tiempo, precio: x.precio, incluye: x.incluye, ideal: x.ideal, veh: "offroad" }));
    CACHE = { ok: !!(I && E && P), items, porClave: {} };
    items.forEach(it => { CACHE.porClave[it.clave] = it; });
    return CACHE;
  }
  const item = k => (k && catalogo().porClave[k]) || null;
  const deGrupo = g => catalogo().items.filter(it => it.grupo === g);

  // Precio según vehículo (SUV y vehículos grandes usan la tarifa SUV como referencia).
  function precioDe(it, v) {
    if (!it || it.cotiza) return null;
    if (it.precio != null) return it.precio;
    if (!it.precios || !v) return null;
    return v === "sedan" ? it.precios.sedan : it.precios.suv;
  }
  const antesDe = (it, v) => it && it.antes && v ? (v === "sedan" ? it.antes.sedan : it.antes.suv) : null;

  /* =================================================================
   * 4. COMPRENSIÓN DEL TEXTO
   *    Palabras clave sin tildes, separadas por "|", con peso ":n".
   *    "palabra*" = cualquier palabra que empiece así.
   * ================================================================= */

  const INTENCIONES = [
    ["cancelar", "cancel*:3|anular:3|anulo:3|reagend*:4|cambiar la hora:4|cambiar hora:4|cambiar mi hora:4|cambiar la fecha:4|cambiar el dia:4|mover la hora:4|postergar:3|posponer:3|me arrepenti:4|arrepiento:3|no voy a poder:3|no puedo ir:2"],
    ["agendar", "agend*:3|reserv*:3|cita:2|tomar hora:4|pedir hora:4|sacar hora:4|hora disponible:3|disponibilidad:3|disponible*:2|cuando pueden:3|cuando podrian:3|pueden venir:3|vengan:2|contratar:2|quiero el servicio:3|quiero un lavado:2|necesito un lavado:2|cupo*:2|para cuando tienen:4"],
    ["precio", "precio*:3|valor:2.5|valores:2.5|cuanto cuesta*:4|cuanto vale*:4|cuanto sale*:4|cuanto cobra*:4|cuanto es:3|cuanto seria:3|cuanto saldria:3|cuanto me sale:4|cuanto:1|cuesta*:2.5|cobra*:2.5|tarifa*:3|cotiz*:2.5|presupuesto:3|lista de precios:4|costo*:3|lucas:2|luca:2|barato:1.5|caro:1.5"],
    ["duracion", "demora*:3|tarda*:3|cuanto tiempo:4|cuantas horas:4|cuanto dura*:3|duracion:3|dura:2|duran:2|horas:1|toma:1|listo en:2"],
    ["incluye", "que incluye*:4|incluye*:2.5|que trae:3|que hacen en:3|en que consiste:4|consiste:2.5|que contempla:3|que se hace:3|que le hacen:3"],
    ["diferencia", "diferencia*:3.5|diferente*:2|versus:2|vs:2|comparar:2"],
    ["recomendar", "cual me conviene:4|cual conviene:3.5|me conviene:3|cual elijo:4|que me recomienda*:4|recomienda*:3|recomiend*:2.5|no se cual:4|no se que:2.5|ayudame a elegir:4|ayuda a elegir:4|cual es mejor:3|cual necesito:4|que necesito:2.5|que servicio:2.5|que me sirve:3"],
    ["servicios", "servicio*:2|que hacen:3|que ofrecen:3|ofrecen:2|que tienen:2|catalogo:3|que trabajos:3|que mas hacen:3"],
    ["agua_luz", "agua:2|luz:2.5|electricidad:3|electric*:2|enchufe*:3|energia:2|manguera*:3|llave de agua:4|llave del agua:4|recursos:2|corriente:2|autonom*:2.5|necesito tener:2.5|tengo que tener:2.5|debo tener:2.5|necesitan algo:3|ocupan algo:3|tengo que poner:3"],
    ["lavado_seco", "lavado en seco:5|en seco:4|seco:2.5|sin agua:4|ecolog*:3|ahorro de agua:4|cuanta agua:3|litros:3|escurr*:3|charco*:3|desague*:2.5|medio ambiente:3|sustentable:3"],
    ["donde", "donde lo hacen:4|donde hacen:3.5|donde trabajan:3.5|domicilio:3|a domicilio:4|van a mi casa:4|vienen a:3|vienen:2|a mi casa:3|mi casa:2|en mi casa:3|oficina:2.5|subterraneo:3|estacionamiento:2|en la calle:3|calle:1.5|faena:2.5|en mi trabajo:3|a la pega:3|movil*:1.5|donde:1"],
    ["espacio", "cuanto espacio:4|espacio:2.5|dos estacionamientos:4|estacionamientos:2|metros:2|angosto:2"],
    ["cobertura", "cobertura:4|zona*:2.5|sector*:2|comuna*:3|llegan a:4|llegan hasta:4|van hasta:4|atienden en:3|alrededores:3|radio:2|lejos:2|fuera de antofagasta:5|fuera de la ciudad:5|otra ciudad:4"],
    ["horario", "horario*:4|a que hora:3|que hora:2|abren:3|cierran:3|atienden:2.5|atencion:1.5|domingo*:3|sabado*:2|feriado*:3|que dias:3|hasta que hora:4|desde que hora:4|de noche:3|abierto*:3|trabajan los:3"],
    ["quedarse", "quedarme:4|quedarse:3|tengo que estar:4|debo estar:4|estar presente:4|tengo que esperar:3|esperar:1.5|dejar las llaves:4|dejo las llaves:4|dejar la llave:4|las llaves:3|llaves:2.5|mientras trabajo:3|no voy a estar:4|no estare:4|no estoy en casa:4"],
    ["pago", "pago:3|pagos:3|pagar:3|como pago:4|medios de pago:4|formas de pago:4|forma de pago:4|tarjeta*:3|debito:3|credito:3|efectivo:3|redcompra:3|pos:2|maquinita:3|apple pay:4|google pay:4|se paga:3|pago antes:4|pagar antes:4|abono:3|adelanto:3|anticipo:3"],
    ["cuotas", "cuota*:4|sin interes:4|en partes:2|financ*:3"],
    ["transferencia", "transferencia*:4|transferir:4|transfiero:4|datos bancarios:5|datos de transferencia:5|datos de la cuenta:5|cuenta:2.5|cuenta rut:4|numero de cuenta:5|banco*:2.5|depositar:3|deposito:3|comprobante:3"],
    ["factura", "factura*:4|facturan:4|boleta*:4|rut empresa:3|rut de empresa:4|giro:2|orden de compra:3|documento tributario:4"],
    ["empresas", "empresa*:3|flota*:4|convenio*:3|corporativ*:3|vehiculos de la empresa:4|varios vehiculos:4|varias camionetas:4|plan mensual:4|mensual*:2|mineria:3|minera*:3|contrato:2|licitacion:3|pyme:2"],
    ["condominio", "condominio*:4|edificio*:3|administracion:3|administrador*:3|conserje*:3|permiso*:3|autoriza*:3|comunidad:2|reglamento:3|solicitud:3"],
    ["anticipacion", "anticipacion:4|con cuanto tiempo:4|cuanto antes:3|con tiempo:2|dias antes:3|mismo dia:3|hoy mismo:4|para hoy:3|hoy:1.5|urgente:3|urgencia:3"],
    ["precios_finales", "precio final:5|precios finales:5|valor final:5|son finales:5|referencial*:4|recargo*:4|cobro adicional:4|cobros extra:4|adicional*:2.5|extra*:2|fuera de estandar:5|iva:3|sube el precio:4|cobran mas:4|sorpresa*:2"],
    ["descuento", "descuento*:4|promo*:3.5|oferta*:3|rebaja*:3|dcto:4|cupon*:3|cliente frecuente:4|mas barato:3|precio especial:4"],
    ["detailing", "que es detailing:5|que es el detailing:5|que es un detailing:5|detailing:1.5|diferencia con un lavado:5|lavado normal:3|lavado convencional:4|rodillo*:3|tunel*:3|lavado automatico:4|servicentro:3"],
    ["productos", "producto*:3|marca*:2.5|vonixx:4|quimico*:3|que usan:4|con que lavan:4|con que limpian:4|shampoo:2.5|biodegradable*:4|toxico*:3|ph neutro:4"],
    ["ruido", "ruido*:4|ruidoso:4|bulla:4|generador:3|decibel*:4|db:3|molest*:3|vecinos:3"],
    ["unidad", "equipamiento:4|equipo*:2|herramienta*:2.5|hidrolavadora:4|aspiradora:4|transporter:4|volkswagen:3|estanque:3|con que llegan:4|que llevan:3|su van:3"],
    ["resenas", "resena*:4|opinion*:3.5|comentarios:3|calificacion*:3|estrellas:3|google:2|confiable*:3|confianza:3|son buenos:3|trabajos anteriores:3|fotos de trabajos:4|antes y despues:4|resultados:2.5|portafolio:4"],
    ["redes", "instagram:4|insta:4|ig:3|tiktok:4|tik tok:4|redes:3|facebook:3"],
    ["ubicacion", "direccion:3|donde estan:4|donde quedan:4|donde se ubican:4|ubicad*:3|ubicacion:3|local:3|taller:2.5|sucursal:3|puedo ir:4|llevar el auto:4|llevo el auto:4|llevar mi auto:4|dejar el auto:3"],
    ["quienes", "quienes son:4|dueno*:3|fundador:4|historia:3|cuanto tiempo llevan:4|experiencia:3|desde cuando:3|mision:3|vision:3"],
    ["reclamo", "reclamo*:4|queja*:4|mala experiencia:4|mal servicio:4|no quede conforme:5|no quede contento:5|no quede satisfecho:5|garantia:4|danaron:4|rayaron:4|rompieron:4|quedo mal:4"],
    ["denuncia", "denuncia*:5|canal de denuncias:6|conducta indebida:6|acoso:5|etica:3"],
    ["tienda", "tienda:4|venden productos:5|venden:2.5|comprar productos:5|kit:3"],
    ["frecuencia", "cada cuanto:5|frecuencia:3|cuantas veces:4|seguido:2|como cuido:3|como mantengo:3|como lo mantengo:4|como mantener:3|cuidar:1.5"],
    ["fotos", "fotos:2.5|foto:2.5|mandar fotos:4|enviar fotos:4|mando fotos:4|imagen*:2"],
    ["contacto", "hablar con alguien:4|hablar con una persona:4|persona real:4|humano:3|ejecutivo:3|contactar*:2.5|contacto:2|llamar*:2.5|llamada:2|telefono:3|numero:1.5|celular:2.5|whatsapp:2.5|wsp:2.5|wasap:2.5|whats:2.5|correo:2.5|mail:2.5|email:2.5"],
    ["bot", "eres un bot:5|eres bot:5|eres robot:5|eres un robot:5|eres humano:5|eres una persona:5|eres real:5|con quien hablo:5|quien eres:5|eres una ia:5|inteligencia artificial:3|chatgpt:3"],
    ["menu", "menu:3|opciones:2|inicio:2|volver:2|empezar de nuevo:3|que puedes hacer:4|como funciona:2.5|ayuda:1.5"],
    ["saludo", "hola:1.6|holi:1.6|holaa*:1.6|buenas:1.6|buen dia:1.6|buenos dias:1.6|buenas tardes:1.6|buenas noches:1.6|alo:1.6|hey:1.2|saludos:1.6|que tal:1.2"],
    ["gracias", "gracias:2.2|muchas gracias:3|te pasaste:3|genial:1.5|excelente:1.5|buenisimo:1.5|bacan:1.5|filete:1.5"],
    ["despedida", "chao:2.2|chau:2.2|adios:2.2|hasta luego:3|nos vemos:2.5|bye:2"]
  ];

  // Vehículos (en orden de prioridad).
  const ENT_VEH = [
    ["offroad", "moto cross|motocross|cross|enduro|cuatri*|atv|utv|side by side|sxs|rzr|razer|can am|canam|maverick|polaris|arenero|buggy|tubular"],
    ["moto", "moto|motos|motito|motocicleta*|scooter|pistera|motoneta"],
    ["grande", "una van|mi van|minivan|furgon*|sprinter|hiace|h1|minibus|camion|camiones|7 asientos|8 asientos|9 asientos|tres corridas"],
    ["suv", "suv|suvs|camioneta*|4x4|jeep|pickup|pick up|todoterreno|crossover|station wagon"],
    ["sedan", "auto|autos|autito|sedan|hatchback|hatch|city car|citycar|coupe|carro|vehiculo chico|auto chico"]
  ];
  const ENT_OR = [
    ["or-utv4", "utv 4|utv de 4|4 plazas|cuatro plazas|4 asientos"],
    ["or-utv2", "utv 2|utv de 2|2 plazas|dos plazas"],
    ["or-utv", "utv|side by side|sxs|rzr|razer|can am|canam|maverick|polaris|arenero|buggy"],
    ["or-atv", "cuatri*|atv"],
    ["or-cross", "moto cross|motocross|cross|enduro"]
  ];
  // Servicios (en orden de prioridad: lo más específico primero).
  const ENT_SVC = [
    ["pack-restauracion", "pack restauracion|pack de restauracion|pack recomendado"],
    ["pack-esencial", "pack esencial|pack basico|pack popular|pack normal"],
    ["ext-proteccion", "mantencion ceramica|mantencion del ceramico|mantencion de ceramico|mantencion de mi ceramico|lavado ceramico|lavado de mantencion|tengo ceramico|tiene ceramico|con ceramico|ya tengo ceramico|tengo un ceramico|tengo sellado ceramico|tengo un sellado ceramico|tiene sellado ceramico|ya tiene ceramico|mantener el ceramico|mantener mi ceramico|cuidar el ceramico"],
    ["ppf", "ppf|piano black|piano|lamina protectora|pantalla|multimedia"],
    ["ceramico", "ceramic*|sellado*|sellar|pulid*|pulir|correccion|rayas|rayon*|rayado*|rayita*|swirl*|brillo|opaco|opaca|opacidad|hidrofob*|nano*"],
    ["int-restauracion", "restaurac*|restaurar|mancha*|olor*|hediondo|hongos|vomit*|derrame*|muy sucio|cochino|lavado de asientos|lavar asientos|lavado de tapiz|lavar tapiz|extraccion"],
    ["int-esencial", "interior esencial|esencial|aspirad*|aspirar"],
    ["ext-express", "express|expres|lavado rapido|lavado simple|lavado basico|lavadito"],
    ["ext-detallado", "detallado exterior|lavado detallado|lavado exterior|lavado por fuera|detallado"],
    ["packs", "pack*|combo*|completo|completa|interior y exterior|exterior e interior|dentro y fuera|dentro y por fuera|por dentro y por fuera|todo el auto|todo el vehiculo|auto completo|lavado completo|limpieza completa"],
    ["interior", "interior*|tapiz|tapices|tapiceria|tapic*|asiento*|butaca*|alfombra*|piso|maletero|mascota*|pelo*|perro*|gato*|limpieza interior"],
    ["exterior", "exterior*|carroceria|llanta*|neumatico*|por fuera|lavado|lavar"]
  ];
  // Trabajos a pedido (se cotizan caso a caso).
  const ENT_OTROS = [
    ["Polarizado de vidrios", "polariza*|lamina de sol|laminas de sol|papel ahumado"],
    ["Pulido de faros", "faro*|foco*|opticos|optico"],
    ["Sellado de llantas", "sellado de llantas|sellar llantas|sellado de llanta"],
    ["Lavado de motor", "motor|vano"],
    ["Limpieza y acondicionado de cuero", "cuero*"],
    ["Limpieza de cielo o techo", "cielo|techo"],
    ["Cinturones de seguridad", "cinturon*"],
    ["Rejillas y ductos de ventilación", "ducto*|rejilla*|ventilacion|aire acondicionado"],
    ["Restauración de plásticos exteriores", "plasticos exteriores|plasticos blanquecinos|plasticos opacos|restaurar plasticos|plasticos negros"],
    ["Corrección de barniz", "correccion de barniz|barniz"],
    ["Descontaminación profunda", "descontamina*"]
  ];
  const LUGARES = ["Mejillones", "Calama", "La Negra", "Coloso", "Juan López", "Taltal", "Tocopilla",
    "Baquedano", "Sierra Gorda", "María Elena", "La Portada", "Hornitos", "Michilla", "Cerro Moreno"];

  function compilar(spec) {
    return spec.split("|").map(s => {
      const m = s.match(/^(.*?)(?::([\d.]+))?$/);
      let k = m[1].trim();
      const w = m[2] ? parseFloat(m[2]) : 2, stem = k.slice(-1) === "*";
      if (stem) k = k.slice(0, -1);
      return { k, w, stem, fuzzy: k.indexOf(" ") === -1 && k.length >= 5,
        re: new RegExp("(?:^| )" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + (stem ? "[a-z0-9]*" : "") + "(?= |$)") };
    });
  }

  // Distancia de edición (con transposición) acotada a `max`.
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let pp = null, p = [];
    for (let j = 0; j <= b.length; j++) p[j] = j;
    for (let i = 1; i <= a.length; i++) {
      const c = [i]; let fila = i;
      for (let j = 1; j <= b.length; j++) {
        let v = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (pp && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, pp[j - 2] + 1);
        c[j] = v; if (v < fila) fila = v;
      }
      if (fila > max) return max + 1;
      pp = p; p = c;
    }
    return p[b.length];
  }

  // Palabras que el asistente ya conoce (o muy comunes): nunca se "corrigen" hacia otra
  // palabra. Así "motos" no se confunde con "fotos" ni "como" con "combo".
  const CONOCIDAS = new Set(("como cuando donde cuanto cuanta cuantos cuantas porque para pero tengo tiene tienen " +
    "quiero puedo pueden hacen hace hacer esta estan este esto eso esos sobre desde hasta entre todo toda todos bien " +
    "mucho mucha poco algo nada usted ustedes favor mismo misma otro otra solo sola ahora antes despues siempre tambien " +
    "aqui cual cuales quien quienes necesito necesita sirve saber seria sale salen trae llevan lleva queda quedan dejan " +
    "persona personas gente hola buenas tarde tardes manana mananas noche noches dia dias hora horas semana semanas " +
    "mes meses lunes martes miercoles jueves viernes sabado domingo proximo proxima mejor gustaria").split(" "));
  const RAICES = [];
  [INTENCIONES, ENT_VEH, ENT_OR, ENT_SVC, ENT_OTROS].forEach(lista => lista.forEach(([, s]) => s.split("|").forEach(k => {
    k.replace(/:[\d.]+$/, "").split(" ").forEach(w => {
      if (w.slice(-1) === "*") { if (w.length >= 5) RAICES.push(w.slice(0, -1)); }
      else if (w) CONOCIDAS.add(w);
    });
  })));
  const memo = new Map();
  function conocida(t) {
    if (!memo.has(t)) memo.set(t, CONOCIDAS.has(t) || RAICES.some(r => t.indexOf(r) === 0));
    return memo.get(t);
  }

  // Tolera errores de tipeo en palabras largas ("presio", "ceramco", "orario").
  function parecido(t, kw) {
    if (!kw.fuzzy || t.length < 5 || conocida(t)) return false;
    if (!kw.stem) return dist(t, kw.k, kw.k.length >= 9 ? 2 : 1) <= (kw.k.length >= 9 ? 2 : 1);
    if (t.length < kw.k.length - 1) return false;
    for (let L = kw.k.length - 1; L <= kw.k.length + 1; L++) if (dist(t.slice(0, L), kw.k, 1) <= 1) return true;
    return false;
  }

  const INT_C = INTENCIONES.map(([id, s]) => [id, compilar(s)]);
  const VEH_C = ENT_VEH.map(([id, s]) => [id, compilar(s)]);
  const OR_C = ENT_OR.map(([id, s]) => [id, compilar(s)]);
  const SVC_C = ENT_SVC.map(([id, s]) => [id, compilar(s)]);
  const OTROS_C = ENT_OTROS.map(([id, s]) => [id, compilar(s)]);
  const LUG_C = LUGARES.map(l => [l, compilar(norm(l))]);

  function entidad(lista, n, tokens) {
    for (const [id, kws] of lista) if (kws.some(kw => kw.re.test(n))) return id;
    for (const [id, kws] of lista) if (kws.some(kw => tokens.some(t => parecido(t, kw)))) return id;
    return null;
  }

  function analizar(texto) {
    const n = (" " + norm(texto) + " ").replace(/ fh detailing /g, " ").replace(/ fh /g, " ").trim();
    const tokens = n ? n.split(" ") : [];
    const puntajes = {};
    let intent = null, score = 0;
    INT_C.forEach(([id, kws]) => {
      let p = 0;
      kws.forEach(kw => {
        if (kw.re.test(n)) p += kw.w;
        else if (kw.fuzzy && tokens.some(t => parecido(t, kw))) p += kw.w * 0.7;
      });
      puntajes[id] = p;
      if (p > score) { score = p; intent = id; }
    });
    const lugar = LUG_C.find(([, kws]) => kws.some(kw => kw.re.test(n)));
    if (lugar && score < 4) { intent = "cobertura"; score = Math.max(score, 4); }
    const veh = entidad(VEH_C, n, tokens);
    return {
      texto: String(texto || ""), n, tokens, puntajes,
      intent: score >= 1.5 ? intent : null, score,
      veh,
      or: veh === "offroad" ? entidad(OR_C, n, tokens) : null,
      svc: entidad(SVC_C, n, tokens),
      otro: entidad(OTROS_C, n, tokens),
      lugar: lugar ? lugar[0] : null
    };
  }

  /* =================================================================
   * 5. RESPUESTAS
   *    Cada respuesta es { b: [bloques], chips: [opciones], si: acción }.
   *    Bloques: "texto html" | {ul:[]} | {ol:[]} | {tabla:[[k,v]]} |
   *    {copiar:[[k,v]]} | {cards:[items], v} | {btn:[...]} | {nota:""}
   * ================================================================= */

  const S = { veh: null, flow: null, si: null, fallos: 0, saludado: false, abierto: false, usado: false };

  const bWa = (t, msg, lead) => ({ t, href: waURL(msg), tipo: "wa", lead: lead || "consulta" });
  const bExt = (t, href) => ({ t, href, tipo: "ext" });
  const waBtn = (t, msg, lead) => ({ btn: [bWa(t, msg, lead)] });
  const faq = (t, id) => ({ t, a: "faq", p: { id } });
  const CH = {
    menu: { t: "Menú principal", a: "menu", sec: true },
    precios: { t: "Ver precios", a: "precios" },
    agendar: { t: "Agendar una hora", a: "agendar" },
    faqs: { t: "Más preguntas", a: "faqs" },
    ceramico: { t: "Sellado cerámico", a: "ceramico" },
    ayuda: { t: "Ayúdame a elegir", a: "ayuda" },
    offroad: { t: "Off Road", a: "offroad" },
    empresas: { t: "Empresas y flotas", a: "empresas" },
    fotos: { t: "Enviar fotos", a: "faq", p: { id: "fotos" } }
  };
  const CAT = { packs: "todo", interior: "interior", exterior: "exterior" };
  const NEC = { todo: "Todo (interior + exterior)", interior: "Solo interior", exterior: "Solo exterior", avanzado: "Corrección y sellado" };

  function menuPrincipal(txt) {
    return { b: [txt || "¿En qué te ayudo?"], chips: [
      CH.precios, CH.agendar, CH.ceramico, CH.offroad, CH.empresas,
      { t: "Preguntas frecuentes", a: "faqs" }, { t: "Hablar con una persona", a: "contacto" }
    ] };
  }

  function listaFaqs() {
    return { b: ["Estas son las preguntas más comunes:"], chips: [
      faq("¿Necesito agua o luz?", "agua_luz"), faq("¿Dónde hacen el servicio?", "donde"),
      faq("¿Cuánto se demora?", "duracion"), faq("¿Tengo que quedarme?", "quedarse"),
      faq("¿Los precios son finales?", "precios_finales"), faq("¿Cómo se paga?", "pago"),
      faq("¿Emiten factura?", "factura"), faq("Mi edificio pide autorización", "condominio"),
      faq("Horario y cobertura", "horario_cobertura"), faq("Cambiar o cancelar una hora", "cancelar"),
      CH.menu
    ] };
  }

  function sinPrecios() {
    return { b: ["Los precios actualizados están en la sección <a href=\"#servicios\">Servicios y precios</a> de la página. También te los enviamos por WhatsApp.",
      waBtn("Pedir precios por WhatsApp", MSG.consulta)], chips: [CH.menu] };
  }

  function pedirVehiculo(txt) {
    return { b: [txt || "¿Qué vehículo tienes?"], chips: [
      { t: "Auto", a: "veh", p: { v: "sedan" } }, { t: "SUV / camioneta", a: "veh", p: { v: "suv" } },
      { t: "Moto", a: "veh", p: { v: "moto" } }, { t: "Off Road (cross, ATV, UTV)", a: "veh", p: { v: "offroad" } },
      { t: "Van o vehículo grande", a: "veh", p: { v: "grande" } }
    ] };
  }

  function pedirNecesidad(v) {
    return { b: ["Perfecto: <b>" + esc(VEH[v].nombre) + "</b>. ¿Qué necesitas?"], chips: [
      { t: NEC.todo, a: "nec", p: { n: "todo" } }, { t: NEC.interior, a: "nec", p: { n: "interior" } },
      { t: NEC.exterior, a: "nec", p: { n: "exterior" } }, { t: NEC.avanzado, a: "nec", p: { n: "avanzado" } },
      { t: "No sé, ayúdame a elegir", a: "ayuda" }, { t: "Cambiar vehículo", a: "precios", p: { cambiar: true }, sec: true }
    ] };
  }

  function elegirVeh(v) {
    S.veh = v;
    if (v === "moto") return respMoto();
    if (v === "offroad") return respOffroad({});
    return pedirNecesidad(v);
  }

  function mostrarCategoria(nec, v) {
    if (!catalogo().ok && nec !== "avanzado") return sinPrecios();
    if (!esAuto(v)) v = null;
    let items, intro;
    if (nec === "avanzado") {
      items = deGrupo("avanzado").concat(deGrupo("ppf"));
      intro = "Detailing avanzado: corrige y protege. Se cotiza con fotos, porque el valor depende del tamaño y del estado del vehículo.";
    } else {
      items = deGrupo({ todo: "pack", interior: "interior", exterior: "exterior" }[nec]);
      intro = nec === "todo" ? "Interior + exterior en una sola visita. En pack te sale más conveniente:"
        : nec === "interior" ? "Servicios de interior:" : "Servicios de exterior:";
    }
    if (v) intro += " <span class=\"fhc-mut\">(" + esc(VEH[v].nombre) + ")</span>";
    const b = [intro, { cards: items, v }, { nota: v === "grande" ? TXT.grande_nota : TXT.iva }];
    const chips = Object.keys(NEC).filter(x => x !== nec).map(x => ({ t: NEC[x], a: "nec", p: { n: x } }));
    if (nec === "avanzado") chips.unshift({ t: "Otros trabajos a pedido", a: "otros" });
    chips.push(v ? { t: "Cambiar vehículo", a: "precios", p: { cambiar: true }, sec: true } : CH.menu);
    return { b, chips };
  }

  function respMoto(k) {
    S.veh = "moto";
    const items = deGrupo("moto");
    if (!items.length) return sinPrecios();
    if (k && item(k)) return detalleServicio(k, "moto");
    return { b: ["Servicios para moto de calle o pistera:", { cards: items, v: "moto" }, { nota: TXT.moto_nota }],
      chips: [{ t: "Mi moto es cross o enduro", a: "offroad" }, { t: "Cambiar vehículo", a: "precios", p: { cambiar: true }, sec: true }] };
  }

  function respOffroad(n) {
    S.veh = "offroad";
    let items = deGrupo("offroad");
    const sub = n && n.or;
    if (sub === "or-utv") items = items.filter(i => /utv/.test(i.clave));
    else if (sub && item(sub)) items = [item(sub)];
    const uno = items.length === 1;
    const b = [uno ? "<b>" + esc(items[0].nombre) + "</b>: " + fmt(items[0].precio) + ", IVA incluido. ¿Te lo agendo?" : TXT.offroad,
      { cards: items, v: "offroad", abierto: uno }];
    if (uno) b.push({ nota: "El valor final depende del estado de la máquina: mándanos una foto y te lo confirmamos antes de agendar." });
    const chips = [CH.fotos];
    if (items.length < OFFROAD.length) chips.unshift({ t: "Ver todo Off Road", a: "offroad" });
    chips.push({ t: "Cambiar vehículo", a: "precios", p: { cambiar: true }, sec: true });
    return { b, chips, si: uno ? { a: "agendar", p: { k: items[0].clave } } : null };
  }

  function respPPF() {
    const items = deGrupo("ppf");
    if (!items.length) return respOtro("PPF en paneles piano black");
    return { b: ["PPF es una lámina transparente autorreparable, cortada a medida. Se cotiza según la superficie:", { cards: items, v: S.veh }],
      chips: [{ t: "Otros trabajos a pedido", a: "otros" }, CH.ceramico, CH.menu] };
  }

  function respOtro(nombre) {
    return { b: ["<b>" + esc(nombre) + "</b> está entre los trabajos que hacemos a pedido. Se cotiza caso a caso, después de ver el vehículo: mándanos fotos y te decimos qué necesita realmente. ¿Te preparo la cotización?"],
      chips: [{ t: "Cotizar por WhatsApp", a: "cotizar", p: { otro: nombre } }, { t: "Ver otros trabajos", a: "otros" }, CH.menu],
      si: { a: "cotizar", p: { otro: nombre } } };
  }

  function respOtros() {
    return { b: [TXT.otros, { ul: Object.keys(OTROS).map(g => "<b>" + esc(g) + ":</b> " + OTROS[g].map(esc).join(", ")) },
      TXT.otros_fin, waBtn("Enviar fotos por WhatsApp", MSG.fotos, "fotos")], chips: [CH.ceramico, CH.precios, CH.menu] };
  }

  function respCeramico() {
    const cot = { a: "cotizar", p: { k: "ceramico" } };
    return { b: [TXT.ceramico, { ol: TXT.ceramico_pasos }, TXT.ceramico_fin],
      chips: [{ t: "Cotizar mi cerámico", a: "cotizar", p: cot.p }, { t: "¿Cómo se mantiene?", a: "mantCeramica" }, faq("Pago en cuotas", "cuotas")],
      si: cot };
  }

  function respMantCeramica() {
    const it = item("ext-proteccion");
    const b = [TXT.ceramico_despues];
    if (it) b.push({ cards: [it], v: esAuto(S.veh) ? S.veh : null });
    return { b, chips: [{ t: "Cotizar un cerámico", a: "cotizar", p: { k: "ceramico" } }, CH.precios, CH.menu],
      si: it ? { a: "agendar", p: { k: it.clave, v: esAuto(S.veh) ? S.veh : null } } : null };
  }

  function respServicios() {
    const nombres = g => deGrupo(g).map(i => esc(i.nombre)).join(", ");
    const ul = catalogo().ok
      ? ["<b>Interior:</b> " + nombres("interior"), "<b>Exterior:</b> " + nombres("exterior"), "<b>Packs interior + exterior:</b> " + nombres("pack")]
      : ["<b>Interior, exterior y packs</b> para autos y SUV"];
    ul.push("<b>Detailing avanzado:</b> sellado cerámico, PPF y trabajos a pedido",
      "<b>Motos</b> de calle y <b>Off Road</b>: cross, ATV y UTV", "<b>Empresas:</b> flotas con plan mensual");
    return { b: ["Esto es lo que hacemos, siempre a domicilio:", { ul }],
      chips: [CH.precios, CH.ceramico, CH.offroad, CH.empresas, { t: "Trabajos a pedido", a: "otros" }] };
  }

  function respDescuento() {
    const ps = deGrupo("pack");
    const b = ["Si quieres interior y exterior, te conviene un <b>pack</b>: sale más barato que tomar los servicios por separado."];
    if (ps.length) b.push({ cards: ps, v: esAuto(S.veh) ? S.veh : null });
    b.push({ nota: "Para flotas de empresa armamos un plan mensual con valor cerrado." });
    return { b, chips: [CH.empresas, CH.precios, CH.menu] };
  }

  // Ficha de un servicio puntual.
  function detalleServicio(k, v) {
    const it = item(k);
    if (!it) return null;
    if (it.clave === "ceramico") return respCeramico();
    const vv = it.veh || (esAuto(v) ? v : null);
    if (vv) S.veh = vv;
    const p = precioDe(it, vv);
    let intro;
    if (it.cotiza) intro = "<b>" + esc(it.nombre) + "</b> se cotiza con fotos: el valor depende del tamaño y del estado del vehículo. ¿Te preparo la cotización?";
    else if (p != null && vv !== "grande") intro = "<b>" + esc(it.nombre) + "</b>" + (it.precios ? " para " + esc(vehTxt(vv).toLowerCase().replace(/^suv/, "SUV")) : "") + ": <b>" + fmt(p) + "</b>, IVA incluido. ¿Te lo agendo?";
    else intro = "Este es el detalle de <b>" + esc(it.nombre) + "</b>:";
    const b = [intro, { cards: [it], v: vv, abierto: true }];
    if (vv === "grande") b.push({ nota: TXT.grande_nota });
    const chips = [];
    if (!vv && it.precios) chips.push({ t: "Es un auto", a: "detalle", p: { k: it.clave, v: "sedan" } },
      { t: "Es SUV / camioneta", a: "detalle", p: { k: it.clave, v: "suv" } });
    chips.push({ t: "Ver más servicios", a: "precios" }, CH.menu);
    return { b, chips, si: it.cotiza ? { a: "cotizar", p: { k: it.clave } } : { a: "agendar", p: { k: it.clave, v: vv } } };
  }

  // Convierte lo detectado en un servicio concreto del catálogo.
  function resolverSvc(n, v) {
    const s = n.svc;
    if (v === "offroad" || (!v && n.or)) return n.or && n.or !== "or-utv" && item(n.or) ? n.or : null;
    if (v === "moto") {
      const busca = re => { const it = deGrupo("moto").find(i => re.test(norm(i.nombre))); return it ? it.clave : null; };
      if (s === "ceramico") return busca(/sellad/);
      if (s === "ext-express") return busca(/express/);
      if (s === "ext-detallado" || s === "exterior" || s === "packs") return busca(/detallad/);
      return null;
    }
    const directos = ["pack-esencial", "pack-restauracion", "ext-proteccion", "int-restauracion", "int-esencial", "ext-express", "ext-detallado", "ceramico"];
    return directos.indexOf(s) !== -1 && item(s) ? s : null;
  }

  // Vehículo a usar: el que se nombró ahora o el recordado, salvo que el servicio
  // pedido no exista para el vehículo recordado (p. ej. "cerámico" después de "cuatrimoto").
  function vehPara(n) {
    if (n.veh) return n.veh;
    const v = S.veh;
    if (!v || !n.svc) return v;
    if (v === "offroad" || (v === "moto" && !resolverSvc(n, "moto"))) return null;
    return v;
  }

  function respPrecio(n) {
    if (n.veh) S.veh = n.veh;
    const v = vehPara(n);
    const quiereCotizar = /cotiz|presupuesto/.test(n.n || "");
    if (n.otro) return quiereCotizar ? iniciarFlujo("cotiza", { otro: n.otro }) : respOtro(n.otro);
    if (!catalogo().ok && n.svc && n.svc !== "ceramico" && n.svc !== "ppf" && esAuto(v || "sedan")) return sinPrecios();
    if (v === "offroad" || n.or) return respOffroad(n);
    if (n.svc === "ppf") return respPPF();
    if (v === "moto") return respMoto(resolverSvc(n, "moto"));
    const k = resolverSvc(n, v);
    if (k) {
      if (quiereCotizar && item(k).cotiza) return iniciarFlujo("cotiza", { servicio: k });
      return detalleServicio(k, v) || sinPrecios();
    }
    if (n.svc && CAT[n.svc]) return mostrarCategoria(CAT[n.svc], v);
    if (v) return pedirNecesidad(v);
    return pedirVehiculo("Te muestro los precios. ¿Qué vehículo tienes?");
  }

  function respDuracion(n) {
    const v = vehPara(n);
    if (n.svc === "ceramico" && v !== "moto") return { b: ["El sellado cerámico toma <b>1 a 2 días</b> de trabajo, y la protección dura <b>hasta 3 años</b> con la mantención adecuada."],
      chips: [{ t: "Cotizar mi cerámico", a: "cotizar", p: { k: "ceramico" } }, { t: "¿Cómo se mantiene?", a: "mantCeramica" }, CH.menu] };
    if (n.otro) return { b: ["El tiempo de <b>" + esc(n.otro) + "</b> depende del vehículo: te lo confirmamos al cotizar con fotos."],
      chips: [{ t: "Cotizar por WhatsApp", a: "cotizar", p: { otro: n.otro } }, CH.menu] };
    let k = resolverSvc(n, v);
    if (!k && n.or && n.or !== "or-utv") k = n.or;
    const it = item(k);
    if (it && it.tiempo) return { b: ["<b>" + esc(it.nombre) + "</b> toma aprox. <b>" + esc(it.tiempo) + "</b>. Al reservar te confirmamos el rango exacto según el estado del vehículo."],
      chips: [it.cotiza ? { t: "Cotizar", a: "cotizar", p: { k } } : { t: "Agendar este servicio", a: "agendar", p: { k, v: it.veh || (esAuto(v) ? v : null) } }, CH.precios, CH.menu] };
    const ul = catalogo().items.filter(i => ["pack", "interior", "exterior"].indexOf(i.grupo) !== -1 && i.tiempo)
      .map(i => "<b>" + esc(i.nombre) + ":</b> " + esc(i.tiempo));
    ul.push("<b>Off Road:</b> 2 a 4 horas", "<b>Sellado cerámico:</b> 1 a 2 días");
    return { b: ["Depende del servicio:", { ul }, "Al reservar te confirmamos el rango exacto según el estado del vehículo."], chips: [CH.precios, CH.agendar, CH.menu] };
  }

  function respIncluye(n) {
    const v = vehPara(n);
    if (n.otro) return respOtro(n.otro);
    if (n.svc === "ppf") return respPPF();
    if (v === "offroad" || n.or) return respOffroad(n);
    const k = resolverSvc(n, v);
    if (k) return detalleServicio(k, v);
    if (n.svc && CAT[n.svc]) return mostrarCategoria(CAT[n.svc], v);
    return { b: ["¿De qué servicio quieres ver el detalle?"], chips: [
      { t: "Packs", a: "nec", p: { n: "todo" } }, { t: "Interior", a: "nec", p: { n: "interior" } },
      { t: "Exterior", a: "nec", p: { n: "exterior" } }, CH.ceramico, CH.offroad] };
  }

  function respDiferencia(n) {
    const ext = ["ext-express", "ext-detallado", "ext-proteccion", "exterior"].indexOf(n.svc) !== -1;
    return { b: [ext ? TXT.dif_exterior : TXT.dif_interior, "Si no sabes cuál te conviene, te ayudo a elegir o lo vemos con fotos por WhatsApp."],
      chips: [CH.ayuda, CH.precios, CH.fotos], si: { a: "ayuda" } };
  }

  const RESP = {
    saludo: () => menuPrincipal(S.saludado ? "¡Hola de nuevo! ¿En qué te ayudo?" : TXT.saludo),
    menu: () => menuPrincipal(),
    gracias: () => ({ b: [TXT.gracias], chips: [CH.agendar, CH.precios, CH.menu] }),
    despedida: () => ({ b: [TXT.despedida], chips: [CH.menu] }),
    bot: () => ({ b: [TXT.bot, waBtn("Escribir por WhatsApp", MSG.consulta, "contacto")], chips: [CH.menu] }),
    contacto: () => ({ b: ["Puedes hablar directamente con el equipo:",
      { tabla: [["WhatsApp", NEGOCIO.telefono], ["Correo", NEGOCIO.email], ["Horario", cap(NEGOCIO.horario.texto)]] },
      waBtn("Escribir por WhatsApp", MSG.consulta, "contacto"), { nota: estadoTexto() }], chips: [CH.menu] }),
    agua_luz: () => ({ b: [TXT.agua_luz], chips: [faq("¿Dónde hacen el servicio?", "donde"), CH.precios, CH.agendar] }),
    donde: () => ({ b: [TXT.donde], chips: [faq("Mi edificio pide autorización", "condominio"), faq("¿Hasta dónde llegan?", "cobertura"), CH.agendar] }),
    espacio: () => ({ b: [TXT.espacio], chips: [faq("Mi edificio pide autorización", "condominio"), CH.agendar] }),
    cobertura: n => ({ b: [n && n.lugar
        ? "Nuestra cobertura habitual es <b>" + esc(NEGOCIO.cobertura) + "</b>. Para <b>" + esc(n.lugar) + "</b>, escríbenos por WhatsApp y lo evaluamos."
        : TXT.cobertura,
      waBtn("Consultar por mi sector", "Hola FH Detailing, quiero saber si llegan a " + (n && n.lugar ? n.lugar : "mi sector") + ".", "cobertura")],
      chips: [faq("Horario de atención", "horario"), CH.agendar] }),
    horario: n => {
      const b = ["Atendemos de <b>" + esc(NEGOCIO.horario.texto) + "</b>. Por WhatsApp respondemos dentro de ese horario."];
      if (n && /domingo/.test(n.n || "")) b.push("Los domingos no tenemos atención regular; si lo necesitas, consúltanos por WhatsApp.");
      if (n && /feriado/.test(n.n || "")) b.push("Para feriados, consúltanos por WhatsApp.");
      b.push({ nota: estadoTexto() });
      return { b, chips: [CH.agendar, faq("¿Hasta dónde llegan?", "cobertura"), CH.menu] };
    },
    horario_cobertura: () => ({ b: ["Atendemos de <b>" + esc(NEGOCIO.horario.texto) + "</b>, en <b>" + esc(NEGOCIO.cobertura) + "</b>. Por WhatsApp respondemos dentro de ese horario.",
      "¿Estás fuera del radio habitual? Escríbenos igual y lo evaluamos.", { nota: estadoTexto() }], chips: [CH.agendar, CH.menu] }),
    quedarse: () => ({ b: [TXT.quedarse], chips: [CH.agendar, faq("¿Necesito agua o luz?", "agua_luz")] }),
    precios_finales: () => ({ b: [TXT.precios_finales], chips: [CH.precios, faq("¿Cómo se paga?", "pago")] }),
    descuento: () => respDescuento(),
    pago: () => ({ b: [TXT.pago], chips: [faq("Datos de transferencia", "transferencia"), faq("¿Puedo pagar en cuotas?", "cuotas"), faq("¿Emiten factura?", "factura")] }),
    cuotas: () => ({ b: [TXT.cuotas], chips: [CH.ceramico, faq("Otras formas de pago", "pago"), CH.menu] }),
    transferencia: () => ({ b: [TXT.transferencia, { copiar: NEGOCIO.banco }, TXT.transferencia_fin,
      waBtn("Enviar comprobante por WhatsApp", MSG.pagar, "pago")], chips: [faq("¿Emiten factura?", "factura"), CH.menu] }),
    factura: () => ({ b: [TXT.factura], chips: [CH.empresas, faq("¿Cómo se paga?", "pago")] }),
    empresas: () => ({ b: [TXT.empresas, { ul: TXT.empresas_lista }],
      chips: [{ t: "Armar un plan para mi flota", a: "flota" }, faq("¿Emiten factura?", "factura"), faq("¿Qué es el lavado en seco?", "lavado_seco")],
      si: { a: "flota" } }),
    condominio: () => ({ b: [TXT.condominio, { ul: TXT.condominio_lista }, TXT.condominio_fin,
      { btn: [{ t: "Descargar solicitud (PDF)", href: NEGOCIO.solicitudCondominio, tipo: "pdf" }, bWa("Necesito ayuda con esto", MSG.condominio, "condominio")] }],
      chips: [CH.agendar, CH.menu] }),
    anticipacion: n => {
      const hoy = n && /(hoy|urgen|mismo dia)/.test(n.n || "");
      const b = [TXT.anticipacion];
      if (hoy) b.push(TXT.anticipacion_hoy, waBtn("Consultar por hoy", MSG.hoy, "hoy"));
      return { b, chips: [CH.agendar, faq("Cambiar o cancelar una hora", "cancelar")] };
    },
    cancelar: () => ({ b: [TXT.cancelar, waBtn("Avisar por WhatsApp", MSG.cancelar, "cancelar")], chips: [CH.menu] }),
    detailing: () => ({ b: [TXT.detailing], chips: [CH.precios, CH.ayuda] }),
    productos: () => ({ b: [TXT.productos], chips: [CH.precios, CH.menu] }),
    ruido: () => ({ b: [TXT.ruido], chips: [faq("Mi edificio pide autorización", "condominio"), CH.menu] }),
    lavado_seco: () => ({ b: [TXT.lavado_seco], chips: [CH.empresas, faq("Mi edificio pide autorización", "condominio")] }),
    unidad: () => ({ b: [TXT.unidad], chips: [faq("¿Necesito agua o luz?", "agua_luz"), CH.precios] }),
    resenas: () => ({ b: [TXT.resenas, { btn: [bExt("Ver reseñas en Google", NEGOCIO.google), bExt("Instagram", NEGOCIO.instagram)] }], chips: [CH.precios, CH.menu] }),
    redes: () => ({ b: [TXT.redes, { btn: [bExt("Instagram", NEGOCIO.instagram), bExt("TikTok", NEGOCIO.tiktok)] }], chips: [CH.menu] }),
    ubicacion: () => ({ b: [TXT.ubicacion], chips: [faq("¿Hasta dónde llegan?", "cobertura"), CH.agendar] }),
    quienes: () => ({ b: [TXT.quienes], chips: [CH.precios, faq("Ver reseñas", "resenas")] }),
    reclamo: () => ({ b: [TXT.reclamo, waBtn("Escribir por WhatsApp", MSG.reclamo, "reclamo")], chips: [CH.menu] }),
    denuncia: () => ({ b: [TXT.denuncia, { btn: [{ t: "Escribir al canal de denuncias", tipo: "mail",
      href: "mailto:" + NEGOCIO.email + "?subject=" + encodeURIComponent("Canal de denuncias - FH Detailing") }] }], chips: [CH.menu] }),
    tienda: () => ({ b: [TXT.tienda], chips: [CH.precios, CH.menu] }),
    frecuencia: n => n && (n.svc === "ceramico" || n.svc === "ext-proteccion") ? respMantCeramica()
      : { b: [TXT.frecuencia], chips: [CH.precios, { t: "Mantención cerámica", a: "mantCeramica" }] },
    fotos: () => ({ b: [TXT.fotos, waBtn("Enviar fotos por WhatsApp", MSG.fotos, "fotos")], chips: [CH.menu] }),
    servicios: () => respServicios(),
    precio: n => respPrecio(n),
    duracion: n => respDuracion(n || {}),
    incluye: n => respIncluye(n),
    diferencia: n => respDiferencia(n || {}),
    recomendar: () => iniciarAyuda(),
    agendar: n => agendarDesdeTexto(n)
  };

  /* =================================================================
   * 6. CONVERSACIONES GUIADAS (reserva, cotización, flota, ayuda)
   * ================================================================= */

  const FLUJOS = {
    agenda: ["vehiculo", "servicio", "modelo", "lugar", "sector", "dia", "franja", "nombre"],
    cotiza: ["vehiculo", "modelo", "comentario", "nombre"],
    empresa: ["cantidad", "frecuencia", "empresa", "nombre"],
    ayuda: ["vehiculo", "estadoInt", "estadoExt"]
  };
  const CAMPO = { vehiculo: "veh", servicio: "servicio", modelo: "modelo", lugar: "lugar", sector: "sector", dia: "dia",
    franja: "franja", nombre: "nombre", comentario: "comentario", cantidad: "cantidad", frecuencia: "frecuencia",
    empresa: "empresa", estadoInt: "int", estadoExt: "ext" };
  const ETIQ = { vehiculo: "Vehículo", servicio: "Servicio", modelo: "Modelo", lugar: "Lugar", sector: "Sector", dia: "Fecha",
    franja: "Horario", nombre: "Nombre", comentario: "Detalle", cantidad: "Cantidad", frecuencia: "Frecuencia", empresa: "Empresa" };
  const OPC = " <span class=\"fhc-mut\">(opcional)</span>";
  const opciones = lista => lista.map(x => typeof x === "string" ? { t: x, a: "paso", p: { v: x } } : x);
  const definido = v => v !== undefined;

  function setServicio(d, k) {
    d.servicio = k;
    const it = k !== "nose" ? item(k) : null;
    if (it && it.veh) d.veh = it.veh;
    else if (it && d.veh && !esAuto(d.veh)) delete d.veh;
  }

  function chipsVeh(d, tipo) {
    const it = d.servicio && d.servicio !== "nose" ? item(d.servicio) : null;
    const ops = [["sedan", "Auto"], ["suv", "SUV / camioneta"], ["grande", "Van o vehículo grande"]];
    if (tipo === "agenda" && !it) ops.push(["moto", "Moto"], ["offroad", "Off Road (cross, ATV, UTV)"]);
    if (tipo === "cotiza" && !it) ops.push(["moto", "Moto"]);
    return ops.map(([v, t]) => ({ t, a: "paso", p: { v } }));
  }

  function chipsServicios(d) {
    const v = d.veh;
    const items = v === "moto" ? deGrupo("moto") : v === "offroad" ? deGrupo("offroad")
      : deGrupo("pack").concat(deGrupo("interior"), deGrupo("exterior"));
    const ch = items.map(it => {
      const p = precioDe(it, v);
      return { t: it.nombre + (it.cotiza ? " · a cotizar" : p != null && v !== "grande" ? " · " + fmt(p) : ""), a: "paso", p: { v: it.clave }, e: it.nombre };
    });
    ch.push({ t: "Aún no lo sé", a: "paso", p: { v: "nose" }, e: "Aún no lo sé", sec: true });
    return ch;
  }

  const PASOS = {
    vehiculo: {
      listo: (d, tipo) => tipo === "ayuda" ? esAuto(d.veh) : !!d.veh,
      preguntar: (d, tipo) => ({ b: [tipo === "ayuda" ? "Primero, ¿qué vehículo es?" : "¿Qué vehículo es?"], chips: chipsVeh(d, tipo) }),
      parse: t => analizar(t).veh || undefined,
      set: (d, v) => {
        d.veh = v; S.veh = v;
        const it = d.servicio && d.servicio !== "nose" ? item(d.servicio) : null;
        if (it && (it.veh || null) !== (esAuto(v) ? null : v)) delete d.servicio;
      }
    },
    servicio: {
      listo: d => !!d.servicio,
      preguntar: d => ({ b: ["¿Qué servicio quieres agendar?"], chips: chipsServicios(d) }),
      parse: (t, d) => {
        const n = analizar(t);
        if (/^(no se|no lo se|aun no|todavia no|no estoy seguro)/.test(n.n)) return "nose";
        return resolverSvc(n, n.veh || d.veh) || (n.or && item(n.or) ? n.or : undefined);
      },
      set: (d, k) => setServicio(d, k)
    },
    modelo: {
      libre: true, opcional: true, noPregunta: true, listo: d => definido(d.modelo),
      preguntar: d => ({ b: ["¿Qué marca y modelo es?" + OPC],
        ph: d.veh === "moto" ? "Ej: Honda CB 190" : d.veh === "offroad" ? "Ej: Can-Am Maverick" : "Ej: Toyota RAV4 2019" }),
      set: (d, v) => { d.modelo = v; }
    },
    lugar: {
      listo: d => !!d.lugar,
      preguntar: () => ({ b: ["¿Dónde estará el vehículo?"], chips: opciones(["Casa", "Oficina / trabajo", "Edificio o condominio", "Faena / otro lugar"]) }),
      parse: t => {
        const n = norm(t);
        if (/edifici|condomin|depto|departamento|torre/.test(n)) return "Edificio o condominio";
        if (/oficina|trabajo|pega|empresa/.test(n)) return "Oficina / trabajo";
        if (/casa|hogar|domicilio/.test(n)) return "Casa";
        if (/faena|minera|obra|otro/.test(n)) return "Faena / otro lugar";
        return undefined;
      },
      set: (d, v) => { d.lugar = v; },
      despues: d => d.lugar === "Edificio o condominio" ? { b: ["Si tu edificio pide autorización, tenemos el documento listo para presentarlo a la administración.",
        { btn: [{ t: "Descargar solicitud (PDF)", href: NEGOCIO.solicitudCondominio, tipo: "pdf" }] }] } : null
    },
    sector: {
      libre: true, opcional: true, noPregunta: true, listo: d => definido(d.sector),
      preguntar: () => ({ b: ["¿En qué sector o dirección aproximada?" + OPC], ph: "Ej: sector sur, Av. Angamos" }),
      set: (d, v) => { d.sector = v; }
    },
    dia: {
      libre: true, listo: d => !!d.dia,
      preguntar: () => ({ b: ["¿Qué día te acomoda?"], ph: "Ej: el viernes en la mañana",
        chips: [{ t: "Lo antes posible", a: "paso", p: { v: "Lo antes posible" } }]
          .concat(proximosDias(5).map(x => ({ t: x.corto, a: "paso", p: { v: x.largo }, e: x.largo })),
            [{ t: "Otra fecha", a: "otrafecha", sec: true }]) }),
      parse: t => interpretarDia(t),
      set: (d, v) => { d.dia = v; }
    },
    franja: {
      listo: d => !!d.franja,
      preguntar: d => {
        const it = item(d.servicio);
        const largo = it && it.horas >= 6;
        return { b: [largo ? "Este servicio ocupa gran parte del día, así que conviene partir temprano. ¿Qué horario prefieres?" : "¿Qué horario prefieres?"],
          chips: opciones(["Mañana (09:00 a 13:00)", "Tarde (13:00 a 18:00)", "Me da lo mismo"]) };
      },
      parse: t => {
        const n = norm(t);
        if (/(lo mismo|da igual|cualquier|indiferente|no importa|como sea)/.test(n)) return "Me da lo mismo";
        if (/(tarde|pm|despues de almuerzo|1[3-7])/.test(n)) return "Tarde (13:00 a 18:00)";
        if (/(manana|temprano|am|9|10|11|12)/.test(n)) return "Mañana (09:00 a 13:00)";
        return undefined;
      },
      set: (d, v) => { d.franja = v; }
    },
    nombre: {
      libre: true, opcional: true, noPregunta: true, listo: d => definido(d.nombre),
      preguntar: (d, tipo) => ({ b: [tipo === "empresa" ? "¿Con quién coordinamos? Tu nombre" + OPC : "¿A nombre de quién dejamos la solicitud?" + OPC], ph: "Tu nombre" }),
      set: (d, v) => { d.nombre = v; }
    },
    comentario: {
      libre: true, opcional: true, listo: d => definido(d.comentario),
      preguntar: () => ({ b: ["¿Qué te gustaría mejorar o qué debemos saber?" + OPC], ph: "Ej: rayas en el capó, poco brillo" }),
      set: (d, v) => { d.comentario = v; }
    },
    cantidad: {
      listo: d => !!d.cantidad,
      preguntar: () => ({ b: ["¿Cuántos vehículos tiene la flota?"], chips: opciones(["1 a 5", "6 a 15", "16 a 40", "Más de 40"]) }),
      parse: t => { const m = norm(t).match(/\d+/); return m ? m[0] + " vehículos" : undefined; },
      set: (d, v) => { d.cantidad = v; }
    },
    frecuencia: {
      listo: d => !!d.frecuencia,
      preguntar: () => ({ b: ["¿Con qué frecuencia necesitan el servicio?"], chips: opciones(["Semanal", "Quincenal", "Mensual", "Por definir"]) }),
      parse: t => {
        const n = norm(t);
        if (/(quincen|dos semanas|2 semanas|cada 15|15 dias)/.test(n)) return "Quincenal";
        if (/seman/.test(n)) return "Semanal";
        if (/(mensual|al mes|cada mes)/.test(n)) return "Mensual";
        if (/(definir|no se|ver|depende)/.test(n)) return "Por definir";
        return undefined;
      },
      set: (d, v) => { d.frecuencia = v; }
    },
    empresa: {
      libre: true, opcional: true, noPregunta: true, listo: d => definido(d.empresa),
      preguntar: () => ({ b: ["¿Cuál es el nombre de la empresa?" + OPC], ph: "Nombre de la empresa" }),
      set: (d, v) => { d.empresa = v; }
    },
    estadoInt: {
      listo: d => !!d.int,
      preguntar: () => ({ b: ["¿Cómo está el interior?"], chips: [
        { t: "Bastante cuidado", a: "paso", p: { v: "ok" } }, { t: "Manchas, olores o mucho uso", a: "paso", p: { v: "mal" } },
        { t: "Solo me interesa el exterior", a: "paso", p: { v: "no" } }] }),
      parse: t => {
        const n = norm(t);
        if (/(solo (el )?exterior|por fuera|no (me interesa )?(el )?interior)/.test(n)) return "no";
        if (/(mancha|olor|sucio|cochino|uso|mascota|perro|hongo|nino|mal)/.test(n)) return "mal";
        if (/(cuidado|bien|limpio|normal|poco|ok)/.test(n)) return "ok";
        return undefined;
      },
      set: (d, v) => { d.int = v; }
    },
    estadoExt: {
      listo: d => !!d.ext,
      preguntar: d => ({ b: ["¿Y por fuera?"], chips: [
        { t: "Solo está sucio", a: "paso", p: { v: "sucio" } }, { t: "Rayas, opaco o sin brillo", a: "paso", p: { v: "rayas" } },
        { t: "Tiene sellado cerámico", a: "paso", p: { v: "cer" } }]
        .concat(d.int !== "no" ? [{ t: "Solo me interesa el interior", a: "paso", p: { v: "no" } }] : []) }),
      parse: (t, d) => {
        const n = norm(t);
        if (/ceramic/.test(n)) return "cer";
        if (/(raya|opac|brillo|swirl|pulir|marcas)/.test(n)) return "rayas";
        if (d.int !== "no" && /(solo (el )?interior|por dentro|no (me interesa )?(el )?exterior)/.test(n)) return "no";
        if (/(sucio|polvo|tierra|barro|normal|bien)/.test(n)) return "sucio";
        return undefined;
      },
      set: (d, v) => { d.ext = v; }
    }
  };

  const INTRO = {
    agenda: () => "¡Vamos! Te hago unas preguntas rápidas y te dejo la solicitud lista para enviarla por WhatsApp.",
    cotiza: d => "Te preparo la cotización de <b>" + esc(nombreSvc(d)) + "</b>. Al final la envías por WhatsApp junto con unas fotos del vehículo.",
    empresa: () => "Te hago unas preguntas rápidas para armar la propuesta de tu flota.",
    ayuda: () => "Te ayudo a elegir con un par de preguntas."
  };
  const nombreSvc = d => d.otro || (d.servicio && item(d.servicio) ? item(d.servicio).nombre : "Por definir (lo vemos por WhatsApp)");

  function iniciarFlujo(tipo, datos) {
    datos = datos || {};
    const d = {};
    if (tipo !== "empresa") {
      const v = datos.veh || S.veh;
      if (v && (tipo !== "ayuda" || esAuto(v))) d.veh = v;
      if (datos.servicio) setServicio(d, datos.servicio);
      if (datos.otro) d.otro = datos.otro;
    }
    S.flow = { tipo, d, paso: null };
    return siguientePaso({ b: [INTRO[tipo](d)] });
  }

  function siguientePaso(previo) {
    const f = S.flow;
    if (!f) return menuPrincipal();
    const out = previo ? [previo] : [];
    for (const p of FLUJOS[f.tipo]) {
      const def = PASOS[p];
      if (def.listo(f.d, f.tipo)) continue;
      f.paso = p;
      const q = def.preguntar(f.d, f.tipo);
      if (def.opcional) q.chips = (q.chips || []).concat({ t: "Omitir", a: "omitir", sec: true });
      out.push(q);
      return out;
    }
    f.paso = null;
    out.push(FIN[f.tipo](f.d));
    return out;
  }

  function responderPaso(v) {
    const f = S.flow;
    if (!f || !f.paso) return menuPrincipal();
    const def = PASOS[f.paso];
    def.set(f.d, v == null ? null : v);
    if (f.tipo === "agenda" && f.d.servicio && item(f.d.servicio) && item(f.d.servicio).cotiza) f.tipo = "cotiza";
    const extra = def.despues ? def.despues(f.d) : null;
    return siguientePaso(extra);
  }

  const firma = () => NEGOCIO.firmaWhatsApp ? ["", NEGOCIO.firmaWhatsApp] : [];
  const vehLinea = d => d.veh ? vehTxt(d.veh) + (d.modelo ? " · " + d.modelo : "") : (d.modelo || "");

  function resumen(intro, filas, encabezado, cierre, boton, lead, nota) {
    const msg = [encabezado, ""].concat(filas.map(([k, v]) => "• " + k + ": " + v), ["", cierre], firma()).join("\n");
    emit("resumen", { tipo: lead });
    return { b: [intro, { tabla: filas }, { btn: [bWa(boton, msg, lead)] }, { nota: nota + " " + estadoTexto() }],
      chips: [{ t: "Corregir algo", a: "editar" }, { t: "Empezar de nuevo", a: "reiniciarFlujo", sec: true }, CH.menu] };
  }

  const FIN = {
    agenda: d => {
      const it = d.servicio && d.servicio !== "nose" ? item(d.servicio) : null;
      const filas = [["Servicio", nombreSvc(d)]];
      if (d.veh || d.modelo) filas.push(["Vehículo", vehLinea(d)]);
      const p = precioDe(it, d.veh);
      if (it && d.veh === "grande") filas.push(["Valor", "Por confirmar (vehículo fuera de estándar)"]);
      else if (p != null) filas.push(["Valor referencial", fmt(p)]);
      if (it && it.tiempo) filas.push(["Duración estimada", it.tiempo]);
      if (d.lugar) filas.push(["Lugar", d.lugar + (d.sector ? " · " + d.sector : "")]);
      else if (d.sector) filas.push(["Sector", d.sector]);
      if (d.dia) filas.push(["Fecha preferida", d.dia]);
      if (d.franja) filas.push(["Horario preferido", d.franja]);
      if (d.nombre) filas.push(["Nombre", d.nombre]);
      return resumen("¡Listo! Este es el resumen de tu solicitud:", filas, "Hola FH Detailing, quiero agendar:",
        "¿Me confirman disponibilidad?", "Enviar solicitud por WhatsApp", "agenda",
        "La hora queda confirmada cuando te respondamos por WhatsApp.");
    },
    cotiza: d => {
      const filas = [["Servicio", nombreSvc(d)]];
      if (d.veh || d.modelo) filas.push(["Vehículo", vehLinea(d)]);
      if (d.comentario) filas.push(["Detalle", d.comentario]);
      if (d.nombre) filas.push(["Nombre", d.nombre]);
      return resumen("¡Listo! Envía esta solicitud y <b>adjunta 3 o 4 fotos</b> del vehículo en el chat de WhatsApp para cotizarte:",
        filas, "Hola FH Detailing, quiero cotizar:", "Les envío fotos de mi vehículo.", "Enviar y adjuntar fotos", "cotizacion",
        "Con las fotos te decimos qué necesita realmente y cuánto cuesta.");
    },
    empresa: d => {
      const filas = [];
      if (d.empresa) filas.push(["Empresa", d.empresa]);
      filas.push(["Cantidad de vehículos", d.cantidad], ["Frecuencia", d.frecuencia]);
      if (d.nombre) filas.push(["Contacto", d.nombre]);
      return resumen("¡Listo! Con esto armamos una propuesta a medida, con valor cerrado al mes:", filas,
        "Hola FH Detailing, represento a una empresa y quiero una propuesta para nuestra flota:", "¿Podemos coordinar?",
        "Enviar por WhatsApp", "empresa", "Te contactamos para coordinar la propuesta.");
    },
    ayuda: d => recomendar(d)
  };

  function recomendar(d) {
    let ks, txt;
    if (d.int === "no" && d.ext === "no") return menuPrincipal("Entonces cuéntame qué buscas:");
    if (d.ext === "rayas") {
      ks = ["ceramico"];
      txt = "Para rayas, opacidad o falta de brillo, lo que corresponde es <b>corregir la pintura y sellarla</b>: el sellado cerámico. Incluye sin costo el Interior Esencial" +
        (d.int === "mal" ? "; si el interior está muy deteriorado, te proponemos una Restauración Interior aparte." : ".");
    } else if (d.ext === "cer") {
      ks = ["ext-proteccion"].concat(d.int === "mal" ? ["int-restauracion"] : []);
      txt = "Si ya tienes sellado cerámico, lo que corresponde es el <b>Lavado de mantención cerámica</b>: el shampoo común ataca la capa." +
        (d.int === "mal" ? " Para manchas u olores en el interior, súmale una <b>Restauración Interior</b>." : "");
    } else if (d.int === "no") {
      ks = ["ext-detallado", "ext-express"];
      txt = "Para el exterior te recomiendo el <b>Lavado detallado exterior</b>, ideal como mantención cada dos o tres semanas. Si solo quieres algo rápido, está el Lavado Express.";
    } else if (d.ext === "no") {
      ks = [d.int === "mal" ? "int-restauracion" : "int-esencial"];
      txt = d.int === "mal" ? "Con manchas, olores o mucho uso, lo que corresponde es la <b>Restauración Interior</b>."
        : "Si el interior está razonablemente cuidado, el <b>Interior Esencial</b> es lo que necesitas.";
    } else {
      ks = [d.int === "mal" ? "pack-restauracion" : "pack-esencial"];
      txt = d.int === "mal" ? "Te recomiendo el <b>Pack Restauración</b>: un reset completo por dentro, más el lavado exterior."
        : "Te recomiendo el <b>Pack Esencial</b>: el auto entero, por dentro y por fuera, en una pasada.";
    }
    const items = ks.map(item).filter(Boolean);
    if (!items.length) return { b: [txt, waBtn("Enviar fotos por WhatsApp", MSG.fotos, "fotos")], chips: [CH.precios, CH.menu] };
    const top = items[0];
    const acc = top.cotiza ? { a: "cotizar", p: { k: top.clave } } : { a: "agendar", p: { k: top.clave, v: d.veh } };
    return { b: [txt, { cards: items, v: d.veh, abierto: items.length === 1 }, { nota: "¿Quieres estar seguro? Mándanos fotos por WhatsApp y te lo confirmamos." }],
      chips: [Object.assign({ t: top.cotiza ? "Cotizar este servicio" : "Agendar este servicio", e: (top.cotiza ? "Quiero cotizar: " : "Quiero agendar: ") + top.nombre }, acc),
        CH.precios, CH.fotos], si: acc };
  }

  function iniciarAyuda() {
    if (S.veh === "moto") return respMoto();
    if (S.veh === "offroad") return respOffroad({});
    return iniciarFlujo("ayuda", {});
  }

  function iniciarAgenda(p) {
    p = p || {};
    if (p.v) S.veh = p.v;
    const it = item(p.k);
    if (it && it.cotiza) return iniciarFlujo("cotiza", { servicio: it.clave });
    return iniciarFlujo("agenda", { servicio: it ? it.clave : undefined, veh: p.v || undefined });
  }

  function agendarDesdeTexto(n) {
    if (n.veh) S.veh = n.veh;
    if (n.otro) return iniciarFlujo("cotiza", { otro: n.otro });
    let k = resolverSvc(n, vehPara(n));
    if (!k && n.or && n.or !== "or-utv" && item(n.or)) k = n.or;
    if (k && item(k).cotiza) return iniciarFlujo("cotiza", { servicio: k });
    return iniciarFlujo("agenda", { servicio: k || undefined, veh: n.veh || undefined });
  }

  function chipsEditar() {
    const f = S.flow;
    if (!f) return menuPrincipal();
    const pasos = FLUJOS[f.tipo].filter(p => ETIQ[p]);
    return { b: ["¿Qué quieres corregir?"], chips: pasos.map(p => ({ t: ETIQ[p], a: "editarPaso", p: { paso: p } })) };
  }

  /* Acciones de los botones */
  const ACC = {
    menu: () => menuPrincipal(),
    precios: p => {
      if (p && p.cambiar) S.veh = null;
      return S.veh ? elegirVeh(S.veh) : pedirVehiculo();
    },
    veh: p => elegirVeh(p.v),
    nec: p => mostrarCategoria(p.n, S.veh),
    detalle: p => detalleServicio(p.k, p.v || S.veh) || sinPrecios(),
    ayuda: () => iniciarAyuda(),
    agendar: p => iniciarAgenda(p),
    cotizar: p => iniciarFlujo("cotiza", { servicio: p.k, otro: p.otro }),
    ceramico: () => respCeramico(),
    mantCeramica: () => respMantCeramica(),
    offroad: () => respOffroad({}),
    empresas: () => RESP.empresas(),
    flota: () => iniciarFlujo("empresa", {}),
    otros: () => respOtros(),
    faqs: () => listaFaqs(),
    faq: p => (RESP[p.id] || RESP.menu)({ n: "", texto: "" }),
    contacto: () => RESP.contacto(),
    paso: p => responderPaso(p.v),
    omitir: () => responderPaso(null),
    otrafecha: () => ({ b: ["Escríbeme la fecha que te acomoda."], ph: "Ej: viernes 20 en la tarde", foco: true }),
    retomar: () => siguientePaso(),
    editar: () => chipsEditar(),
    editarPaso: p => { if (S.flow) delete S.flow.d[CAMPO[p.paso]]; return siguientePaso(); },
    reiniciarFlujo: () => {
      const f = S.flow;
      if (!f) return menuPrincipal();
      const base = f.tipo === "cotiza" ? { servicio: f.d.servicio, otro: f.d.otro } : {};
      return iniciarFlujo(f.tipo, base);
    }
  };

  function ejecutar(a, p) {
    try {
      const f = ACC[a];
      return f ? f(p || {}) : menuPrincipal();
    } catch (e) {
      console.error("[FHChat]", e);
      return { b: [TXT.fallback, waBtn("Escribir por WhatsApp", MSG.consulta)], chips: [CH.menu] };
    }
  }

  /* Texto escrito por el visitante */
  const AFIRMA = /^(si+|sip|sii+ por favor|si por favor|si porfa|si quiero|si dale|dale|ok[a-z]*|ya( po)?|bueno|perfecto|claro|de una|vale|listo|obvio|por favor|porfa)$/;
  const NIEGA = /^(no+|nop|nah|no gracias|despues|mas tarde|todavia no|aun no|ahora no)$/;

  function responder(n) {
    try {
      const hayEnt = !!(n.svc || n.veh || n.otro);
      if (n.intent === "saludo" && hayEnt) {
        const r = respPrecio(n);
        return [{ b: ["¡Hola!"] }].concat(Array.isArray(r) ? r : [r]);
      }
      if (n.intent && RESP[n.intent]) { S.fallos = 0; return RESP[n.intent](n); }
      if (hayEnt || n.or) { S.fallos = 0; return respPrecio(n); }
      S.fallos++;
      if (S.fallos >= 2) return { b: [TXT.fallback2, waBtn("Escribir por WhatsApp", MSG.consulta)], chips: menuPrincipal().chips };
      return { b: [TXT.fallback, waBtn("Preguntar por WhatsApp", "Hola FH Detailing, tengo una consulta: " + n.texto.slice(0, 300), "fallback")],
        chips: [CH.precios, { t: "Preguntas frecuentes", a: "faqs" }, CH.menu] };
    } catch (e) {
      console.error("[FHChat]", e);
      return { b: [TXT.fallback, waBtn("Escribir por WhatsApp", MSG.consulta)], chips: [CH.menu] };
    }
  }

  const conRetomar = r => {
    const lista = Array.isArray(r) ? r : [r];
    if (S.flow && S.flow.paso) {
      const u = lista[lista.length - 1];
      u.chips = [{ t: S.flow.tipo === "cotiza" ? "Seguir con mi cotización" : S.flow.tipo === "empresa" ? "Seguir con la propuesta" : S.flow.tipo === "ayuda" ? "Seguir eligiendo" : "Seguir con mi reserva", a: "retomar" }]
        .concat((u.chips || []).filter(c => c.a !== "menu"));
    }
    return lista;
  };

  // Pregunta por precio/duración/detalle en medio de una reserva o cotización, sin
  // nombrar otro servicio: se responde sobre el servicio que se está pidiendo.
  function sobreServicioActual(n, f) {
    if (["precio", "duracion", "incluye"].indexOf(n.intent) === -1 || n.svc || n.otro || n.veh || n.or) return null;
    const it = item(f.d.servicio);
    const nombre = f.d.otro || (it && it.nombre);
    if (!nombre) return null;
    if (f.d.otro || it.cotiza) return { b: ["<b>" + esc(nombre) + "</b> se cotiza caso a caso, con fotos del vehículo. Termina la solicitud y te respondemos con el valor por WhatsApp."] };
    return detalleServicio(it.clave, f.d.veh);
  }

  function textoEnPaso(texto) {
    const f = S.flow, def = PASOS[f.paso];
    const n = analizar(texto);
    const pregunta = /\?\s*$/.test(texto) || /^\s*¿/.test(texto);
    if (!def.libre) {
      // Primero se intenta entender como respuesta a lo que se preguntó.
      const v = def.parse ? def.parse(texto, f.d) : undefined;
      if (v !== undefined && v !== null) return responderPaso(v);
    }
    const actual = sobreServicioActual(n, f);
    if (actual && (pregunta || !def.libre)) return conRetomar(actual);
    if (def.libre) {
      if (pregunta && (def.noPregunta || (n.intent && n.score >= 3) || n.svc || n.otro)) return conRetomar(responder(n));
      if (def.opcional && NIEGA.test(n.n)) return responderPaso(null);
      const cortesia = (AFIRMA.test(n.n) || ["gracias", "saludo", "despedida"].indexOf(n.intent) !== -1) &&
        !n.svc && !n.veh && !n.otro && n.tokens.length <= 3;
      if (cortesia) return repreguntar(def, f, "Claro. ");
      const v = def.parse ? def.parse(texto, f.d) : String(texto).trim().slice(0, 80);
      return responderPaso(v === undefined ? String(texto).trim().slice(0, 80) : v);
    }
    if (n.intent || n.svc || n.otro || n.veh) return conRetomar(responder(n));
    return repreguntar(def, f, "No te entendí bien. ");
  }

  function repreguntar(def, f, prefijo) {
    const q = def.preguntar(f.d, f.tipo);
    q.b = [prefijo + q.b[0]].concat(q.b.slice(1));
    if (def.opcional) q.chips = (q.chips || []).concat({ t: "Omitir", a: "omitir", sec: true });
    return q;
  }

  function procesarTexto(texto) {
    const n = norm(texto);
    if (S.flow && S.flow.paso) return textoEnPaso(texto);
    if (S.si && AFIRMA.test(n)) { const s = S.si; S.si = null; return ejecutar(s.a, s.p); }
    if (NIEGA.test(n)) { S.si = null; return { b: ["Perfecto. Si necesitas algo más, aquí estoy."], chips: [CH.precios, CH.menu] }; }
    if (AFIRMA.test(n)) return menuPrincipal("¡Perfecto! ¿En qué te ayudo?");
    return responder(analizar(texto));
  }

  /* =================================================================
   * 7. INTERFAZ
   * ================================================================= */

  const ICO = {
    chat: '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.4-4.5a8.4 8.4 0 1 1 15.6-4.4z"/><path d="M8.6 11.8h.01M12.2 11.8h.01M15.8 11.8h.01" stroke-width="2.7"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    restart: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 4.5v4.6h4.6"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    ext: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5l8.5 6 8.5-6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm0 18.13a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21zm4.53-6.15c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.24.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>'
  };

  const CSS = `
.fhc,.fhc *{box-sizing:border-box}
.fhc{--fhc-teal:#00BFC6;--fhc-btn:linear-gradient(135deg,#00C6CE 0%,#049CA2 100%);--fhc-btn-hi:linear-gradient(135deg,#22D6DD 0%,#05ADB4 100%);
  --fhc-bg:#0A0B0B;--fhc-bg2:#121414;--fhc-bg3:#1A1D1D;--fhc-line:rgba(255,255,255,.09);--fhc-tx:#ECEFEF;--fhc-mut:#9AA3A4;
  --fhc-ease:cubic-bezier(.22,1,.36,1);--fhc-b:22px;
  font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--fhc-tx);line-height:1.45;font-size:14.5px;-webkit-font-smoothing:antialiased}
.fhc.fhc-up{--fhc-b:94px}
.fhc button{font-family:inherit}
.fhc :focus-visible{outline:2px solid var(--fhc-teal);outline-offset:2px}
.fhc-dock{position:fixed;right:22px;bottom:calc(var(--fhc-b) + env(safe-area-inset-bottom,0px));z-index:999;transition:bottom .5s var(--fhc-ease),opacity .3s,transform .3s var(--fhc-ease)}
.fhc-launch{position:relative;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;background:var(--fhc-btn);color:#001112;display:flex;align-items:center;justify-content:center;
  box-shadow:0 10px 30px rgba(0,191,198,.35),0 2px 8px rgba(0,0,0,.45);transition:transform .25s var(--fhc-ease),box-shadow .25s,background .25s}
.fhc-launch:hover{background:var(--fhc-btn-hi);transform:translateY(-2px) scale(1.04);box-shadow:0 14px 40px rgba(0,191,198,.5),0 2px 8px rgba(0,0,0,.45)}
.fhc-launch:active{transform:scale(.94)}
.fhc-launch:focus-visible{outline:2px solid #fff;outline-offset:3px}
.fhc-badge{position:absolute;top:1px;right:1px;width:13px;height:13px;border-radius:50%;background:#4ADE80;border:2px solid #050505}
.fhc-teaser{position:absolute;right:0;bottom:calc(100% + 12px);width:max-content;max-width:min(270px,calc(100vw - 44px));background:#141717;border:1px solid rgba(0,191,198,.35);
  border-radius:16px 16px 4px 16px;box-shadow:0 12px 34px rgba(0,0,0,.55);opacity:0;transform:translateY(8px);visibility:hidden;
  transition:opacity .4s var(--fhc-ease),transform .4s var(--fhc-ease),visibility .4s}
.fhc-teaser.on{opacity:1;transform:none;visibility:visible}
.fhc-teaser-t{display:block;width:100%;text-align:left;border:0;background:none;color:var(--fhc-tx);cursor:pointer;padding:12px 36px 12px 14px;font-size:13.5px;line-height:1.4;border-radius:16px}
.fhc-teaser-t b{color:#fff;display:block;margin-bottom:2px}
.fhc-teaser-x{position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;border:0;background:none;color:var(--fhc-mut);cursor:pointer;display:flex;align-items:center;justify-content:center}
.fhc-teaser-x:hover{color:#fff;background:rgba(255,255,255,.08)}
.fhc-teaser-x svg{width:15px;height:15px}
.fhc-panel{position:fixed;right:22px;bottom:22px;z-index:1000;width:384px;height:min(660px,calc(100vh - 44px));display:flex;flex-direction:column;
  background:var(--fhc-bg);border:1px solid var(--fhc-line);border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.65),0 0 0 1px rgba(0,191,198,.06);overflow:hidden;
  opacity:0;transform:translateY(16px) scale(.98);transform-origin:bottom right;visibility:hidden;transition:opacity .35s var(--fhc-ease),transform .35s var(--fhc-ease),visibility .35s}
.fhc-panel:focus{outline:none}
.fhc.fhc-open .fhc-panel{opacity:1;transform:none;visibility:visible}
.fhc.fhc-open .fhc-dock{opacity:0;pointer-events:none;transform:scale(.8)}
.fhc-head{display:flex;align-items:center;gap:10px;padding:13px 10px 13px 14px;border-bottom:1px solid var(--fhc-line);flex:none;
  background:radial-gradient(120% 140% at 0% 0%,rgba(0,191,198,.14),transparent 60%),#0D0F0F}
.fhc-av{position:relative;width:40px;height:40px;border-radius:12px;background:#050505;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:15px;letter-spacing:-.02em;color:#fff;flex:none}
.fhc-av i{position:absolute;right:6px;bottom:10px;width:5px;height:5px;border-radius:50%;background:var(--fhc-teal)}
.fhc-ttl{flex:1;min-width:0}
.fhc-ttl b{display:block;font-size:15px;font-weight:700;color:#fff;letter-spacing:-.01em}
.fhc-ttl>span{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fhc-mut);white-space:nowrap;overflow:hidden}
.fhc-st{overflow:hidden;text-overflow:ellipsis}
.fhc-dot{width:7px;height:7px;border-radius:50%;background:#6B7273;flex:none}
.fhc-dot.on{background:#4ADE80;box-shadow:0 0 0 3px rgba(74,222,128,.18)}
.fhc-hb{width:38px;height:38px;border-radius:10px;border:0;background:none;color:#C9D0D1;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;transition:background .2s,color .2s}
.fhc-hb:hover{background:rgba(255,255,255,.07);color:#fff}
.fhc-hb.fhc-wa{color:#3BE07B}
.fhc-log{position:relative;flex:1;overflow-y:auto;padding:16px 14px 10px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain;
  scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.16) transparent}
.fhc-msg{display:flex;flex-direction:column;gap:8px;max-width:100%;animation:fhcIn .35s var(--fhc-ease)}
@keyframes fhcIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.fhc-bot{align-items:flex-start}
.fhc-user{align-items:flex-end}
.fhc-bub{max-width:90%;padding:10px 13px;border-radius:16px;font-size:14.5px;line-height:1.5;overflow-wrap:anywhere}
.fhc-bot .fhc-bub{background:var(--fhc-bg3);border:1px solid rgba(255,255,255,.06);border-top-left-radius:6px}
.fhc-user .fhc-bub{background:var(--fhc-btn);color:#001112;font-weight:500;border-top-right-radius:6px;white-space:pre-wrap}
.fhc-bub>*{margin:0}
.fhc-bub>*+*{margin-top:8px}
.fhc-bub b{color:#fff;font-weight:650}
.fhc-bub ul,.fhc-bub ol{padding-left:19px}
.fhc-bub li{margin:3px 0}
.fhc-bub li::marker{color:var(--fhc-teal)}
.fhc-bub a{color:var(--fhc-teal);text-decoration:underline;text-underline-offset:2px}
.fhc-mut{color:var(--fhc-mut);font-weight:400}
.fhc-nota{margin:0;font-size:12px;line-height:1.45;color:var(--fhc-mut);padding:0 4px;max-width:94%}
.fhc-cards{display:flex;flex-direction:column;gap:8px;width:100%}
.fhc-card{width:100%;background:var(--fhc-bg2);border:1px solid var(--fhc-line);border-radius:14px;padding:12px 13px}
.fhc-card-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.fhc-card-h b{font-size:14.5px;font-weight:700;color:#fff}
.fhc-tag{font-size:10px;font-weight:800;letter-spacing:.08em;color:#001112;background:var(--fhc-teal);border-radius:20px;padding:2px 8px}
.fhc-card-d{margin:4px 0 0;font-size:13px;color:var(--fhc-mut)}
.fhc-card-m{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:10px}
.fhc-time{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;color:#BFC6C7;white-space:nowrap}
.fhc-price{font-weight:800;font-size:16px;color:#fff;white-space:nowrap;text-align:right}
.fhc-price s{font-weight:500;font-size:12.5px;color:var(--fhc-mut);margin-right:6px}
.fhc-price small,.fhc-price2 small{font-size:10.5px;font-weight:700;color:var(--fhc-mut);margin-right:4px;letter-spacing:.04em;text-transform:uppercase}
.fhc-price.cot{color:var(--fhc-teal);font-size:14px}
.fhc-price2{display:flex;flex-direction:column;align-items:flex-end;gap:1px;font-weight:800;font-size:14.5px;color:#fff;white-space:nowrap}
.fhc-inc{margin-top:10px;border-top:1px solid var(--fhc-line);padding-top:8px}
.fhc-inc summary{cursor:pointer;font-size:12.5px;font-weight:600;color:var(--fhc-teal);list-style:none;display:inline-flex;align-items:center;gap:6px}
.fhc-inc summary::-webkit-details-marker{display:none}
.fhc-inc summary::after{content:"+";font-size:15px;line-height:1}
.fhc-inc[open] summary::after{content:"\\2013"}
.fhc-inc ul{margin:8px 0 0;padding-left:18px;font-size:13px;color:#D3D9DA}
.fhc-inc li{margin:2px 0}
.fhc-inc li::marker{color:var(--fhc-teal)}
.fhc-ideal{margin:8px 0 0;font-size:12.5px;color:var(--fhc-mut)}
.fhc-card-a{display:flex;gap:8px;margin-top:11px}
.fhc-cta{flex:1;border:0;border-radius:40px;padding:10px 14px;background:var(--fhc-btn);color:#001112;font-weight:700;font-size:13px;cursor:pointer;transition:background .2s,transform .15s}
.fhc-cta:hover{background:var(--fhc-btn-hi)}
.fhc-cta:active{transform:scale(.97)}
.fhc-btns{display:flex;flex-wrap:wrap;gap:8px}
.fhc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:40px;padding:11px 18px;font-size:14px;font-weight:700;text-decoration:none;line-height:1.2;cursor:pointer;transition:background .2s,border-color .2s,transform .15s}
.fhc-btn:active{transform:scale(.97)}
.fhc-btn-wa{background:#0F8040;color:#fff;box-shadow:0 6px 20px rgba(37,211,102,.22)}
.fhc-btn-wa:hover{background:#0C6E37}
.fhc-btn-sec{background:none;color:var(--fhc-tx);border:1px solid rgba(255,255,255,.22)}
.fhc-btn-sec:hover{border-color:var(--fhc-teal);color:#fff}
.fhc-tab{display:grid;gap:2px;font-size:13px}
.fhc-tab div{display:flex;justify-content:space-between;gap:14px;padding:5px 0;border-bottom:1px dashed rgba(255,255,255,.09)}
.fhc-tab div:last-child{border-bottom:0}
.fhc-tab dt{color:var(--fhc-mut);flex:none}
.fhc-tab dd{margin:0;color:#fff;font-weight:600;text-align:right;overflow-wrap:anywhere}
.fhc-copy{width:100%;border:1px solid rgba(0,191,198,.45);background:rgba(0,191,198,.08);color:#BFF5F7;border-radius:10px;padding:9px;font-weight:700;font-size:12.5px;letter-spacing:.06em;cursor:pointer}
.fhc-copy.ok{background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.5);color:#BBF7D0}
.fhc-chips{display:flex;flex-wrap:wrap;gap:7px;padding:2px 0 4px;animation:fhcIn .35s var(--fhc-ease)}
.fhc-chip{border:1px solid rgba(0,191,198,.5);background:rgba(0,191,198,.06);color:#C8F6F8;border-radius:40px;padding:8px 13px;font-size:13.5px;font-weight:500;line-height:1.25;text-align:left;cursor:pointer;
  transition:background .2s,border-color .2s,color .2s,transform .15s}
.fhc-chip:hover{background:rgba(0,191,198,.16);border-color:var(--fhc-teal);color:#fff}
.fhc-chip:active{transform:scale(.97)}
.fhc-chip.sec{border-color:rgba(255,255,255,.18);background:none;color:#C9D0D1}
.fhc-chip.sec:hover{border-color:rgba(255,255,255,.4);color:#fff}
.fhc-typing .fhc-bub{display:inline-flex;gap:4px;padding:13px 14px}
.fhc-typing i{width:7px;height:7px;border-radius:50%;background:#7E8889;animation:fhcDot 1.2s infinite ease-in-out}
.fhc-typing i:nth-child(2){animation-delay:.15s}
.fhc-typing i:nth-child(3){animation-delay:.3s}
@keyframes fhcDot{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-3px)}}
.fhc-form{display:flex;align-items:center;gap:8px;padding:10px 12px 8px;border-top:1px solid var(--fhc-line);background:#0D0F0F;flex:none;margin:0}
.fhc-in{flex:1;min-width:0;height:44px;border-radius:22px;border:1px solid rgba(255,255,255,.13);background:#151818;color:#fff;padding:0 16px;font-family:inherit;font-size:16px;outline:none;transition:border-color .2s}
.fhc-in::placeholder{color:#7D8687}
.fhc-in:focus{border-color:var(--fhc-teal)}
.fhc .fhc-in:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(0,191,198,.18)}
.fhc-send{width:44px;height:44px;border-radius:50%;border:0;background:var(--fhc-btn);color:#001112;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
.fhc-send:hover{background:var(--fhc-btn-hi)}
.fhc-foot{margin:0;padding:0 12px 10px;background:#0D0F0F;text-align:center;font-size:11px;color:#7A8485;flex:none}
@media (max-width:560px){
  .fhc-panel{top:0;right:0;bottom:0;left:0;width:auto;height:100%;border-radius:0;border:0;transform:translateY(24px)}
  .fhc-foot{padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}
  .fhc-bub{max-width:92%}
}
@media (max-width:640px){html.fhc-on footer{padding-bottom:170px}}
html.fhc-lock,html.fhc-lock body{overflow:hidden}
@media (prefers-reduced-motion:reduce){.fhc *,.fhc-panel,.fhc-dock{transition:none!important;animation:none!important}}
@media print{.fhc{display:none!important}}
`;

  let root, dock, launch, teaser, panel, log, input, stDot, stTxt;
  let cola = Promise.resolve(), gen = 0, RAPIDO = false;
  const PH = "Escribe tu pregunta…";
  const mm = q => !!(window.matchMedia && window.matchMedia(q).matches);
  const esMovil = () => mm("(max-width: 560px)");
  const reduce = () => mm("(prefers-reduced-motion: reduce)");
  const finoPuntero = () => mm("(pointer: fine)");

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function emit(tipo, det) {
    const detail = Object.assign({ tipo }, det || {});
    try { document.dispatchEvent(new CustomEvent("fhchat", { detail })); } catch (e) { /* sin soporte */ }
    try { if (typeof window.gtag === "function") window.gtag("event", "fhchat_" + tipo, det || {}); } catch (e) { /* sin analytics */ }
  }

  /* ---------- Render de mensajes ---------- */

  function tabla(filas) {
    const dl = el("dl", "fhc-tab");
    filas.forEach(([k, v]) => {
      const fila = el("div");
      const dt = el("dt"); dt.textContent = k;
      const dd = el("dd"); dd.textContent = v;
      fila.append(dt, dd);
      dl.appendChild(fila);
    });
    return dl;
  }

  function precioEl(it, v) {
    if (it.cotiza) return el("span", "fhc-price cot", "A cotizar");
    if (it.precio != null) return el("span", "fhc-price", fmt(it.precio));
    if (!it.precios) return el("span", "fhc-price cot", "Consultar");
    if (v === "sedan" || v === "suv") {
      const a = antesDe(it, v);
      return el("span", "fhc-price", (a ? "<s>" + fmt(a) + "</s>" : "") + fmt(precioDe(it, v)));
    }
    if (v === "grande") return el("span", "fhc-price", "<small>Ref. SUV</small>" + fmt(it.precios.suv));
    return el("span", "fhc-price2", "<span><small>Auto</small>" + fmt(it.precios.sedan) + "</span><span><small>SUV</small>" + fmt(it.precios.suv) + "</span>");
  }

  function tarjeta(it, v, abierto) {
    const c = el("div", "fhc-card");
    const h = el("div", "fhc-card-h", "<b>" + esc(it.nombre) + "</b>");
    if (it.tag) h.appendChild(el("span", "fhc-tag", esc(it.tag)));
    c.appendChild(h);
    if (it.desc) c.appendChild(el("p", "fhc-card-d", esc(it.desc)));
    const m = el("div", "fhc-card-m");
    m.appendChild(el("span", "fhc-time", ICO.clock + " " + esc(it.tiempo || "Según trabajo")));
    m.appendChild(precioEl(it, v));
    c.appendChild(m);
    if ((it.incluye && it.incluye.length) || it.ideal) {
      const d = el("details", "fhc-inc");
      if (abierto) d.open = true;
      d.appendChild(el("summary", null, "Qué incluye"));
      if (it.incluye && it.incluye.length) {
        const ul = el("ul");
        it.incluye.forEach(x => ul.appendChild(el("li", null, esc(x))));
        d.appendChild(ul);
      }
      if (it.ideal) d.appendChild(el("p", "fhc-ideal", esc(it.ideal)));
      c.appendChild(d);
    }
    const a = el("div", "fhc-card-a");
    const b = el("button", "fhc-cta", it.cotiza ? "Cotizar con fotos" : "Agendar");
    b.type = "button";
    b.dataset.a = it.cotiza ? "cotizar" : "agendar";
    b.dataset.p = JSON.stringify(it.cotiza ? { k: it.clave } : { k: it.clave, v: v || null });
    b.dataset.e = (it.cotiza ? "Quiero cotizar: " : "Quiero agendar: ") + it.nombre;
    b.setAttribute("aria-label", (it.cotiza ? "Cotizar " : "Agendar ") + it.nombre);
    a.appendChild(b);
    c.appendChild(a);
    return c;
  }

  function boton(b) {
    const a = el("a", "fhc-btn " + (b.tipo === "wa" ? "fhc-btn-wa" : "fhc-btn-sec"));
    a.href = b.href;
    if (b.tipo === "pdf") a.setAttribute("download", "");
    else if (b.tipo !== "mail") { a.target = "_blank"; a.rel = "noopener"; }
    a.innerHTML = (ICO[b.tipo] || "") + "<span>" + esc(b.t) + "</span>";
    a.dataset.tipo = b.tipo || "";
    if (b.lead) a.dataset.lead = b.lead;
    return a;
  }

  function chipsEl(chips) {
    const w = el("div", "fhc-chips");
    w.setAttribute("role", "group");
    w.setAttribute("aria-label", "Opciones de respuesta");
    chips.forEach(c => {
      const b = el("button", "fhc-chip" + (c.sec ? " sec" : ""));
      b.type = "button";
      b.textContent = c.t;
      b.dataset.a = c.a;
      if (c.p) b.dataset.p = JSON.stringify(c.p);
      if (c.e) b.dataset.e = c.e;
      w.appendChild(b);
    });
    return w;
  }

  const quitarChips = () => { if (log) log.querySelectorAll(".fhc-chips").forEach(x => x.remove()); };

  function bajar(grupo, extra) {
    if (!log) return;
    const alto = grupo.offsetHeight + (extra ? extra.offsetHeight + 10 : 0);
    const destino = alto > log.clientHeight * 0.85 ? grupo.offsetTop - 12 : log.scrollHeight;
    try { log.scrollTo({ top: destino, behavior: reduce() ? "auto" : "smooth" }); } catch (e) { log.scrollTop = destino; }
  }

  function renderBot(spec) {
    const g = el("div", "fhc-msg fhc-bot");
    let bub = null;
    const burbuja = () => bub || (bub = g.appendChild(el("div", "fhc-bub")));
    (spec.b || []).forEach(bl => {
      if (bl == null) return;
      if (typeof bl === "string") { burbuja().appendChild(el("p", null, bl)); return; }
      if (bl.ul || bl.ol) {
        const l = el(bl.ul ? "ul" : "ol");
        (bl.ul || bl.ol).forEach(x => l.appendChild(el("li", null, x)));
        burbuja().appendChild(l);
        return;
      }
      if (bl.tabla) { burbuja().appendChild(tabla(bl.tabla)); return; }
      if (bl.copiar) {
        const b = burbuja();
        b.appendChild(tabla(bl.copiar));
        const c = el("button", "fhc-copy", "COPIAR DATOS");
        c.type = "button";
        c.dataset.txt = bl.copiar.map(r => r[0] + ": " + r[1]).join("\n");
        b.appendChild(c);
        return;
      }
      bub = null;
      if (bl.cards) {
        const w = el("div", "fhc-cards");
        bl.cards.forEach(it => w.appendChild(tarjeta(it, bl.v, bl.abierto && bl.cards.length <= 2)));
        g.appendChild(w);
      } else if (bl.btn) {
        const w = el("div", "fhc-btns");
        bl.btn.forEach(x => w.appendChild(boton(x)));
        g.appendChild(w);
      } else if (bl.nota) {
        g.appendChild(el("p", "fhc-nota", bl.nota));
      }
    });
    log.appendChild(g);
    let chips = null;
    if (spec.chips && spec.chips.length) {
      quitarChips();
      chips = chipsEl(spec.chips);
      log.appendChild(chips);
    }
    S.si = spec.si || null;
    input.placeholder = spec.ph || PH;
    if (spec.foco && finoPuntero()) input.focus({ preventScroll: true });
    bajar(g, chips);
  }

  const largoTexto = spec => (spec.b || []).reduce((n, bl) => n + (typeof bl === "string" ? bl.replace(/<[^>]+>/g, "").length : 40), 0);

  // Muestra los mensajes del asistente en orden, con "escribiendo…" entre ellos.
  function decir(r) {
    if (!r) return cola;
    const lista = [];
    (function aplanar(x) { if (Array.isArray(x)) x.forEach(aplanar); else if (x) lista.push(x); })(r);
    const g0 = gen;
    lista.forEach(spec => {
      cola = cola.then(() => new Promise(res => {
        if (g0 !== gen) return res();
        const ms = RAPIDO ? 0 : reduce() ? 150 : Math.min(1000, 320 + largoTexto(spec) * 3);
        const t = ms ? mostrarEscribiendo() : null;
        setTimeout(() => {
          if (t) t.remove();
          if (g0 === gen) {
            try { renderBot(spec); } catch (e) { console.error("[FHChat]", e); }
          }
          res();
        }, ms);
      }));
    });
    return cola;
  }

  function mostrarEscribiendo() {
    const m = el("div", "fhc-msg fhc-bot fhc-typing", '<div class="fhc-bub" aria-hidden="true"><i></i><i></i><i></i></div>');
    log.appendChild(m);
    bajar(m);
    return m;
  }

  function mostrarUsuario(t) {
    quitarChips();
    S.si = null;
    const m = el("div", "fhc-msg fhc-user");
    const b = el("div", "fhc-bub");
    b.textContent = t;
    m.appendChild(b);
    log.appendChild(m);
    bajar(m);
  }

  function alEscribir(texto) {
    const t = String(texto || "").trim().slice(0, 300);
    if (!t) return;
    const si = S.si;
    mostrarUsuario(t);
    S.si = si;
    emit("mensaje", { texto: t });
    let r;
    try { r = procesarTexto(t); } catch (e) { console.error("[FHChat]", e); r = responder(analizar(t)); }
    S.si = null;
    decir(r);
  }

  function copiarDatos(b) {
    const txt = b.dataset.txt || "";
    const ok = () => {
      b.textContent = "¡COPIADO!";
      b.classList.add("ok");
      setTimeout(() => { b.textContent = "COPIAR DATOS"; b.classList.remove("ok"); }, 1800);
    };
    const manual = () => {
      const ta = el("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let r = false;
      try { r = document.execCommand("copy"); } catch (e) { r = false; }
      ta.remove();
      if (r) ok();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, manual);
    else manual();
  }

  /* ---------- Panel ---------- */

  function actualizarEstado() {
    if (!stDot) return;
    // El asistente responde siempre; el horario del equipo se informa en los mensajes.
    stDot.classList.add("on");
    stTxt.textContent = "Asistente virtual 24/7";
    stTxt.title = abiertoAhora() ? "Equipo en horario de atención" : "Equipo fuera de horario: respondemos " + NEGOCIO.horario.texto;
  }

  function construirPanel() {
    panel = el("section", "fhc-panel");
    panel.id = "fhc-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "fhc-ttl");
    panel.tabIndex = -1;
    panel.innerHTML =
      '<header class="fhc-head">' +
        '<div class="fhc-av" aria-hidden="true">FH<i></i></div>' +
        '<div class="fhc-ttl"><b id="fhc-ttl">FH Detailing</b><span><i class="fhc-dot"></i><span class="fhc-st">Asistente virtual</span></span></div>' +
        '<a class="fhc-hb fhc-wa" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp" title="Escribir por WhatsApp">' + ICO.wa + "</a>" +
        '<button type="button" class="fhc-hb fhc-rst" aria-label="Reiniciar conversación" title="Reiniciar conversación">' + ICO.restart + "</button>" +
        '<button type="button" class="fhc-hb fhc-x" aria-label="Cerrar asistente" title="Cerrar">' + ICO.close + "</button>" +
      "</header>" +
      '<div class="fhc-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<form class="fhc-form" autocomplete="off">' +
        '<input class="fhc-in" type="text" maxlength="300" enterkeyhint="send" aria-label="Escribe tu mensaje">' +
        '<button class="fhc-send" type="submit" aria-label="Enviar mensaje">' + ICO.send + "</button>" +
      "</form>" +
      '<p class="fhc-foot">Asistente automático · Valores referenciales con IVA</p>';
    root.appendChild(panel);
    log = panel.querySelector(".fhc-log");
    input = panel.querySelector(".fhc-in");
    input.placeholder = PH;
    stDot = panel.querySelector(".fhc-dot");
    stTxt = panel.querySelector(".fhc-st");
    const waHead = panel.querySelector(".fhc-wa");
    waHead.href = waURL(MSG.consulta);
    waHead.addEventListener("click", () => emit("lead", { tipo: "cabecera" }));

    panel.querySelector(".fhc-form").addEventListener("submit", e => {
      e.preventDefault();
      const t = input.value;
      input.value = "";
      alEscribir(t);
    });
    panel.querySelector(".fhc-x").addEventListener("click", cerrar);
    panel.querySelector(".fhc-rst").addEventListener("click", reiniciar);
    panel.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); cerrar(); } });

    log.addEventListener("click", e => {
      const b = e.target.closest("[data-a]");
      if (b && log.contains(b)) {
        e.preventDefault();
        let p = {};
        try { p = b.dataset.p ? JSON.parse(b.dataset.p) : {}; } catch (err) { p = {}; }
        mostrarUsuario(b.dataset.e || b.textContent.trim());
        decir(ejecutar(b.dataset.a, p));
        return;
      }
      const c = e.target.closest(".fhc-copy");
      if (c) { copiarDatos(c); return; }
      const w = e.target.closest("a.fhc-btn");
      if (w) emit(w.dataset.lead ? "lead" : "enlace", { tipo: w.dataset.lead || w.dataset.tipo, href: w.href });
      const ancla = e.target.closest('a[href^="#"]');
      if (ancla) cerrar();
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", ajustarVV);
      window.visualViewport.addEventListener("scroll", ajustarVV);
    }
    window.addEventListener("resize", ajustarVV);
  }

  // En celulares, el panel se ajusta al espacio visible cuando aparece el teclado.
  function ajustarVV() {
    if (!panel) return;
    const vv = window.visualViewport;
    if (!S.abierto || !esMovil() || !vv) {
      panel.style.height = "";
      panel.style.top = "";
      document.documentElement.classList.toggle("fhc-lock", S.abierto && esMovil());
      return;
    }
    document.documentElement.classList.add("fhc-lock");
    panel.style.height = vv.height + "px";
    panel.style.top = vv.offsetTop + "px";
  }

  function abrir(tema) {
    if (!panel) construirPanel();
    if (!S.abierto) {
      S.abierto = true;
      S.usado = true;
      root.classList.add("fhc-open");
      launch.setAttribute("aria-expanded", "true");
      teaserVisto();
      const badge = launch.querySelector(".fhc-badge");
      if (badge) badge.remove();
      actualizarEstado();
      ajustarVV();
      emit("abrir");
      setTimeout(() => {
        try { if (finoPuntero()) input.focus({ preventScroll: true }); else panel.focus({ preventScroll: true }); } catch (e) { /* nada */ }
      }, 60);
    }
    if (!S.saludado) {
      S.saludado = true;
      decir(tema ? { b: ["¡Hola! Soy el asistente virtual de <b>FH Detailing</b>."] } : menuPrincipal(TXT.saludo));
    }
    if (tema) {
      const t = String(tema);
      if (ACC[t]) decir(ejecutar(t, {}));
      else if (RESP[t]) decir(RESP[t]({ n: "", texto: "" }));
      else alEscribir(t);
    }
  }

  function cerrar() {
    if (!S.abierto) return;
    S.abierto = false;
    root.classList.remove("fhc-open");
    launch.setAttribute("aria-expanded", "false");
    ajustarVV();
    emit("cerrar");
    try { launch.focus({ preventScroll: true }); } catch (e) { /* nada */ }
  }

  function reiniciar() {
    gen++;
    cola = Promise.resolve();
    S.flow = null; S.si = null; S.fallos = 0; S.veh = null;
    log.innerHTML = "";
    input.placeholder = PH;
    emit("reiniciar");
    decir(menuPrincipal(TXT.saludo));
  }

  /* ---------- Botón flotante y mensaje de bienvenida ---------- */

  function teaserVisto() {
    if (teaser) teaser.classList.remove("on");
    try { localStorage.setItem("fhc-teaser", "1"); } catch (e) { /* almacenamiento bloqueado */ }
  }

  function programarTeaser() {
    let visto = false;
    try { visto = localStorage.getItem("fhc-teaser") === "1"; } catch (e) { visto = false; }
    if (visto) return;
    setTimeout(() => {
      if (S.usado) return;
      teaser.classList.add("on");
      setTimeout(() => teaser.classList.remove("on"), 15000);
    }, 6000);
  }

  // Si la página tiene el botón flotante de WhatsApp, el asistente se ubica encima.
  function seguirWhatsApp() {
    const wa = document.querySelector(".sticky-wa");
    if (!wa) return;
    const sync = () => root.classList.toggle("fhc-up", wa.classList.contains("show"));
    sync();
    try { new MutationObserver(sync).observe(wa, { attributes: true, attributeFilter: ["class"] }); } catch (e) { /* nada */ }
  }

  function montar() {
    const st = el("style");
    st.id = "fhc-css";
    st.textContent = CSS;
    document.head.appendChild(st);

    root = el("div", "fhc");
    root.id = "fhc";
    dock = el("div", "fhc-dock");
    teaser = el("div", "fhc-teaser",
      '<button type="button" class="fhc-teaser-t"><b>¿Dudas con tu servicio?</b>Te muestro precios y te dejo la reserva lista.</button>' +
      '<button type="button" class="fhc-teaser-x" aria-label="Cerrar mensaje">' + ICO.close + "</button>");
    launch = el("button", "fhc-launch", ICO.chat + '<span class="fhc-badge" aria-hidden="true"></span>');
    launch.type = "button";
    launch.setAttribute("aria-label", "Abrir asistente virtual de FH Detailing");
    launch.setAttribute("aria-expanded", "false");
    launch.setAttribute("aria-controls", "fhc-panel");
    launch.title = "Asistente FH Detailing";
    dock.append(teaser, launch);
    root.appendChild(dock);
    document.body.appendChild(root);
    document.documentElement.classList.add("fhc-on");

    launch.addEventListener("click", () => abrir());
    teaser.querySelector(".fhc-teaser-t").addEventListener("click", () => abrir());
    teaser.querySelector(".fhc-teaser-x").addEventListener("click", teaserVisto);

    // Cualquier elemento con data-fhchat="precios|agendar|ceramico|…" abre el asistente.
    document.addEventListener("click", e => {
      const t = e.target && e.target.closest && e.target.closest("[data-fhchat]");
      if (!t || (root && root.contains(t))) return;
      e.preventDefault();
      abrir(t.getAttribute("data-fhchat") || undefined);
    });

    seguirWhatsApp();
    programarTeaser();
  }

  window.FHChat = {
    abrir: tema => abrir(tema),
    cerrar: () => cerrar(),
    preguntar: texto => { abrir(); alEscribir(texto); },
    reiniciar: () => { if (panel) reiniciar(); },
    // Para pruebas automáticas
    _analizar: analizar,
    _responder: texto => responder(analizar(texto)),
    _rapido: on => { RAPIDO = on !== false; },
    _estado: () => S
  };

  function iniciar() {
    try { montar(); } catch (e) { console.error("[FHChat] no se pudo iniciar", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
