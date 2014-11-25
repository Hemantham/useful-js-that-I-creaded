B.SearchResults = function (Opts) {

    Opts = Opts || {};

    var LoadSearchResScripts = ['jquery', 'tmpl'];

    if (!JSON) LoadSearchResScripts.push('json2');

    B.Max_Distance = Opts.Max_Distance || 200;

    var Paging;

    B.R.push([LoadSearchResScripts, function (/*$, tmpl*/) {


        var $sliderText = $(".txt-distance-val");

        var $sliderRange = $(".search-filter-range-1");

        var sortStarted = function ($this) {
            isSelected = $this.hasClass("selected"),
				defaultSort = $this.attr("data-defaultsort") && $this.attr("data-defaultsort").toLowerCase();

            if (isSelected) {
                $this.toggleClass("desc");
            }
            else {
                $(".sort-criteria .selected").removeClass("selected desc");
                $this.addClass("selected");
                if (defaultSort == "desc") $this.addClass("desc");
            }

            B.searchAsync();
        }

        $('.sort-criteria :button').on("click", function (ev) {

            ev.preventDefault();

            sortStarted($(this));

        });

        $('select[name="SortCriteria"]').on("change", function (ev) {

            //debugger;

            B.searchAsync();

        });

        B.R.push(['rangeslider', function () {

            $sliderText.each(function() {

                var $this = $(this);
                $this.data("oldval", $this.val());

            }).on("change", function() {

                $sliderRange.val($sliderText.val()).change();

                B.searchAsync();

            }).on("blur", function () {

                var $this = $(this);
                if ($this.val() != $this.data("oldval")) {
                 //   B.searchAsync();
                    $this.data("oldval", $this.val());
                }

            });

            B.RangeSliders.AddVariant(".search-filter-range-1", {
                onSlide: function (position, value) {

                    $sliderText.val(value);

                },
                onSlideEnd: function (position, value) {

                    $sliderText.val(value);

                    B.searchAsync();

                }
            });

        }]);


        B.updateQueryStringParameter = function (uri, key, value, isReplace) {
            var re = new RegExp("([?|&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (isReplace && uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                return uri + separator + key + "=" + value;
            }
        };

        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        B.synchronizeLabels = function (elements) {

            elements = (
				elements ?
					$(elements) :
					$("#form-filter").find('[data-facet-group-name] input:checkbox:checked, select')
			);
            var labeldiv = $(".filterlabels");

            elements.each(function () {

                var element = $(this),
					sourcetext = '',
					sourceid = '',
					sourcetype = '',
					isShow = false
                ;
                if (element.is("[type=checkbox]")) {

                    sourcetext = element.next().text();
                    sourceid = element.attr("id");
                    sourcetype = "checkbox";
                    if (element.prop("checked")) {
                        isShow = true;
                    }

                } else if (element.is("select")) {

                    sourcetext = element.find("option:selected").text() + ' ' + element.closest(".field").find(".field-label").text();
                    sourceid = element.attr("id");
                    sourcetype = "select";
                    if (element.val() != '') {
                        isShow = true;
                    }
                }

                if (labeldiv.find("[data-sourceid='" + sourceid + "']").length > 0) {
                    labeldiv.find("[data-sourceid='" + sourceid + "']").remove();
                }

                if (isShow) {
                    $('<li data-sourceid="' + sourceid + '"><button type="button" class="btn small"><span>' + sourcetext + '</span> <i class="b4-icon b4-icon-cross"></i></button></li>').appendTo(labeldiv).find("button").on("click", function (ev) { B.deselectInputs(ev, this); });
                }

            });


        };

        $(function () {



            $("[data-facet-parent]").on('change', function (event) {
                var e = $(this);
                var ischecked = e.prop("checked");

                $("[data-facet-group-name ='" + e.val() + "']")
                 .find("input:checkbox")
                    .each(function () {

                        $(this).prop('checked', ischecked);

                        if (ischecked) {
                            $(this).attr('name', $(this).attr('group-name'));
                        } else {
                            $(this).removeAttr('name');
                        }
                        B.synchronizeLabels($(this));

                    });

                B.searchAsync();

            });


            $("[data-facet-group-name]").each(function () {
                var $group = $(this),
					groupName = $group.attr('data-facet-group-name')
                ;
                $group.find("input:checkbox").on('change', function (event) {
                    var e = $(this);

                    if (e.prop("checked")) {
                        e.attr('name', groupName);
                    } else {
                        e.removeAttr('name');
                    }
                    B.searchAsync();
                    B.synchronizeLabels(e);
                });
            });

            $(".filter-item select").on('change', function (event) {
                B.searchAsync();
                B.synchronizeLabels(this);
            });



            $("[clientlevelfilterfor]:checkbox").on('change', function (event) {

                //debugger;
                var identifierClass = $(this).attr('clientlevelfilterfor');

                var parentClass = $(this).attr('hidableparent');

                $('.' + identifierClass).properShow();
                $('.' + identifierClass).closest('.' + parentClass).properShow();

                $("[clientlevelfilterfor]:checkbox").each(function (index, value) {

                    var $this = $(this);

                    identifierClass = $this.attr('clientlevelfilterfor');

                    parentClass = $this.attr('hidableparent');

                    if (parentClass == null) {
                    	if ($this.prop('checked')) $('.' + identifierClass).properHide();
                    	$('.' + identifierClass + " .state-switcher:first").trigger('switch', ['none']);
                    } else {
                    	if ($this.prop('checked')) $('.' + identifierClass).closest('.' + parentClass).properHide();
                    	$('.' + identifierClass).closest('.' + parentClass).find(".state-switcher:first").trigger('switch', ['none']);
                    }

                });

            });
            /**/
        });

        B.changeMainPageUrl = function (response, urlPath) {

            document.title = (response && response.pageTitle) || document.title;
            if (window.history.replaceState) window.history.replaceState({ i: false },
               '',
                urlPath
            );
        }


        //////window.onpopstate = function (e) {

        //////    if (e.state.url) {
        //////        window.location = e.state.url + "&ispopstate=true";
        //////    }

        //////    //B.searchAsync({ data: { isPopState: true } });

        //////}


        $.extend({

            deserializeParam: function (str) {
                return (str || document.location.search).replace(/(^\?)/, '').split("&").map(function (n) { return n = n.split("="), this[n[0]] = n[1], this }.bind({}))[0];
            }

        });

        B.loadCommonFilterParameters = function (url) {

            $('input.search-filter-range-1').each(function () {

                url = B.updateQueryStringParameter(url, "DistanceKms", $(this).val(), true);

            });

            $('.filter-item select').each(function () {
                var name = $(this).attr("name");

                url = B.updateQueryStringParameter(url, name, $(this).val(), true);

            });

            $('.sort-criteria .selected:visible').each(function () {
                var name = $(this).attr("name");

                url = B.updateQueryStringParameter(url, name, $(this).val(), true);

                url = B.updateQueryStringParameter(url, "SortDirection", ($(this).hasClass("desc") ? "Desc" : "Asc"), true);

            });

            $('select[name="SortCriteria"]:visible').each(function () {
                var name = $(this).attr("name");

                url = B.updateQueryStringParameter(url, name, $(this).val(), true);

                url = B.updateQueryStringParameter(url, "SortDirection", $(this).find('option:selected').attr('data-sort-direction'), true);

            });

            return url;
        }

        var loadAllFilterParameters = function (expandFrom, pageNumber) {

            var serializedQueryString = $("#form-search").serialize() + '&' + $("#form-filter").serialize();

            var getUrl = Opts.SearchResultsUrl;
            var hostUrl = Opts.SearchUrl;
            var mapUrl = Opts.MapUrl;

            var url = '?' + serializedQueryString;

            url = B.loadCommonFilterParameters(url);

            return {
                // Get the names of the breakpoints (as set in CSS)
                Geturl: (getUrl + url) + (expandFrom ? '&ExpandFrom=' + B.searchExpandCount : '') + (pageNumber ? '&pageNumber=' + pageNumber : ''),
                Hosturl: (hostUrl + url) + ((pageNumber != null) ? '&pageNumber=' + pageNumber : ''),
                MapUrl: (mapUrl + url)
            };
        };

        B.deselectInputs = function (event, button) {
            button = button || this;
            var id = $(button).closest("[data-sourceid]").attr("data-sourceid");
            var input = $("#form-filter").find("#" + id);
            $(button).closest('[data-sourceid]').remove();
            if (input.is("[type=checkbox]")) {
                input.prop('checked', false).trigger("change");

            } else if (input.is("select")) {
                input.val("");
            }
        };

        B.jsonModelToHiddenInputs = function (jsonModel) {
            var items = Array.prototype.slice.call(arguments, 1);
            $.each(items, function (idx, item) {
                item = (typeof (item) == 'string') ? [item, item] : item;
                $("input[type=hidden][name='" + item[1] + "']").val(jsonModel[item[0]]);
            });
        };

        //use this function to reset the filter views based on result view outupt
        B.updateMainPageFields = function (jsonModel, isExpand) {

            //debugger;
            var criteria = jsonModel.RequestModel;

            B.jsonModelToHiddenInputs(criteria, 'ItemKey', 'ArrivalDateString', 'DepartureDateString', 'NumAdults', 'NumKids', 'SiteType');

            $.each(B.RefreshTypeAhead || [], function (index, value) {

                value(jsonModel.ResponseModel.TownText, criteria.ItemKey, criteria.ItemType);
            });

            if (criteria.ItemType != 1) {
                if (!$('.field.filter-item.show-if-rangeslider').is(":visible")) {

                    $('.field.filter-item.show-if-rangeslider').properToggle('show');

                }
                $('.filtertext [data-tmpl-load="accomm-search-results-dist"]').show();
            }
            else {

                $(".search-filter-range-1").val(25).change();
                $('.field.filter-item.show-if-rangeslider').properToggle('hide');
                $('.filtertext [data-tmpl-load="accomm-search-results-dist"]').hide();

            }

            if (isExpand) {

                $(".search-filter-range-1").val(criteria.DistanceKms).change();

            }

            if (criteria.DistanceKms >= B.Max_Distance || criteria.ItemType == 1) {

                $('#expandWrap').hide();

            } else if (!$('#expandWrap').is(':visible')) {
                $('#expandWrap').show();
            }

            setLinks();

        };

        // B.LoadResultsList = $('[data-tmpl-group="SearchGroup"][data-tmpl-load="accomm-search-results-list"]');

        B.asyncReturnJson = function (data, requestParam) {

            $('[data-tmpl-group="SearchGroup"]').each(function () {
                $(this).html(tmpl($(this).attr("data-tmpl-load"), data));
            });
            if (!data.error) {

            	if (MQ && MQ.getContext() != 'mobile') $(".listing-park-accomm a").attr("target", "_blank");

                B.ClassTooltip.Init();

                B.asyncGetAvailability(data);

                if (typeof Opts.onSearchPerformed == 'function') {
                    Opts.onSearchPerformed(data);
                }
            }

        };

        B.asyncGetAvailability = function (responsedata) {

            B.R.push(['rangeslider', B.RangeSliders && B.RangeSliders.Init]);

            if (Opts.SignalRHubsUrl) {

                B.R.push(['signalr', function () {

                    B.R.push([Opts.SignalRHubsUrl, function () {

                        B.setupCallbackSocket = function () {

                            B.signalrCallbackHub = $.connection.callbackHub;

                            B.signalrCallbackHub.client.ShowResults = function (data) {
                                console.log('processed ' + data.ParkId, data);

                                var key = data.ParkId,
									hasAccomm = data.TotalAvailable > 0,
                                    hasDeals = data.TotalSpecialRates > 0,
									$park = $('.park-item[data-park-id="' + key + '"]'),
									$parkAccommOptions = $park.find('.accomm-options .load-park-accomm'),
                                    $parkAccommOptionsText = $park.find('.accomm-options .text-part'),
                                    accomodationCount = data.Accommodations == null ? 0 : data.Accommodations.length
                                ;
                                if (hasAccomm) {
                                    $park.removeClass("unavailableItem");
                                    $parkAccommOptions.html('<span class="lbl rounded lower avail">' + data.TotalAvailable + ' available</span>');
                                }
                                else {
                                    $park.addClass("unavailableItem");
                                    $parkAccommOptions.html('<span class="lbl rounded lower">' + data.TotalAvailable + ' available</span>');
                                }

                                $parkAccommOptionsText.find('span.linkline').text(accomodationCount + ' option' + (accomodationCount > 1 ? 's' : ''));

                                if (hasDeals) {
                                    var dealSpan = $park.find(".accomm-deals");
                                    //dealSpan.find('span').text(data.TotalSpecialRates + ' deal' + ((data.TotalSpecialRates > 1) ? 's !' : ' !'));
                                    dealSpan.find('span').text(' Deal' + ((data.TotalSpecialRates > 1) ? 's' : '') + ' available');
                                    dealSpan.show();
                                }
                                else {
                                    $park.find(".accomm-deals").remove();
                                }



                                $.each(data.Accommodations, function (accommIdx, accomm) {
                                    var accommKey = accomm.AccommodationId,
										isAvail = accomm.IsAvailable,
										Message = accomm.UnavailableMessage || accomm.availableMessage || accomm.Message,
										//offerCode = accomm.OfferCode,
										$accomm = $('.accomm-item[data-accomm-id="' + accommKey + '"]'),
										$accommPrice = $accomm.find(".load-accomm-price"),
                                        $accommnights = $accomm.find(".load-accomm-nights"),
										//$accommBookHref = $accomm.find(".add-book-href"),
										$accommUnavailRemoveBookHref = $accomm.find(".unavail-remove-book-href"),
										$accommAvailability = $accomm.find('.load-accomm-availability'),
										$accommNotAvailable = $accomm.find('.load-accomm-not-available'),
										$accommAvailabilityMobile = $accomm.find('.load-accomm-availability-mobile'),
										$accommAvailMessage = $accomm.find('.load-accomm-avail-msg'),
										ChargesUrl = $accomm.attr("data-park-charges-url")
                                    ;

                                    // console.log('offer code for ' + accommKey + ' : ' + offerCode);

                                    $accomm.attr('data-accomodationid', accommKey);

                                    if (isAvail) {

                                        $accomm.removeClass("unavailableItem");
                                        $accommPrice.html('<div class="price"><span>From</span> <strong>$' + B.formatPriceNumHtml(accomm.MinPrice,0) + '</strong></div>');
                                        $accommnights.html('<p>for ' + responsedata.RequestModel.NumNights + ' night' + (responsedata.RequestModel.NumNights == 1 ? '' : 's') + '</p>');
                                        //$accommBookHref.attr("href", ChargesUrl);
                                        $accommAvailability.html('<a href="' + ChargesUrl + '" class="url-accomm-book btn block primary trans-color">Book Now</a>').closest(".avail-width").addClass("avail-width-set");
                                        $accommAvailabilityMobile.html('<a href="' + ChargesUrl + '" class="url-accomm-book btn primary trans-color">Book Now</a>').closest(".avail-width").addClass("avail-width-set");
                                        $accommAvailMessage.html(Message ? '<p><span class="icon-txt"><span class="icon"><span class="b4-icon b4-icon-information"></span></span> <span class="txt">' + Message + '</span></span></p>' : '').closest(".avail-width").addClass("avail-width-set");
                                    }
                                    else {
                                        $accomm.addClass("unavailableItem");
                                        $accommPrice.html('');
                                        $accommnights.html('');
                                        //$accommBookHref.removeAttr("href");
                                        $accommUnavailRemoveBookHref.removeAttr("href").find(".linkline").removeClass("linkline");
                                        $accommNotAvailable.add($accommAvailabilityMobile).html('<span class="lbl rounded">Not available</span').closest(".avail-width").removeClass("avail-width-set");
                                        $accommAvailMessage.html(Message ? '<p><span class="icon-txt"><span class="icon"><span class="b4-icon b4-icon-information"></span></span> <span class="txt">' + Message + '</span></span></p>' : '').closest(".avail-width").addClass("avail-width-set");
                                    }

                                    var $dealNames = $accomm.find("p.descripspecial");
                                    $.each(accomm.Description, function (i, dealname) {
                                        $dealNames.append('<p><span class="lbl lower rounded deals">Deal</span> ' + dealname + '</p>');
                                    });

                                });

                                if (MQ && MQ.getContext() != 'mobile') $(".listing-park-accomm a").attr("target", "_blank");

                            };

                            B.signalrCallbackHub.client.ShowError = function (error) {
                                console.log(error);
                            };

                            B.signalrCallbackHub.client.CompletedResults = function (seconds) {

                                $("[clientlevelfilterfor]:checkbox").trigger("change");
                                console.log('finished getting results. Total time: ' + seconds + ' seconds');
                            };

                            $.connection.hub.start().done(function () {

                                //var trimmedParks = $.map(responsedata.ResponseModel.Items, function (n, i) {
                                //    return {    ParkID          :   n.ParkID ,
                                //                Accomodations   :   $.map(n.Accomodations, function (n2, i2) {
                                //                    return { ID : n2.ID };
                                //                                    })
                                //    }
                                //});
                                //debugger;
                                var accommodationIds = [];
                                $.each(responsedata.ResponseModel.Items, function (i, park) {

                                    $.each(park.Accomodations, function (j, accommodation) {

                                        accommodationIds.push(accommodation.ID);

                                    });

                                });

                                var signalrRequest = {
                                    Criteria: responsedata.RequestModel,
                                    AccommodationIds: accommodationIds
                                };

                                console.log('going to start websocket', { 'data': { 'data': signalrRequest } });
                                B.signalrCallbackHub.server.accommodationSearchResult(signalrRequest);
                            });

                            $.connection.hub.error(function (error) {
                                console.log('SignalR error: ' + error);
                            });
                        };

                        $(function () {

                            B.setupCallbackSocket();

                            B.StateSwitcherAttachEvents();

                        });

                    }]);

                }]);

            }

        };

        var searchAsync = function (event) {

            var isExpand = event && event.data && event.data.expandFrom;
            var pageNumber = (event && event.data && event.data.pageNumber) ? event.data.pageNumber : null;
            // var isPopState = getParameterByName("ispopstate");


            event && event.preventDefault && event.preventDefault();

            $(".load-results-container").removeClass("load-results-error").addClass("load-results-loading");

            var urls = B.loadAllFilterParameters(isExpand, pageNumber);

            var index = urls.Geturl.indexOf("?");

            var params = index > 0 ? urls.Geturl.substring(index + 1) : '';

            B.currentSearchReq && B.currentSearchReq.abort();

            B.signalrCallbackHub && $.connection.hub.stop();

            B.ReqType = "json";

            B.currentSearchReq = $.get(urls.Geturl, function () {

            }, B.ReqType)
                .done(function (data) {

                    $(".load-results-container").removeClass("load-results-error").removeClass("load-results-loading");

                    B.searchExpandCount = data.ResponseModel.Items != null ? data.ResponseModel.Items.length : 0;

                    data.requestParam = params;

                    // if (!isPopState) {
                    B.changeMainPageUrl(data, urls.Hosturl);
                    //  }

                    B.updateMainPageFields(data, isExpand);

                    B.asyncReturnJson(data);

                    if (Opts.DoPage && pageNumber == null) {

                        setPagination(data.ResponseModel.NonPagedCount);
                        Paging.setNumber(data.ResponseModel.NonPagedCount);
                        Paging.opts["noSelect"] = true;
                        Paging.setPage(1);
                        Paging.opts["noSelect"] = false;
                    }


                    if (data.ResponseModel.ResponseMessage
                        && (data.ResponseModel.ResponseMessage.Status == 400
                        || data.ResponseModel.ResponseMessage.Status == 404)) {
                        failProcess(data, urls);
                    }
                    else {
                        $('[data-tmpl-group="Errors"] div').remove();

                        $('.accomm-search-results .search-results').show();

                    }
                })
                .fail(function (error) {

                    B.searchExpandCount = 0;



                    B.changeMainPageUrl(error.responseJSON, urls.Hosturl);

                    B.updateMainPageFields(error.responseJSON, isExpand);

                    B.asyncReturnJson(error.responseJSON);

                    failProcess(error.responseJSON, urls);

                })
            ;

        };

        var failProcess = function (data, urls) {

            $(".load-results-container").removeClass("load-results-loading");

            $('[data-tmpl-group="Errors"]').each(function () {
                $(this).html(tmpl($(this).attr("data-tmpl-load"), data));
            });

            if (data.ResponseModel.ResponseMessage.Status == 400) {
                $('.accomm-search-results .search-results').hide();
            }

        }
        var setPagination = function (nonPagedCount) {


            Paging = $(".pagination").paging(nonPagedCount || 0, {
                format: '[< ncnnn >]',
                perpage: 25, // show 25 elements per page
                lapping: 0,  // don't overlap pages for the moment
                page: null,  // start at page, can also be "null" or negative
                onSelect: function (page) {

                    B.searchAsync({ data: { pageNumber: page } });

                },
                onFormat: function (type) {
                    switch (type) {
                        case 'block': // n and c
                            return '<a class="btn small ' + (this.value == this.page ? ' secondary ' : '') + ' " type="button">' + this.value + '</a>';
                        case 'next': // >
                            return '<a class="btn small  outline white" type="button"><span class="b4-icon b4-icon-arrow-e-fill"></span></a>';
                        case 'prev': // <
                            return '<a class="btn small  outline white" type="button"><span class="b4-icon b4-icon-arrow-w-fill"></span></a>';
                        case 'first': // [
                            return '<a class="btn small  outline white" type="button">first</a>';
                        case 'last': // ]
                            return '<a class="btn small  outline white" type="button">last</a>';
                    }
                }
            });


        }

        B.searchAsync = typeof Opts.searchAsync == 'function' ? Opts.searchAsync : searchAsync;

        B.loadAllFilterParameters = typeof Opts.loadAllFilterParameters == 'function' ? Opts.loadAllFilterParameters : loadAllFilterParameters;

        function setLinks() {

            var mapButton = $(".view-map-click");

            var baseurl = B.loadAllFilterParameters(0).MapUrl;

            mapButton.attr("href", baseurl);

        }

        $(function () {

            $('#form-search button').on("click",
                function (e) {
                    e.preventDefault();
                    if ($('#form-search').valid()) {
                        B.searchAsync(e);
                        $('a.btn.folder-target-open[data-folder-handle-for="form-book-container"]').trigger("folderToggle");
                    }
                }
            );


            B.searchAsync();

            $('.expandSearch').on("click", { "expandFrom": true }, B.searchAsync);

            B.synchronizeLabels();

        });

    }]);


}