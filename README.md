<div align="center">
  <h1>Azukar IDE</h1>
  <p>Entorno de desarrollo, síntesis y programación WebUSB para FPGAs Lattice iCE40</p>

  [![Estado](https://img.shields.io/badge/Estado-Activo-success?style=for-the-badge&logoSize=auto)]()
  [![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg?style=for-the-badge&logoSize=auto)](LICENSE)
  [![Vue.js](https://img.shields.io/badge/_-Vue.js_3-4FC08D.svg?style=for-the-badge&logo=vuedotjs&logoColor=white&logoSize=auto)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/_-TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white&logoSize=auto)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/_-Tailwind_CSS-06B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white&logoSize=auto)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/_-Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white&logoSize=auto)](https://vite.dev/)
  [![WebAssembly](https://img.shields.io/badge/_-WebAssembly-654FF0.svg?style=for-the-badge&logo=webassembly&logoColor=white&logoSize=auto)](https://webassembly.org/)
  [![WebUSB](https://img.shields.io/badge/_-WebUSB-005C84.svg?style=for-the-badge&logo=usb&logoColor=white&logoSize=auto)]()
  [![GitHub Pages](https://img.shields.io/badge/_-GitHub_Pages-222222.svg?style=for-the-badge&logo=github&logoColor=white&logoSize=auto)](https://valenting182.github.io/Azukar-IDE/)
  [![Yosys](https://img.shields.io/badge/_-Yosys-FF8000.svg?style=for-the-badge&logo=logoColor=white&logoSize=auto)](https://yosyshq.net/yosys/)
  [![nextpnr](https://img.shields.io/badge/_-nextpnr-339933.svg?style=for-the-badge&logoSize=auto)](https://github.com/YosysHQ/nextpnr)
  [![FTDI](https://img.shields.io/badge/_-FT2232H-E31B23.svg?style=for-the-badge&logoSize=auto)](https://ftdichip.com/)
</div>

[Español](#español) | [English](#english)

---

# Español

## Descripción general

Azukar IDE es un entorno de desarrollo integrado (IDE) y programador basado en estándares web (WebUSB y Web Serial) orientado a la arquitectura FPGA Lattice iCE40. Permite desarrollar código Verilog HDL, ejecutar síntesis lógica y Place & Route directamente en el cliente mediante WebAssembly, y transferir bitstreams a la memoria Flash SPI o a la SRAM del dispositivo sin requerir software instalado ni cadenas de compilación nativas en el sistema anfitrión.

Desarrollado en el marco del proyecto Azukar FPGA (orientado a la enseñanza de sistemas digitales en Ingeniería Electrónica), el sistema busca resolver los cuellos de botella habituales en laboratorios universitarios, donde las restricciones de permisos administrativos y la complejidad de instalación de suites EDA comerciales dificultan el flujo de trabajo inicial.

## Características técnicas

- **Entorno de edición y verificación sintáctica:**
  - Editor basado en CodeMirror 6 con resaltado, autocompletado y linter en tiempo real para Verilog HDL.
  - Comprobación rápida de jerarquía y tipos sin compilación completa (`read_verilog` y `hierarchy -check`).
  - Validación de restricciones físicas (`.pcf`) contra los puertos del módulo superior (*top*), alertando sobre señales no declaradas o pines duplicados.
  - Editor en vista dividida (Split-View) para trabajar simultáneamente con módulos instanciados o archivos de restricciones.

- **Cadena de síntesis en el navegador (WebAssembly):**
  - Ejecución local mediante YoWASP (Yosys para síntesis lógica y nextpnr-ice40 para ubicación y ruteo).
  - Generación de bitstreams `.bin` con `icepack`.
  - Reporte de utilización de recursos (celdas lógicas LC, bloques BRAM, pines de E/S, PLL) y cálculo de frecuencia máxima operativa (Fmax) frente al camino crítico.
  - Flujo de compilación desacoplado: posibilidad de sintetizar y descargar el bitstream `.bin` de forma independiente sin conectar hardware físico.

- **Programación hardware vía WebUSB (FTDI FT2232H):**
  - Interfaz directa con el Canal A del chip FT2232H mediante comandos MPSSE.
  - Programación de memoria SPI Flash con verificación byte a byte del bitstream transferido.
  - Carga volátil ultrarrápida directamente en la SRAM de la FPGA mediante bitbang (ADBUS2), reduciendo tiempos de prueba y evitando el desgaste de la memoria Flash.
  - Control de líneas de estado y reset de hardware (`CRESET_B`, `CDONE`, `CS`).

- **Monitor serie integrado (Web Serial):**
  - Comunicación serie con el Canal B del FTDI a 115200 baudios (8N1).
  - Modos de visualización: texto con marcas temporales, volcado hexadecimal y graficador numérico en tiempo real.
  - Consola interactiva con historial de comandos.

- **Arquitectura y persistencia:**
  - Ejecución 100% en el cliente: el código fuente no se transfiere a ningún servidor externo.
  - Gestión multiproyecto respaldada en `localStorage`.
  - Operación fuera de línea (*offline*) mediante Service Worker para la caché de binarios WebAssembly.
  - Exportación e importación completa del proyecto en archivos comprimidos `.zip` y compartición mediante enlaces autocontenidos en el hash de la URL.

## Placas soportadas

El sistema es compatible con placas basadas en FPGAs Lattice iCE40 que utilicen el puente USB FTDI FT2232H:

| Placa | FPGA | Encapsulado | Interfaz USB | Configuración |
| :--- | :--- | :--- | :--- | :--- |
| **Azukar v2** | Lattice iCE40-HX4K | TQFP-144 | FTDI FT2232H (MPSSE + UART) | `boards/azukar-v2/` |
| **Alhambra II** | Lattice iCE40-HX4K | TQFP-144 | FTDI FT2232H (MPSSE + UART) | `boards/alhambra-ii/` |
| **EDU-CIAA-FPGA** | Lattice iCE40-HX4K | TQFP-144 | FTDI FT2232H (MPSSE + UART) | `boards/edu-ciaa-fpga/` |
| **Placas personalizadas** | iCE40 (LP/HX/UP) | Cualquiera | FTDI FT2232H o compatible | Configurable desde la interfaz |

## Tecnologías utilizadas

- **Frontend:** Vue.js 3 (Composition API), TypeScript, Tailwind CSS, Vite.
- **Editor de código:** CodeMirror 6.
- **EDA WebAssembly:** YoWASP (Yosys, nextpnr-ice40, Project IceStorm).
- **APIs Web de Hardware:** WebUSB API, Web Serial API, File System Access API.
- **Despliegue e integración continua:** GitHub Pages, GitHub Actions.

## Ejecución y acceso

### Acceso web directo (Recomendado)

La aplicación está disponible en línea y lista para ser ejecutada directamente en el navegador sin requerir ninguna instalación local:

**https://valenting182.github.io/Azukar-IDE/**

Requisitos de acceso:
- Navegador basado en Chromium con soporte para WebUSB y Web Serial (Google Chrome o Microsoft Edge, versión 89 o superior).
- Al servirse bajo protocolo seguro HTTPS, el navegador habilita automáticamente el acceso al hardware USB para detectar, programar y comunicarse con la placa FPGA.

### Desarrollo local

Para clonar el proyecto y trabajar en el entorno de desarrollo local con recarga en vivo:

```bash
git clone https://github.com/valenting182/Azukar-IDE.git
cd Azukar-IDE/web
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Licencia

Este proyecto se distribuye bajo los términos de la Licencia MIT. Para más información, consulte el archivo [LICENSE](LICENSE).

---

# English

## Overview

Azukar IDE is a web-based integrated development environment (IDE), logic synthesizer, and hardware programmer built on modern browser standards (WebUSB and Web Serial) for the Lattice iCE40 FPGA architecture. It enables writing Verilog HDL code, running logic synthesis and Place & Route directly on the client machine via WebAssembly, and programming bitstreams to either SPI Flash or SRAM without requiring vendor toolchain installations or local build dependencies.

Developed within the Azukar FPGA project (focused on digital systems education in Electronic Engineering), the project addresses common constraints in university labs, where restricted user privileges and software deployment overhead hinder the learning experience.

## Technical Features

- **Code Editing and Syntax Analysis:**
  - CodeMirror 6 editor with syntax highlighting, code autocompletion, and real-time Verilog linting.
  - Fast hierarchy and type verification without invoking full synthesis (`read_verilog` and `hierarchy -check`).
  - Physical constraint checking (`.pcf`) against the top module port definitions, flagging undeclared signals or duplicate physical pins prior to compilation.
  - Split-view editor for side-by-side editing of instanced modules and constraint files.

- **In-Browser Synthesis Toolchain (WebAssembly):**
  - Client-side execution via YoWASP (Yosys for logic synthesis and nextpnr-ice40 for place and route).
  - Bitstream generation (`.bin`) using `icepack`.
  - Comprehensive resource utilization reporting (Logic Cells, BRAM blocks, IO pads, PLLs) and critical-path timing estimation (Fmax).
  - Decoupled compilation pipeline: synthesize and export intermediate artifacts (`.bin`, `.asc`, `.json`) without requiring a connected board.

- **Hardware Flashing via WebUSB (FTDI FT2232H):**
  - Direct communication with FTDI FT2232H Channel A through MPSSE commands.
  - SPI Flash programming with byte-by-byte hardware verification against the uploaded bitstream.
  - Volatile SRAM configuration via bitbang over ADBUS2, optimizing iteration speed and eliminating Flash write cycle wear.
  - Dedicated hardware reset and status line control (`CRESET_B`, `CDONE`, `CS`).

- **Integrated Serial Monitor (Web Serial):**
  - Serial communication with FTDI Channel B at 115200 baud (8N1).
  - Multiple display modes: timestamped text logs, hexadecimal stream inspection, and real-time numerical signal plotting.
  - Interactive console input with command history buffer.

- **Architecture and Persistence:**
  - 100% client-side execution: HDL source code remains strictly local and is never uploaded to remote servers.
  - Multi-project management backed by `localStorage`.
  - Full offline capability supported by a Service Worker that caches WebAssembly binaries.
  - Complete project import/export via `.zip` files and stateless project sharing through compressed URL hash fragments.

## Supported Boards

Compatible with Lattice iCE40 boards that integrate an FTDI FT2232H dual USB-serial/FIFO interface:

| Board | FPGA | Package | USB Interface | Configuration |
| :--- | :--- | :--- | :--- | :--- |
| **Azukar v2** | Lattice iCE40-HX4K | TQFP-144 | FTDI FT2232H (MPSSE + UART) | `boards/azukar-v2/` |
| **Alhambra II** | Lattice iCE40-HX4K | TQFP-144 | FTDI FT2232H (MPSSE + UART) | `boards/alhambra-ii/` |
| **EDU-CIAA-FPGA** | Lattice iCE40-HX4K | TQFP-144 | FTDI FT2232H (MPSSE + UART) | `boards/edu-ciaa-fpga/` |
| **Custom Boards** | iCE40 (LP/HX/UP) | Any | FTDI FT2232H or compatible | Configurable in UI |

## Technologies

- **Frontend:** Vue.js 3 (Composition API), TypeScript, Tailwind CSS, Vite.
- **Code Editor:** CodeMirror 6.
- **WebAssembly EDA:** YoWASP (Yosys, nextpnr-ice40, Project IceStorm).
- **Web Hardware APIs:** WebUSB API, Web Serial API, File System Access API.
- **Deployment & CI/CD:** GitHub Pages, GitHub Actions.

## Getting Started

### Direct Web Access (Recommended)

The application is deployed online and ready to run directly from the browser without any local installation:

**https://valenting182.github.io/Azukar-IDE/**

Access Requirements:
- Chromium-based browser supporting WebUSB and Web Serial (Google Chrome or Microsoft Edge, version 89 or higher).
- Served over secure HTTPS, enabling native browser access to USB hardware for detection, programming, and UART communication.

### Local Development

To clone the repository and run the application locally with hot-module replacement (HMR):

```bash
git clone https://github.com/valenting182/Azukar-IDE.git
cd Azukar-IDE/web
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## License

This project is distributed under the terms of the MIT License. See [LICENSE](LICENSE) for details.
