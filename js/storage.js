/**
* Hipstermatic - Arty <canvas> photos filters
*
* @info		localStorage functions
* @version	0.1
* @author	Kevin Stevens, Clare Hyam, Chloe Watts, Jasal Vadgama
* @require	jquery 1.7.1+
* @license	GPL v3
**/

var hipstermatic = hipstermatic || {};

hipstermatic.storage = {
	/* Storage vars */
	config: {
		imageDataInStorage: '', // raw string image data held in local storage
		imageJsonInStorage: {} // parsed JSON of the image data in local storage
	},

	saveImage: function(e) {
		// get data URL (base64 encoded) and add to local storage
		var canvas = document.getElementById(hipstermatic.vars.canvasSelector.split('#')[1]);
			dataURL = canvas.toDataURL(),
			imageTitle = $('#imageTitle').val();

		e.preventDefault();

		// if image title is empty
		if (!imageTitle) {
			// show error msg
			alert('Please enter an image name.');
			return;
		}

		// make sure name doesn't already exist
		for (i = 0; i < hipstermatic.storage.config.imageJsonInStorage.images.length; i++) {
			if (hipstermatic.storage.config.imageJsonInStorage.images[i].title === imageTitle) {
				// name exists so show error and quit
				alert('That name already exists, please chose another.');
				return;
			}
		}

		// push data to json object
		hipstermatic.storage.config.imageJsonInStorage.images.push({
			title: imageTitle,
			data: dataURL
		});
		//console.log(hipstermatic.storage.config.imageJsonInStorage);

		// stringify json
		hipstermatic.storage.config.imageDataInStorage = JSON.stringify(hipstermatic.storage.config.imageJsonInStorage);
		//console.log(hipstermatic.storage.config.imageDataInStorage);

		// add to local storage
		localStorage.setItem('hipstermatic.images', hipstermatic.storage.config.imageDataInStorage);

		alert('"' + imageTitle + '" has been saved');
	},

	deleteImage: function() {
		// delete a saved image
	},

	getImageList: function() {
		// get list of saved images
		var $ul = $('<ul class="imageList" />'),
			savedImages = hipstermatic.storage.config.imageJsonInStorage.images;

		for (i = 0; i < savedImages.length; i++) {
			//console.log(savedImages[i].title);

			$('<li><img src="' + savedImages[i].data + '" /> ' + savedImages[i].title + '</li>').appendTo($ul);
		}
	},

	viewImage: function() {
		// view selected image
	},

	init: function() {
		// get image items from local storage
		// if nothing there set to empty string
		hipstermatic.storage.config.imageDataInStorage = localStorage['hipstermatic.images'] || '';

		// convert raw image data to JSON
		// if nothing there set up new object
		hipstermatic.storage.config.imageJsonInStorage = $.parseJSON(hipstermatic.storage.config.imageDataInStorage) || { "images": [] };

		//console.log(localStorage['hipstermatic.images']);

		hipstermatic.storage.getImageList();
	}
};

$(function() {
	hipstermatic.storage.init();
});