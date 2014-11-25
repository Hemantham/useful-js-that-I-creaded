
var _gaq = _gaq || [];

(function() {
  
var getAccountIDs = function() {

    var str = document.URL;
    var accountids = [];
    accountids.push('UA-4661258-1');
    
    if (str.match(/(\/nsw(\/|\b))/gi)!= null) {
        accountids.push('UA-5096763-2');
        accountids.push('UA-6442986-1');
    }
    if (str.match(/(\/qld(\/|\b))/gi)!= null) {
        accountids.push('UA-5114826-2');
    }
    if (str.match(/(\/sa(\/|\b))/gi)!= null) {
        accountids.push('UA-5115976-1');
    }
    if (str.match(/(\/tas(\/|\b))/gi) != null) {
        accountids.push('UA-5542065-1');
    }
    if (str.match(/(\/vic(\/|\b))/gi)!= null) {
        accountids.push('UA-5114927-2');
    }
    if (str.match(/(\/wa(\/|\b))/gi)!= null) {
        accountids.push('UA-5116106-1');
    }
    if (str.match(/(\/nt(\/|\b))/gi)!= null) {
        accountids.push('UA-5542082-1');
    }
    
    return accountids;
}

// this code can be used when moved to analytics.js

////var _gaq = _gaq || [];
////_gaq.push(['_setAccount', 'UA-4661258-1']);
////_gaq.push(['_setDomainName', '.big4.com.au']);
////_gaq.push(['_setAllowLinker', true]);
////_gaq.push(['_trackPageview']);

////(function () {
////    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
////    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
////    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
////})();


///////**
////// * Creates a temporary global ga object and loads analy  tics.js.
////// * Paramenters o, a, and m are all used internally.  They could have been declared using 'var',
////// * instead they are declared as parameters to save 4 bytes ('var ').
////// *
////// * @param {Window}      i The global context object.
////// * @param {Document}    s The DOM document object.
////// * @param {string}      o Must be 'script'.
////// * @param {string}      g URL of the analytics.js script. Inherits protocol from page.
////// * @param {string}      r Global name of analytics object.  Defaults to 'ga'.
////// * @param {DOMElement?} a Async script tag.
////// * @param {DOMElement?} m First script tag in document.
////// */
//////(function(i, s, o, g, r, a, m){
//////    i['GoogleAnalyticsObject'] = r; // Acts as a pointer to support renaming.

//////    // Creates an initial ga() function.  The queued commands will be executed once analytics.js loads.
//////    i[r] = i[r] || function() {
//////            (i[r].q = i[r].q || []).push(arguments);
//////        },

//////    // Sets the time (as an integer) this tag was executed.  Used for timing hits.
//////    i[r].l = 1 * new Date();

//////    // Insert the script tag asynchronously.  Inserts above current tag to prevent blocking in
//////    // addition to using the async attribute.
//////    a = s.createElement(o),
//////    m = s.getElementsByTagName(o)[0];
//////    a.async = 1;
//////    a.src = g;
//////    m.parentNode.insertBefore(a, m);
//////})(window, document, 'script', '//www.google-analytics.com/analytics.js', '__gaTracker');

//////$.each(getAccountIDs, function(i) {
//////    __gaTracker('create', 'UA-XXXX-Y', 'auto'); // Creates the tracker with default parameters.
//////    __gaTracker('send', 'pageview');
//////});
    



$.each(getAccountIDs(), function (i, account) {
    if (i == 0) {
        _gaq.push(['_setAccount', account]);
        _gaq.push(['_setDomainName', '.big4.com.au']);
        _gaq.push(['_setAllowLinker', true]);
        _gaq.push(['_trackPageview']);
    } else {
        _gaq.push(['account' + i + '._setAccount', account]);
        _gaq.push(['account' + i + '._setDomainName', '.big4.com.au']);
        _gaq.push(['account' + i + '._setAllowLinker', true]);
        _gaq.push(['account' + i + '._trackPageview']);
    }
});

(function () {
  
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);

})();


//$(function() {
//    $('.trackEvent').each(function() {
//        var $this = $(this).on('click', function() {
//        var category =  $this.attr("track_category");
//        var action = $this.attr("track_action");
//        _gaq.push(['_trackEvent', category, action, 'value']);
//        });
//    });
//});

})();