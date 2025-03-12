import { cache } from 'react'

import { sdk } from '@lib/config'
import medusaError from '@lib/util/medusa-error'
import { HttpTypes } from '@medusajs/types'

export const listRegions = cache(async function () {
  return sdk.store.region
    .list({}, { next: { tags: ['regions'] } })
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ['regions'] } })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  try {
    console.log('getRegion: Processing request for country code:', countryCode);

    // If countryCode is 'dk', automatically redirect to 'uk'
    if (countryCode.toLowerCase() === 'dk') {
      console.log('getRegion: Redirecting dk to uk');
      countryCode = 'uk';
    }
    
    // Always try to get and use the GBP region for UK requests
    const regions = await listRegions();
    
    // Find any real region to use
    let foundRegion = null;
    
    if (regions && regions.length > 0) {
      // Clear the map to prevent stale data
      regionMap.clear();
      
      // First priority: Find a region with GBP currency
      const gbpRegion = regions.find(r => r.currency_code?.toLowerCase() === 'gbp');
      
      // For UK requests, prioritize GBP region
      if (countryCode.toLowerCase() === 'uk' && gbpRegion) {
        console.log('getRegion: Using GBP region for UK:', {
          regionId: gbpRegion.id,
          currency: gbpRegion.currency_code
        });
        regionMap.set('uk', gbpRegion);
        return gbpRegion;
      }
      
      // Second priority: Find a region that has the UK as a country
      const ukRegion = regions.find(r => 
        r.countries?.some(c => 
          c.iso_2?.toLowerCase() === 'uk' || 
          c.iso_2?.toLowerCase() === 'gb'
        )
      );
      
      if (ukRegion) {
        console.log('getRegion: Found region containing UK:', ukRegion.id);
        if (countryCode.toLowerCase() === 'uk') {
          return ukRegion;
        }
        foundRegion = ukRegion;
      }
      
      // For all countries, populate the map
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
          if (c.iso_2) {
            regionMap.set(c.iso_2.toLowerCase(), region);
          }
        });
      });
      
      // If we have regions but no UK specified, use the first region for UK
      if (!regionMap.has('uk') && regions.length > 0) {
        console.log('getRegion: No UK-specific region found, using first region for UK');
        regionMap.set('uk', regions[0]);
      }
      
      // Get the region for the requested country code
      let region = regionMap.get(countryCode.toLowerCase());
      
      // If we found a region, use it
      if (region) {
        console.log('getRegion: Found matching region for', countryCode, ':', region.id);
        return region;
      }
      
      // If no specific region found for this country code but we have a UK region
      if (regionMap.has('uk')) {
        console.log('getRegion: No specific region for', countryCode, ', using UK region');
        return regionMap.get('uk');
      }
      
      // Last resort: use the first region if available
      if (regions.length > 0) {
        console.log('getRegion: Using first available region:', regions[0].id);
        return regions[0];
      }
    }
    
    // If we reached here, no regions were found from the API
    console.warn('getRegion: No valid regions found from API, cannot continue');
    return null;
  } catch (error) {
    console.error('getRegion: Error:', error);
    return null;
  }
})
