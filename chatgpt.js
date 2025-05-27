(function() {
  // --- 1. Inject Draggable Navigator ---
  function injectNavigator() {
    if (document.getElementById('draggable-buttons-container')) return; // Prevent duplicates

    const container = document.createElement('div');
    container.id = 'draggable-buttons-container';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '10000';
    container.style.backgroundColor = '#ffffff';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '5px';
    container.style.cursor = 'move';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    // Create buttons
    const buttons = ['<<', '<', '>', '>>'];
    buttons.forEach(text => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.fontSize = '16px';
      btn.style.transform = 'rotate(90deg)';
      btn.style.color = 'green';
      btn.style.margin = '2px 0';
      container.appendChild(btn);
    });

    // --- Draggable logic ---
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    container.addEventListener('mousedown', function(e) {
      isDragging = true;
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (isDragging) {
        container.style.top = (e.clientY - offsetY) + 'px';
        container.style.left = (e.clientX - offsetX) + 'px';
        container.style.right = 'auto';
      }
    });

    document.addEventListener('mouseup', function() {
      isDragging = false;
      document.body.style.userSelect = '';
    });

    // Touch support
    container.addEventListener('touchstart', function(e) {
      isDragging = true;
      const touch = e.touches[0];
      offsetX = touch.clientX - container.getBoundingClientRect().left;
      offsetY = touch.clientY - container.getBoundingClientRect().top;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('touchmove', function(e) {
      if (isDragging) {
        const touch = e.touches[0];
        container.style.top = (touch.clientY - offsetY) + 'px';
        container.style.left = (touch.clientX - offsetX) + 'px';
        container.style.right = 'auto';
      }
    });

    document.addEventListener('touchend', function() {
      isDragging = false;
      document.body.style.userSelect = '';
    });

    document.body.appendChild(container);
  }

  // --- 2. Conversation-turn Navigation Logic ---
  function getConversationTurns() {
    return Array.from(document.querySelectorAll('[data-testid]'))
      .filter(el => el.getAttribute('data-testid').startsWith('conversation-turn'));
  }

  let conversationTurns = getConversationTurns();
  let currentIdx = 0;

  function scrollToConversation(idx) {
    if (conversationTurns.length === 0) return;
    idx = Math.max(0, Math.min(idx, conversationTurns.length - 1));
    conversationTurns[idx].scrollIntoView({ behavior: "smooth", block: "center" });
    currentIdx = idx;
    // No highlight
  }

  // No highlightCurrent function needed!

  function updateCurrentOnScroll() {
    const viewportCenter = window.innerHeight / 2;
    let minDist = Infinity;
    let closestIdx = currentIdx;
    conversationTurns.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - viewportCenter);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    });
    if (closestIdx !== currentIdx) {
      currentIdx = closestIdx;
      // No highlight
    }
  }

  window.addEventListener('scroll', updateCurrentOnScroll);

  function connectButtons() {
    const container = document.getElementById('draggable-buttons-container');
    if (!container) return;
    const buttons = container.querySelectorAll('button');
    if (buttons.length < 4) return;

    // << First
    buttons[0].onclick = () => scrollToConversation(0);

    // < Previous
    buttons[1].onclick = () => scrollToConversation(currentIdx - 1);

    // > Next
    buttons[2].onclick = () => scrollToConversation(currentIdx + 1);

    // >> Last
    buttons[3].onclick = () => scrollToConversation(conversationTurns.length - 1);
  }

  // --- 3. MutationObserver to update everything if DOM changes ---
  const observer = new MutationObserver(() => {
    // Re-inject navigator if missing
    if (!document.getElementById('draggable-buttons-container')) {
      injectNavigator();
      connectButtons();
    }
    // Refresh conversation-turns and button connections
    conversationTurns = getConversationTurns();
    if (currentIdx >= conversationTurns.length) {
      currentIdx = conversationTurns.length - 1;
    }
    connectButtons();
  });
  // Observe the entire document, not just body!
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // --- 4. Initial setup ---
  injectNavigator();
  connectButtons();

  console.log('ChatGPT Navigator loaded successfully!');
})();
