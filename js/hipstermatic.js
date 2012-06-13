/**
* Hipstermatic - Arty <canvas> photos filters
*
* @version	0.1
* @author	Kevin Stevens, Clare Hyam, Chloe Watts, Jasal Vadgama
* @require	jquery 1.7.1+
* @license	GPL v3
**/

var hipstermatic = hipstermatic || {};

hipstermatic = function() {
	/* VARS */
	var

		/* PRIVATE FUNCTIONS */
		loadImageFromFile = function(e) {
			var $canvas = $("#myCanvas"),
				$input = $('#input'),
				ctx = $canvas.get(0).getContext("2d"),
				reader = new FileReader(),
				img = new Image();

			reader.onload = function(e) {
				img.src = event.target.result;
				img.onload = function() {
					var imgWidth = img.width,
						imgHeight = img.height,
						imgScaleFactor, scaledImgWidth, scaledImgHeight;

					// clear current canvas content
					ctx.clearRect(0, 0, $canvas.width(), $canvas.height());

					// scale the image down to a max 500x500
					if (imgWidth > imgHeight) {
						// calculate the scale factor
						imgScaleFactor = imgWidth / 500;

						// set the new width and height
						scaledImgWidth = 500;
						scaledImgHeight = imgHeight / imgScaleFactor;
					} else {
						// calculate the scale factor
						imgScaleFactor = imgHeight / 500;

						// set the new width and height
						scaledImgWidth = imgWidth / imgScaleFactor;
						scaledImgHeight = 500;
					}

					// set canvas size based on image size
					$canvas.attr({
						width: scaledImgWidth,
						height: scaledImgHeight
					});

					// draw image on canvas
					//ctx.drawImage([image], [top], [left], [width], [height]);
					ctx.drawImage(img, 0, 0, scaledImgWidth, scaledImgHeight);
				};
			};

			reader.readAsDataURL(e.target.files[0]);
		},
		saveImage = function() {
			// save the image
		},

		/* FILTERS */
		filters = {
			blur: function() {
				console.log('blur');
			}
		};

	/* PUBLIC FUNCTIONS */
	return {
		init: function() {
			var $input = $('#input');

			// bind file input
			$input.bind('change', function(e) {
				loadImageFromFile(e);
			});

			// bind filter clicks
			$('.filters').on('click', 'a', function(e) {
				e.preventDefault();

				// call function to apply the filter
				filters[$(e.target).data('filter')]();
			});
		}
	};
}();

$(function() {
	hipstermatic.init();
});