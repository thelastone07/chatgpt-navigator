(function () {

if (!window.__myHistoryPatched) {
    window.__myHistoryPatched = true;
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    function triggerUrlChange() {
      console.log('URL changed');
      initializeNavigator();
    }

    history.pushState = function() {
      const result = pushState.apply(this, arguments);
      triggerUrlChange();
      return result;
    };

    history.replaceState = function() {
      const result = replaceState.apply(this, arguments);
      triggerUrlChange();
      return result;
    };

    window.addEventListener('popstate', triggerUrlChange);
  }

function trackSidebar() {
  const historyDiv = document.getElementById('history');
  if (!historyDiv) {
      setTimeout(trackSidebar, 1000);
      return;
  }
  console.log('Sidebar found',historyDiv);
  historyDiv.addEventListener('click', function(e) {
  // Check if the click was on an <a> tag or its descendant
  const aTag = e.target.closest('a');
  if (aTag && historyDiv.contains(aTag)) {
    console.log('changed url through a ');
    initializeNavigator();
  }
});
}

trackSidebar();       

let currentIdx = 0;
let scrollTimeout = null;
let scrollContainer = null;
let observer = null;
let isScrolling = false;
let isPaused = false;

function cleanup() {
  const container = document.getElementById('draggable-buttons-container');
  if (container) container.remove();

  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', throttledScrollHandler);
    scrollContainer = null;
  }

  if (observer) observer.disconnect();
}

function injectNavigator() {
  if (document.getElementById('draggable-buttons-container')) return;
  console.log('Injecting navigator');
  const container = document.createElement('div');
  container.id = 'draggable-buttons-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: '10000',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '5px',
    cursor: 'move',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '4px',
    userSelect: 'none'
  });

  const buttons = ['<<', '<', '>', '>>'];
  buttons.forEach(text => {
    const btn = document.createElement('button');
    btn.textContent = text;
    Object.assign(btn.style, {
      fontSize: '16px',
      transform: 'rotate(90deg)',
      color: 'green',
      margin: '2px 0',
      background: '#f8f8f8',
      border: '1px solid #ddd',
      borderRadius: '3px',
      cursor: 'pointer',
      userSelect: 'none'
    });
    container.appendChild(btn);
  });

  let isDragging = false, offsetX = 0, offsetY = 0;

  const handleMove = (clientX, clientY) => {
    container.style.top = `${clientY - offsetY}px`;
    container.style.left = `${clientX - offsetX}px`;
    container.style.right = 'auto';
  };

  container.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    handleMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  container.addEventListener('touchstart', e => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - container.getBoundingClientRect().left;
    offsetY = touch.clientY - container.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  document.body.appendChild(container);
}

function getConversationTurns() {
  return Array.from(document.querySelectorAll('[data-testid^="conversation-turn-"]'));
}

function scrollToConversation(idx) {
  const conversationTurns = getConversationTurns();
  if (conversationTurns.length === 0) return;
  idx = Math.max(0, Math.min(idx, conversationTurns.length - 1));
  console.log(`Scrolling to conversation turn at index: ${idx}`);
  conversationTurns[idx].scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
  updateCurrentIdx();
}

function updateCurrentIdx() {
const turns = getConversationTurns();
let visibleEls = [];

turns.forEach((el, idx) => {
  const rect = el.getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

  if (isVisible) {
    visibleEls.push({ idx, top: Math.abs(rect.top) });
  }
});

if (visibleEls.length > 0) {
  // If multiple visible - pick one closest to top
  visibleEls.sort((a, b) => a.top - b.top);
  const newIdx = visibleEls[0].idx;

  if (currentIdx !== newIdx) {
    currentIdx = newIdx;
    console.log(`Current conversation index: ${currentIdx}`);
    connectButtons();
  }
}
}


function throttledScrollHandler() {
  isScrolling = true;
  if (scrollTimeout) clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    isScrolling = false;
    updateCurrentIdx();
  }, 150);
}

function findScrollableParent(el) {
  while (el) {
    const style = getComputedStyle(el);
    const overflowY = style.overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function setupScrollTracking() {
  const sampleTurn = document.querySelector('[data-testid^="conversation-turn-"]');
  if (!sampleTurn) {
    setTimeout(setupScrollTracking, 100);
    return;
  }

  scrollContainer = findScrollableParent(sampleTurn);
  if (!scrollContainer) {
    setTimeout(setupScrollTracking, 100);
    return;
  }
  scrollContainer.addEventListener('scroll', throttledScrollHandler);
  updateCurrentIdx();
}

function connectButtons() {
  const container = document.getElementById('draggable-buttons-container');
  if (!container) return;
  const buttons = container.querySelectorAll('button');
  if (buttons.length < 4) return;

  buttons[0].onclick = () => scrollToConversation(0)
  buttons[1].onclick = () => scrollToConversation(currentIdx - 1)
  buttons[2].onclick = () => scrollToConversation(currentIdx + 1)
  buttons[3].onclick = () => scrollToConversation(getConversationTurns().length - 1)
}

function initializeNavigator() {
  cleanup();
  
  if (observer) observer.disconnect();
  function tryToObserve() {
    const ele = document.querySelector('[data-testid^="conversation-turn-"]');
    console.log('Trying to observe conversation turns', ele);
    if (!ele) {
      setTimeout(tryToObserve, 100);
      return;
    }
    injectNavigator();
    connectButtons();
    setupScrollTracking();

    const observerElement = ele.parentElement;
    observer = new MutationObserver(() => {
      if (isPaused) return;
      if (isScrolling) return;
      console.log('Firing observer');
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
      }, 100);
      if (!document.getElementById('draggable-buttons-container')) {
        injectNavigator();
      }
      setupScrollTracking();
    });
    console.log('setting up observer');
    observer.observe(observerElement, {
    childList: true,
    subtree: true
  });
  }

  setTimeout(tryToObserve,5000);
}

initializeNavigator();
})();
