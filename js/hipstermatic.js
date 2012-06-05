$(document).ready(function() {
						   
						   
    var input = document.getElementById('input');
    input.addEventListener('change', handleFiles);
	
	function handleFiles(e) {
		var canvas = $("#myCanvas");
		var ctx = canvas.get(0).getContext("2d");
		var reader = new FileReader;
		var input = document.getElementById('input');
		input.addEventListener('change', handleFiles);
		reader.onload = function(event) {
			var img = new Image;
			img.src = event.target.result;
			img.onload = function() {
				var imgWidth = img.width;
				var imgHeight = img.height;
				ctx.clearRect(0, 0, canvas.width(), canvas.height());
				$("#myCanvas").attr('width', imgWidth);
				$("#myCanvas").attr('height', imgHeight);
				ctx.drawImage(img, 0, 0);
			}
		}
		reader.readAsDataURL(e.target.files[0]);
	}
});
