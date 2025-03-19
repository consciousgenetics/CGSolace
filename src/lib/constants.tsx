import React from 'react'

import { CreditCard } from '@medusajs/icons'
import { StoreCollection, StoreProductCategory } from '@medusajs/types'
import {
  BancontactIcon,
  BlikIcon,
  IdealIcon,
  PayPalIcon,
  Przelewy24Icon,
  StripeIcon,
} from '@modules/common/icons'

// Product filters
export const FILTER_KEYS = {
  ORDER_BY_KEY: 'sort_by',
  PRICE_KEY: 'price',
  MATERIAL_KEY: 'material',
  TYPE_KEY: 'type',
  COLLECTION_KEY: 'collection',
}

export const PRODUCT_LIST_PATHNAMES = {
  CATEGORY: '/categories',
  COLLECTION: '/collections',
  EXPLORE: '/shop',
  SEARCH: '/results',
} as const

export const blogSortOptions = [
  {
    value: 'desc',
    label: 'Newest',
  },
  {
    value: 'asc',
    label: 'Oldest',
  },
]

export const storeSortOptions = [
  {
    value: 'relevance',
    label: 'Relevance',
  },
  {
    value: 'created_at',
    label: 'New in',
  },
  {
    value: 'price_asc',
    label: 'Price: Low-High',
  },
  {
    value: 'price_desc',
    label: 'Price: High-Low',
  },
]

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_system_default: {
    title: 'Bank Transfer / Manual Payment',
    icon: <CreditCard />,
  },
}

// This only checks if it is native stripe for card payments, it ignores the other stripe-based providers
export const isStripe = (providerId?: string) => {
  return false // Disable Stripe
}
export const isPaypal = (providerId?: string) => {
  return false // Disable PayPal
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith('pp_system_default')
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  'krw',
  'jpy',
  'vnd',
  'clp',
  'pyg',
  'xaf',
  'xof',
  'bif',
  'djf',
  'gnf',
  'kmf',
  'mga',
  'rwf',
  'xpf',
  'htg',
  'vuv',
  'xag',
  'xdr',
  'xau',
]

export const passwordRequirements = [
  'At least 8 characters',
  'One lowercase letter',
  'One uppercase letter',
  'One number or symbol',
]

export const createNavigation = (
  productCategories: StoreProductCategory[],
  collections?: StoreCollection[]
) => {
  // Categories to exclude from the navigation
  const excludedCategories = [
    'Shirts', 
    'Sweatshirt', 
    'Sweatshirts', 
    'Pants', 
    'Merch',
    'Clothing',
    'Feminized Seeds',  // Exclude from categories since it's now a main menu item
    'Regular Seeds',     // Exclude from categories since it's now a main menu item
  ];
  
  // Create stable categories - use a seed value for deterministic ordering
  const stableCategories = [...productCategories].sort((a, b) => 
    a.handle.localeCompare(b.handle)
  );
  
  // Filter out the excluded categories
  const filteredCategories = stableCategories.filter(
    category => !excludedCategories.some(excluded => 
      category.name.toLowerCase() === excluded.toLowerCase()
    )
  );
  
  // Get top-level categories
  const topLevelCategories = filteredCategories.filter(
    (category) => !category.parent_category
  );
  
  // Map categories to the format expected by the dropdown menu
  const mappedCategories = topLevelCategories.map(category => {
    // Find all child categories for this parent (also excluding unwanted categories)
    const childCategories = filteredCategories.filter(child => 
      child.parent_category && 
      child.parent_category.id === category.id
    ).sort((a, b) => a.handle.localeCompare(b.handle)); // Sort child categories for consistency
    
    return {
      name: category.name,
      type: 'parent_category',
      handle: `/categories/${category.handle}`,
      category_children: childCategories.map(child => ({
        name: child.name,
        type: 'category',
        handle: `/categories/${category.handle}/${child.handle}`,
        category_children: [],
      })),
    };
  });

  return [
    {
      name: 'FEMINIZED SEEDS',
      handle: '/categories/feminized-seeds',
      category_children: [
        {
          name: 'Zapplez',
          type: 'category',
          handle: '/categories/zapplez',
          category_children: [],
        },
        {
          name: 'Pink Waferz',
          type: 'category',
          handle: '/categories/pink-waferz',
          category_children: [],
        },
        {
          name: 'Red Kachina',
          type: 'category',
          handle: '/categories/red-kachina',
          category_children: [],
        }
      ],
    },
    {
      name: 'REGULAR SEEDS',
      handle: '/categories/seeds',
      category_children: [
        {
          name: "Chronic's Kush",
          type: 'category',
          handle: '/categories/chronics-kush',
          category_children: [],
        },
      ],
    },
    {
      name: 'MERCH',
      handle: '/categories/clothing',
      category_children: [
        {
          name: 'Mens Merch',
          type: 'category',
          handle: '/categories/mens',
          category_children: [],
        },
        {
          name: 'Womens Merch',
          type: 'category',
          handle: '/categories/womens-merch',
          category_children: [],
        }
      ],
    },
    {
      name: 'ACCESSORIES',
      handle: '/categories/accessories',
      category_children: null,
    },
    {
      name: 'ABOUT US',
      handle: '/about-us',
      category_children: null,
    }
  ]
}

export const createFooterNavigation = (
  productCategories: StoreProductCategory[]
) => {
  return {
    navigation: [
      {
        header: 'SHOP',
        links: [
          {
            title: 'Feminized Seeds',
            href: '/categories/feminized-seeds',
      },
      {
            title: 'Regular Seeds',
            href: '/categories/seeds',
          },
          {
            title: 'Clothing',
            href: '/categories/clothing',
          },
          {
            title: 'Accessories',
            href: '/categories/accessories',
          },
        ],
      },
      {
        header: 'INFO',
        links: [
          {
            title: 'Contact',
            href: '/contact',
          },
          {
            title: 'About',
            href: '/about-us',
          },
          {
            title: 'Privacy Policy',
            href: '/privacy-policy',
          },
          {
            title: 'Terms & Conditions',
            href: '/terms-and-conditions',
          },
        ],
      },
    ],
    contact: {
      header: "Let's stay in touch",
      text: 'Keep up to date with the latest product launches and news. Find out more about our brands and get special promo codes.',
    },
    other: [
      {
        title: 'Privacy Policy',
        href: '/privacy-policy',
      },
      {
        title: 'Terms & Conditions',
        href: '/terms-and-conditions',
      },
    ],
  }
}

export const checkoutFooterNavigation = [
  {
    title: 'Privacy Policy',
    href: '/privacy-policy',
  },
  {
    title: 'Terms & Conditions',
    href: '/terms-and-conditions',
  },
]

export const emailRegex = new RegExp(
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)

