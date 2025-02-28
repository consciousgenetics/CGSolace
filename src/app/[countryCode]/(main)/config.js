// Route configuration for the [countryCode]/(main) group
// This helps prevent issues with client-reference-manifest.js

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = 'force-no-store'; 