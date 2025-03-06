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

    // Always try to get and use the GBP region for UK requests
    const regions = await listRegions();
    if (!regions) {
      console.warn('getRegion: No regions found from API');
      return null;
    }

    // Clear the map to prevent stale data
    regionMap.clear();

    // First, find the GBP region
    const gbpRegion = regions.find(r => r.currency_code?.toLowerCase() === 'gbp');
    
    // For UK requests, always return GBP region if available
    if (countryCode.toLowerCase() === 'uk') {
      if (gbpRegion) {
        console.log('getRegion: Using GBP region for UK:', {
          regionId: gbpRegion.id,
          currency: gbpRegion.currency_code
        });
        regionMap.set('uk', gbpRegion);
        return gbpRegion;
      } else {
        console.warn('getRegion: No GBP region found for UK');
      }
    }

    // For all countries, populate the map
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c.iso_2) {
          regionMap.set(c.iso_2.toLowerCase(), region);
        }
      });
    });

    // Get the region for the requested country code
    let region = regionMap.get(countryCode.toLowerCase());

    // If no specific region found and this is a UK request, use GBP region as fallback
    if (!region && countryCode.toLowerCase() === 'uk' && gbpRegion) {
      console.log('getRegion: Using GBP region as fallback for UK');
      region = gbpRegion;
      regionMap.set('uk', gbpRegion);
    }

    // If still no region found, use the first available region
    if (!region && regions.length > 0) {
      region = regions[0];
      regionMap.set(countryCode.toLowerCase(), region);
    }

    if (!region) {
      console.warn(`getRegion: No region found for country code: ${countryCode}`);
      return null;
    }

    console.log('getRegion: Returning region:', {
      countryCode: countryCode.toLowerCase(),
      regionId: region.id,
      currency: region.currency_code
    });

    return region;
  } catch (error) {
    console.error('getRegion: Error:', error);
    return null;
  }
})
