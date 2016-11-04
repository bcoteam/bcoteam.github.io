jQuery(function($) {

	var toggleCards = function(type) {
		$('html').attr('data-show', type);
	}

	var onAuthorize = function() {
		updateLoggedIn();

		Trello.members.get("me", function(member) {
			$("#username").text(member.fullName);

			// Trello.get("members/me/cards", function(cards) {
			// 	$cards.empty();
			// 	$.each(cards, function(ix, card) {
			// 		$("<a>")
			// 		.attr({href: card.url, target: "trello"})
			// 		.addClass("card")
			// 		.text(card.name)
			// 		.appendTo($cards);
			// 	});  
			// });
		});

	};

	var updateLoggedIn = function() {
	    var isLoggedIn = Trello.authorized();
	    $("#loggedout").toggle(!isLoggedIn);
	    $("#loggedin").toggle(isLoggedIn);        
	};
	    
	var logout = function() {
	    Trello.deauthorize();
	    updateLoggedIn();
	};
	                          
	Trello.authorize({
	    interactive:false,
	    success: onAuthorize
	});

	$("#connect").click(function(){
	    Trello.authorize({
	        type: "popup",
	        success: onAuthorize
	    })
	});
	    
	$("#disconnect").click(logout);

	// Get all of the information about the list from a public board

	var success = function(successMsg) {

		// Dump all data
		console.log(successMsg);

		// Vars
		var sitesLaunchedIn2016 = [];
		var sitesLaunchedIn2017 = [];
		var sitesLaunchedIn2018 = [];

		// Master loop of all cards
		$.each(successMsg, function(index, card) {

			/**
			 * Get dates
			 */
			var devDateString = '00/00/0000';
			var betaDateString = '00/00/0000';
			var liveDateString = '00/00/0000';
			var siteUrl;


			// Break description into array at each line break
			var description = card.desc.split('\n');

			// Find line containing string
			for ( var i = 0; i < description.length; i++ ) {

				// If we find a match
				if ( description[i].indexOf('@dev ') > -1 ) {
					var devDateString = description[i].replace('@dev ', '');
				}

				// If we find a match
				if ( description[i].indexOf('@beta ') > -1 ) {
					var betaDateString = description[i].replace('@beta ', '');
				}

				// If we find a match
				if ( description[i].indexOf('@live ') > -1 ) {
					var liveDateString = description[i].replace('@live ', '');
				}

				// If we find a match
				if ( description[i].indexOf('@url ') > -1 ) {
					var siteUrl = description[i].replace('@url ', '');
				}

				if ( description[i].indexOf('@screenshot ') > -1 ) {
					var screenshot = description[i].replace('@screenshot ', '');
				}
			}

			/***/

			// Label IDs
			var devLabel = "564f818e19ad3a5dc2385210";
			var betaLabel = "564f818e19ad3a5dc2385211";
			var liveLabel = "56a00891fb396fe70678ae29";

			// If has label
			if (card.labels.length !== 0) {
				console.log(index + ': ' + card.name);
			}

			// In dev
			if ( card.labels.length !== 0 && card.labels[0].id === devLabel ) {
				$('#dev-cards').append('<li id="card-' + card.id + '" data-card-status="dev" data-card-id="' + card.id + '"><h3 data-card-details-toggle="' + card.id + '">' + card.name + '</h3><section id="card-' + card.id + '-body" class="card-body"></section></li>');
			}

			// Beta
			if ( card.labels.length !== 0 && card.labels[0].id === betaLabel ) {
				$('#beta-cards').append('<li id="card-' + card.id + '" data-card-status="beta" data-card-id="' + card.id + '"><h3 data-card-details-toggle="' + card.id + '">' + card.name + '</h3><section id="card-' + card.id + '-body" class="card-body"></section></li>');
			}

			// Live
			if ( card.labels.length !== 0 && card.labels[0].id === liveLabel ) {
				$('#live-cards').append('<li id="card-' + card.id + '" data-card-status="live" data-card-id="' + card.id + '"><h3 data-card-details-toggle="' + card.id + '">' + card.name + '</h3><section id="card-' + card.id + '-body" class="card-body"></section></li>');
			}

			$('#card-' + card.id + '-body').append('<p><strong>Site URL:</strong> <a href="' + siteUrl + '" target="_blank">' + siteUrl + '</a></p>');
			$('#card-' + card.id + '-body').append('<p><strong>Dev Date:</strong> ' + devDateString + '</p>');
			$('#card-' + card.id + '-body').append('<p><strong>Beta Date:</strong> ' + betaDateString + '</p>');
			$('#card-' + card.id + '-body').append('<p><strong>Live Date:</strong> ' + liveDateString + '</p>');
			$('#card-' + card.id + '-body').append('<p><strong>Days in dev:</strong> ' + daysBetweenTwoDates(devDateString, betaDateString) + '</p>');
			$('#card-' + card.id + '-body').append('<p><strong>Days in beta:</strong> ' + daysBetweenTwoDates(betaDateString, liveDateString) + '</p>');

			if ( screenshot ) {
				$('#card-' + card.id + '-body').append('<p><img src="' + screenshot + '"></p>');
			}

			if ( liveDateString && liveDateString.indexOf('2016') > -1 ) {
				sitesLaunchedIn2016.push(card.id);
			}

			if ( liveDateString && liveDateString.indexOf('2017') > -1 ) {
				sitesLaunchedIn2017.push(card.id);
			}

			if ( liveDateString && liveDateString.indexOf('2018') > -1 ) {
				sitesLaunchedIn2018.push(card.id);
			}
		});

		// console.log(sitesLaunchedIn2017);
		$('#stats-container').append('<div><strong>Sites Launched 2016: </strong>' + sitesLaunchedIn2016.length + '</div>');
		$('#stats-container').append('<div><strong>Sites Launched 2017: </strong>' + sitesLaunchedIn2017.length + '</div>');
		$('#stats-container').append('<div><strong>Sites Launched 2018: </strong>' + sitesLaunchedIn2018.length + '</div>');

		// Get count
		$('#dev-count').append('(' + $('#dev-cards').children().length + ')');
		$('#beta-count').append('(' + $('#beta-cards').children().length + ')');
		$('#live-count').append('(' + $('#live-cards').children().length + ')');

		// Toggle 
		$('[data-toggle]').click(function() {
			var type = $(this).attr('data-toggle');
			toggleCards(type);
		});
	};

	var error = function(errorMsg) {
	  console.log(errorMsg);
	};

	Trello.get('/boards/564f818ee25ad60179c05025/cards/', success, error);
	// Trello.get('/cards/bFVQJSsc/', success, error);

	function daysBetweenTwoDates(date1, date2) {
		var date1 = new Date(date1);
		var date2 = new Date(date2);
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		return diffDays;
	}

	function toggleCardDetails(id) {
		$('#card-' + id).toggleClass('show-card-details');
	}

	$(document).ready(function() {
		$(document).on('click', '[data-card-details-toggle]', function() {
			toggleCardDetails($(this).attr('data-card-details-toggle'));
		});
	});

	function finder(description, search) {
		var data = '';

		if ( description.indexOf(search + ' ') > -1 ) {
			data = description.replace(search + ' ', '');
		}

		return data;
	}

});













