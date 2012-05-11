/*Copyright 2012, DomainsBot Inc. */

(function( $ ) {

	   var DomainsBotApi  = function(options)
	   {
		var loader;
		var checking;
		   
		var settings = $.extend( {
			'urlApi'         : 'https://xml.domainsbot.com/xmlservices/spinner.aspx',
			'urlAvailability' : "",
			'urlCheckout' : "",  
			'searchTextbox' : null,
			'searchSubmit' : null,
			'loading' : null,
			'checking' : null,
			'results' : null,
			'searchParameter' : null,
			'parameters' : null,
			'onSuccess' : null,
			'onError' : null,
			'onLoading' : null,
			'onAvailabilitySuccess' : null,
			'onAvailabilityError' : null,
			'onCheckout' : null
			    
		 }, options);
		 
		var GetUrlVars =  function ()
		{
		   var vars = [], hash;
		   var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		   for(var i = 0; i < hashes.length; i++)
		   {
			   hash = hashes[i].split('=');
			   vars.push(hash[0]);
			   vars[hash[0]] = hash[1];
		   }
		   return vars;
		};
		var checkAvailability = function (domain, id, options)
		{
		    
			// Built the post string.
			var postString = options.urlAvailability.toLowerCase().replace("%domain%",domain);

			//check if domain not empty
			if(domain!="")
			{ 
				$.ajax({
					url: postString,
					method:'POST',
					success:function(response)
					{
						if(options.onAvailabilitySuccess != null){
							options.onAvailabilitySuccess({ Domain: domain, Index: id, Available:  response == "1"? true : false} );
						}
						if(options.urlAvailability != null && options.urlAvailability != "")
						{
							
							//Check if domain name is available or not
							if(response == 0)
							{
								
								$(options.results).find("div[bind='domainsbotDomain'][index='" + id+"']").parent().hide();	
							}
							else
							{
								
								$(options.results).find("div[bind='domainsbotDomain'][index='" + id+"']").hide();
							}
									
									
						}
					},
					error: function(response){
						if(options.onAvailabilityError != null){
							options.onAvailabilityError (response);
						}
					}
				});
			}
		    
		}; 
		var GetDomains = function (key,options)
		{
			 var cnt = 0; var i;
			
			// Define an empty string
			var postString = "";
			
			
			// Binds the post string with key term and suggestion
			postString = "q=" + escape(key);
			
			for(var index in options.parameters) {
					postString += "&"+index+"="+escape(options.parameters[index]);
			}
			
			
			
			$(options.results).html("");
			
			if(options.loading != null){
				console.log(loader);
				$(options.results).append(loader);
				// Set teh ajax loader image
				$(loader).css('display','block');
			}
			
			if(options.onLoad != null){
				options.onLoad();
			}
			//console.log(options.urlApi +"?" + postString);
			// Make the ajax call to domain.php
			$.ajax({
				url:options.urlApi +"?" + postString + "&callback=?",
				dataType: 'json',
				success:function(data)
				{	
					if(options.onSuccess != null){
						options.onSuccess(data);
					}
					else{
						var htmlItem = "";
						if(data && data.Domains){
							$.each(data.Domains, function(i,domain){
								
								htmlItem += "<div >";
								
								var url = "";
								if(options.urlCheckout  != null && options.urlCheckout != "")
								{
									url = options.urlCheckout.toLowerCase().replace("%domain%",domain.DomainName);
								}
								
								// cart url
								htmlItem += "<a href='"+url+"' bind='domainsbotDomainLink' domainName='"+domain.DomainName+"' >"+domain.DomainName+"</a>";
															
								htmlItem += "<div bind='domainsbotDomain' index='"+i+"' domainName = '"+domain.DomainName+"' >" 
									+ (((options.urlAvailability != null && options.urlAvailability != "") || (options.onAvailabilitySuccess != null && options.onAvailabilitySuccess != "") && options.checking != null)? checking.clone().css('display','block').wrap('<p>').parent().html()  : "" )
									+"</div>";
								
								htmlItem += "</div>";
								
							});
							
						}
						else
						{
							if(options.onError != null){
								options.onError(data);
							}
						}

						
						
						$(options.results).html(htmlItem);
						
						if(options.onCheckout != null)
						{
							$(options.results).find("a[bind='domainsbotDomainLink']").click(function(evt)
							{
								
								options.onCheckout({ Domain: $(this).attr("domainName")}, evt );
							});
						}
						

						
						
						if((options.urlAvailability != null && options.urlAvailability != "") || (options.onAvailabilitySuccess != null && options.onAvailabilitySuccess != "")){
							
							for(i = 0; i < data.Domains.length; i++)
							{
								checkAvailability(data.Domains[i].DomainName, i, options);
							}
							
						}
						
						
					}
				},
				error: function(data)
				{
					if(options.onError != null){
						options.onError(data);
					}
					
				}
			});
			
			
		};
		
		
	    
		  
		
		 if(settings.searchTextbox != null){
			// Sets focus the search text box
			$(settings.searchTextbox).focus();
		}


		if(settings.loading != null){
			// Sets variable with ajax loader image
			$(settings.loading).css('display','none');
			
			loader = $(settings.loading).clone();
			
			//this.loader.remove();
		}

		if(settings.checking != null){
			// Sets variable with ajax loader image
			$(settings.checking).css('display','none');
			
			checking = $(settings.checking).clone();
			
			//this.checking.remove();
		}
		// Enter button
		if(settings.searchTextbox != null){
			// Check for Key down event on Search text box
			$(settings.searchTextbox).keydown(function(event) {

				// Check if user hits the <enter>
				if(event.keyCode == 13){
					// calls to function
					GetDomains($(settings.searchTextbox).val(),settings);
				}
			});
		}
		
		
		if(settings.searchSubmit != null && settings.searchTextbox != null){
			// Check the click event, search btn pressed
			$(settings.searchSubmit).click(function(){

					//call the function to get result
					GetDomains($(settings.searchTextbox).val(), settings);
			});
		}
		
		if(settings.searchParameter != null && settings.searchParameter != ""){
			
			var p = GetUrlVars();
			
			if(p != null && p[settings.searchParameter] != null && p[settings.searchParameter] != ""){
				console.log(p[settings.searchParameter] );
				GetDomains(p[settings.searchParameter], settings);
			}
		}
			
		
		

		// Public method
		this.search = function(key)
		{
			
			GetDomains(key, settings);
		};
	   };
	
	   
    
	
	    var methods = {
		    init : function( options ) { 
			var ret = new DomainsBotApi(options);
			
			return ret;
		    }
	  };
	
	  $.fn.domainsbot = function ( method ) {
		    // Method calling logic
		    if ( methods[method] ) {
		      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		    } else if ( typeof method === 'object' || ! method ) {
		      return methods.init.apply( this, arguments );
		    } else {
		      $.error( 'Method ' +  method + ' does not exist on jQuery.domainsbot' );
		    }    
	  
	  };
})( jQuery );