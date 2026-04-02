# Brief para nueva tool

## 1. Integrate a new tool to check flights prices

Create a tool that allows the agent to check flight prices for a given route and date. The tool should be simple to use and integrate with the existing agent architecture. It should provide accurate and up-to-date information on flight prices, allowing the agent to respond to user queries about travel costs effectively.

---

## 2. Context

Hoy el proyecto ya cuenta con una base funcional: recibe una pregunta desde consola, decide si necesita usar una herramienta y entrega una respuesta al usuario en español.

El valor principal del proyecto es educativo: mostrar de forma sencilla cómo construir un agente que razona, usa herramientas y mantiene una estructura ordenada para poder crecer sin romper lo existente.

El reto actual no está en “hacer que funcione”, sino en dejar una guía más clara de propósito, límites y criterios de calidad para que cualquier persona del equipo pueda continuar el trabajo con rapidez.

También existen puntos a cuidar a corto plazo:

- La herramienta de cálculo resuelve bien casos simples, pero su enfoque actual no es ideal para escenarios de producción.
- La configuración depende de variables de entorno correctas; si faltan, la ejecución falla (lo cual es deseable, pero requiere buena documentación).
- El proyecto está listo para crecer con nuevas herramientas, pero necesita mantener una forma de trabajo consistente para no perder claridad.

El objetivo de este brief es alinear al equipo en una visión compartida: mantener el agente simple, útil y fácil de extender, con foco en calidad, pruebas y comunicación clara.

---

## 3. Requerimientos del proyecto

### Lenguaje y stack

- El proyecto está construido con TypeScript sobre Node.js moderno.
- Usa LangChain para componer el agente y orquestar el uso de herramientas.
- Se conecta a OpenRouter para acceder al modelo de lenguaje.
- Usa validación de configuración para asegurar que el entorno esté completo antes de ejecutar.
- Cuenta con pruebas automatizadas y validaciones de calidad para mantener estabilidad.

### Arquitectura y enfoque

La solución está dividida en capas claras para que cada parte tenga una responsabilidad concreta:

- Una capa de entrada recibe la pregunta del usuario.
- Una capa de ejecución coordina el proceso de respuesta.
- Una capa de composición arma el agente con su modelo, prompt y herramientas.
- Una capa de capacidades concentra las herramientas del dominio (cálculo y hora).
- Una capa de configuración centraliza y valida variables de entorno.

Este enfoque permite:

- Entender rápido qué hace cada módulo.
- Agregar nuevas herramientas sin reescribir todo.
- Probar piezas de forma aislada.
- Reducir riesgos al evolucionar el proyecto.

### Input esperado

El sistema espera preguntas escritas en lenguaje natural por parte del usuario.

Tipos de solicitudes contempladas hoy:

- Cuándo cuesta un vuelo de Buenos Aires a Madrid el 15 de julio?
- Cuánto cuesta un vuelo de Nueva York a París el próximo mes?
- Cuánto cuesta un vuelo de Tokio a Sídney?

Resultado esperado para el usuario:

- Respuesta en español.
- Explicación breve de lo que hizo el agente.
- Uso de herramientas solo cuando realmente aporta valor.

---

## 4. Restricciones

- Mantener el enfoque pedagógico: primero claridad, luego complejidad.
- Evitar agregar componentes que no aporten al objetivo principal del aprendizaje.
- No introducir dependencias innecesarias sin justificación funcional.
- Cuidar que cualquier mejora preserve compatibilidad con la ejecución por consola y pruebas existentes.
- Documentar claramente cualquier cambio en configuración, comportamiento o límites del agente.

---

## 5. Definition of Done (DoD)

El trabajo se considera terminado cuando:

- La nueva herramienta de consulta de precios de vuelos está implementada y funciona correctamente.
- El agente puede usar la herramienta para responder preguntas sobre precios de vuelos.
- Se han agregado pruebas automatizadas para la nueva herramienta y su integración con el agente.
- La documentación del proyecto se ha actualizado para incluir la nueva herramienta y cualquier cambio relevante en la configuración o uso del agente.
- El código sigue las buenas prácticas de calidad y es fácil de entender
- El proyecto se puede ejecutar sin errores y las pruebas pasan exitosamente.

---

## 6. Notas de implementación acordadas

- Nombre de la herramienta: `flight_prices`.
- Parámetros esperados:
	- `origin`: código IATA de 3 letras.
	- `destination`: código IATA de 3 letras.
	- `departureDate`: fecha en formato `YYYY-MM-DD`.
	- `passengers` (opcional, default `1`).
	- `currency` (opcional, default `USD`).
- La herramienta responde en texto claro en español para que el agente pueda explicarlo al usuario final.
- Si existe configuración de proveedor externo y responde correctamente, se usa ese precio.
- Si no hay configuración o el proveedor falla, la herramienta usa una estimación local determinista para mantener continuidad pedagógica y pruebas estables.
- Validaciones mínimas:
	- Fecha válida y no pasada.
	- Origen y destino distintos.
	- Códigos IATA válidos.
- Alcance fuera de esta iteración:
	- Reserva o compra de tickets.
	- Búsqueda multi-tramo o con escalas.
	- Predicción histórica de precios.
