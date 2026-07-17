export const environment = {
  production: false,
  // Production-URL: erfordert, dass der Workflow in n8n einmal auf "Publish" geklickt wurde.
  // Alternative für Testläufe (erfordert "Listen for test event" vor jedem Aufruf):
  // 'http://localhost:5678/webhook-test/generate_recipe'
  n8nWebhookUrl: 'http://localhost:5678/webhook/generate_recipe',
};
