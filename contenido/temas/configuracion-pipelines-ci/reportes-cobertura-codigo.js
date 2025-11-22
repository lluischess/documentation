// @ts-nocheck
const reportesCoberturaCodigo = `
    <div class="content-section">
        <h1 id="reportes-cobertura-codigo">Generación de Reportes de Cobertura de Código</h1>
        <p>Configuración de coverage reports con Codecov, Coveralls y reportes nativos en CI/CD para PrestaShop 8.9+.</p>

        <h2 class="section-title">1. Codecov Integration</h2>

        <pre><code class="language-yaml"># GitHub Actions
- name: Run tests with coverage
  run: vendor/bin/phpunit --coverage-clover=coverage.xml

- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage.xml
    flags: unittests
    fail_ci_if_error: true
    token: \${{ secrets.CODECOV_TOKEN }}
</code></pre>

        <h2 class="section-title">2. GitLab Coverage</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
test:
  script:
    - vendor/bin/phpunit --coverage-text --colors=never
  coverage: '/^\s*Lines:\s*\d+.\d+\%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
</code></pre>

        <h2 class="section-title">3. HTML Coverage Report</h2>

        <pre><code class="language-yaml"># GitHub Actions
- name: Generate HTML coverage
  run: vendor/bin/phpunit --coverage-html=build/coverage

- name: Upload coverage artifact
  uses: actions/upload-artifact@v3
  with:
    name: coverage-report
    path: build/coverage/
</code></pre>

        <h2 class="section-title">4. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Coverage:</strong>
            <ul class="mb-0">
                <li>Objetivo: > 80% coverage</li>
                <li>Fail CI si coverage baja</li>
                <li>Reportes HTML para review</li>
                <li>Integración con Codecov/Coveralls</li>
                <li>Badge en README</li>
            </ul>
        </div>
    </div>
`;
