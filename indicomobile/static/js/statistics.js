/* Piwik */
var _paq = _paq || [];
(function(){
    var u=(STATISTICS_SERVER);
    _paq.push(['setSiteId', STATISTICS_SITE]);
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript';
    g.defer=true;
    g.async=true;
    g.src=u+'piwik.js';
    s.parentNode.insertBefore(g,s);
    })();
/* End Piwik Code */
