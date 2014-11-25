// symply add a refernce to this to enable shortlisting.
//short list button needs to be pre populated with required attributes
//: hemantha

B.initializeshortlist = function (url) {
  
    var getCookie =  function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    }

    var updateShotlistedButton = function () {
    var cookieString = getCookie("BIG4ParkShortlist");
    if (cookieString != '') {
        var cookies = $.parseJSON(cookieString);

        $("a[name='shortlistbutton']").each(function () {

            var $this = $(this);

            var id = $this.attr('data-shortlist-id');

            var type = $this.attr('data-shortlist-type');

            var matchs = $.grep(cookies, function (cookie) {

                return cookie.i == id && cookie.t == type;
            });

            if (matchs != null && matchs.length > 0) {
                $this.find('> *').addClass('saved');
                $this.find('.shortlisttext').html('Added to shortlist');
            }
        });
    }
}
    
    var getShortLists = function () {
        $.ajax({
            type: "GET",
            url: url + '-get',
            success: function (results) {
                //debugger;
                $(".nav-shortlist .number").html(results.length);

                $("html")[results.length > 0 ? 'addClass' : 'removeClass']("nav-shortlist-hasitems");
            }
        });
    };

    var addToShortList = function(shortList) {
        $.ajax({
            type: "POST",
            url: url,
            data: shortList,
            success: function() {
                getShortLists();
                updateShotlistedButton();
            },
            dataType: 'json'
        });
    };

    var removeFromShortList = function (shortList) {
        $.ajax({
            type: "POST",
            url: url + '/' + shortList.ID + '/delete',
            data: shortList,
            success: function () {
                getShortLists();
               
            },
            dataType: 'json'
        });
    };

    var removeAllFromShortList = function () {
    $.ajax({
        type: "POST",
        url: url + '/delete',
        success: function () {
            getShortLists();

        },
        dataType: 'json'
    });
};

    updateShotlistedButton();

    //removed since now it loads in th emain request
    //getShortLists();

    $("a[name='shortlistbutton']").on("click", function (e) {

        var shortList = {
            SubDomain: $(this).attr('data-shortlist-subdomain')
            , ID: $(this).attr('data-shortlist-id')
            , Type: $(this).attr('data-shortlist-type')
        };

        addToShortList(shortList);
        e.preventDefault();

        return false;
    });

    $('a.removeShortlistButton').on("click", function (e) {

        var shortList = {
            SubDomain: $(this).attr('data-shortlist-subdomain')
           , ID: $(this).attr('data-shortlist-id')
           , Type: $(this).attr('data-shortlist-type')
        };

        removeFromShortList(shortList);
        $(this).closest('[data-shortlist-container]').remove();
        if ($('[data-shortlist-container]').length == 0) {
            $('.noShortlistMessage').properShow();
            $('.shortListPanel').properHide();
            $('.shortlist-edit').properHide();
		}
        e.preventDefault();
    });

    $('a.removeAllShortlistButton').on("click", function (e) {
        
        removeAllFromShortList();
        $('[data-shortlist-container]').remove();
        $('.noShortlistMessage').properShow();
        $('.shortListPanel').properHide();
        $('.shortlist-edit').properHide();
        e.preventDefault();
    });
    
}