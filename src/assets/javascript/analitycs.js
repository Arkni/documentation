// google analytics
(function(i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-67035328-2', 'auto');
ga('send', 'pageview');

if (report404ga) {
  ga('send', 'event', {
    eventCategory: 'documentation-not-found',
    eventAction: document.location.href,
    eventLabel: document.referrer || '',
    transport: 'beacon'
  });
}

(function scrollToHash() {
  if (window.location.hash != '') {
    var anchor = $(location.hash).get(0);
    if (anchor) {
      anchor.scrollIntoView();
    }
  }
})();
