// @ts-nocheck
const codeReviewsPairProgramming = `
    <div class="content-section">
        <h1 id="code-reviews-pair-programming">Code Reviews y Pair Programming</h1>
        <p>Mejores prácticas para code reviews efectivos y pair programming en equipos PrestaShop 8.9+ para aumentar calidad de código.</p>

        <h2 class="section-title">1. Code Reviews</h2>

        <div class="alert alert-info">
            <strong>📝 Beneficios del Code Review:</strong>
            <ul class="mb-0">
                <li>Detecta bugs antes de producción</li>
                <li>Mejora la calidad del código</li>
                <li>Transfiere conocimiento en el equipo</li>
                <li>Asegura consistencia en el estilo</li>
                <li>Identifica mejoras de arquitectura</li>
                <li>Mentoring de desarrolladores junior</li>
                <li>Documentación implícita del código</li>
            </ul>
        </div>

        <h2 class="section-title">2. Checklist de Code Review</h2>

        <h3>2.1. Funcionalidad</h3>

        <pre><code class="language-markdown">## Funcionalidad
- [ ] El código hace lo que se supone que debe hacer
- [ ] Los edge cases están manejados
- [ ] Los errores se manejan apropiadamente
- [ ] No hay lógica redundante o innecesaria
- [ ] Los cambios no rompen funcionalidad existente

## Tests
- [ ] Hay tests unitarios para nueva funcionalidad
- [ ] Los tests cubren casos límite
- [ ] Todos los tests pasan
- [ ] Mock/stubs apropiados en tests
- [ ] Tests integration si es necesario
</code></pre>

        <h3>2.2. Código Limpio</h3>

        <pre><code class="language-markdown">## Legibilidad
- [ ] Nombres de variables/funciones descriptivos
- [ ] Funciones pequeñas y con propósito único
- [ ] Comentarios solo donde son necesarios
- [ ] Sin código comentado (usar git)
- [ ] Sin console.log / var_dump olvidados

## Arquitectura
- [ ] Sigue principios SOLID
- [ ] No hay duplicación de código (DRY)
- [ ] Separación de responsabilidades clara
- [ ] Dependencias bien inyectadas
- [ ] Patrón de diseño apropiado

## Performance
- [ ] No hay queries N+1
- [ ] Cache implementado donde corresponde
- [ ] Assets optimizados
- [ ] Lazy loading cuando es apropiado
- [ ] Sin memory leaks
</code></pre>

        <h3>2.3. Seguridad</h3>

        <pre><code class="language-markdown">## Seguridad
- [ ] Inputs validados y sanitizados
- [ ] Outputs escaped apropiadamente
- [ ] SQL injection prevenido (prepared statements)
- [ ] XSS prevenido
- [ ] CSRF tokens en formularios
- [ ] Autenticación/autorización verificadas
- [ ] Datos sensibles no en logs
- [ ] Secrets no hardcoded
</code></pre>

        <h2 class="section-title">3. Proceso de Code Review</h2>

        <h3>3.1. Antes del Review (Autor)</h3>

        <pre><code class="language-bash"># 1. Self-review primero
git diff main...feature-branch

# 2. Ejecutar tests
composer test

# 3. Ejecutar linters
composer cs:fix
composer phpstan

# 4. Actualizar descripción del PR
# - ¿Qué cambia?
# - ¿Por qué?
# - ¿Cómo probarlo?
# - Screenshots si aplica
</code></pre>

        <h3>3.2. Pull Request Template</h3>

        <pre><code class="language-markdown"><!-- .github/pull_request_template.md -->
## Descripción
<!-- ¿Qué hace este PR? -->

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Refactoring
- [ ] Documentación

## ¿Cómo probarlo?
1. 
2. 
3. 

## Checklist
- [ ] Self-review realizado
- [ ] Tests añadidos/actualizados
- [ ] Tests pasan localmente
- [ ] Documentación actualizada
- [ ] Sin console.log/var_dump
- [ ] Linters pasan (phpstan, phpcs)

## Screenshots (si aplica)


## Issue relacionado
Closes #

## Notas adicionales
</code></pre>

        <h3>3.3. Durante el Review (Reviewer)</h3>

        <pre><code class="language-markdown">## Metodología 4-Eyes

### Primera Pasada (5 min)
- Leer descripción del PR
- Entender el contexto
- Ver los archivos changed
- Identificar áreas críticas

### Segunda Pasada (15-30 min)
- Revisar código línea por línea
- Probar localmente si es necesario
- Verificar tests
- Buscar edge cases

### Tercera Pasada (10 min)
- Dejar comentarios constructivos
- Aprobar, solicitar cambios, o comentar
- Etiquetar PR apropiadamente
</code></pre>

        <h2 class="section-title">4. Tipos de Comentarios</h2>

        <h3>4.1. Comentarios Efectivos</h3>

        <pre><code class="language-markdown">## ✅ Bueno
**Problema:** Este método tiene complejidad ciclomática de 15.
**Sugerencia:** Considera extraer la validación a métodos separados.
**Ejemplo:**
\`\`\`php
private function validateCustomer($customer): bool
{
    return $customer && $customer->active;
}
\`\`\`
**Por qué:** Mejora legibilidad y facilita testing.

## ❌ Malo
"Este código es malo."
"Refactoriza esto."
"No me gusta."
</code></pre>

        <h3>4.2. Prefijos Convencionales</h3>

        <pre><code class="language-markdown">**[BLOCKER]** Debe corregirse antes de merge
- Ejemplo: Bug crítico, vulnerability

**[CRITICAL]** Importante pero no bloqueante
- Ejemplo: Performance issue, code smell

**[SUGGESTION]** Mejora opcional
- Ejemplo: Refactoring, mejor naming

**[NITPICK]** Opinión personal (no crítico)
- Ejemplo: Estilo de código, preferencias

**[QUESTION]** Necesita clarificación
- Ejemplo: No entiendo este approach

**[PRAISE]** Algo bien hecho
- Ejemplo: Excelente solución, buen test
</code></pre>

        <h2 class="section-title">5. Code Review con GitHub</h2>

        <h3>5.1. Configuración de Branch Protection</h3>

        <pre><code class="language-yaml"># .github/branch-protection.yml (via API o UI)
branch-protection:
  main:
    required_status_checks:
      strict: true
      contexts:
        - "CI / tests"
        - "CI / phpstan"
        - "CI / phpcs"
    
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    
    enforce_admins: false
    
    restrictions:
      users: []
      teams: ["developers"]
</code></pre>

        <h3>5.2. CODEOWNERS</h3>

        <pre><code class="language-plaintext"># .github/CODEOWNERS
# Default owners
* @team-lead

# Backend
*.php @backend-team
modules/ @backend-team @senior-dev

# Frontend
*.js @frontend-team
*.vue @frontend-team

# CI/CD
.github/ @devops-team
docker/ @devops-team

# Docs
*.md @tech-writers

# Critical files
composer.json @team-lead
docker-compose.yml @devops-lead
</code></pre>

        <h3>5.3. Automatización con GitHub Actions</h3>

        <pre><code class="language-yaml"># .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  size-label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: \${{ secrets.GITHUB_TOKEN }}
  
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - name: Install dependencies
        run: composer install
      
      - name: PHPCS
        run: vendor/bin/phpcs
      
      - name: PHPStan
        run: vendor/bin/phpstan analyse
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        run: composer test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  comment-coverage:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Tests passed with 95% coverage'
            })
</code></pre>

        <h2 class="section-title">6. Pair Programming</h2>

        <div class="alert alert-info">
            <strong>👥 Pair Programming:</strong>
            <ul class="mb-0">
                <li><strong>Driver:</strong> Escribe el código</li>
                <li><strong>Navigator:</strong> Revisa, sugiere, piensa estratégicamente</li>
                <li>Intercambiar roles cada 15-30 minutos</li>
                <li>Comunicación constante</li>
                <li>Ideal para: código complejo, onboarding, debugging</li>
            </ul>
        </div>

        <h3>6.1. Estilos de Pair Programming</h3>

        <table>
            <thead>
                <tr>
                    <th>Estilo</th>
                    <th>Driver</th>
                    <th>Navigator</th>
                    <th>Uso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ping Pong</strong></td>
                    <td>Escribe test</td>
                    <td>Implementa feature</td>
                    <td>TDD</td>
                </tr>
                <tr>
                    <td><strong>Strong Style</strong></td>
                    <td>Manos en teclado</td>
                    <td>Dicta qué escribir</td>
                    <td>Mentoring</td>
                </tr>
                <tr>
                    <td><strong>Driver/Navigator</strong></td>
                    <td>Escribe código</td>
                    <td>Piensa estrategia</td>
                    <td>General</td>
                </tr>
            </tbody>
        </table>

        <h3>6.2. Herramientas para Remote Pairing</h3>

        <pre><code class="language-markdown">## IDE Colaborativos
- **VS Code Live Share**
  - Compartir sesión de VS Code
  - Audio/chat integrado
  - Debugging compartido
  
- **JetBrains Code With Me**
  - Para PhpStorm
  - Cursores múltiples
  - Terminal compartida

## Screen Sharing
- **Tuple** - Optimizado para pair programming
- **Zoom** - Control remoto
- **Google Meet** - Simple y rápido

## Git para Pairing
\`\`\`bash
# Co-authored commits
git commit -m "Feature: Add payment gateway

Co-authored-by: Partner Name <partner@example.com>"
\`\`\`
</code></pre>

        <h3>6.3. Buenas Prácticas Pair Programming</h3>

        <pre><code class="language-markdown">## Antes de Empezar
- [ ] Objetivo claro de la sesión
- [ ] Ambiente de trabajo configurado
- [ ] Sin interrupciones programadas
- [ ] Tests preparados

## Durante la Sesión
- [ ] Comunicar en voz alta tu pensamiento
- [ ] Hacer preguntas
- [ ] Tomar breaks cada hora
- [ ] Intercambiar roles regularmente
- [ ] Ser paciente y respetuoso

## Después de la Sesión
- [ ] Commit del trabajo
- [ ] Documentar decisiones
- [ ] Actualizar tareas
- [ ] Feedback mutuo
</code></pre>

        <h2 class="section-title">7. Mob Programming</h2>

        <pre><code class="language-markdown">## Mob Programming (3+ personas)

### Roles
- **Driver:** Una persona en teclado
- **Navigators:** Resto del equipo guía
- **Facilitador:** Mantiene tiempo y enfoque

### Rotación
- Driver rota cada 10-15 minutos
- Usar timer (mobti.me)
- Todos participan

### Cuándo Usar
- Problemas complejos
- Decisiones arquitecturales
- Onboarding de equipo
- Code reviews en vivo
</code></pre>

        <h2 class="section-title">8. Métricas de Code Review</h2>

        <pre><code class="language-markdown">## KPIs de Code Review

### Velocidad
- **Time to First Review:** < 4 horas
- **Time to Merge:** < 24 horas
- **Review Cycles:** < 3 iteraciones

### Calidad
- **Defects Found:** 5-10 por 1000 LOC
- **Coverage:** > 80%
- **Approval Rate:** > 90%

### Eficiencia
- **PR Size:** < 400 LOC (ideal: < 200)
- **Files Changed:** < 10
- **Review Time:** 30-60 min
</code></pre>

        <h2 class="section-title">9. Scripts de Automatización</h2>

        <pre><code class="language-bash">#!/bin/bash
# pr-check.sh - Ejecutar antes de crear PR

echo "🔍 Pre-PR Checklist"

# Tests
echo "Running tests..."
composer test || exit 1

# Linters
echo "Running linters..."
vendor/bin/phpcs || exit 1
vendor/bin/phpstan || exit 1

# Git
echo "Checking git status..."
if [[ -n \$(git status -s) ]]; then
    echo "❌ Uncommitted changes"
    exit 1
fi

# Branch
BRANCH=\$(git branch --show-current)
if [[ "\$BRANCH" == "main" ]]; then
    echo "❌ Cannot create PR from main"
    exit 1
fi

echo "✅ Ready to create PR!"
echo "Run: gh pr create"
</code></pre>

        <h2 class="section-title">10. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Code Reviews Efectivos:</strong>
            <ul class="mb-0">
                <li>PRs pequeños (< 400 LOC)</li>
                <li>Reviews rápidos (< 24h)</li>
                <li>Comentarios constructivos</li>
                <li>Aprobar o rechazar, no "LGTM" sin revisar</li>
                <li>Automatizar checks triviales</li>
                <li>Focus en lógica, no en estilo (automatizar)</li>
                <li>Celebrar buen código</li>
            </ul>
        </div>

        <div class="alert alert-warning">
            <strong>⚠️ Evitar:</strong>
            <ul class="mb-0">
                <li>PRs masivos (> 1000 LOC)</li>
                <li>Reviews superficiales</li>
                <li>Comentarios vagos o negativos</li>
                <li>Aprobar sin entender</li>
                <li>Ego en reviews</li>
                <li>Bikeshedding (discutir detalles triviales)</li>
            </ul>
        </div>

        <div class="alert alert-info">
            <strong>📊 Reglas de Oro:</strong>
            <ul class="mb-0">
                <li><strong>10 minutos:</strong> Máximo para revisar 100 LOC</li>
                <li><strong>400 LOC:</strong> Máximo por PR</li>
                <li><strong>2 aprobaciones:</strong> Mínimo para merge</li>
                <li><strong>24 horas:</strong> Máximo para primer review</li>
            </ul>
        </div>
    </div>
`;
