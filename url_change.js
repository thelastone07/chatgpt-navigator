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
  }
    trackSidebar();         


})();