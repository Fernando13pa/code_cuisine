export const environment = {
  production: true,
  // Keep this enabled while the frontend is under construction so no UI test
  // can accidentally trigger n8n/Gemini. Set to false only for the final E2E.
  useLocalRecipeFixtures: true,
  n8nWebhookUrl: 'REPLACE_WITH_N8N_CLOUD_URL',
};
