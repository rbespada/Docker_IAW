# 📊 GUÍA DE PRESENTACIÓN - PROYECTO WEBSTACK

## Cómo Defender Este Proyecto

---

## 📋 ESTRUCTURA DE LA PRESENTACIÓN (10-15 minutos)

### **MINUTO 1-2: INTRODUCCIÓN**

Decir:
> "He desarrollado una tienda online funcional que demuestra la arquitectura cliente-servidor con Nginx y Node.js. El proyecto cumple todos los requisitos académicos solicitados con código implementado, documentación completa y ejemplos prácticos."

**Mostrar en pantalla:**
- Abrir http://localhost/ (si está desplegado)
- O mostrar capturas de pantalla

---

### **MINUTO 3-4: REQUISITO 1 - ANÁLISIS DE ARQUITECTURA**

**Mostrar archivo:** `doc/ARQUITECTURA.md` - Sección 1

**Explicar:**
1. Modelo cliente-servidor
   - "El cliente (navegador) envía peticiones al servidor Nginx"
   - "Nginx actúa como reverse proxy hacia Node.js"
   - "Node.js procesa lógica y consulta la BD"

2. Componentes
   - Navegador → Nginx → Node.js → SQLite
   - Diagrama ASCII en el documento

3. Flujo de comunicación
   - DNS → TCP → TLS → HTTP

**Demostración:**
- Abrir dev tools del navegador (F12)
- Mostrar petición a /api/productos
- Headers y respuesta JSON

---

### **MINUTO 5-6: REQUISITO 2 - TIPOLOGÍA DE WEB**

**Mostrar archivo:** `doc/ARQUITECTURA.md` - Sección 2

**Explicar:**
1. Requisitos del cliente:
   - "La tienda necesita catálogo interactivo"
   - "Carrito de compras con estado persistente"
   - "Gestión de usuarios y precios dinámicos"

2. Por qué dinámico y no estático:
   - "Un sitio estático no puede tener carrito"
   - "No permite actualizaciones en tiempo real"
   - "No soporta múltiples usuarios simultáneos"

3. Tabla comparativa:
   - Mostrar tabla en la documentación
   - Explicar cada fila

**Demostración práctica:**
- Ir a /catalogo
- Hacer clic en un producto
- Mostrar cómo agrega al carrito
- Demostrar que es dinámico: actualizar página, carrito sigue ahí

---

### **MINUTO 7-9: REQUISITO 3 - SELECCIÓN TECNOLÓGICA**

**Mostrar archivo:** `doc/ARQUITECTURA.md` - Sección 3

**Explicar por qué Nginx:**

Comparativa:
```
Apache: Flexible pero consume mucha memoria
Nginx:  ✅ Bajo consumo, excelente reverse proxy
IIS:    Solo para Windows/.NET
```

**Ventajas de Nginx:**
1. "Arquitectura event-driven - maneja miles de conexiones"
2. "Bajo consumo de memoria"
3. "Reverse proxy excelente para Node.js"
4. "Caché y compresión nativa"

**Demostraciones técnicas:**
- Abrir `nginx/nginx.conf`
- "Veis el upstream app:3000 - esto es el reverse proxy"
- Mostrar caché para estáticos (30 días)
- Mostrar compresión GZIP (location ~* \.js|\.css)
- Mostrar headers de seguridad

**Verificar en navegador:**
- F12 → Network
- Ver header "Content-Encoding: gzip"
- Ver header Cache-Control

---

### **MINUTO 10-12: REQUISITO 4 - FUNCIONAMIENTO HTTP**

**Mostrar archivo:** `doc/ARQUITECTURA.md` - Sección 4

**Explicar flujo paso a paso:**

1. **DNS:** Usuario escribe URL → se resuelve a IP
2. **TCP:** 3-way handshake para establecer conexión
3. **TLS:** Negociación HTTPS (certificados)
4. **HTTP REQUEST:**
   ```
   GET /api/productos HTTP/1.1
   Host: tienda.com
   Accept: application/json
   ```

5. **NGINX DECISION:**
   - ¿Es /api/? → Reenviar a Node.js
   - ¿Es /images/? → Servir desde caché
   
6. **NODE.JS PROCESSING:**
   - Valida sesión
   - Consulta BD: SELECT * FROM productos
   - Renderiza respuesta

7. **HTTP RESPONSE:**
   ```
   HTTP/1.1 200 OK
   Content-Type: application/json
   Content-Encoding: gzip
   Cache-Control: max-age=3600
   
   {"resultado": [...]}
   ```

8. **CLIENTE:** Descomprime, parsea JSON, actualiza DOM

**Demostración en vivo:**
- Abrir navegador dev tools (F12)
- Network tab
- Hacer petición (buscar producto)
- Mostrar:
  - Request: GET /api/productos
  - Response: JSON con productos
  - Headers: Content-Encoding: gzip
  - Time: mostrar que es muy rápido

---

### **MINUTO 13-14: REQUISITO 5 - SEGURIDAD Y MANTENIMIENTO**

**Mostrar archivo:** `doc/ARQUITECTURA.md` - Sección 5

**A. BACKUPS:**
- "Script automático cada día a las 22:00"
- Mostrar: `scripts/backup.sh`
- "Comprime con GZIP, retiene 30 días"
- "Permite restauración: `scripts/restore.sh`"

**B. SEGURIDAD:**
- HTTP headers (X-Frame-Options, CSP)
- Validación de entrada (prevención SQL Injection)
- Rate limiting en Nginx
- Cookies seguras (HttpOnly, Secure)

**C. CERTIFICADOS TLS:**
- Let's Encrypt (gratuito)
- Renovación automática
- Fuerza HTTPS

**D. FIREWALL:**
- UFW habilitado
- Solo puertos 22, 80, 443
- Fail2Ban contra ataques de fuerza bruta

**Demostraciones:**
- Mostrar certificado TLS: Click en candado → Ver certificado
- Mostrar headers de seguridad: F12 → Network → Response Headers
- Mostrar backup script: `cat scripts/backup.sh | head -20`

---

### **MINUTO 15: CONCLUSIÓN**

Decir:
> "Este proyecto demuestra una arquitectura profesional cliente-servidor con Nginx como reverse proxy, Node.js como servidor de aplicación, y todas las prácticas de seguridad y mantenimiento necesarias para producción."

**Preguntar si hay dudas**

---

## 🎯 PUNTOS CLAVE A ENFATIZAR

1. **Dinámico vs Estático:** "El carrito prueba que es dinámico"
2. **Por qué Nginx:** "Es event-driven, consume poco y es excelente proxy"
3. **HTTP Flujo:** "Mostrar real en dev tools"
4. **Seguridad:** "Backups automáticos, headers, validación de entrada"

---

## 💻 PREPARAR ENTORNO PARA PRESENTACIÓN

### **Antes de empezar:**

```bash
# 1. Desplegar proyecto
cd /workspaces/Docker_IAW
docker-compose up -d

# 2. Esperar a que inicie (30 segundos)
sleep 30

# 3. Verificar
docker-compose ps
# Debería mostrar: app (running) y nginx (running)

# 4. Probar en navegador
open http://localhost/
```

### **Tener abiertos estos archivos:**

- Terminal con `docker-compose logs -f` (si falla algo)
- `doc/ARQUITECTURA.md` en editor (para mostrar)
- Navegador en http://localhost/ (demostración práctica)
- Dev tools abierto (F12) para ver requests

---

## 🔍 PREGUNTAS ESPERADAS Y RESPUESTAS

### P1: "¿Por qué Nginx y no Apache?"
R: "Nginx usa arquitectura event-driven que maneja miles de conexiones simultáneas con bajo consumo. Apache es más flexible pero consume más memoria. Para este proyecto dinámico, Nginx es más eficiente."

### P2: "¿Cómo sabe Nginx qué es estático y qué dinámico?"
R: "Se configura en nginx.conf. Si la URL contiene /api/, se reenvía a Node.js. Si es /images/ o estáticos, se sirven desde caché. Es un reverse proxy inteligente."

### P3: "¿Cómo funcionan los backups?"
R: "Hay un script que a las 22:00 exporta la BD SQLite, la comprime con GZIP y la guarda. Retiene 30 días locales. Para restaurar, hay otro script que descomprime e importa."

### P4: "¿Es seguro para producción?"
R: "Tiene medidas básicas: HTTPS, headers de seguridad, validación de entrada, rate limiting, firewall. Para producción máxima, necesitaría WAF, load balancer, y múltiples servidores."

### P5: "¿Cómo escalas si crece el tráfico?"
R: "Nginx está preparado como load balancer. Podría tener múltiples instancias de Node.js detrás. También CDN para estáticos y base de datos PostgreSQL en lugar de SQLite."

---

## 📊 CHECKLIST PRE-PRESENTACIÓN

- [ ] Docker ejecutándose
- [ ] Proyecto desplegado (http://localhost/ funciona)
- [ ] Terminal preparado con logs
- [ ] Navegador con dev tools abierto
- [ ] Documentación a mano (doc/ARQUITECTURA.md)
- [ ] Código visible (app/server.js, nginx.conf)
- [ ] Conexión a internet estable
- [ ] Proyector funcionando (si es presencial)

---

## ⏱️ TIMING DE PRESENTACIÓN RECOMENDADO

```
0:00-1:00   Intro y lo que voy a mostrar
1:00-3:00   Req. 1: Arquitectura (mostrar doc + demo)
3:00-5:00   Req. 2: Dinámico (tabla + demo en navegador)
5:00-8:00   Req. 3: Nginx (comparativa + código config)
8:00-12:00  Req. 4: HTTP (explicar flujo + dev tools)
12:00-14:00 Req. 5: Seguridad (backups + headers)
14:00-15:00 Conclusión y preguntas
```

---

## 📁 ARCHIVOS A MOSTRAR DURANTE PRESENTACIÓN

1. **Documentación:** `doc/ARQUITECTURA.md`
2. **Código:** `app/server.js`, `nginx/nginx.conf`
3. **Config:** `docker-compose.yml`
4. **Scripts:** `scripts/backup.sh`
5. **Navegador:** http://localhost/ (en vivo)
6. **Dev Tools:** F12 para mostrar requests reales

---

## 🎓 CÓMO RESPONDER A CORRECTOR

**Estructura recomendada:**

1. **Pregunta:** "Explica el flujo HTTP"
2. **Mi respuesta:**
   - "El cliente envía GET /api/productos a través del navegador"
   - "Llega a Nginx en puerto 80"
   - "Nginx ve que es /api/ → reenvía a Node.js:3000"
   - "Node.js consulta SQLite y responde con JSON"
   - "Nginx reenvía al cliente con Content-Encoding: gzip"
   - "Cliente descomprime y renderiza"
   - *(Mostrar en dev tools)*

3. **Añadir detalles técnicos:**
   - Mencionar TCP, TLS, DNS cuando sea relevante
   - Citar códigos HTTP (200, 404, 500)
   - Hablar de headers de seguridad

---

## 💡 CONSEJOS FINALES

✅ **Haz:**
- Confía en tu documentación (está muy completa)
- Demuestra en navegador (es lo que importa)
- Usa ejemplos reales del código
- Menciona por qué Nginx (examen suele preguntar)

❌ **No hagas:**
- Leas solo de las diapositivas
- Hables de cosas no implementadas
- Inventes respuestas técnicas (es mejor decir "no lo sé")
- Olvides mostrar que funciona en vivo

---

**¡BUENA SUERTE EN TU PRESENTACIÓN!** 🎓✨
