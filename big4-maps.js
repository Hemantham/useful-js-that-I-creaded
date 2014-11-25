///big4 maps functiality , hemantha, 2014-10-21

var Big4Maps = (function() {
    
    var _selectedClusterIconUrl = 'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m3.png';
    var _unSelectedClusterIconUrl = 'http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m1.png';
    var _baseUrl;
    var _selectedIconUrl;
    var _youArehereIconUrl;
    var _unSelectedIconUrl;
    var _unSelectedAttractionIconUrl;
    var _$start;  // this is the start and end texboxes for direction type. this valye will be populated from DirectionRequest.[Start|End]
    var _$end ;
    var _$getLocation ;
    var _$directionsPanel ;
    var _$mapCanvas;
    var _$getLocationButton;

   
    var mcOptions;
    var markers = [];
    var clusterer;
    var map;
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var waypts = null;
    var _model = {
        Zoom: 10,
        IsAutoBounds: true,
        AreaFilter: [],  // bit complecated to initialize with defaults. not required for itinerary type
        Title: 'Map of Unknown',
        IsFullScreen: true,
        MapType: 'park', // available types : park = 0,state = 2,region = 3,directions = 4,country = 5,city = 6,itinerary = 7,attraction = 8,
        Center : { X : -37.0 , Y : 143.0},
        Waypoints : [
        {
            Street : "311 Great Ocean Road ",
            City : "APOLLO BAY",
            PostCode : "3233",
        }],

        DirectionRequest : {
                            Start : {
                                    Street : "78 Bellarine Highway",
                                    City : "Queenscliff",
                                    PostCode :"3225",
                                },
                            End : {
                                    Street : "45 Murray St",
                                    City : "Anglesea",
                                    PostCode : "3230",
                                }
                            
        }

    };

    var initClusterIcons = function () {

        mcOptions = {
            styles: [{
                    height: 44,
                    url: _unSelectedClusterIconUrl,
                    width: 38,
                    textColor: '#fff'
                    },
                {
                    height: 44, //56,
                    url: _unSelectedClusterIconUrl,
                    width: 38 ,//56,
                    textColor: '#fff'
                },
                {
                    height: 44,// 66,
                    url: _unSelectedClusterIconUrl,
                    width: 38, //66
                    textColor: '#fff'
                },
                {
                    height: 44,// 78,
                    url: _unSelectedClusterIconUrl,
                    width: 38, // 78
                    textColor: '#fff'
                },
                {
                    height: 44, // 90,
                    url: _unSelectedClusterIconUrl,
                    width: 38, //90
                    textColor: '#fff'
                }],
            gridSize: 20
        }

    }

    var calcRoute = function (next) {

        //debugger;
        //todo after proper license remmove this limit

        waypts = _model.Waypoints ? _model.Waypoints : [];
       
        waypts = (waypts.length > 8) ? waypts.slice(0,8) : waypts;

        var start = _$start.val() || (_model.DirectionRequest.Start.Street
            + (_model.DirectionRequest.Start.City ? ', ' + _model.DirectionRequest.Start.City : '')
            + (_model.DirectionRequest.Start.PostCode ? ', ' + _model.DirectionRequest.Start.PostCode : '')
            + ', Australia');

        var end = _$end.val() || (_model.DirectionRequest.End.Street
            + (_model.DirectionRequest.End.City ? (', ' + _model.DirectionRequest.End.City) : '')
            + (_model.DirectionRequest.End.PostCode ? (', ' + _model.DirectionRequest.End.PostCode) : '')
            +  ', Australia');
        
        var request = {
            origin: start,
            destination: end,
            waypoints: $.map(waypts || [], function(point) {
                return {
                    location:
                    (point.Latitude && point.Longitude) ? new google.maps.LatLng(point.Latitude ,  point.Longitude) :
                      (  point.Street
                        + (point.City ? (', ' + point.City) : '')
                        + (point.PostCode ? (', ' + point.PostCode) : '')
                        + ', Australia' )
                    ,
                    stopover: true
                }
            }),
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING
        };


        //if (_model.MapType == 'itinerary') {
        //    directionsService.route(request, renderCustomDirections);
        //} else
        //{
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                if (next) {
                    next(response.routes[0].legs[0].start_location);
                }
                directionsDisplay.setDirections(response);
             
            } else {
                alert('No results found');
            }
        });

      
       // }
    };



    var getCurLocation = function() {

        //if (navigator.geolocation) {
        //    navigator.geolocation.getCurrentPosition(getCurAddress, getCurLocationError);
        //} else {
        //    // Browser doesn't support Geolocation
        //    getCurLocationError();su
        //}

        if (geo_position_js.init()) {
            geo_position_js.getCurrentPosition(getCurAddress, getCurLocationError);
        } else {
            getCurLocationError();
        }
    };

    var getCurLocationError = function() {
        console.log('unable to get current position');
    };

    var getCurAddress = function(position) {
        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'latLng': latlng }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    var start = _$start;
                    start.val(results[1].formatted_address);
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    };

    var setDirectionDisplay = function(map) {

        var rendererOptions = {
            draggable: true
            ,
            suppressMarkers:   true,
        };
        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
        directionsDisplay.setMap(map);
        if (_$directionsPanel.length > 0) {
            directionsDisplay.setPanel(_$directionsPanel.get(0));
        }

    };

    var getTooltip = function(item) {

        if (item.GeoLocationType == "attraction") {
            return getAtractionTooltip(item);
        } else {
            return getParkMapTooltip(item);
        }
    };

    var getParkMapTooltip = function(park) {

        return '<div class="park-map-tooltip blocklinks closer-p">'
            + '<a href="' + park.Uri + '">'
            + '<p><span class="img-or-size-bg-16-9" style="background-image: url(' + park.ParkHeroImage + ')"><img src="' + park.ParkHeroImage + '" alt="' + park.Name + '" /></span></p>'
            + '<p class="hdg h6 bright-blue">' + park.Name + '</p>'
            + '</a>'
            + '<p class="parkAddress"> ' + park.Street + ' <br /> ' + park.City + ', ' + park.LocationStateCode + ', ' + park.PostCode + ' </p>'
            + '<p class="parkRating">'
            + ((park.Rating != null && park.Rating > 0) ? ('<span class="rating-stars ' + getgRatingCss(park.Rating) + '"></span>') : '')
            + '<i class="b4-icon ' + getDogsAllowCss(park.DogsAllow) + '"></i></p>'
            + '</div>';
    };

    var getAtractionTooltip = function(item) {

        return '<div class="park-map-tooltip blocklinks closer-p">'
            + '<a href="' + item.Uri + '">'
            + '<p><span class="img-or-size-bg-16-9" style="background-image: url(' + item.ParkHeroImage + ')"><img src="' + item.ParkHeroImage + '" alt="' + item.Name + '" /></span></p>'
            + '<p class="hdg h6 bright-blue">' + item.Name + '</p>'
            + '</a>'
            + '<p class="parkAddress"> ' + item.Brief + ' </p>'
            + '</div>';
    };

    var getgRatingCss = function(rating) {
        if (rating == null || rating == 0) {
            return '';
        } else {
            var floor = Math.floor(rating);
            return 'stars-' + floor + (rating > floor ? "h" : "");
        }
    };

    var getDogsAllowCss = function(dogsAllow) {

        return dogsAllow ? "b4-icon-dogs green" : "b4-icon b4-icon-dogs-no";

    };

    var selectIcon = function(regionElement, isSelect) {

        var location = regionElement.parent().parent().attr('data-location-name').replace("'", " ").replace('\\', ' ');
        var clusters = clusterer.getClusters();
        var iconCluster = isSelect ? _selectedClusterIconUrl : _unSelectedClusterIconUrl;
        var icon = isSelect ? _selectedIconUrl : _unSelectedIconUrl;
        var locationType = regionElement.closest('.location-park-region-item').length > 0 ? "region" : "city";

        $.each(clusters, function(i, currentCluster) {
            var isClusterUpdated = false;
            $.each(currentCluster.getMarkers(), function(j, currentMarker) {
                if ((locationType == "region" && currentMarker.big4_region == location)
                        || (locationType == "city" && currentMarker.big4_city == location)
                ) {
                    if (currentCluster.getMarkers().length > 1) {
                        if (!isClusterUpdated) {
                            $(currentCluster.clusterIcon_.div_).find('img').attr('src', iconCluster);
                        }
                        isClusterUpdated = true;
                    }
                    currentMarker.setIcon(icon);
                }
            });
        });

    };

    var getParks = function () {
        var subdomains = "?s=" + $.map(_model.AreaFilter, function (p, i) {
            return (p.SubDomain);
        }).join("&s=");

        $.ajax({
            type: "GET",
            url: _baseUrl + 'mapdata/mapparks' + subdomains,
            success: function (results) {
                _model.AreaFilter = results;
                initialize();
            }
        });
    };

    var initialize = function() {
        var location = new google.maps.LatLng(_model.Center.X,  _model.Center.Y);
        var mapOptions = {
            zoom: _model.Zoom,
            scrollwheel: _model.IsFullScreen,
            draggable: _model.IsFullScreen || !(B.isTouchSupported()),
            center: location
        };

    map = new google.maps.Map(_$mapCanvas.get(0), mapOptions);

    //  Create a new viewpoint bound
    var bounds = new google.maps.LatLngBounds();
    var singleInfoWindow;

    $.each(_model.AreaFilter, function(indexx, item) {
        var latlong = new google.maps.LatLng(item.Latitude, item.Longitude);
        var marker = new google.maps.Marker({
            position: latlong,
            map: map,
            title: item.Name,
            big4_region: item.LocationName,
            big4_city: item.City
        });
      
        marker.setIcon( item.Icon ? item.Icon : _unSelectedIconUrl );
        markers.push(marker);
        var infowindow = new google.maps.InfoWindow({
            content: getTooltip(item)
        });
        singleInfoWindow = infowindow;
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
        bounds.extend(latlong);
    });

    if (_model.MapType == 'directions') {
        setDirectionDisplay(map);
    } else if (_model.MapType == 'itinerary') {
        setDirectionDisplay(map);
        calcRoute();
    }

    if (_model.IsAutoBounds) {

        map.fitBounds(bounds);

        $(window).resize(function () {
            map.fitBounds(bounds);
        });
    }
   
    clusterer = new MarkerClusterer(map, markers, mcOptions);
       
    //if just one park or attaction show the info window when load
    //if (markers.length == 1 && !_model.IsStatic) {
    //    singleInfoWindow.open(map, markers[0]);
    //}

    };

    var startmarker;
    var addstartpoint = function(start) {
        // debugger;
        if (startmarker != null) {
            startmarker.setMap(null);
        }
        startmarker = new google.maps.Marker({
            position: start,
            map: map,
            title: 'You are here'
        });
      
         startmarker.setIcon(_youArehereIconUrl);
        // markers.push(startmarker);
  }
    
    return {

        Init: function (options) { // this needs to be  called in $(function(){}) // document ready
            
            _selectedClusterIconUrl = options.selectedClusterIconUrl || _selectedClusterIconUrl;
            _unSelectedClusterIconUrl =  options.unSelectedClusterIconUrl || _unSelectedClusterIconUrl;
            _selectedIconUrl =  options.selectedIconUrl || _selectedIconUrl;
            _unSelectedIconUrl = options.unSelectedIconUrl || _unSelectedIconUrl;
            _unSelectedAttractionIconUrl = options.unSelectedAttractionIconUrl || _unSelectedAttractionIconUrl;
            _youArehereIconUrl = options.youArehereIconUrl || '';
            _baseUrl = options.baseUrl ;
            
            
            _$start = options.start || $('#start');;
            _$end = options.end || $('#end');
            _$getLocation = options.getLocation || $('#curloc');
            _$getLocationButton = options.getLocation || $('#go');
            _$directionsPanel = options.directionsPanel || $('#directions-panel');
            _$mapCanvas = options.mapCanvas || $('#map-canvas');
            _model = options.model || _model;

            //_model.Waypoints = _model.Waypoints.slice(0, 4); //todo remove
          
            if (_model.IsStatic) {
                _$mapCanvas.css("width", "400px");
                _$mapCanvas.css("height", "400px");
            }

            initClusterIcons();
            initialize();


            $('.location-park-city-item a').on('mouseover', function() {
                selectIcon($(this), true);
            });

            $('.location-park-region-item a').on('mouseover', function() {
                selectIcon($(this), true);
            });

            $('.location-park-region-item a').on('mouseout', function() {
                selectIcon($(this), false);
            });

            $('.location-park-city-item a').on('mouseout', function() {
                selectIcon($(this), false);
            });

            _$getLocation.on("click", function(e) {
                e.preventDefault();
                getCurLocation();
            });
			
			
            _$getLocationButton.on("click", function (e) {
               // debugger;
                e.preventDefault();
                calcRoute(addstartpoint); 
            });
            
			
            _$getLocationButton.closest("form").on("submit", function (e) {
            	e.preventDefault();
            	calcRoute(addstartpoint);
            });

           

            //$( window ).resize(function() {
            //    initialize();
            //});

            //google.maps.event.addDomListener(window, 'load', initialize);
            // $(window).load(initialize);

        }
    };

})();
















