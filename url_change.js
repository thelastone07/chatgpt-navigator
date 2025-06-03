(function(){
    
    console.log('URL change listener initialized');
    if (!window.__myHistoryPatched) {
    window.__myHistoryPatched = true;
    const pushState = history.pushState;
    const replaceState = history.replaceState;

    function triggerUrlChange() {
      console.log('URL changed');
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
    }
  });

  const navBar  = document.querySelector('nav[aria-label="Chat history"]');
  console.log('Nav bar found', navBar);
  if (navBar) {
    const asides = Array.from(navBar.children).filter(el => el.tagName.toLowerCase()==='aside');
    asides.forEach(aside =>  {
      aside.addEventListener('click', (e) => {
        const aTag = e.target.closest('a');
        if (aTag && navBar.contains(aTag)) {
          console.log('changed url through aside');
  
        }
      });
    })
  }
  }
    trackSidebar();         


})();