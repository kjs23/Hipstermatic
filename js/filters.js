var hipstermatic = hipstermatic || {};

hipstermatic.filter = {
	config: {
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
		},
		sepia: {
			sepia: true
		},
		gaussian: {
			gaussian: true
		},
		greyscale: {
			greyscale: true
		},
		brightness: {
			brightness: 50
		}
	},

	apply: function(config) {
		var canvas = hipstermatic.vars.canvasSelector,
			imageHolder = hipstermatic.vars.imgObject,
			canvasWidth = hipstermatic.vars.canvasWidth,
			canvasHeight = hipstermatic.vars.canvasHeight,
			ctx = hipstermatic.vars.canvasContext,
			imgPixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
			imgPixelsHeight = imgPixels.height,
			imgPixelsWidth = imgPixels.width;

		if (config.vingette) {
			this.setVingette(config, ctx, canvasWidth, canvasHeight);
		}
		if (config.brightness || config.channelAdjustment || config.greyscale || config.sepia) {
			for (var y = 0; y < imgPixelsHeight; y++) {
				for (var x = 0; x < imgPixelsWidth; x++) {
					var i = (y * 4) * imgPixelsWidth + x * 4,
					avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3,
					r, g, b;
					if (config.brightness) {r = config.brightness,g = config.brightness, b = config.brightness;}
					if (config.channelAdjustment) {r = config.channelAdjustment.red,g = config.channelAdjustment.green, b = config.channelAdjustment.blue;}
					if (config.sepia){
						r = (imgPixels.data[i]*0.393) + (imgPixels.data[i+1]*0.769) + (imgPixels.data[i+2]*0.189);
						g = (imgPixels.data[i]*0.349) + (imgPixels.data[i+1]*0.686) + (imgPixels.data[i+2]*0.168);
						b = (imgPixels.data[i]*0.272) + (imgPixels.data[i+1]*0.534) + (imgPixels.data[i+2]*0.131);
					}

					if (config.greyscale){
						//setPixel
						//add bluetones etc
						imgPixels.data[i] = avg;
						imgPixels.data[i + 1] = avg;
						imgPixels.data[i + 2] = avg;
					}
					else {
						//adjust pixel
						imgPixels.data[i] += r;
						imgPixels.data[i + 1] += g;
						imgPixels.data[i + 2] += b;
					}
				}
			}

			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixelsWidth, imgPixelsHeight); // add only one placement for all pixelTweaking
		}
	
		if (config.gaussian) {
			this.setGaussian(config, ctx, canvasWidth, canvasHeight, imgPixels);
		}

		if (config.border){
			this.setBorder(config, ctx, canvasWidth, canvasHeight);
		}
		//canvas.toDataURL(); not sure where to put this yet but seems useful

	},
	setGaussian: function(config, ctx, canvasWidth, canvasHeight, imageData){
			function Matrix(){
				this.rows = [];
			}
			//console.log("gaussian");
			var blurRadius = 7; //temp - move into config
			var buffer = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
			var imageDataHeight = imageData.height;
			var imageDataWidth = imageData.width;


			var sumR = 0;
			var sumG = 0;
			var sumB = 0;
			var sumA = 0;
			var gausFact = Array(1,6,15,20,15,6,1);
			var gausSum = 64;
			for (var y = 0; y < imageDataHeight; y++) {
				for (var x = 0; x < imageDataWidth; x++) {
					var i = (y * 4) * imageDataWidth + x * 4;
					sumR = 0;
					sumG = 0;
					sumB = 0;
					sumA = 0;
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

					ctx.putImageData(iData, xCoord, yCoord, 0, 0, imageDataWidth, imageDataHeight);

				}
			}
		}
	},
	setVingette: function(config, ctx, canvasWidth, canvasHeight){
		var transparency = 'rgba(0, 0, 0, 0)';
		//console.log(config.vingette);
		var outerRadius = Math.sqrt( Math.pow(canvasWidth/2, 2) + Math.pow(canvasHeight/2, 2) );
        ctx.globalCompositeOperation = 'source-over';
        //darken corners
		var grd = ctx.createRadialGradient(canvasWidth/2,canvasHeight/2, 0, canvasWidth/2,canvasHeight/2, outerRadius);
		grd.addColorStop(0, transparency);
		grd.addColorStop(0.5, transparency);
		grd.addColorStop(1, 'rgba(0,0,0,' + config.vingette.shadowStrength +')');
		ctx.fillStyle=grd;
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		//lighten centre
		ctx.globalCompositeOperation = 'lighter';
		grd = ctx.createRadialGradient(canvasWidth/2,canvasHeight/2, 0, canvasWidth/2,canvasHeight/2, outerRadius);
		grd.addColorStop(0,'rgba(255, 255, 255,' + config.vingette.highlightStrength + ')');
		grd.addColorStop(0.5, transparency);
		grd.addColorStop(1, transparency);
		ctx.fillStyle=grd;
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		ctx.globalCompositeOperation = "source-over"; //setting back to default
		ctx.fillStyle="#000";
	},
	setBorder: function(config, ctx, canvasWidth, canvasHeight){

		var borderWidth = config.border.width,
		borderColor = config.border.color;
		if (config.border.isRounded){
			//rounded corners
			//cornerRadius = { upperLeft: cornerRadius, upperRight: cornerRadius, lowerLeft: cornerRadius, lowerRight: cornerRadius },
			var radius = config.border.radius,
			newRectWidth = borderWidth + (canvasWidth - (borderWidth*2)),
			newRectHeight = borderWidth + (canvasHeight - (borderWidth*2));
			//composite operation to clip corners
			ctx.globalCompositeOperation = "destination-in";
			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = borderWidth;
			//draw rounded rectangle
			ctx.beginPath();
			ctx.moveTo(borderWidth + radius, borderWidth);
			ctx.lineTo(newRectWidth - radius, borderWidth);
			ctx.quadraticCurveTo(newRectWidth, borderWidth, newRectWidth, borderWidth + radius);
			ctx.lineTo(newRectWidth, newRectHeight - radius);
			ctx.quadraticCurveTo(newRectWidth, newRectHeight, newRectWidth - radius, newRectHeight);
			ctx.lineTo(borderWidth + radius, newRectHeight);
			ctx.quadraticCurveTo(borderWidth, newRectHeight, borderWidth, newRectHeight - radius);
			ctx.lineTo(borderWidth, borderWidth + radius);
			ctx.quadraticCurveTo(borderWidth, borderWidth, borderWidth + radius, borderWidth);

			ctx.closePath();
			ctx.fill();
			//set background colour based on color supplied
			ctx.globalCompositeOperation = "destination-over";
			ctx.fillStyle = borderColor;
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
			ctx.globalCompositeOperation = "source-over"; //setting back to default
		}
	
		else {
			//standard corners
			ctx.beginPath();
			ctx.rect(0, 0, canvasWidth, canvasHeight);
			ctx.lineWidth = borderWidth;
			ctx.strokeStyle = borderColor;
			ctx.stroke();
		}
	},
	bindEvents:function(){
		var canvas = $(hipstermatic.vars.canvasSelector),
		filterLinks = $(hipstermatic.vars.filterSelector).find("a"),
		vingetteAdjustmentInputs = $(".vingetteAdjustment input"),
		channelAdjustmentInputs = $(".channelAdjustment input"),
		canvasUrl;
		filterLinks.bind("click keydown", function(e) {
			// call function to apply the filter
			if (!e.keyCode || e.keyCode === "13"){
				var $this = $(this),
				type = $this.attr("data-filter");
				if ($this.hasClass("active") || hipstermatic.vars.canvasContext === ""){
					alert("upload a picture first");
				}
				else {
					canvas.trigger("revert");
					$this.addClass("active");
					if (hipstermatic.filter.config[type]) {
						canvasUrl = hipstermatic.filter.apply(hipstermatic.filter.config[type]);
					}
					else {
						//no config related to this filter type
					}
				}
				return false;
			}

		});
		$("#brightness").bind("change", function(){
			canvas.trigger("revert");
			hipstermatic.filter.apply({brightness: parseInt($(this).attr("value"), 10)});
		});
		channelAdjustmentInputs.bind("change", function(){
			canvas.trigger("revert");
			var t = {channelAdjustment: {}};
			channelAdjustmentInputs.each(function(){
				var value = parseInt($(this).attr("value"), 10);
				var id = $(this).attr("id").toString();
				t.channelAdjustment[id] = value;
			});
			
			hipstermatic.filter.apply(t);
		});
		vingetteAdjustmentInputs.bind("change", function(){
			canvas.trigger("revert");
			var t = {vingette: {}};
			vingetteAdjustmentInputs.each(function(){
				//build config to pass through
				var value = $(this).attr("value");
				var id = $(this).attr("id").toString();
				t.vingette[id] = value;
			});
			
			hipstermatic.filter.apply(t);
		});
		$(".revert").bind("click", function(e){
			if (!e.keyCode || e.keyCode === "13"){
				canvas.trigger("revert");
				return false;
			}
		});
		canvas.bind("revert", function(e){
			var image = hipstermatic.vars.imgObject;
			//puts back to original image
			hipstermatic.vars.canvasContext.drawImage(image, 0, 0, hipstermatic.vars.canvasWidth, hipstermatic.vars.canvasHeight);
			filterLinks.removeClass("active");
		});
	},
		
	init: function(){
		this.bindEvents();
	}
};

$(function() {
	if ($(hipstermatic.vars.filterSelector).length > 0){
		hipstermatic.filter.init();
	}
});