// @ts-nocheck
const ejecucionPruebasCI = `
    <div class="content-section">
        <h1 id="ejecucion-pruebas-ci">Ejecución de Pruebas Unitarias y de Integración en CI</h1>
        <p>Configuración y ejecución de tests automáticos en pipelines CI/CD para PrestaShop 8.9+ con PHPUnit.</p>

        <h2 class="section-title">1. PHPUnit en GitHub Actions</h2>

        <pre><code class="language-yaml"># .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: mbstring, intl, pdo_mysql
          coverage: xdebug
      
      - run: composer install
      
      - name: Wait for MySQL
        run: |
          until mysqladmin ping -h 127.0.0.1 -P 3306 --silent; do
            echo 'waiting for mysql...'
            sleep 1
          done
      
      - name: Setup database
        run: |
          php bin/console doctrine:database:create --env=test
          php bin/console doctrine:schema:create --env=test
      
      - name: Run Unit Tests
        run: vendor/bin/phpunit --testsuite=Unit --testdox
      
      - name: Run Integration Tests
        run: vendor/bin/phpunit --testsuite=Integration --testdox
        env:
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: test_db
          DB_USERNAME: root
          DB_PASSWORD: root
      
      - name: Run All Tests with Coverage
        run: vendor/bin/phpunit --coverage-clover=coverage.xml --coverage-html=coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          flags: unittests
          fail_ci_if_error: true
</code></pre>

        <h2 class="section-title">2. PHPUnit con Paralelización</h2>

        <pre><code class="language-yaml"># Tests paralelos
jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        suite: [Unit, Integration, Functional]
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          tools: paratest
      
      - run: composer install
      
      - name: Run tests (shard \${{ matrix.shard }}/4)
        run: |
          vendor/bin/paratest \\
            --testsuite=\${{ matrix.suite }} \\
            --processes=4 \\
            --runner=WrapperRunner
</code></pre>

        <h2 class="section-title">3. GitLab CI con Tests</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
test:unit:
  stage: test
  image: php:8.1-cli
  services:
    - mysql:8.0
  variables:
    MYSQL_DATABASE: test_db
    MYSQL_ROOT_PASSWORD: root
  script:
    - composer install
    - vendor/bin/phpunit --testsuite=Unit --log-junit=junit-unit.xml
  artifacts:
    when: always
    reports:
      junit: junit-unit.xml

test:integration:
  stage: test
  image: php:8.1-cli
  services:
    - mysql:8.0
  script:
    - composer install
    - php bin/console doctrine:database:create --env=test
    - php bin/console doctrine:schema:create --env=test
    - vendor/bin/phpunit --testsuite=Integration --log-junit=junit-integration.xml
  artifacts:
    when: always
    reports:
      junit: junit-integration.xml
</code></pre>

        <h2 class="section-title">4. Tests con Fixtures</h2>

        <pre><code class="language-yaml"># Load fixtures antes de tests
- name: Load Fixtures
  run: php bin/console doctrine:fixtures:load --env=test --no-interaction

- name: Run Functional Tests
  run: vendor/bin/phpunit --testsuite=Functional
</code></pre>

        <h2 class="section-title">5. Configuración phpunit.xml.dist</h2>

        <pre><code class="language-xml">&lt;?xml version="1.0"?&gt;
&lt;phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"&gt;
    
    &lt;testsuites&gt;
        &lt;testsuite name="Unit"&gt;
            &lt;directory&gt;tests/Unit&lt;/directory&gt;
        &lt;/testsuite&gt;
        
        &lt;testsuite name="Integration"&gt;
            &lt;directory&gt;tests/Integration&lt;/directory&gt;
        &lt;/testsuite&gt;
        
        &lt;testsuite name="Functional"&gt;
            &lt;directory&gt;tests/Functional&lt;/directory&gt;
        &lt;/testsuite&gt;
    &lt;/testsuites&gt;
    
    &lt;coverage&gt;
        &lt;include&gt;
            &lt;directory suffix=".php"&gt;src&lt;/directory&gt;
        &lt;/include&gt;
        
        &lt;report&gt;
            &lt;clover outputFile="build/logs/clover.xml"/&gt;
            &lt;html outputDirectory="build/coverage"/&gt;
            &lt;text outputFile="php://stdout" showUncoveredFiles="false"/&gt;
        &lt;/report&gt;
    &lt;/coverage&gt;
    
    &lt;logging&gt;
        &lt;junit outputFile="build/logs/junit.xml"/&gt;
    &lt;/logging&gt;
&lt;/phpunit&gt;
</code></pre>

        <h2 class="section-title">6. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Tests en CI:</strong>
            <ul class="mb-0">
                <li>Separar Unit, Integration, Functional</li>
                <li>Paralelizar cuando posible</li>
                <li>Base de datos en services</li>
                <li>Fixtures automatizadas</li>
                <li>Coverage > 80%</li>
                <li>JUnit reports para GitLab/GitHub</li>
                <li>Fail fast en PRs, completo en main</li>
            </ul>
        </div>
    </div>
`;
