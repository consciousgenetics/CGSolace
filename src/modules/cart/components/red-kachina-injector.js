// Red Kachina Product Disclaimer Injector
// This script directly injects disclaimers into the cart for Red Kachina products

(function() {
  // Function to add disclaimer for Red Kachina products
  function addRedKachinaDisclaimers() {
    console.log("Checking for Red Kachina products in cart...");
    
    // Find all product items in the cart
    const cartItems = document.querySelectorAll('.flex.w-full.justify-between.p-5');
    
    if (cartItems.length === 0) {
      console.log("No cart items found yet");
      return;
    }
    
    console.log(`Found ${cartItems.length} items in cart`);
    
    // Process each cart item
    cartItems.forEach(cartItem => {
      // Get the product title element
      const titleElement = cartItem.querySelector('h3');
      if (!titleElement) return;
      
      const title = titleElement.textContent.toLowerCase();
      
      // More specific check for Red Kachina products
      // First check for category indicators that might be present in the cart
      const isRedKachinaProduct = 
        // Check product title for specific Red Kachina indicators
        (title.includes('red kachina') || title === 'red opal') ||
        // Check for any other indicators in the cart item that might show Red Kachina category
        cartItem.textContent.toLowerCase().includes('red kachina collection');
      
      if (isRedKachinaProduct) {
        console.log(`Found Red Kachina product: ${titleElement.textContent}`);
        
        // Check if we already added a disclaimer to this item
        if (!cartItem.querySelector('.red-kachina-disclaimer')) {
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
          disclaimer.style.marginLeft = 'auto'; // Push to the right
          disclaimer.style.width = 'fit-content'; // Only take as much width as needed
          disclaimer.style.maxWidth = '180px'; // Set maximum width
          disclaimer.style.display = 'block'; // Ensure block display
          
          // Add content
          disclaimer.textContent = '⚠️ PREORDER: Will ship near seed drop date';
          
          // Find the column that contains product info (first flex column)
          const productInfoColumn = cartItem.querySelector('.flex.h-full.flex-col');
          
          if (productInfoColumn) {
            // Create a flex container to align the disclaimer to the right
            const flexContainer = document.createElement('div');
            flexContainer.style.display = 'flex';
            flexContainer.style.justifyContent = 'flex-end';
            flexContainer.style.width = '100%';
            flexContainer.style.marginTop = '6px';
            
            // Add the disclaimer to the flex container
            flexContainer.appendChild(disclaimer);
            
            // Insert at the end of the product info column
            productInfoColumn.appendChild(flexContainer);
            console.log("Disclaimer added successfully with right alignment");
          } else {
            // Fallback: insert after the title
            const flexContainer = document.createElement('div');
            flexContainer.style.display = 'flex';
            flexContainer.style.justifyContent = 'flex-end';
            flexContainer.style.width = '100%';
            flexContainer.style.marginTop = '6px';
            
            flexContainer.appendChild(disclaimer);
            titleElement.insertAdjacentElement('afterend', flexContainer);
            console.log("Disclaimer added after title with right alignment (fallback)");
          }
        } else {
          console.log("Disclaimer already exists for this item");
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