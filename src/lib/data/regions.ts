import { cache } from 'react'

import { sdk } from '@lib/config'
import medusaError from '@lib/util/medusa-error'
import { HttpTypes } from '@medusajs/types'

// Default region data as fallback when API fails - use type assertion with unknown
const DEFAULT_REGION = {
  id: "reg_01HM2V51G64Z8638702TKBVWHJ2",
  name: "UK",
  currency_code: "gbp",
  currency: {
    code: "gbp",
    symbol: "£",
    symbol_native: "£",
    name: "British Pound"
  },
  countries: [
    {
      id: "826", // Changed to string to match BaseRegionCountry
      iso_2: "gb",
      iso_3: "gbr",
      name: "United Kingdom",
      display_name: "United Kingdom",
      region_id: "reg_01HM2V51G64Z8638702TKBVWHJ2",
      num_code: 826
    }
  ]
} as unknown as HttpTypes.StoreRegion;

export const listRegions = cache(async function () {
  try {
    console.log('listRegions: Fetching regions from API');
    return sdk.store.region
      .list({}, { next: { tags: ['regions'] } })
      .then(({ regions }) => {
        console.log(`listRegions: Successfully fetched ${regions.length} regions`);
        return regions;
      })
      .catch(err => {
        console.error('listRegions: Error fetching regions:', err);
        return medusaError(err);
      });
  } catch (error) {
    console.error('listRegions: Unexpected error:', error);
    return [];
  }
})

export const retrieveRegion = cache(async function (id: string) {
  try {
    console.log(`retrieveRegion: Fetching region with ID ${id}`);
    return sdk.store.region
      .retrieve(id, {}, { next: { tags: ['regions'] } })
      .then(({ region }) => {
        console.log(`retrieveRegion: Successfully fetched region ${id}`);
        return region;
      })
      .catch(err => {
        console.error(`retrieveRegion: Error fetching region ${id}:`, err);
        return medusaError(err);
      });
  } catch (error) {
    console.error(`retrieveRegion: Unexpected error for ${id}:`, error);
    throw error;
  }
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  try {
    console.log('getRegion: Processing request for country code:', countryCode);
    
    // Always try to get regions
    let regions;
    try {
      regions = await listRegions();
    } catch (error) {
      console.error('getRegion: Failed to fetch regions, using fallback:', error);
      // Use default region as fallback
      return DEFAULT_REGION;
    }
    
    // Find any real region to use
    let foundRegion = null;
    
    if (regions && regions.length > 0) {
      // Clear the map to prevent stale data
      regionMap.clear();
      
      // First priority: Find a region with GBP currency
      const gbpRegion = regions.find(r => r.currency_code?.toLowerCase() === 'gbp');
      
      // For GB requests, prioritize GBP region
      if (countryCode.toLowerCase() === 'gb' && gbpRegion) {
        console.log('getRegion: Using GBP region for GB:', {
          regionId: gbpRegion.id,
          currency: gbpRegion.currency_code
        });
        regionMap.set('gb', gbpRegion);
        return gbpRegion;
      }
      
      // Second priority: Find a region that has the GB as a country
      const gbRegion = regions.find(r => 
        r.countries?.some(c => c.iso_2?.toLowerCase() === 'gb')
      );
      
      if (gbRegion) {
        console.log('getRegion: Found region containing GB:', gbRegion.id);
        regionMap.set('gb', gbRegion);
        if (countryCode.toLowerCase() === 'gb') {
          return gbRegion;
        }
        foundRegion = gbRegion;
      }
      
      // For all countries, populate the map
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
          if (c.iso_2) {
            regionMap.set(c.iso_2.toLowerCase(), region);
          }
        });
      });
      
      // If we have regions but no GB specified, use the first region for GB
      if (!regionMap.has('gb') && regions.length > 0) {
        console.log('getRegion: No GB-specific region found, using first region for GB');
        regionMap.set('gb', regions[0]);
      }
      
      // Get the region for the requested country code
      let region = regionMap.get(countryCode.toLowerCase());
      
      // If we found a region, use it
      if (region) {
        console.log('getRegion: Found matching region for', countryCode, ':', region.id);
        return region;
      }
      
      // If no specific region found for this country code but we have a GB region
      if (regionMap.has('gb')) {
        console.log('getRegion: No specific region for', countryCode, ', using GB region');
        return regionMap.get('gb');
      }
      
      // Last resort: use the first region if available
      if (regions.length > 0) {
        console.log('getRegion: Using first available region:', regions[0].id);
        return regions[0];
      }
    }
    
    // If we reached here, no regions were found from the API
    console.warn('getRegion: No valid regions found from API, using default region');
    return DEFAULT_REGION;
  } catch (error) {
    console.error('getRegion: Error:', error);
    console.log('getRegion: Returning default region due to error');
    return DEFAULT_REGION;
  }
})
