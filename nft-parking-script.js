// Main JavaScript for NFT Parking Slot Marketplace
document.addEventListener('DOMContentLoaded', function() {
  // Global variables
  let web3;
  let currentAccount = null;
  const mockParkingNFTs = [];
  const mockAuctions = [];
  const mockMyNFTs = [];
  
  // DOM elements
  const loadingScreen = document.getElementById('loading');
  const connectWalletBtn = document.getElementById('connect-wallet');
  const walletAddressSpan = document.getElementById('wallet-address');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Modals
  const purchaseModal = document.getElementById('purchase-modal');
  const auctionModal = document.getElementById('auction-modal');
  const listModal = document.getElementById('list-modal');
  const createModal = document.getElementById('create-modal');
  const txConfirmationModal = document.getElementById('tx-confirmation-modal');
  
  // Close buttons for modals
  const closeButtons = document.querySelectorAll('.close');
  
  // Initialize the application
  function init() {
    // Check if Web3 is already available
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      loadingScreen.style.display = 'none';
      setupEventListeners();
      generateMockData();
      renderMarketplace();
      renderAuctions();
    } else {
      // No Web3 provider detected
      loadingScreen.querySelector('p').textContent = 'Please install MetaMask to use this application';
      
      // Add a button to continue without Web3
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn';
      continueBtn.textContent = 'Continue with Demo Mode';
      continueBtn.onclick = function() {
        loadingScreen.style.display = 'none';
        setupEventListeners();
        generateMockData();
        renderMarketplace();
        renderAuctions();
      };
      loadingScreen.appendChild(continueBtn);
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Connect wallet button
    connectWalletBtn.addEventListener('click', connectWallet);
    
    // Tabs
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        switchTab(tabId);
      });
    });
    
    // Close buttons for modals
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
      });
    });
    
    // Window click to close modals
    window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
      }
    });
    
    // Purchase confirmation
    document.getElementById('confirm-purchase').addEventListener('click', purchaseNFT);
    
    // Auction bid placement
    document.getElementById('place-bid').addEventListener('click', placeBid);
    
    // Listing type change
    document.getElementById('listing-type').addEventListener('change', toggleListingForm);
    
    // Confirm listing
    document.getElementById('confirm-listing').addEventListener('click', listNFT);
    
    // New listing options toggle
    document.querySelectorAll('input[name="list-new"]').forEach(radio => {
      radio.addEventListener('change', function() {
        const listOptions = document.getElementById('new-listing-options');
        listOptions.style.display = this.value === 'yes' ? 'block' : 'none';
      });
    });
    
    // New listing type change
    document.getElementById('new-listing-type').addEventListener('change', function() {
      const fixedForm = document.getElementById('new-fixed-price-form');
      const auctionForm = document.getElementById('new-auction-form');
      
      if (this.value === 'fixed') {
        fixedForm.style.display = 'block';
        auctionForm.style.display = 'none';
      } else {
        fixedForm.style.display = 'none';
        auctionForm.style.display = 'block';
      }
    });
    
    // Create NFT button
    document.getElementById('confirm-create').addEventListener('click', createNFT);
    
    // Close transaction confirmation
    document.getElementById('close-tx-confirmation').addEventListener('click', function() {
      txConfirmationModal.style.display = 'none';
    });
  }
  
  // Connect wallet function
  async function connectWallet() {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        walletAddressSpan.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;
        
        // Change button text
        connectWalletBtn.textContent = 'Wallet Connected';
        connectWalletBtn.disabled = true;
        
        // Update UI for connected state
        document.querySelector('.hero').classList.add('connected');
        
        // Load user's NFTs
        loadMyNFTs();
        
        return true;
      } catch (error) {
        console.error("User denied account access:", error);
        return false;
      }
    } else {
      alert('Please install MetaMask to connect your wallet!');
      return false;
    }
  }
  
  // Switch tab function
  function switchTab(tabId) {
    // Update active tab
    tabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Update active content
    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // If switching to my-nfts tab and wallet is connected, reload
    if (tabId === 'my-nfts' && currentAccount) {
      loadMyNFTs();
    }
  }
  
  // Generate mock data for testing
  function generateMockData() {
    // Sample features
    const features = [
      'EV Charging', '24/7 Security', 'Covered Parking', 'CCTV', 
      'Near Elevator', 'Easy Access', 'Premium Location', 'Reserved Space'
    ];
    
    // Generate marketplace items
    for (let i = 1; i <= 6; i++) {
      // Select random features
      const itemFeatures = [];
      const featureCount = Math.floor(Math.random() * 4) + 1;
      
      for (let j = 0; j < featureCount; j++) {
        const feature = features[Math.floor(Math.random() * features.length)];
        if (!itemFeatures.includes(feature)) {
          itemFeatures.push(feature);
        }
      }
      
      mockParkingNFTs.push({
        id: `nft-${i}`,
        name: `Premium Spot A-${i}`,
        location: `Downtown Business Center, Level ${Math.floor(Math.random() * 5) + 1}`,
        price: (Math.random() * 0.5 + 0.1).toFixed(3),
        features: itemFeatures,
        owner: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
      });
    }
    
    // Generate auction items
    for (let i = 1; i <= 4; i++) {
      // Select random features
      const itemFeatures = [];
      const featureCount = Math.floor(Math.random() * 4) + 1;
      
      for (let j = 0; j < featureCount; j++) {
        const feature = features[Math.floor(Math.random() * features.length)];
        if (!itemFeatures.includes(feature)) {
          itemFeatures.push(feature);
        }
      }
      
      // Generate random end time (between 1 hour and 24 hours from now)
      const hoursLeft = Math.floor(Math.random() * 23) + 1;
      const minutesLeft = Math.floor(Math.random() * 60);
      const secondsLeft = Math.floor(Math.random() * 60);
      
      // Generate bid history
      const bidHistory = [];
      const bidCount = Math.floor(Math.random() * 5);
      let currentBid = (Math.random() * 0.3 + 0.05).toFixed(3);
      
      for (let j = 0; j < bidCount; j++) {
        const bidder = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        bidHistory.unshift({
          bidder: bidder,
          amount: currentBid,
          time: new Date(Date.now() - Math.random() * 86400000).toLocaleString()
        });
        currentBid = (parseFloat(currentBid) - (Math.random() * 0.05)).toFixed(3);
      }
      
      mockAuctions.push({
        id: `auction-${i}`,
        name: `Prime Spot B-${i}`,
        location: `Shopping Mall Complex, Section ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
        currentBid: bidHistory.length > 0 ? bidHistory[0].amount : currentBid,
        features: itemFeatures,
        endTime: new Date(Date.now() + (hoursLeft * 3600000) + (minutesLeft * 60000) + (secondsLeft * 1000)),
        bidHistory: bidHistory
      });
    }
    
    // Generate user's NFTs if they were connected
    if (currentAccount) {
      loadMyNFTs();
    }
  }
  
  // Load user's NFTs
  function loadMyNFTs() {
    // Clear current NFTs
    mockMyNFTs.length = 0;
    
    // Add 0-3 NFTs from marketplace (simulating ownership)
    const ownedCount = Math.floor(Math.random() * 4);
    for (let i = 0; i < ownedCount; i++) {
      if (i < mockParkingNFTs.length) {
        const nft = {...mockParkingNFTs[i]};
        nft.owner = currentAccount;
        mockMyNFTs.push(nft);
      }
    }
    
    // Add 1-2 unique NFTs
    const uniqueCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < uniqueCount; i++) {
      mockMyNFTs.push({
        id: `my-nft-${i}`,
        name: `My Private Spot X-${i+1}`,
        location: 'Personal Residence Building',
        features: ['Personal Use', 'High Security'],
        owner: currentAccount,
        forSale: false
      });
    }
    
    // Render the user's NFTs
    renderMyNFTs();
  }
  
  // Render marketplace
  function renderMarketplace() {
    const marketplaceContainer = document.getElementById('marketplace-items');
    marketplaceContainer.innerHTML = '';
    
    mockParkingNFTs.forEach((nft, index) => {
      const nftElement = createNFTElement(nft, 'marketplace');
      marketplaceContainer.appendChild(nftElement);
    });
  }
  
  // Render auctions
  function renderAuctions() {
    const auctionContainer = document.getElementById('auction-items');
    auctionContainer.innerHTML = '';
    
    mockAuctions.forEach((auction, index) => {
      const auctionElement = createNFTElement(auction, 'auction');
      auctionContainer.appendChild(auctionElement);
    });
    
    // Start countdown timers
    updateAuctionTimers();
  }
  
  // Render user's NFTs
  function renderMyNFTs() {
    const myNFTsContainer = document.getElementById('owned-nfts');
    myNFTsContainer.innerHTML = '';
    
    if (currentAccount && mockMyNFTs.length > 0) {
      mockMyNFTs.forEach((nft, index) => {
        const nftElement = createNFTElement(nft, 'owned');
        myNFTsContainer.appendChild(nftElement);
      });
    } else if (currentAccount) {
      myNFTsContainer.innerHTML = '<p class="no-items-message">You don\'t own any parking NFTs yet. Create or purchase one to get started!</p>';
    } else {
      myNFTsContainer.innerHTML = '<p class="no-items-message">Please connect your wallet to see your NFTs.</p>';
    }
  }
  
  // Create NFT element
  function createNFTElement(nft, type) {
    const container = document.createElement('div');
    container.className = 'parking-item';
    container.setAttribute('data-id', nft.id);
    
    // Create image
    const imageDiv = document.createElement('div');
    imageDiv.className = 'parking-image';
    
    const img = document.createElement('img');
    img.src = `/api/placeholder/300/200`;
    img.alt = nft.name;
    
    imageDiv.appendChild(img);
    container.appendChild(imageDiv);
    
    // Create details section
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'parking-details';
    
    // NFT name
    const nameElem = document.createElement('h3');
    nameElem.className = 'parking-name';
    nameElem.textContent = nft.name;
    detailsDiv.appendChild(nameElem);
    
    // Location
    const locationElem = document.createElement('p');
    locationElem.className = 'parking-location';
    locationElem.textContent = nft.location;
    detailsDiv.appendChild(locationElem);
    
    // Features
    if (nft.features && nft.features.length > 0) {
      const featuresDiv = document.createElement('div');
      featuresDiv.className = 'parking-features';
      
      nft.features.forEach(feature => {
        const featureTag = document.createElement('span');
        featureTag.className = 'feature-tag';
        featureTag.textContent = feature;
        featuresDiv.appendChild(featureTag);
      });
      
      detailsDiv.appendChild(featuresDiv);
    }
    
    // Price or current bid
    const priceElem = document.createElement('div');
    priceElem.className = 'parking-price';
    
    if (type === 'marketplace') {
      priceElem.textContent = `${nft.price} ETH`;
    } else if (type === 'auction') {
      priceElem.textContent = `Current bid: ${nft.currentBid} ETH`;
      
      // Add auction timer for auctions
      const timerElem = document.createElement('div');
      timerElem.className = 'auction-timer';
      timerElem.innerHTML = `Ends in: <span class="time-left" data-end="${nft.endTime.getTime()}">Loading...</span>`;
      detailsDiv.appendChild(timerElem);
    }
    
    detailsDiv.appendChild(priceElem);
    
    // Action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'action-buttons';
    
    if (type === 'marketplace') {
      const buyBtn = document.createElement('button');
      buyBtn.className = 'btn btn-full';
      buyBtn.textContent = 'Buy Now';
      buyBtn.addEventListener('click', () => showPurchaseModal(nft));
      actionsDiv.appendChild(buyBtn);
    } else if (type === 'auction') {
      const bidBtn = document.createElement('button');
      bidBtn.className = 'btn btn-full';
      bidBtn.textContent = 'Place Bid';
      bidBtn.addEventListener('click', () => showAuctionModal(nft));
      actionsDiv.appendChild(bidBtn);
    } else if (type === 'owned') {
      const listBtn = document.createElement('button');
      listBtn.className = 'btn';
      listBtn.textContent = 'List for Sale';
      listBtn.addEventListener('click', () => showListModal(nft));
      actionsDiv.appendChild(listBtn);
      
      const transferBtn = document.createElement('button');
      transferBtn.className = 'btn btn-outline';
      transferBtn.textContent = 'Transfer';
      transferBtn.addEventListener('click', () => {
        alert('Transfer functionality will be implemented in a future update.');
      });
      actionsDiv.appendChild(transferBtn);
    }
    
    detailsDiv.appendChild(actionsDiv);
    container.appendChild(detailsDiv);
    
    return container;
  }
  
  // Show purchase modal
  function showPurchaseModal(nft) {
    // Fill in details
    document.getElementById('purchase-slot-name').textContent = nft.name;
    document.getElementById('purchase-slot-location').textContent = nft.location;
    document.getElementById('purchase-slot-price').textContent = `${nft.price} ETH`;
    document.getElementById('purchase-slot-owner').textContent = `${nft.owner.substring(0, 6)}...${nft.owner.substring(38)}`;
    
    // Store NFT ID
    document.getElementById('confirm-purchase').setAttribute('data-id', nft.id);
    
    // Show modal
    purchaseModal.style.display = 'block';
  }
  
  // Show auction modal
  function showAuctionModal(auction) {
    // Fill in details
    document.getElementById('auction-slot-name').textContent = auction.name;
    document.getElementById('auction-slot-location').textContent = auction.location;
    document.getElementById('auction-current-bid').textContent = `${auction.currentBid} ETH`;
    
    // Calculate minimum bid (5% more than current)
    const minBid = (parseFloat(auction.currentBid) * 1.05).toFixed(3);
    document.getElementById('bid-amount').min = minBid;
    document.getElementById('bid-amount').value = minBid;
    
    // Update auction timer
    const timeLeft = getTimeLeft(auction.endTime);
    document.getElementById('auction-time-left').textContent = timeLeft;
    
    // Populate bid history
    const bidHistoryList = document.getElementById('bid-history-list');
    bidHistoryList.innerHTML = '';
    
    if (auction.bidHistory && auction.bidHistory.length > 0) {
      auction.bidHistory.forEach(bid => {
        const bidItem = document.createElement('div');
        bidItem.className = 'bid-item';
        
        const bidderSpan = document.createElement('span');
        bidderSpan.className = 'bidder';
        bidderSpan.textContent = `${bid.bidder.substring(0, 6)}...${bid.bidder.substring(38)}`;
        
        const amountSpan = document.createElement('span');
        amountSpan.className = 'bid-amount';
        amountSpan.textContent = `${bid.amount} ETH`;
        
        bidItem.appendChild(bidderSpan);
        bidItem.appendChild(amountSpan);
        bidHistoryList.appendChild(bidItem);
      });
    } else {
      bidHistoryList.innerHTML = '<p>No bids yet. Be the first to bid!</p>';
    }
    
    // Store auction ID
    document.getElementById('place-bid').setAttribute('data-id', auction.id);
    
    // Show modal
    auctionModal.style.display = 'block';
  }
  
  // Show list for sale modal
  function showListModal(nft) {
    // Fill in details
    document.getElementById('list-slot-name').textContent = nft.name;
    
    // Reset form
    document.getElementById('listing-type').value = 'fixed';
    document.getElementById('listing-price').value = '';
    document.getElementById('auction-start-price').value = '';
    document.getElementById('auction-duration').value = '24';
    
    // Show appropriate form
    document.getElementById('fixed-price-form').style.display = 'block';
    document.getElementById('auction-form').style.display = 'none';
    
    // Store NFT ID
    document.getElementById('confirm-listing').setAttribute('data-id', nft.id);
    
    // Show modal
    listModal.style.display = 'block';
  }
  
  // Show create NFT modal
  function showCreateModal() {
    // Reset form
    document.getElementById('new-slot-name').value = '';
    document.getElementById('new-slot-location').value = '';
    document.getElementById('new-slot-features').value = '';
    document.getElementById('new-slot-image').value = '';
    document.getElementById('list-no').checked = true;
    document.getElementById('new-listing-options').style.display = 'none';
    
    // Show modal
    createModal.style.display = 'block';
  }
  
  // Show transaction confirmation modal
  function showTransactionModal(message) {
    document.getElementById('tx-status').textContent = message || 'Processing your transaction...';
    document.getElementById('tx-hash').textContent = '';
    document.getElementById('close-tx-confirmation').style.display = 'none';
    txConfirmationModal.style.display = 'block';
    
    // Generate mock transaction hash
    setTimeout(() => {
      const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      document.getElementById('tx-hash').textContent = txHash;
    }, 1500);
  }
  
  // Complete transaction (mock)
  function completeTransaction(success, message) {
    if (success) {
      document.getElementById('tx-status').textContent = message || 'Transaction completed successfully!';
      document.getElementById('tx-status').style.color = 'var(--success-color)';
    } else {
      document.getElementById('tx-status').textContent = message || 'Transaction failed. Please try again.';
      document.getElementById('tx-status').style.color = 'var(--accent-color)';
    }
    
    document.getElementById('close-tx-confirmation').style.display = 'block';
  }
  
  // Toggle listing form based on selected type
  function toggleListingForm() {
    const listingType = document.getElementById('listing-type').value;
    const fixedForm = document.getElementById('fixed-price-form');
    const auctionForm = document.getElementById('auction-form');
    
    if (listingType === 'fixed') {
      fixedForm.style.display = 'block';
      auctionForm.style.display = 'none';
    } else {
      fixedForm.style.display = 'none';
      auctionForm.style.display = 'block';
    }
  }
  
  // Purchase NFT function
  function purchaseNFT() {
    // Check if wallet is connected
    if (!currentAccount) {
      if (!connectWallet()) {
        return;
      }
    }
    
    // Get NFT ID
    const nftId = this.getAttribute('data-id');
    const nft = mockParkingNFTs.find(n => n.id === nftId);
    
    if (!nft) {
      alert('NFT not found');
      return;
    }
    
    // Close purchase modal
    purchaseModal.style.display = 'none';
    
    // Show transaction modal
    showTransactionModal(`Purchasing ${nft.name} for ${nft.price} ETH...`);
    
    // Simulate transaction
    setTimeout(() => {
      // 90% chance of success
      const success = Math.random() < 0.9;
      
      if (success) {
        // Update ownership and add to user's NFTs
        nft.owner = currentAccount;
        
        // Remove from marketplace array (but keep in memory)
        const nftIndex = mockParkingNFTs.findIndex(n => n.id === nftId);
        if (nftIndex !== -1) {
          mockParkingNFTs.splice(nftIndex, 1);
        }
        
        // Add to user's NFTs if not already there
        if (!mockMyNFTs.some(n => n.id === nftId)) {
          mockMyNFTs.push(nft);
        }
        
        // Complete transaction
        completeTransaction(true, `Successfully purchased ${nft.name}!`);
        
        // Update UI
        renderMarketplace();
        renderMyNFTs();
      } else {
        // Failed transaction
        completeTransaction(false, 'Transaction failed. Insufficient funds or network error.');
      }
    }, 3000);
  }
  
  // Place bid function
  function placeBid() {
    // Check if wallet is connected
    if (!currentAccount) {
      if (!connectWallet()) {
        return;
      }
    }
    
    // Get auction ID
    const auctionId = this.getAttribute('data-id');
    const auction = mockAuctions.find(a => a.id === auctionId);
    
    