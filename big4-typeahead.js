

B.InitializeBig4TypeAhead = function (datauri, onSelected) {

    B.RefreshTypeAhead = [];
    $('[data-searchbar-container]').each(function () {

        //debugger;
        var typeaheadcontainer = $(this);
        var typeaheadCreater = {};

        typeaheadCreater.Engine = new Bloodhound({
            remote: {
                url: datauri 
            },
            datumTokenizer: function (d) {
                //console.log("datumTokenizer", d.Title, d);
                return Bloodhound.tokenizers.whitespace(d.Title); //Bloodhound.tokenizers.whitespace(d.Title);
            },
            queryTokenizer: function (q) {
                //console.log("queryTokenizer", q);
                return Bloodhound.tokenizers.whitespace(q);
            }
        });


        typeaheadCreater.Engine.initialize();

        typeaheadCreater.typeIcons = {
        	1: "signpost type--region",
        	3: "pin type--park",
            4: "signpost type--town"
        };
        typeaheadCreater.typeDetail = {
        	1: "type-region",
        	3: "type-park",
        	4: "type-town"
        };

        typeaheadCreater.HiddenKey = typeaheadcontainer.find('input.typeahead-key[type=hidden]');

        typeaheadCreater.HiddenType = typeaheadcontainer.find('input.typeahead-typeid[type=hidden]');

        typeaheadCreater.Outer = typeaheadcontainer.find(".typeahead-field-outer");

        typeaheadCreater.Input = typeaheadCreater.Outer.find('input.typeahead-lookup:not([type=hidden])');

        typeaheadCreater.SelectFunc = function (DisplayTitle, Key, Type) {
          
            typeaheadCreater.Input.val(DisplayTitle);
            typeaheadCreater.Outer.addClass('typeahead-selected type-' + Type);
            typeaheadCreater.HiddenKey.val(Key);
            typeaheadCreater.HiddenType.val(Type);

        };

        //var tainput = typeaheadCreater.Input.get();
        //var taOuter = typeaheadCreater.Outer.get();
        //var taHiddenKey = typeaheadCreater.HiddenKey.get();
        //var taHiddenType = typeaheadCreater.HiddenType.get();

        B.RefreshTypeAhead .push( function (DisplayTitle, Key, Type) {

            if (Type) {
              
                typeaheadCreater.Input.val(DisplayTitle);
                typeaheadCreater.Input.attr("value", DisplayTitle);
                typeaheadCreater.Input.text(DisplayTitle);
                typeaheadCreater.Outer.addClass('typeahead-selected type-' + Type);

                typeaheadCreater.HiddenKey.val(Key);
                typeaheadCreater.HiddenType.val(Type);

                } else {

                //typeaheadCreater.UnselectFunc(DisplayTitle, Key);

            }

        });

        typeaheadCreater.UnselectFunc = function (DisplayTitle, Key) {
         
            typeaheadCreater.Outer.removeClass('typeahead-selected').attr('class', function (i, c) {
                return c.replace(/(^|\s)type-\S+/g, '');
            });

            typeaheadCreater.HiddenKey.val("");
            typeaheadCreater.HiddenType.val("");

        };

        typeaheadCreater.Input.typeahead({
            hint: true,
            highlight: true,
            minLength: 1

        }, {
            name: 'keyword-lookup',
            displayKey: 'Title',
            source: typeaheadCreater.Engine.ttAdapter(),
            templates: {
                suggestion: function (resultObj) {
                    var str = ['',
                        '<a href="javascript:;" class="typeahead-result ' + typeaheadCreater.typeDetail[resultObj['Type']] + '" title="' + resultObj['TypeName'] + ': ' + resultObj['Title'] + '">',
                            '<div class="icon type-' + resultObj['Type'] + '">',
                                '<i class="b4-icon b4-icon-' + typeaheadCreater.typeIcons[resultObj['Type']] + '"></i>',
                            '</div>',
                            '<div class="info">',
                                '<p>',
                                    '<span class="visuallyhidden">' + resultObj['TypeName'] + ': </span>',
                                    resultObj['Title'],
                                '</p>',
                            '</div>',
                        '</a>',
                    ''].join('');
                    //console.log(str, resultObj);
                    return str;
                }
            }

        }).on("change keypress keyup input", function (event, sugg, dataset) {

            //debugger;
            if (event.charCode === 13 && typeof onSelected == 'function') {
                //debugger;
                typeaheadCreater.SelectFunc(this.value, this.value, '');
                onSelected();
            }
            else if (this.value != this.oldval) {
                typeaheadCreater.UnselectFunc();

            }

            this.oldval = this.value;


        }).on("typeahead:selected typeahead:autocompleted", function (event, sugg, dataset) {

           
            typeaheadCreater.SelectFunc(sugg.Title, sugg.Key, sugg.Type);

            this.oldval = this.value;

        });

    }); //end each

    var $tt_input = $(".tt-input");
    if ($tt_input.length > 0)
    	$tt_input.addClass("required");

}
///}]);

B.InitializeBig4TypeAheadContentSearch = function (datauri, onSelected) {

	var showContentSearch = function (data) {
		var arr = $.map(data[1], function (item) {
			return {
				value: item[0]
			};
		});
		//console.log(arr);
		return arr;
	};

	var ContentSearch = new Bloodhound({
		datumTokenizer: function (data) {
			return Bloodhound.tokenizers.whitespace(data.value);
		},
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		remote: {
			url: datauri,
			ajax: {
				type: 'GET',
				dataType: 'jsonp'
			},
			filter: showContentSearch
		}
	});

	ContentSearch.initialize();

	$('.searchTerm').typeahead({
		highlight: true,
		minLength: 1
	}, {
		name: 'results',
		displayKey: 'value',
		source: ContentSearch.ttAdapter(),
		templates: {
			suggestion: function (resultObj) {
				var str = ['',
					'<a href="javascript:;" class="typeahead-result" title="' + resultObj['value'] + '">',
						'<div class="info">',
							'<p>',
								resultObj['value'],
							'</p>',
						'</div>',
					'</a>',
				''].join('');
				//console.log(str, resultObj);
				return str;
			}
		}
	});

}