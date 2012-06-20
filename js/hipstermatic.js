/**
* Hipstermatic - Arty <canvas> photos filters
*
* @version	0.1
* @author	Kevin Stevens, Clare Hyam, Chloe Watts, Jasal Vadgama
* @require	jquery 1.7.1+
* @license	GPL v3
**/

var hipstermatic = hipstermatic || {};

/* this.vars */
hipstermatic.vars = {
	// image
	imgObject: "",
	// canvas properties
	canvasSelector: "#myCanvas",
	canvasContext: "",
	canvasWidth: 0,
	canvasHeight: 0,
	filterSelector: ".filters"
};

hipstermatic.loadImageFromFile = function(e) {
	var $canvas = $(hipstermatic.vars.canvasSelector),
		$input = $('#input'),
		reader = new FileReader();
		hipstermatic.vars.imgObject = new Image();

	// set he canvas context
	hipstermatic.vars.canvasContext = $canvas.get(0).getContext("2d"),

	reader.onload = function(e) {
		hipstermatic.vars.imgObject.src = e.target.result;
		hipstermatic.vars.imgObject.onload = function() {
			var imgWidth = hipstermatic.vars.imgObject.width,
				imgHeight = hipstermatic.vars.imgObject.height,
				imgScaleFactor;

			// clear current canvas content
			hipstermatic.vars.canvasContext.clearRect(0, 0, $canvas.width(), $canvas.height());

			// scale the image down to a max 800x500
			if (imgWidth > imgHeight) {
				// calculate the scale factor
				imgScaleFactor = imgWidth / 800;

				// set the new width and height
				hipstermatic.vars.canvasWidth = 800;
				hipstermatic.vars.canvasHeight = parseInt((imgHeight / imgScaleFactor), 10);//parseInt to stop odd numbers in chrome
			} else {
				// calculate the scale factor
				imgScaleFactor = imgHeight / 500;

				// set the new width and height
				hipstermatic.vars.canvasWidth = parseInt((imgWidth / imgScaleFactor), 10); //parseInt to stop odd numbers in chrome
				hipstermatic.vars.canvasHeight = 500;
			}

			// set canvas size based on image size
			$canvas.attr({
				width: hipstermatic.vars.canvasWidth,
				height: hipstermatic.vars.canvasHeight
			}).css({
				marginLeft: -($canvas.width() / 2)
			});

			// draw image on canvas
			// ctx.drawImage([image], [top], [left], [width], [height]);
			hipstermatic.vars.canvasContext.drawImage(hipstermatic.vars.imgObject, 0, 0, hipstermatic.vars.canvasWidth, hipstermatic.vars.canvasHeight);

			// show the filters down
			$('#sidebar').find('.togglePanel').animate({
				left: -92
			});

			// unbind the canvas click and show the 'change' button
			$('canvas').off('click');
			$('.newImage').css({
				display: 'block'
			});
		};
	};

	reader.readAsDataURL(e.target.files[0]);
};

hipstermatic.initSidebar = function() {
	var $sidebar = $('#sidebar');

	// set init position
	$sidebar.css({
		//marginTop: -($sidebar.height() / 2),
		visibility: 'visible',
		height: $(window).height() - 20
	}).animate({
		right: -292
	}, 0);

	// bind toggle to h2
	$sidebar.find('.togglePanel').on('click', function(e) {
		var animateTo;

		e.preventDefault();

		if ($sidebar.hasClass('active')) {
			animateTo = -292;
		} else {
			animateTo = -1;
		}

		$sidebar.stop(true, true).animate({
			right: animateTo
		}).toggleClass('active');
	});
};

hipstermatic.init = function() {
	var $input = $('#input');

	// bind file input
	$input.on('change', function(e) {
		hipstermatic.loadImageFromFile(e);
	});

	// bind save button
	$('.save').on('click', function() {
		hipstermatic.storage.saveImage();
	});

	$('canvas, .newImage').on('click', function() {
		// click the hidden form
		$('#input').click();
	});

	hipstermatic.initSidebar();
};
		
$(function() {
	hipstermatic.init();
});