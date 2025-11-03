/*******************************
  Configuration
*******************************/
const WHATSAPP_NUMBER = '917836998590'; // country code + number, no + sign.

// ** Data Storage **
let allVendorData = []; // Stores the fetched data from vendors.json
let currentCategory = 'All'; // Tracks the current view ('All' or a specific category name)
let allCategories = ['All']; // Will be populated from JSON
let activeServiceData = {}; // Stores data for the currently open service (for modal use)


/*******************************
  DOM Elements
*******************************/
const cardsEl = document.getElementById('cards');
const pillsEl = document.getElementById('pills');
const searchInput = document.getElementById('searchInput');
const currentTitleEl = document.getElementById('current-title');
const backButtonEl = document.getElementById('back-to-categories');

// Booking Modal Elements
const bookModalBackdrop = document.getElementById('modalBackdrop');
const modalServiceTitle = document.getElementById('modalServiceTitle');
const modalServiceId = document.getElementById('modalServiceId');
const modalVendorName = document.getElementById('modalVendorName');
const modalPriceDisplay = document.getElementById('modalPriceDisplay');
const modalServiceDesc = document.getElementById('modalServiceDesc');
const modalServiceIdHidden = document.getElementById('modalServiceIdHidden');
const modalServicePrice = document.getElementById('modalServicePrice');
const modalVendorNameHidden = document.getElementById('modalVendorNameHidden');
const modalCategoryHidden = document.getElementById('modalCategoryHidden'); // New field
const imageGalleryEl = document.getElementById('imageGallery');
const carCalcContainer = document.getElementById('carCalcContainer'); // New container

// Calculator Modal Elements
const calcModalBackdrop = document.getElementById('calcModalBackdrop');
const calcServiceTitle = document.getElementById('calcServiceTitle');
const calcServiceId = document.getElementById('calcServiceId');
const calcDisplayId = document.getElementById('calcDisplayId');
const calcDisplayBasePrice = document.getElementById('calcDisplayBasePrice');
const calcDisplayPricePerKm = document.getElementById('calcDisplayPricePerKm');
const calcDistance = document.getElementById('calcDistance');
const calcPickupLoc = document.getElementById('calcPickupLoc');
const calcDestLoc = document.getElementById('calcDestLoc');
const calcResult = document.getElementById('calcResult');
const calcResultBreakdown = document.getElementById('calcResultBreakdown');
const calcTotalAmount = document.getElementById('calcTotalAmount');
const calcForm = document.getElementById('calcForm');
const bookCalculatedPriceBtn = document.getElementById('bookCalculatedPriceBtn');

// Gallery Modal Elements
const galleryModalBackdrop = document.getElementById('galleryModalBackdrop');
const galleryTrack = document.getElementById('galleryTrack');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const galleryCounter = document.getElementById('galleryCounter');
let currentGalleryIndex = 0;

/*******************************
  Data Fetching and Initialization
*******************************/

async function fetchVendorData() {
    const GITHUB_JSON_URL = './vendors(1).json';

    try {
        const response = await fetch(GITHUB_JSON_URL);

        // 1. Check if the network response was successful (status 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 2. Parse the JSON response
        const data = await response.json();
        allVendorData = data; // Store the fetched data globally

        // 3. Extract and validate categories (now inside the try block)
        allCategories = ['All'];
        allVendorData.forEach(cat => {
            if (cat.category) {
                allCategories.push(cat.category);
            }
        });
        
        // 4. Initial Render: Show main categories
        renderPills();
        renderMainCategories();

    } catch (error) {
        // Log the full error to the console for debugging
        console.error("Could not fetch vendor data from GitHub:", error);

        // Update the UI to show the error
        cardsEl.innerHTML = '<p style="text-align:center; color:var(--maroon); margin-top:50px;">❌ Error: Could not load services. Check your GitHub file URL and network connection.</p>';
        pillsEl.innerHTML = ''; 
        currentTitleEl.textContent = 'Service Load Failed';
    }
}

// Initial call to load data
fetchVendorData();

/*******************************
  Rendering & Navigation Logic
*******************************/

function renderPills(){
    pillsEl.innerHTML = '';
    allCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'pill' + (cat === 'All' ? ' active' : '');
        btn.textContent = cat;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            
            // Set view state
            currentCategory = cat;
            
            if (cat === 'All') {
                renderMainCategories();
            } else {
                renderSubcategories(currentCategory);
            }
        });
        pillsEl.appendChild(btn);
    });
}

// --- Card HTML Generation ---

// Template for a MAIN CATEGORY CARD (No change)
function categoryCardHTML(categoryData) {
    const mainImage = categoryData.subcategories.length > 0 && categoryData.subcategories[0].images.length > 0 ? categoryData.subcategories[0].images[0] : '';
    const subCount = categoryData.subcategories.length;

    return `
        <div class="card" data-category="${categoryData.category.toLowerCase()}" data-type="category" data-title="${categoryData.category.toLowerCase()}">
            <div style="position:relative">
                <img class="media" src="${mainImage}" alt="${categoryData.category} image" style="width:100%;height:190px;object-fit:cover" loading="lazy" onerror="this.src='assets/images/placeholder.jpg'" />
                <div class="tag">${categoryData.category}</div>
            </div>
            <div class="card-body">
                <h3>${categoryData.category} (${subCount} items)</h3>
                <p>${categoryData.description}</p>
                <div class="price">Click to view all services</div>
                <div style="display:flex;gap:8px;align-items:center">
                    <button class="btn viewSubcategories" data-category="${categoryData.category}">View Services</button>
                    <a class="muted" href="#" onclick="event.preventDefault()">Browse</a>
                </div>
            </div>
        </div>
    `;
}

// Template for a SUBCATEGORY (SERVICE) CARD - **UPDATED for Image Gallery Trigger**
function serviceCardHTML(service, mainCategory) {
    if (!service.title || !service.price || !service.images || service.images.length === 0) return ''; 

    const serviceDataString = JSON.stringify({ ...service, mainCategory });
    const safeData = serviceDataString.replace(/'/g, '&#39;'); 

    return `
        <div class="card" data-category="${mainCategory.toLowerCase()}" data-title="${service.title.toLowerCase()}" data-type="service">
            <div style="position:relative">
                <img class="media service-image-trigger" src="${service.images[0]}" alt="${service.title} image" 
                     style="width:100%;height:190px;object-fit:cover; cursor:pointer;" loading="lazy" 
                     data-service-data='${safeData}' 
                     onerror="this.src='assets/images/placeholder-service.jpg'" />
                <div class="tag">${mainCategory}</div>
            </div>
            <div class="card-body">
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                <div class="price">${service.price}</div>
                <div style="display:flex;gap:8px;align-items:center">
                    <button class="btn bookNow" data-service-data='${safeData}'>Book via WhatsApp</button>
                    <a class="muted service-image-trigger" href="#" onclick="event.preventDefault()" data-service-data='${safeData}'>More details</a>
                </div>
            </div>
        </div>
    `;
}

function renderMainCategories(){
    currentCategory = 'All';
    currentTitleEl.textContent = 'OUR SERVICES';
    backButtonEl.classList.add('hidden');
    cardsEl.innerHTML = allVendorData.map(c => categoryCardHTML(c)).join('');
    
    // Attach listeners for 'View Services' button
    document.querySelectorAll('.viewSubcategories').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            renderSubcategories(category);
        });
    });
    
    // Clear search and reset pills
    searchInput.value = '';
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    const allPill = document.querySelector('.pill:first-child');
    if (allPill) allPill.classList.add('active');
}

function renderSubcategories(categoryName){
    const categoryData = allVendorData.find(c => c.category === categoryName);
    
    if (!categoryData || categoryData.subcategories.length === 0) {
        cardsEl.innerHTML = `<p style="text-align:center; margin-top:30px;">No services found in the category: <strong>${categoryName}</strong>.</p>`;
        return;
    }
    
    currentCategory = categoryName;
    currentTitleEl.textContent = `Services in: ${categoryName}`;
    backButtonEl.classList.remove('hidden');

    const subcategoryHTML = categoryData.subcategories.map(s => serviceCardHTML(s, categoryName)).join('');
    cardsEl.innerHTML = subcategoryHTML;
    
    // Update active pill
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.pill').forEach(p => {
        if (p.textContent === categoryName) {
            p.classList.add('active');
        }
    });

    // Attach listeners for all service cards (Book button and Image/Details trigger)
    attachServiceEventListeners();
}

function attachServiceEventListeners() {
    // Listener for Book button (opens Booking Modal)
    document.querySelectorAll('.bookNow').forEach(el => {
        el.removeEventListener('click', handleBookClick);
        el.addEventListener('click', handleBookClick);
    });
    
    // Listener for Image/Details button/media (opens Gallery or Booking modal)
    document.querySelectorAll('.service-image-trigger').forEach(el => {
        el.removeEventListener('click', handleImageTriggerClick);
        el.addEventListener('click', handleImageTriggerClick);
    });
}

function handleDataParse(dataAttribute) {
    try {
        const unescapedData = dataAttribute.replace(/&#39;/g, "'");
        return JSON.parse(unescapedData);
    } catch (error) {
        console.error("Error parsing service data:", error, dataAttribute);
        alert("Sorry, there was an issue retrieving service details.");
        return null;
    }
}

function handleBookClick(e) {
    e.preventDefault();
    const serviceData = handleDataParse(e.currentTarget.dataset.serviceData);
    if (serviceData) {
        activeServiceData = serviceData;
        openBookingModal(serviceData);
    }
}

function handleImageTriggerClick(e) {
    e.preventDefault();
    const serviceData = handleDataParse(e.currentTarget.dataset.serviceData);
    if (serviceData) {
        // If clicking on the main media image, open the full gallery
        if (e.currentTarget.classList.contains('media')) {
             openGalleryModal(serviceData);
        } 
        // If clicking on the 'More details' link, open the booking modal (as originally intended)
        else { 
            activeServiceData = serviceData;
            openBookingModal(serviceData);
        }
    }
}

backButtonEl.addEventListener('click', renderMainCategories);


/*******************************
  Filtering Logic (Search) - No Change
*******************************/

function filterAndRender(){
    const q = searchInput.value.trim().toLowerCase();
    
    if (currentCategory === 'All') {
        const filteredCategories = allVendorData.filter(c => 
            c.category.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );
        cardsEl.innerHTML = filteredCategories.map(c => categoryCardHTML(c)).join('');
        
        document.querySelectorAll('.viewSubcategories').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                renderSubcategories(category);
            });
        });

    } 
    else {
        let servicesToFilter = [];
        
        const categoryData = allVendorData.find(c => c.category === currentCategory);
        if (categoryData) {
            categoryData.subcategories.forEach(sub => servicesToFilter.push({...sub, mainCategory: categoryData.category}));
        }
        
        const filteredServices = servicesToFilter.filter(s => 
            s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        );

        cardsEl.innerHTML = filteredServices.map(s => serviceCardHTML(s, s.mainCategory)).join('');

        attachServiceEventListeners();
    }
}

searchInput.addEventListener('input', filterAndRender);


/*******************************
  1. Booking Modal Logic (Updated for Car Calc)
*******************************/

function openBookingModal(serviceData){
    // Set active service data globally
    activeServiceData = serviceData;
    
    // Update modal content
    modalServiceTitle.textContent = serviceData.title;
    modalServiceId.textContent = serviceData.serviceId;
    modalServiceIdHidden.value = serviceData.serviceId;
    modalVendorName.textContent = serviceData.vendorName || 'N/A';
    modalVendorNameHidden.value = serviceData.vendorName || 'N/A';
    
    // Price logic: Use 'price' or calculated price from activeServiceData
    modalServicePrice.value = activeServiceData.calculatedPrice || serviceData.price;
    modalPriceDisplay.textContent = activeServiceData.calculatedPrice ? `${activeServiceData.calculatedPrice} (Calculated)` : serviceData.price;

    modalServiceDesc.textContent = serviceData.description;
    modalCategoryHidden.value = serviceData.mainCategory; // Store category
    
    // Car Calculator Button Visibility
    if (serviceData.mainCategory === 'Cars' && serviceData.basePrice && serviceData.pricePerKm) {
        carCalcContainer.classList.remove('hidden');
    } else {
        carCalcContainer.classList.add('hidden');
    }

    // Render image gallery (small) and attach listener for full gallery
    imageGalleryEl.innerHTML = serviceData.images.map((url, index) => 
        `<img src="${url}" alt="${serviceData.title} image ${index + 1}" data-index="${index}" loading="lazy" onerror="this.src='assets/images/placeholder.jpg'">`
    ).join('');
    
    imageGalleryEl.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', (e) => {
            const startIndex = parseInt(e.currentTarget.dataset.index);
            openGalleryModal(serviceData, startIndex);
        });
    });


    // Show modal
    bookModalBackdrop.style.display = 'flex';
    setTimeout(() => { 
        bookModalBackdrop.classList.add('show');
    }, 10);
    
    document.getElementById('bookingForm').reset();
    document.getElementById('name').focus();
    locationOther.classList.add('hidden');
    locationOther.required = false;
}

function closeBookingModal() {
    bookModalBackdrop.classList.remove('show');
    setTimeout(() => {
        bookModalBackdrop.style.display = 'none';
        imageGalleryEl.innerHTML = ''; 
    }, 300);
    // Reset calculated price state
    delete activeServiceData.calculatedPrice;
    delete activeServiceData.pickupLocation;
    delete activeServiceData.destinationLocation;
    delete activeServiceData.distance;
}

document.getElementById('closeModal').addEventListener('click', closeBookingModal);
bookModalBackdrop.addEventListener('click', (ev) => { if (ev.target === bookModalBackdrop) closeBookingModal(); });

// show/hide other location field
const locationSelect = document.getElementById('locationSelect');
const locationOther = document.getElementById('locationOther');
locationSelect.addEventListener('change', () => {
  if (locationSelect.value === 'Other'){
    locationOther.classList.remove('hidden');
    locationOther.required = true;
    locationOther.focus();
  } else {
    locationOther.classList.add('hidden');
    locationOther.required = false;
  }
});

// form submit -> build whatsapp message and open
document.getElementById('bookingForm').addEventListener('submit', function(ev){
  ev.preventDefault();
  
  // Get data from form and hidden fields
  const name = document.getElementById('name').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const location = (locationSelect.value === 'Other') ? locationOther.value.trim() : locationSelect.value;
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const serviceId = modalServiceIdHidden.value;
  const servicePrice = modalServicePrice.value;
  const serviceTitle = modalServiceTitle.textContent;
  const vendorName = modalVendorNameHidden.value;

  // build message
  let message = `*JLPweds Booking Request*\n`;
  message += `\n*Service*: ${serviceTitle} \n`;
  message += `*Service ID*: ${serviceId} \n`;
  message += `*Vendor*: ${vendorName} \n`;
  message += `*Price (Quoted)*: ${servicePrice} \n`;
  
  // ADD CALCULATOR DETAILS IF PRESENT
  if(activeServiceData.calculatedPrice) {
      message += `*Price Breakdown*:\n`;
      message += `  - Base: ₹${activeServiceData.basePrice.toLocaleString('en-IN')}\n`;
      message += `  - KM: ${activeServiceData.distance} km @ ₹${activeServiceData.pricePerKm}/km = ₹${(activeServiceData.distance * activeServiceData.pricePerKm).toLocaleString('en-IN')}\n`;
      message += `*Pickup Location*: ${activeServiceData.pickupLocation} \n`;
      message += `*Destination Location*: ${activeServiceData.destinationLocation} \n`;
  }
  
  message += `\n*Customer Name*: ${name} \n`;
  message += `*Customer Mobile*: ${mobile} \n`;
  message += `*Event Location (Area)*: ${location} \n`;
  message += `*Event Date*: ${date} \n`;
  message += `*Event Time*: ${time} \n`;
  message += `\n--- Sent from JLPweds website ---`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // try to open WhatsApp.
  window.open(url, '_blank');

  // also copy message to clipboard for fallback
  navigator.clipboard && navigator.clipboard.writeText(message).then(()=>{
    console.log('Message copied to clipboard (fallback).');
  }).catch(()=>{});

  // close modal
  closeBookingModal(); // Using animated close function
});


/*******************************
  2. Car Calculator Modal Logic (New Feature)
*******************************/

document.getElementById('openCalcBtn').addEventListener('click', openCalculatorModal);

function openCalculatorModal() {
    closeBookingModal(); // Close booking modal first

    calcServiceTitle.textContent = activeServiceData.title;
    calcServiceId.textContent = activeServiceData.serviceId;
    calcDisplayId.textContent = activeServiceData.serviceId;
    calcDisplayBasePrice.textContent = `₹${activeServiceData.basePrice.toLocaleString('en-IN')}`;
    calcDisplayPricePerKm.textContent = `₹${activeServiceData.pricePerKm.toLocaleString('en-IN')}`;
    
    // Reset form and result
    calcForm.reset();
    calcResult.classList.add('hidden');

    calcModalBackdrop.style.display = 'flex';
    setTimeout(() => { 
        calcModalBackdrop.classList.add('show');
    }, 10);
    calcDistance.focus();
}

function closeCalculatorModal() {
    calcModalBackdrop.classList.remove('show');
    setTimeout(() => {
        calcModalBackdrop.style.display = 'none';
    }, 300);
}

document.getElementById('closeCalcModal').addEventListener('click', closeCalculatorModal);
calcModalBackdrop.addEventListener('click', (ev) => { if (ev.target === calcModalBackdrop) closeCalculatorModal(); });


calcForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const distance = parseInt(calcDistance.value);
    const pricePerKm = activeServiceData.pricePerKm;
    const basePrice = activeServiceData.basePrice;
    const pickupLoc = calcPickupLoc.value.trim();
    const destLoc = calcDestLoc.value.trim();
    
    if (isNaN(distance) || distance <= 0) {
        alert("Please enter a valid distance in kilometers.");
        return;
    }
    
    const kmCost = distance * pricePerKm;
    const totalAmount = basePrice + kmCost;
    
    // Store calculation results in activeServiceData
    activeServiceData.calculatedPrice = `₹${totalAmount.toLocaleString('en-IN')}`;
    activeServiceData.distance = distance;
    activeServiceData.pickupLocation = pickupLoc;
    activeServiceData.destinationLocation = destLoc;
    
    // Update result display
    calcResultBreakdown.innerHTML = `
        <p style="margin: 0;">Base Price: ₹${basePrice.toLocaleString('en-IN')}</p>
        <p style="margin: 3px 0;">${distance} km × ₹${pricePerKm}/km = ₹${kmCost.toLocaleString('en-IN')}</p>
        <p style="margin: 3px 0;">Trip: ${pickupLoc} to ${destLoc}</p>
    `;
    calcTotalAmount.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    calcResult.classList.remove('hidden');
});

// Book with Calculated Price button
bookCalculatedPriceBtn.addEventListener('click', () => {
    closeCalculatorModal();
    // Re-open booking modal with the new calculated price set in activeServiceData
    openBookingModal(activeServiceData);
});

/*******************************
  3. Image Gallery Modal Logic (New Feature)
*******************************/

function openGalleryModal(serviceData, startIndex = 0) {
    // Populate gallery track
    galleryTrack.innerHTML = serviceData.images.map(url => 
        `<img src="${url}" alt="${serviceData.title} image" onerror="this.src='assets/images/placeholder.jpg'">`
    ).join('');
    
    currentGalleryIndex = startIndex;
    updateGallery();

    // Show modal
    galleryModalBackdrop.style.display = 'flex';
    setTimeout(() => { 
        galleryModalBackdrop.classList.add('show');
    }, 10);
}

function updateGallery() {
    const images = galleryTrack.querySelectorAll('img');
    if (images.length === 0) return;

    // Ensure index is within bounds
    if (currentGalleryIndex < 0) currentGalleryIndex = images.length - 1;
    if (currentGalleryIndex >= images.length) currentGalleryIndex = 0;

    // Translate the gallery track
    const offset = -currentGalleryIndex * 100;
    galleryTrack.style.transform = `translateX(${offset}%)`;
    
    // Update counter
    galleryCounter.textContent = `${currentGalleryIndex + 1} / ${images.length}`;
    
    // Update navigation button visibility
    galleryPrev.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    galleryNext.style.visibility = images.length > 1 ? 'visible' : 'hidden';
}

function closeGalleryModal() {
    galleryModalBackdrop.classList.remove('show');
    setTimeout(() => {
        galleryModalBackdrop.style.display = 'none';
        galleryTrack.innerHTML = ''; // Clear images
    }, 300);
}

document.getElementById('closeGalleryModal').addEventListener('click', closeGalleryModal);
galleryModalBackdrop.addEventListener('click', (ev) => { if (ev.target.classList.contains('modal-backdrop')) closeGalleryModal(); });

// Gallery Navigation Handlers
galleryPrev.addEventListener('click', () => {
    currentGalleryIndex--;
    updateGallery();
});
galleryNext.addEventListener('click', () => {
    currentGalleryIndex++;
    updateGallery();
});

// Keyboard navigation (optional enhancement)
document.addEventListener('keydown', (e) => {
    if (galleryModalBackdrop.classList.contains('show')) {
        if (e.key === 'ArrowLeft') {
            currentGalleryIndex--;
            updateGallery();
        } else if (e.key === 'ArrowRight') {
            currentGalleryIndex++;
            updateGallery();
        } else if (e.key === 'Escape') {
            closeGalleryModal();
        }
    }
});