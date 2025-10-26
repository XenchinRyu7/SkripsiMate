// Deployment detection utilities

/**
 * Check if app is running in self-hosted mode or cloud-hosted
 * Self-hosted: Unlimited access
 * Cloud-hosted: Enforce subscription limits
 */
export function isSelfHosted(): boolean {
  // Method 1: Check environment variable
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'cloud') {
    return false; // Force cloud mode
  }
  
  if (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'self-hosted') {
    return true; // Force self-hosted mode
  }

  // Method 2: Check domain (fallback)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Cloud domains (your production domains)
    const cloudDomains = [
      'skripsimate.vercel.app',
      'skripsimate.com',
      'app.skripsimate.com',
    ];
    
    // Check if current domain is in cloud list
    const isCloudDomain = cloudDomains.some(domain => 
      hostname.includes(domain)
    );
    
    if (isCloudDomain) {
      return false; // Cloud-hosted
    }
  }

  // Default: Self-hosted (localhost, custom domains, etc)
  return true;
}

/**
 * Get deployment info for debugging
 */
export function getDeploymentInfo() {
  return {
    mode: isSelfHosted() ? 'self-hosted' : 'cloud-hosted',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    env: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'auto-detect',
  };
}

