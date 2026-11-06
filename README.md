# Fh-detailing 
FH Detailing

## Asistente virtual (chatbot)

El sitio incluye un asistente virtual (`chatbot.js`): un botón turquesa en la esquina inferior derecha, ubicado sobre el botón de WhatsApp.

**Qué hace**

- Responde preguntas escritas con palabras propias, aunque traigan errores de tipeo: precios, duración, horario, cobertura, formas de pago, cuotas, transferencia, factura, edificios y condominios, flotas, Off Road, sellado cerámico, trabajos a pedido, etc.
- Muestra los precios según el vehículo (auto, SUV, moto, Off Road o van).
- Ayuda a elegir el servicio con dos preguntas.
- Arma la solicitud de **reserva**, **cotización con fotos** o **propuesta para flotas** y la deja lista para enviar por WhatsApp con todos los datos (servicio, vehículo, valor, lugar, día y horario). La hora se confirma cuando el equipo responde.
- Funciona 100 % en el navegador: no necesita servidor, cuentas ni pagos mensuales.

**Instalación**

Ya está instalado. Es esta línea, justo antes de `</body>` en `index.html`:

```html
<script src="chatbot.js" defer></script>
```

> **Importante:** si vuelves a subir un `index.html` desde tu computador, revisa que tenga esa línea. Si no la tiene, el asistente desaparece de la página.

**Cómo editarlo**

| Qué quieres cambiar | Dónde |
| --- | --- |
| Precios de autos, SUV y motos | Se leen solos desde la sección Servicios de `index.html` (listas `interior`, `exterior`, `packs` y `MOTO`). Si cambias un precio ahí, el asistente lo muestra actualizado. |
| Precios Off Road, horario, teléfono, datos de transferencia y textos de las respuestas | Sección 1 de `chatbot.js` ("DATOS DEL NEGOCIO Y RESPUESTAS"). |
| Palabras que entiende el asistente | Sección 4 de `chatbot.js` (`INTENCIONES`). |

**Abrir el asistente desde cualquier botón o enlace**

Agrega `data-fhchat` con el tema: `precios`, `agendar`, `ceramico`, `offroad`, `empresas` o `faqs`. Ejemplo:

```html
<a href="#" data-fhchat="precios">Ver precios con el asistente</a>
```

**Medición (opcional)**

El asistente emite el evento `fhchat` en la página (abrir, mensaje, resumen, lead…). Si se instala Google Analytics (`gtag`), los registra solos como eventos `fhchat_*`.
