import { createClient } from '@blinkdotnew/sdk';

export const blink = createClient({
  projectId: 'pdf-game-concept-mobile-generator-140lsnk4',
  authRequired: true,
  // Add mobile-specific configuration
  baseUrl: 'https://api.blink.new'
});