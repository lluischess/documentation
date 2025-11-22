// @ts-nocheck
const notificacionesCI = `
    <div class="content-section">
        <h1 id="notificaciones-ci">Notificaciones de CI (Slack, Email)</h1>
        <p>Configuración de notificaciones automáticas de builds en Slack, Email y otras plataformas para equipos PrestaShop.</p>

        <h2 class="section-title">1. Slack Notifications - GitHub Actions</h2>

        <pre><code class="language-yaml"># .github/workflows/ci.yml
jobs:
  notify:
    runs-on: ubuntu-latest
    needs: [test, build]
    if: always()
    
    steps:
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          text: |
            Build \${{ job.status }}
            Commit: \${{ github.event.head_commit.message }}
            Author: \${{ github.actor }}
            Branch: \${{ github.ref_name }}
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
</code></pre>

        <h2 class="section-title">2. GitLab Slack Integration</h2>

        <pre><code class="language-yaml"># .gitlab-ci.yml
notify:slack:
  stage: notify
  when: always
  script:
    - |
      curl -X POST \$SLACK_WEBHOOK_URL \\
        -H 'Content-Type: application/json' \\
        -d "{
          \"text\": \"Build \$CI_JOB_STATUS\",
          \"attachments\": [{
            \"color\": \"\$CI_JOB_STATUS\" == \"success\" ? \"good\" : \"danger\",
            \"fields\": [
              {\"title\": \"Project\", \"value\": \"\$CI_PROJECT_NAME\", \"short\": true},
              {\"title\": \"Branch\", \"value\": \"\$CI_COMMIT_REF_NAME\", \"short\": true}
            ]
          }]
        }"
</code></pre>

        <h2 class="section-title">3. Email Notifications</h2>

        <pre><code class="language-yaml"># GitHub Actions
- name: Send Email
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: \${{ secrets.EMAIL_USERNAME }}
    password: \${{ secrets.EMAIL_PASSWORD }}
    subject: Build Failed - \${{ github.repository }}
    to: team@example.com
    from: CI/CD Bot
    body: |
      Build failed for commit \${{ github.sha }}
      Branch: \${{ github.ref_name }}
      Author: \${{ github.actor }}
</code></pre>

        <h2 class="section-title">4. Discord Webhook</h2>

        <pre><code class="language-yaml"># Discord notification
- name: Discord notification
  uses: Ilshidur/action-discord@master
  env:
    DISCORD_WEBHOOK: \${{ secrets.DISCORD_WEBHOOK }}
  with:
    args: '🚀 Build succeeded for {{ EVENT_PAYLOAD.repository.full_name }}'
</code></pre>

        <h2 class="section-title">5. Mejores Prácticas</h2>

        <div class="alert alert-success">
            <strong>✅ Notificaciones:</strong>
            <ul class="mb-0">
                <li>Solo notificar failures en main/develop</li>
                <li>Success solo en production deploys</li>
                <li>Información contextual (branch, commit, author)</li>
                <li>Links directos a pipeline</li>
                <li>Mentions solo para errores críticos</li>
            </ul>
        </div>
    </div>
`;
