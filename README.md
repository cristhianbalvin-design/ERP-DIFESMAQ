# OPERA · DIFESMAQ

Sitio estático de seguimiento del desarrollo de OPERA y de la agenda de capacitación de DIFESMAQ. La raíz publicada es `docs-cliente/gantt/`; también puede abrirse `index.html` directamente en el navegador.

## Actualización automática

Al abrir la página se muestra inmediatamente la copia incluida en `datos.js` y después se consulta en vivo el catálogo público del ERP. El indicador de Desarrollo muestra el origen y, cuando está disponible, la fecha del último cambio. Si falla la conexión o el repositorio del ERP deja de ser público, la página sigue mostrando la copia.

GitHub Actions actualiza esa copia todos los días a las 11:23 UTC (06:23 en Lima), y al cambiar el plan, los scripts o el cálculo en `main`. Para forzarla, ir a **Actions → Actualizar Gantt → Run workflow** (`workflow_dispatch`). Si hay cambios válidos, el workflow publica un commit en `main` y Vercel despliega el sitio.

Para generar manualmente, usar Node.js 22 y ejecutar `node scripts/generar-gantt.mjs`. El catálogo se obtiene de `origin/main` del repositorio hermano `../ERP - TIDEO` o, si Git no está disponible, del archivo en disco. Se puede elegir otro directorio con `--erp "ruta"` o `GANTT_ERP_DIR`, o dar prioridad a una URL con `--catalogo-url <url>`. Para comprobar la copia sin escribir, agregar `--verificar`: ignora la fecha de generación, devuelve 2 ante diferencias y 1 ante errores. `--datos "ruta"` permite utilizar otro directorio de datos.

## Estado de capacitación

En `docs-cliente/gantt/datos/capacitacion.json`, buscar la sesión por su `id` y cambiar `estado` por `programada`, `confirmada`, `realizada` o `reprogramada`, según corresponda. Los cambios en `main` actualizan la copia automáticamente; también se puede ejecutar el generador manualmente. Una sesión pasada que siga programada o confirmada se muestra como «Por registrar», sin alterar el JSON. Las fechas son propuestas sujetas a la disponibilidad de DIFESMAQ.
