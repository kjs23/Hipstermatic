/**
* Hipstermatic - Arty <canvas> photos filters
*
* @version	0.1
* @author	Kevin Stevens, Clare Hyam, Chloe Watts, Jasal Vadgama
* @require	jquery 1.7.1+
* @license	GPL v3
**/

var hipstermatic = hipstermatic || {};

hipstermatic.filter = {
	config: {
		hudson: {
			border: {
				radius: 10,
				width: 10,
				color: "#000000"
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
				color: "#ffffff"
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
	selectors: {
		brightnessInput: $("#brightness"),
		shadowStrengthInput: $("#shadowStrength"),
		highlightStrengthInput: $("#highlightStrength"),
		redChannelAdjustmentInput: $("#red"),
		blueChannelAdjustmentInput: $("#blue"),
		greenChannelAdjustmentInput: $("#green"),
		channelAdjustmentInputs: $(".channelAdjustment input"),
		borderCheckBox: $("#border"),
		borderColorInput: $(".borderAdjustment #color"),
		borderWidthInput: $(".borderAdjustment #width"),
		borderRadiusInput: $(".borderAdjustment #radius"),
		vingetteAdjustmentInputs: $(".vingetteAdjustment input"),
		borderAdjustmentInputs: $(".borderAdjustment input"),
		revertTrigger: $(".revert")
	},
	apply: function(config) {
		var canvas = document.getElementById("myCanvas"),
			imageHolder = hipstermatic.vars.imgObject,
			canvasWidth = hipstermatic.vars.canvasWidth,
			canvasHeight = hipstermatic.vars.canvasHeight,
			ctx = hipstermatic.vars.canvasContext,
			imgPixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
			imgPixelsHeight = imgPixels.height,
			imgPixelsWidth = imgPixels.width;

	
		if (config.brightness || config.channelAdjustment || config.greyscale || config.sepia) {
			for (var y = 0; y < imgPixelsHeight; y++) {
				for (var x = 0; x < imgPixelsWidth; x++) {
					var i = (y * 4) * imgPixelsWidth + x * 4,
					r, g, b;
					if (config.brightness) {
						r = config.brightness,g = config.brightness, b = config.brightness;
						imgPixels = hipstermatic.filter.adjustPixel(imgPixels, i, r, g, b);
					}
					if (config.channelAdjustment) {
						r = config.channelAdjustment.red,g = config.channelAdjustment.green, b = config.channelAdjustment.blue;
						imgPixels = hipstermatic.filter.adjustPixel(imgPixels, i, r, g, b);
						
					}
					
					if (config.greyscale || config.sepia){
						var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
						imgPixels = hipstermatic.filter.setPixel(imgPixels, i, avg, avg, avg);
					}
					
				}
			}

			ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixelsWidth, imgPixelsHeight); // add only one placement for all pixelTweaking
		}
		if (config.sepia) {
			this.setSepia(config, ctx, canvasWidth, canvasHeight);
		}
		if (config.gaussian) {
			this.setGaussian(config, ctx, canvasWidth, canvasHeight, imgPixels);
		}
		if (config.vingette) {
			this.setVingette(config, ctx, canvasWidth, canvasHeight);
		}
		if (config.border){
			if (config.border.width > 0){
				this.setBorder(config, ctx, canvasWidth, canvasHeight);
			}
		}
		
		return canvas.toDataURL(); //not sure where to put this yet but seems useful

	},
	setSepia: function(config, ctx, canvasWidth, canvasHeight){
		
		ctx.fillStyle = "rgba(202, 119, 30, 0.18)";
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		ctx.fillStyle = "#000";
		
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
		//add some defaults
		if (config.border.radius){
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
	setSliders: function(config){
		var selectors = hipstermatic.filter.selectors;
		//add selectors var here
		if(config.vingette){
			var shadowStrength = config.vingette.shadowStrength;
			var highlightStrength = config.vingette.highlightStrength;
		}
		if (config.channelAdjustment){
			var red = config.channelAdjustment.redAdjustment;
			var green = config.channelAdjustment.greenAdjustment;
			var blue = config.channelAdjustment.blueAdjustment;
		}
		if (config.border) {
			//may want to change this as reserved word
			var width = config.border.width;
			var color = config.border.color;
			var radius = config.border.radius;
			//var isRounded = config.border.isRounded;
			
		}
		selectors.brightnessInput.attr("value", config.brightness || 0);
		selectors.shadowStrengthInput.attr("value", shadowStrength || 0);
		selectors.highlightStrengthInput.attr("value", highlightStrength || 0);
		selectors.redChannelAdjustmentInput.attr("value", red || 0);
		selectors.greenChannelAdjustmentInput.attr("value", green || 0);
		selectors.blueChannelAdjustmentInput.attr("value", blue || 0);
		selectors.borderCheckBox.attr("checked", config.border || false);
		selectors.borderColorInput.attr("value", color || "#000000");
		selectors.borderWidthInput.attr("value", width || 0);
		selectors.borderRadiusInput.attr("value", radius || 0);
		
		
		//console.log(config.brightness);
	},
	adjustPixel: function(imageData, index, r, g, b){
		imageData.data[index] += r;
		imageData.data[index + 1] += g;
		imageData.data[index + 2] += b;
		return imageData;
	},
	setPixel: function(imageData, index, r, g, b){
		imageData.data[index] = r;
		imageData.data[index + 1] = g;
		imageData.data[index + 2] = b;
		return imageData;
	},
	mergeFiltersSliderConfig: function(){
		//grab last applied filter config
		var activeFilter = $(".filters .active");
		var sliderConfig = {channelAdjustment:{}, vingette: {}, brightness:{}};
		//loop through filter sliders - add values to slider config
		
		channelAdjustmentInputs = hipstermatic.filter.selectors.channelAdjustmentInputs;
		vingetteAdjustmentInputs = hipstermatic.filter.selectors.vingetteAdjustmentInputs;
		borderAdjustmentInputs = hipstermatic.filter.selectors.borderAdjustmentInputs;
		channelAdjustmentInputs.each(function(){ //maybe change these to fieldsets
				var value = parseInt($(this).attr("value"), 10);
				var id = $(this).attr("id").toString();
				sliderConfig.channelAdjustment[id] = value;
		});
		vingetteAdjustmentInputs.each(function(){
				//build config to pass through
				var value = $(this).attr("value"); //parseInt rounds this down, need to have a look at this
				var id = $(this).attr("id").toString();
				//console.log(value);
				sliderConfig.vingette[id] = value;
		});
		if (hipstermatic.filter.selectors.borderCheckBox.is(":checked")){
			sliderConfig.border = {};
			borderAdjustmentInputs.each(function(){
					var $this = $(this);
					var value = $this.attr("value");//need to work out color seperatelt
					if ($this.attr("type") == "range"){
						//if range make sure this is integer
						value = parseInt($this.attr("value"), 10);
					}
					
					var id = $this.attr("id").toString();
					sliderConfig.border[id] = value;
					
			});
		}

		sliderConfig.brightness = parseInt(hipstermatic.filter.selectors.brightnessInput.attr("value"), 10);
		
		
		
		//capture values if null | value = 0
		
		
		if (activeFilter.length > 0){

			var type = activeFilter.attr("data-filter");
			var filterConfig = hipstermatic.filter.config[type];
			//extend config
			//set sliderConfig to extended config
			filterSettings = $.extend({}, filterConfig, sliderConfig);
				if (!hipstermatic.filter.selectors.borderCheckBox.is(":checked"))
				{
					delete filterSettings.border;
				}
			sliderConfig = filterSettings;
		}
	
			return sliderConfig;

		

	},
	bindEvents:function(){
		var canvas = $(hipstermatic.vars.canvasSelector),
		filterLinks = $(hipstermatic.vars.filterSelector).find("a"),
		vingetteAdjustmentInputs = hipstermatic.filter.selectors.vingetteAdjustmentInputs,
		channelAdjustmentInputs = hipstermatic.filter.selectors.channelAdjustmentInputs,
		canvasUrl;
		filterLinks.bind("click keydown", function(e) {
			// call function to apply the filter
			if (!e.keyCode || e.keyCode === "13"){
				var $this = $(this),
				type = $this.attr("data-filter");
				if (!$this.hasClass("active")){
					canvas.trigger("revert");
					$this.addClass("active");
					if (hipstermatic.filter.config[type]) {
						canvasUrl = hipstermatic.filter.apply(hipstermatic.filter.config[type]);
						hipstermatic.filter.setSliders(hipstermatic.filter.config[type]);
					}
					else {
						//no config related to this filter type
					}
					
				}
				return false;
			}

		});
		hipstermatic.filter.selectors.brightnessInput.bind("change", function(){
			canvas.trigger("revert", [true]);
			var config = hipstermatic.filter.mergeFiltersSliderConfig();
			hipstermatic.filter.apply(config);
			
		});
		channelAdjustmentInputs.bind("change", function(){
			canvas.trigger("revert", [true]);
			var config = hipstermatic.filter.mergeFiltersSliderConfig();
			hipstermatic.filter.apply(config);
		});
		vingetteAdjustmentInputs.bind("change", function(){
			canvas.trigger("revert", [true]);
			var config = hipstermatic.filter.mergeFiltersSliderConfig();
			hipstermatic.filter.apply(config);
		});
		hipstermatic.filter.selectors.borderCheckBox.bind("change", function(){
			canvas.trigger("revert", [true]);
			var config = hipstermatic.filter.mergeFiltersSliderConfig();
		
			
			if(!$(this).is(":checked")){
				//turn off borders
				//remove border properties from config
				if (config.border) {
					delete config.border;
				}
				
				//reset border sliders
				//hipstermatic.filter.setSliders(config);

			}
			hipstermatic.filter.apply(config);
		});
		hipstermatic.filter.selectors.borderAdjustmentInputs.bind("change", function(){
			canvas.trigger("revert", [true]);
			var config = hipstermatic.filter.mergeFiltersSliderConfig();
			//console.log(config);
			hipstermatic.filter.apply(config);
		});
		hipstermatic.filter.selectors.revertTrigger.bind("click keydown", function(e){
			if (!e.keyCode || e.keyCode === "13"){
				canvas.trigger("revert");
				return false;
			}
		});
		canvas.bind("revert", function (event, retainFilter){
			var image = hipstermatic.vars.imgObject;
			//puts back to original image
			hipstermatic.vars.canvasContext.drawImage(image, 0, 0, hipstermatic.vars.canvasWidth, hipstermatic.vars.canvasHeight);
			if(!retainFilter){filterLinks.removeClass("active");}
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