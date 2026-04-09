---
name: Code modularity preference
description: User wants code split into small, focused files — no large monolithic files
type: feedback
---

Mantener el código modular: cada archivo debe tener máximo 300 líneas y una responsabilidad clara. Si un archivo crece demasiado, dividirlo en módulos separados.

**Why:** El usuario prefiere archivos pequeños y enfocados para mejor mantenibilidad y legibilidad.

**How to apply:** Antes de agregar código a un archivo existente, evaluar si conviene extraer lógica a un archivo nuevo. Aplicar especialmente en rutas, controladores, servicios y validaciones.
