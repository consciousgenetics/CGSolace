'use strict';

/**
 * product-variant-color router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/product-variant-color',
      handler: 'variant-color.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/product-variant-color/:id',
      handler: 'variant-color.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 