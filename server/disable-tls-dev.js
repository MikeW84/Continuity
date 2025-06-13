// Temporary script to disable TLS certificate validation for local development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.warn('[WARNING] TLS certificate validation is disabled! This is insecure and for development only.');

// Start the actual server
import('./index.js');
