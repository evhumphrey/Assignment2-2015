(function() {


	$.getJSON('/igselfphotosasync')
		.done(function(data) {
			//console.log(data);
			console.log('printing images');
			var test = data.users.map(function(item) {
				return item.images.low_resolution.url;
			});
			
			count = 0;
			while(count < test.length) {
				var img = $('<img>');
				img.attr('src', test[count]);
				img.appendTo('#imglist');
				count++;
			}
		});

	
})();