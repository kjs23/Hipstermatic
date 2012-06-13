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
	var
		/* VARS */
		vars = {
			// image
			imgObject: "",
			// canvas properties
			canvasSelector: "#myCanvas",
			canvasContext: "",
			canvasWidth: 0,
			canvasHeight: 0
		},

		/* FILTERS */
		filterConfig = {
			hudson: {
				border: {
					isRounded: true,
					radius: 10,
					width: 10,
					color: "black"
				},
				vingette: {
					shadowStrength: 0.5,
					highlightStrength: 0.5
				}
			},
			inkwell: {
				greyscale: true,
				border: {
					width: 20,
					color: "white"
				}
				//gaussian: true
			},
			greyscale: {
				greyscale: true
			},
			brightness: {
				brightness: 50
			}
		},

		/* PRIVATE FUNCTIONS */
		loadImageFromFile = function(e) {
			var $canvas = $(vars.canvasSelector),
				$input = $('#input'),
				reader = new FileReader();
				vars.imgObject = new Image();

			// set he canvas context
			vars.canvasContext = $canvas.get(0).getContext("2d"),

			reader.onload = function(e) {
				vars.imgObject.src = e.target.result;
				vars.imgObject.onload = function() {
					var imgWidth = vars.imgObject.width,
						imgHeight = vars.imgObject.height,
						imgScaleFactor;

					// clear current canvas content
					vars.canvasContext.clearRect(0, 0, $canvas.width(), $canvas.height());

					// scale the image down to a max 500x500
					if (imgWidth > imgHeight) {
						// calculate the scale factor
						imgScaleFactor = imgWidth / 500;

						// set the new width and height
						vars.canvasWidth = 500;
						vars.canvasHeight = imgHeight / imgScaleFactor;
					} else {
						// calculate the scale factor
						imgScaleFactor = imgHeight / 500;

						// set the new width and height
						vars.canvasWidth = imgWidth / imgScaleFactor;
						vars.canvasHeight = 500;
					}

					// set canvas size based on image size
					$canvas.attr({
						width: vars.canvasWidth,
						height: vars.canvasHeight
					});

					// draw image on canvas
					//ctx.drawImage([image], [top], [left], [width], [height]);
					vars.canvasContext.drawImage(vars.imgObject, 0, 0, vars.canvasWidth, vars.canvasHeight);
				};
			};

			reader.readAsDataURL(e.target.files[0]);
		},

		applyFilter = function(config) {
		//console.log("applyFilter");
		
		//var canvas = imageHolder.children("canvas");
		//console.log(config);
		var canvas = $(vars.canvasSelector),
		imageHolder = $(vars.imgObject),
		canvasWidth = canvas.width(),
		canvasHeight = canvas.height(),
		ctx = vars.canvasContext,
		imgPixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

		

		if (config.vingette) {

			//console.log(config.vingette);
			var outerRadius = Math.sqrt( Math.pow(canvasWidth/2, 2) + Math.pow(canvasHeight/2, 2) );
            ctx.globalCompositeOperation = 'source-over';
            //darken corners
			var grd = ctx.createRadialGradient(canvasWidth/2,canvasHeight/2, 0, canvasWidth/2,canvasHeight/2, outerRadius);
			grd.addColorStop(0,'rgba(0, 0, 0, 0)');
			grd.addColorStop(0.5,'rgba(0, 0, 0, 0)');
			grd.addColorStop(1, 'rgba(0,0,0,' + config.vingette.shadowStrength +')');
			ctx.fillStyle=grd;
			ctx.fillRect(0,0,canvasWidth,canvasHeight);
			//lighten centre
			ctx.globalCompositeOperation = 'lighter';
			grd = ctx.createRadialGradient(canvasWidth/2,canvasHeight/2, 0, canvasWidth/2,canvasHeight/2, outerRadius);
			grd.addColorStop(0,'rgba(255, 255, 255,' + config.vingette.highlightStrength + ')');
			grd.addColorStop(0.5,'rgba(0, 0, 0, 0)');
			grd.addColorStop(1, 'rgba(0,0,0, 0)');
			ctx.fillStyle=grd;
			ctx.fillRect(0,0,canvasWidth,canvasHeight);
			ctx.globalCompositeOperation = "source-over"; //setting back to default
			ctx.fillStyle="#000";
		}
		if (config.brightness){
				
			//merge pixel tweaking somehow - only want one set of these loops - too dangerous doing these all at once
			//try negatives to make darker?
			for (var y = 0; y < imgPixels.height; y++) {
				for (var x = 0; x < imgPixels.width; x++) {
					var i = (y * 4) * imgPixels.width + x * 4;
					//var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;

					
					/*red*/imgPixels.data[i] += config.brightness;
					/*green*/imgPixels.data[i + 1] += config.brightness;
					/*blue*/imgPixels.data[i + 2] += config.brightness;
				}
			}
			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height); // add only one placement for all pixelTweaking
		}
		if (config.greyscale) {
			//greyscale
			for (var y = 0; y < imgPixels.height; y++) {
				for (var x = 0; x < imgPixels.width; x++) {
					var i = (y * 4) * imgPixels.width + x * 4;
					var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;

					
					/*red*/imgPixels.data[i] = avg;
					/*green*/imgPixels.data[i + 1] = avg;
					/*blue*/imgPixels.data[i + 2] = avg;
				}
			}
			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
		}
		if (config.redAdjustment || config.greenAdjustment || config.blueAdjustment)
		{
			for (var y = 0; y < imgPixels.height; y++) {
				for (var x = 0; x < imgPixels.width; x++) {
					
					var i = (y * 4) * imgPixels.width + x * 4;
					
					
					/*red*/imgPixels.data[i] +=config.redAdjustment;
					/*green*/imgPixels.data[i + 1] +=config.greenAdjustment;
					/*blue*/imgPixels.data[i + 2] +=config.blueAdjustment;
				}
			}
			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
		}
		if (config.gaussian) {
			function Matrix(){
				this.rows = [];
			}
			//console.log("gaussian");
			var blurRadius = 7; //temp - move into config
			var buffer = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
			

			var sumR = 0;
			var sumG = 0;
			var sumB = 0;
			var sumA = 0;
			var gausFact = Array(1,6,15,20,15,6,1);
			var gausSum = 64;
			for (var y = 0; y < imgPixels.height; y++) {
				for (var x = 0; x < imgPixels.width; x++) {
				var i = (y * 4) * imgPixels.width + x * 4;
				var sumR = 0;
				var sumG = 0;
				var sumB = 0;
				var sumA = 0;
				var m = new Matrix(); 
				for (var k=0; k<blurRadius; k++) {

					color = ctx.getImageData(parseInt(y+k), x, 1, 1);
					
					m.rows[k] = new Array(parseInt(y+k), x);

					 var r = color.data[0]; //perhaps merge these if not using elsewhere
					 var g = color.data[1];
					 var b = color.data[2];
					 var a = color.data[3];
					  
					
					sumR += r*gausFact[k];
					sumG += g*gausFact[k];
					sumB += b*gausFact[k];
					sumA += a*gausFact[k]; //might want to take this one out
					


						//hipstermatic.setPixel(buffer, i, sumR/gausSum, sumG/gausSum, sumB/gausSum, sumA/gausSum);
					

				}
				//console.log(m);	
				//console.log(m.rows.length);
			
				for (var u=0; u<m.rows.length; u++){
					
					var xCoord = parseInt(m.rows[u][0], 10);
					var yCoord = parseInt(m.rows[u][1], 10);
					var iData = ctx.getImageData(xCoord, yCoord, 1, 1);
					iData.data[0] = sumR/gausSum;
					iData.data[1] = sumG/gausSum;
					iData.data[2]= sumB/gausSum;
					iData.data[3] = sumA/gausSum;
					/*console.log("x" + xCoord);
					console.log("y" + yCoord);*/

					ctx.putImageData(iData, xCoord, yCoord, 0, 0, imgPixels.width, imgPixels.height);

				}
				
			
				

					

				
			}
		}
		
	
			
			
		

		}
		if (config.border){
			if (config.border.isRounded){
				//rounded corners
				//cornerRadius = { upperLeft: cornerRadius, upperRight: cornerRadius, lowerLeft: cornerRadius, lowerRight: cornerRadius },
				var canvasX = config.border.width,
				canvasY = config.border.width,
				newRectWidth = canvasWidth - (config.border.width*2),
				newRectHeight = canvasHeight - (config.border.width*2);
				

				ctx.globalCompositeOperation = "destination-in";
				ctx.save();
				ctx.beginPath();
				ctx.lineWidth = config.border.width;
				//draw rounded rectangle
				ctx.beginPath();
				ctx.moveTo(canvasX + config.border.radius, canvasY);
				ctx.lineTo(canvasX + newRectWidth - config.border.radius, canvasY);
				ctx.quadraticCurveTo(canvasX + newRectWidth, canvasY, canvasX + newRectWidth, canvasY + config.border.radius);
				ctx.lineTo(canvasX + newRectWidth, canvasY + newRectHeight - config.border.radius);
				ctx.quadraticCurveTo(canvasX + newRectWidth, canvasY + newRectHeight, canvasX + newRectWidth - config.border.radius, canvasY + newRectHeight);
				ctx.lineTo(canvasX + config.border.radius, canvasY + newRectHeight);
				ctx.quadraticCurveTo(canvasX, canvasY + newRectHeight, canvasX, canvasY + newRectHeight - config.border.radius);
				ctx.lineTo(canvasX, canvasY + config.border.radius);
				ctx.quadraticCurveTo(canvasX, canvasY, canvasX + config.border.radius, canvasY);

				ctx.closePath();
			    ctx.fill();
			    //set background colour based on color supplied 
				ctx.globalCompositeOperation = "destination-over";
				ctx.fillStyle = config.border.color;
				ctx.fillRect(0, 0, canvasWidth, canvasHeight);
				ctx.globalCompositeOperation = "source-over"; //setting back to default
			}
		
			else {
				//standard corners
				ctx.beginPath();
				ctx.rect(0, 0, canvasWidth, canvasHeight);
				ctx.lineWidth = config.border.width;
				ctx.strokeStyle = config.border.color;
				ctx.stroke();
			}
			
		}	//canvas.toDataURL(); not sure where to put this yet but seems useful

		};
		saveImage = function() {
			// save the image
		};

		
	/* PUBLIC FUNCTIONS */
	return {
		init: function() {
			var $input = $('#input'),
			canvas = $(vars.canvasSelector);
			// bind file input
			$input.bind('change', function(e) {
				loadImageFromFile(e);
			});

			// bind filter clicks
			$('.filters').on('click', 'a', function(e) {
				

				// call function to apply the filter
				//filters[$(e.target).data('filter')]();
				if (!e.keyCode || e.keyCode === "13"){
				var $this = $(this);
				if (!$this.hasClass("active") && vars.canvasContext !== ""){
					//$(hipstermatic.vars.canvasSelector).trigger("revert");


					canvas.trigger("revert");

					var type = $this.attr("data-filter");

					//filterLinks.removeClass("active");
					$(this).addClass("active");
					//console.log();
					if (filterConfig[type]) {
						var canvasUrl = applyFilter(filterConfig[type]);
						//$("#save").attr("href", canvasUrl);
					}
					else {
						//console.log("no config currently added for this filter");
					}
				}
				else {
					alert("upload a picture first duh!");
				}
				return false;
			}

		});
		$("#brightness").bind("change", function(){
			//console.log($(this).attr("value"));
			canvas.trigger("revert");
			applyFilter({brightness: parseInt($(this).attr("value"), 10)});
		});
		$(".channelAdjustment input").bind("change", function(){
			//console.log($(this).attr("value"));
			canvas.trigger("revert");
			
			var t = {};
		
			$(".channelAdjustment input").each(function(){
				var value = parseInt($(this).attr("value"), 10);
				var id = $(this).attr("id").toString();
				t[id] = value;
			});
			//console.log(t);
			applyFilter(t);
		});
		$(".revert").bind("click", function(){
			if (!e.keyCode || e.keyCode === "13"){
				canvas.trigger("revert");
				return false;
			}
		});
		canvas.bind("revert", function(){
			//puts back to original image
			
			//console.log(vars.canvasContext);
			
			//console.log(vars.imgObject);
			ctx.drawImage(vars.imgObject, 0, 0);
			
			//filterLinks.removeClass("active");
		});
		}
	};
}();

$(function() {
	hipstermatic.init();
});