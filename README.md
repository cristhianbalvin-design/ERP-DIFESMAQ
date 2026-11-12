# OPERA · DIFESMAQ

Sitio estático de seguimiento del desarrollo de OPERA y de la agenda de capacitación de DIFESMAQ. La raíz publicada es `docs-cliente/gantt/`; también puede abrirse `index.html` directamente en el navegador. No necesita servidor ni dependencias JavaScript.

## Actualización

1. Editar los archivos JSON correspondientes en `docs-cliente/gantt/datos/`.
2. Con Node.js 22, ejecutar desde la raíz `node scripts/generar-gantt.mjs`. El generador consulta el catálogo de `origin/main` del repositorio hermano `../ERP - TIDEO`; si Node no puede ejecutar Git (por ejemplo, por permisos del entorno), usa el archivo en disco del repositorio vecino e indica esa fuente en la salida. Conviene que el repositorio vecino esté en `main` actualizado. Se puede elegir otro directorio con `--erp "ruta"` o la variable `GANTT_ERP_DIR`.
3. Revisar el resultado y publicar la carpeta `docs-cliente/gantt/`.

Para comprobar que `datos.js` está actualizado sin modificarlo, ejecutar `node scripts/generar-gantt.mjs --verificar`. La comparación ignora la fecha de generación; devuelve código 1 si hay diferencias. Para probar con copias de los JSON se puede usar `--datos "ruta"`.

## Estado de capacitación

En `docs-cliente/gantt/datos/capacitacion.json`, buscar la sesión por su `id` y cambiar `estado` por `programada`, `confirmada`, `realizada` o `reprogramada`, según corresponda. Guardar y ejecutar nuevamente el generador. Las fechas son propuestas sujetas a la disponibilidad de DIFESMAQ.
