export const environment = {
  production: false,
  // n8n Cloud (14-Tage-Testversion): Workflow ist published, daher die
  // Production-Webhook-URL (ohne "-test", kein manuelles "Listen" nötig).
  n8nWebhookUrl: 'https://fernando13cb.app.n8n.cloud/webhook/generate_recipe',
};
