(function() {
  $(document).ajaxStart(function() {
    console.log("Start");
    $(".modal").addClass("loading");
  })
  $.getJSON( '/igMediaCounts')
    
    .done(function( data ) {
      var yCounts = data.users.map(function(item){
        return item.counts.media;
      });
      var yCounts2 = data.users.map(function(item){
        return item.counts.followed_by;
      });
      var xLabels = data.users.map(function(item){
        return item.username;
      });
      
      yCounts.unshift('Media Count');
      yCounts2.unshift('Followers');
      xLabels.unshift('Usernames');
      var chart = c3.generate({
        oninit: function() {
          console.log("Done");
          $(".modal").removeClass("loading");
        },
       
        bindto: '#chart',
        data: {
          x: 'Usernames',
          columns: [
            xLabels,
            yCounts,
            yCounts2
          ],
          type: 'bar'
        },
        axis: {
          x: {
            type: 'category',   
            tick: {
              rotate: 65
            },     
          }

        }
      });
    }); 
})();
