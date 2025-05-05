// Red Kachina Product Disclaimer Injector
// This script directly injects disclaimers into the cart for Red Kachina products

(function() {
  // Function to add disclaimer for Red Kachina products
  function addRedKachinaDisclaimers() {
    console.log("Checking for Red Kachina products in cart...");
    
    // Find all product titles in the cart
    const productTitles = document.querySelectorAll('.flex.w-full.justify-between.p-5 h3');
    
    if (productTitles.length === 0) {
      console.log("No product titles found in cart yet");
      return;
    }
    
    console.log(`Found ${productTitles.length} products in cart`);
    
    // Process each product title
    productTitles.forEach(titleElement => {
      const title = titleElement.textContent.toLowerCase();
      
      // Check if this is a Red Kachina product
      if (title.includes('red kachina') || title.includes('red-kachina') || title.includes('red opal')) {
        console.log(`Found Red Kachina product: ${titleElement.textContent}`);
        
        // Find the parent container (flex item container)
        const titleContainer = titleElement.closest('div');
        
        // Check if we already added a disclaimer
        if (titleContainer && !titleContainer.querySelector('.red-kachina-disclaimer')) {
          console.log("Adding disclaimer...");
          
          // Create disclaimer element
          const disclaimer = document.createElement('div');
          disclaimer.className = 'red-kachina-disclaimer';
          disclaimer.style.backgroundColor = '#FCD34D'; // Yellow background
          disclaimer.style.color = '#000';
          disclaimer.style.padding = '6px 8px';
          disclaimer.style.marginTop = '6px';
          disclaimer.style.borderRadius = '4px';
          disclaimer.style.fontSize = '12px';
          disclaimer.style.fontWeight = 'bold';
          disclaimer.style.textAlign = 'center';
          
          // Add content
          disclaimer.textContent = '⚠️ Will ship near seed drop date';
          
          // Insert after the product variant info
          const variantElement = titleContainer.querySelector('[data-testid="product-variant"]');
          if (variantElement) {
            variantElement.insertAdjacentElement('afterend', disclaimer);
            console.log("Disclaimer added successfully");
          } else {
            // If no variant element, insert after the title
            titleElement.insertAdjacentElement('afterend', disclaimer);
            console.log("Disclaimer added after title (no variant found)");
          }
        } else {
          console.log("Disclaimer already exists or container not found");
        }
      }
    });
  }
  
  // Function to set up the observer
  function setupObserver() {
    console.log("Setting up mutation observer for cart changes");
    
    // Create an observer to watch for cart changes
    const observer = new MutationObserver(mutations => {
      // Only process once per batch of mutations
      let shouldProcess = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }
      
      if (shouldProcess) {
        console.log("Cart content changed, checking for Red Kachina products...");
        setTimeout(addRedKachinaDisclaimers, 100); // Slight delay to ensure DOM is updated
      }
    });
    
    // Start observing the document body
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return observer;
  }
  
  // Function to initialize everything
  function initialize() {
    console.log("Initializing Red Kachina disclaimer script");
    
    // Check if document is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        addRedKachinaDisclaimers();
        setupObserver();
      });
    } else {
      // Document already loaded
      addRedKachinaDisclaimers();
      setupObserver();
    }
    
    // Also check again after a short delay (for React apps)
    setTimeout(addRedKachinaDisclaimers, 1000);
    setTimeout(addRedKachinaDisclaimers, 2000);
  }
  
  // Start everything
  initialize();
})();

export {}; 