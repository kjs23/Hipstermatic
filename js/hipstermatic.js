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
		},
		hipstermatic.loadImageFromFile = function(e) {
			var $canvas = $(this.vars.canvasSelector),
				$input = $('#input'),
				reader = new FileReader();
				this.vars.imgObject = new Image();

			// set he canvas context
			this.vars.canvasContext = $canvas.get(0).getContext("2d"),

			reader.onload = function(e) {
				hipstermatic.vars.imgObject.src = e.target.result;
				hipstermatic.vars.imgObject.onload = function() {
					var imgWidth = hipstermatic.vars.imgObject.width,
						imgHeight = hipstermatic.vars.imgObject.height,
						imgScaleFactor;

					// clear current canvas content
					hipstermatic.vars.canvasContext.clearRect(0, 0, $canvas.width(), $canvas.height());

					// scale the image down to a max 500x500
					if (imgWidth > imgHeight) {
						// calculate the scale factor
						imgScaleFactor = imgWidth / 500;

						// set the new width and height
						hipstermatic.vars.canvasWidth = 500;
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
					});

					// draw image on canvas
					//ctx.drawImage([image], [top], [left], [width], [height]);
					hipstermatic.vars.canvasContext.drawImage(hipstermatic.vars.imgObject, 0, 0, hipstermatic.vars.canvasWidth, hipstermatic.vars.canvasHeight);
				};
			};

			reader.readAsDataURL(e.target.files[0]);
		},

		
		hipstermatic.saveImage = function() {
			// save the image
		};
		hipstermatic.init = function(){
			var $input = $('#input'),
			canvas = $(this.vars.canvasSelector);
			// bind file input
			$input.bind('change', function(e) {
				hipstermatic.loadImageFromFile(e);
			});
		};
		
	


$(function() {
	hipstermatic.init();
	
});