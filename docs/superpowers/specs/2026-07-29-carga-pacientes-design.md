# Diseño — Carga de pacientes (masiva y manual)

*Brainstorming del 29 julio 2026. Aprobado por el usuario, sección por
sección, en conversación directa — este documento es la versión final
consolidada.*

## Problema

Hoy el único camino para que un paciente exista en la tabla `pacientes`
de Supabase es 100% automático: el paciente escribe por WhatsApp a la
clínica → n8n (workflow clonado por clínica) → agente IA → inserta en
Supabase. No existe ninguna forma manual ni de carga masiva en el
dashboard — `PatientsPage.tsx` es hoy de solo lectura sobre datos mock.

Una clínica dental real que se suma a Odontix ya tiene su propia base de
pacientes de antes (de su sistema anterior, de una planilla Excel, etc.).
Sin una forma de cargar esa base inicial, cada clínica arrancaría de cero
el día del onboarding.

Nota aparte (no bloqueante para este diseño): se detectó que
`pacientes.cliente_id` está en NULL en todos los datos reales actuales,
probablemente porque la plantilla de n8n nunca seteó ese campo al crear
pacientes (solo lo hace al crear citas, según `ONBOARDING_CLINICA.md`
Fase 4). El usuario está reacondicionando el workflow de n8n aparte, en
el VPS Nexaro — ese trabajo es independiente de esta función.

## Tres caminos que coexisten

1. **Carga masiva inicial** (admin, vía Excel/CSV) — el "seed" de arranque
   de una clínica nueva. Es el foco de este documento.
2. **Alta manual uno por uno** (la clínica, desde su propio panel) — para
   sumar pacientes nuevos día a día.
3. **Automático por WhatsApp** (ya existe, vía n8n) — sin cambios acá.

Los tres comparten la misma regla de identidad/duplicados (ver abajo),
para que un paciente se comporte igual sin importar por qué puerta entró.

## Enfoque técnico

**Todo en el frontend, sin backend nuevo.** El admin sube el archivo, se
parsea en el navegador (librería `xlsx`/SheetJS o equivalente, agregar
como nueva dependencia — soporta .xlsx y .csv), se mapean columnas, se
previsualiza, y al confirmar se hace el upsert directo contra Supabase
usando el mismo cliente (`@/lib/supabase`) que ya usa toda la app.

Se descartaron dos alternativas: un backend/Edge Function dedicado (no lo
justifica el volumen real de una lista de pacientes de una sola clínica),
y un widget de importación de terceros (agrega peso a un bundle que ya es
un único archivo HTML, y de todas formas habría que integrar ahí la
lógica de duplicados propia).

## Identidad y duplicados

**Clave de duplicado: `telefono` + `nombre` (combinados), dentro de la
misma clínica (`cliente_id`).** Se decidió así y no solo por teléfono
porque el esquema real ya tiene un campo `contacto_id` separado de
`pacientes.id` — un mismo número de WhatsApp (ej. el de una madre) puede
corresponder a más de un paciente (ej. sus hijos). Usar solo teléfono
fusionaría por error a esas personas distintas en un solo registro.

**Campos obligatorios: `nombre` y `telefono` únicamente.** Todo lo demás
(`email`, `fecha_nacimiento`, `dni`, `genero`, `cobertura`, `direccion`,
`notas_medicas`, `tags`) es opcional — la clínica lo completa después, en
la entrevista con el paciente o cuando quiera, editando el registro.

**Al encontrar una coincidencia (mismo teléfono+nombre en la misma
clínica): actualizar, no omitir.** Rellena los campos que el paciente
existente tenga vacíos con lo que traiga el archivo — nunca borra un dato
que ya existía si el archivo viene vacío en ese campo.

**Filas inválidas (sin nombre o sin teléfono): se omiten, no bloquean el
resto de la carga.** Al final se muestra un resumen: cuántos nuevos,
cuántos actualizados, cuántos omitidos y en qué filas (para que el admin
pueda corregir el archivo y reintentar solo esas).

## Carga masiva — flujo de 4 pasos (admin)

**Dónde vive:** botón nuevo **"Cargar pacientes"** en `AdminClinicasPage`,
junto al botón "Ver como" de cada fila de clínica — abre un asistente
scopeado a esa clínica (`cliente_id` ya conocido por contexto, no se pide
a mano).

1. **Subir archivo** — input de archivo, acepta `.xlsx` y `.csv`.
2. **Mapear columnas** — se detectan las columnas del archivo y se
   muestran dropdowns para asignar cada una a un campo de Odontix
   (Nombre, Teléfono, Email, Fecha nacimiento, DNI, Género, Cobertura,
   Dirección, Notas). Nombre y Teléfono se marcan visualmente como
   obligatorios; el resto puede quedar "sin mapear".
3. **Previsualizar** — tabla con las primeras ~10 filas ya mapeadas según
   la elección del paso 2, antes de tocar la base real.
4. **Confirmar e importar** — se procesan todas las filas aplicando la
   regla de duplicados e inserción/actualización de arriba, y se muestra
   el resumen final (nuevos / actualizados / omitidos con número de fila).

## Alta manual (la clínica)

En `PatientsPage.tsx`, un botón **"Nuevo paciente"** que abre un modal —
mismo patrón visual que el modal "Nueva clínica" de `AdminClinicasPage`.
Campos: Nombre* y Teléfono* obligatorios, resto opcional. Al guardar,
aplica la misma regla de duplicados dentro de la clínica del usuario
logueado (`cliente_id` tomado de la sesión, no editable). Si ya existe un
paciente con ese teléfono+nombre en esa clínica, actualiza en vez de
crear uno nuevo.

## Fuera de alcance (explícitamente no se construye acá)

- Cualquier lógica de "¿el turno es para vos o para otra persona?" en la
  conversación de WhatsApp — eso vive en el workflow de n8n, que el
  usuario está reacondicionando por separado.
- Arreglar que `pacientes.cliente_id` esté en NULL en los datos actuales
  de n8n — es un problema del workflow, no de esta función del dashboard.
- Exportar pacientes, eliminar en masa, o cualquier otra operación sobre
  pacientes existentes más allá de crear/actualizar por carga o alta
  manual.

## Preguntas cerradas en esta sesión (no reabrir sin nueva evidencia)

- ¿Admin o clínica sube el Excel? → Ambos caminos coexisten (admin para
  el seed inicial, clínica para altas del día a día), más el automático
  de WhatsApp que ya existía.
- ¿Formato fijo o mapeo flexible de columnas? → Mapeo flexible.
- ¿Teléfono solo o teléfono+nombre como clave de duplicado? → Teléfono +
  nombre, por el caso de una madre sacando turno para un hijo con el
  mismo número.
- ¿Actualizar o ignorar en caso de duplicado? → Actualizar (rellenar
  vacíos, nunca borrar lo existente).
- ¿Bloquear toda la carga si hay filas inválidas, u omitir y avisar? →
  Omitir y avisar con resumen.

## Siguiente paso

Escribir el plan de implementación (skill `writing-plans`) a partir de
este spec.
