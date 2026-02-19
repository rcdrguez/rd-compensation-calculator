# rd-compensation-calculator

Web app SaaS para profesionales en República Dominicana que necesitan estimar salario neto, comparar ofertas y calcular prestaciones con reglas configurables por año.

> **Disclaimer legal:** Este proyecto ofrece estimaciones y no reemplaza cálculos oficiales ni asesoría legal/laboral.

## Features
- Cálculo de neto mensual/anual (TSS + ISR estimado).
- Total compensation con bonos y beneficios monetizados.
- Comparador de ofertas (12/24/36 meses) con ganador y razones explicables.
- Prestaciones: preaviso, cesantía, vacaciones y regalía proporcional.
- Panel de configuración con presets, overrides, y export/import JSON.
- Auto-extracción desde texto con fallback determinístico por regex.

## Rutas
- `/neto`
- `/comparar`
- `/prestaciones`
- `/configuracion`

## Capturas
- ![Dashboard placeholder](docs/screenshots/dashboard-placeholder.png)

## Desarrollo local
```bash
npm install
npm run dev
npm run test
npm run build
```

## Configuración
1. Ve a `/configuracion`.
2. Elige preset (RD 2025 / RD 2026).
3. Edita parámetros y guarda.
4. Exporta/importa JSON para compartir reglas.

## Roadmap
- Mejorar editor granular de brackets ISR y reglas laborales.
- Gráficas de sensibilidad por escenarios.
- Opción IA local embebida (modelo liviano en navegador) para extracción avanzada.
