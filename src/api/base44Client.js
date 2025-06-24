import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "685548b489d96e9d198fb93c", 
  requiresAuth: true // Ensure authentication is required for all operations
});
