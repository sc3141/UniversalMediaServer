function changeMargins() {
	var total_w = $('#Media').width();
	var cells = $('#Media li');
	var aspect = 16 / 9;
	var images_w = 0;
	var row_h = 180;
	var row_start = 0;
	var spaces = 1;

	for (var i = 0; i < cells.length; i++) {
		images_w += (180 * aspect);
		var avail_w = total_w - ++spaces * 20;
		var wrap = images_w > avail_w;
		if (wrap || i === cells.length - 1) {
			if (wrap) {
				row_h = avail_w / images_w * 180;
			}
			var cell_w = row_h * aspect;

			// Normalize cell heights for current row
			for (var c = row_start; c <= i; c++) {
				var caption_w = cell_w - 33;
				$(cells[c]).find('.caption').css({
					width : caption_w + 'px',
					maxWidth : caption_w + 'px',
				});
				$(cells[c]).find('.thumb').css({
					width : 'auto',
					height : row_h + 'px',
					maxWidth : cell_w + 'px',
					maxHeight : row_h + 'px',
				});
				$(cells[c]).find('a:first-child').css({
					height : row_h + 'px',
					width : cell_w + 'px',
				});
			}
			images_w = 0;
			row_start = i + 1;
			spaces = 1;
		}
	}
}

function scrollActions() {
	if ($(window).width() > 1080) {
		if ($(window).scrollTop() === 0) {
			$("#Menu").animate({height: 95}, 200);
			$("#ContentPage #Menu #HomeButton").animate({height: 93}, 200);
			$("ul#Folders").animate({top: 94}, 200);
			$("ul#Media").animate({paddingTop: 115}, 200);
		} else {
			$("#Menu").animate({height: 53}, 200);
			$("#ContentPage #Menu #HomeButton").animate({height: 51}, 200);
			$("ul#Folders").animate({top: 52}, 200);
			$("ul#Media").animate({paddingTop: 73}, 200);
		}
	} else {
		$("#Menu").animate({height: 53}, 200);
		$("#ContentPage #Menu #HomeButton").animate({height: 51}, 200);
		$("ul#Media").animate({paddingTop: 20}, 200);
	}
}

function searchFun(url, txt) {
	var str = prompt(txt);
	if (str !== null) {
		window.location.assign(url+'?str='+str)
	}
	return false;
}

function umsAjax(u, reload) {
	$.ajax({url: u}).done(function() {
		if(reload) {
			window.location.reload();
		}
	});
}

var polling, refused;

function poll() {
	$('body').append('<div id="notices"><div/></div>');
	polling = setInterval(function(){
		$.ajax({ url: '/poll',
			success: function(json){
				refused = 0;
				if (json) {
					//console.log('json: '+json)
					var ops = JSON.parse(json), i;
					for (i = 0; i < ops.length; i++) {
						var args = ops[i];
						switch (args[0]) {
							case 'seturl':
								window.location.replace(args[1]);
								break;
							case 'control':
								if (typeof control === 'function') {
									control(args[1], args[2]);
								}
								break;
							case 'notify':
								notify(args[1], args[2]);
								break;
						}
					}
				}
			},
			error: function() {
				if (++refused > 10) {
					clearInterval(polling);
				}
			}
		});
	}, 1000);
}

function notify(icon, msg) {
	//console.log('notify: '+icon+': '+msg);
	var notice = $('<div class="notice"><span class="icon '+icon+'"></span><span class="msg">'+msg+'</msg></div>');
	notice.insertAfter($('#notices').children(':last'));
	setTimeout(function() {
		notice.fadeOut('slow', function(){notice.remove();});
	}, 5000);
}

$(document).ready(function() {
	if ($('#Media').length) {
		$(window).bind('load resize', changeMargins);
	}

	if ($('#Folders').length) {
		$('#Folders li').bind('contextmenu', function(){
			return false;
		});
	}

	if ($('#Menu').length) {
		$(window).bind('load resize scroll', scrollActions);
	}

	poll();
});
