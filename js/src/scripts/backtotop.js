(function($) {
		
	addScrollTopAnimation(); // start 

	function addScrollTopAnimation() {
			
		var $scrolltop_link = $('#scroll-top');

		$scrolltop_link.on( 'click' ,  function ( ev ) {
			
			ev.preventDefault();
			
			$( 'html, body' ).animate( {
				
				scrollTop: 0
				
			}, 700 );
			
		})
		
		// Hides the link initially
		.data('hidden', 1).hide(); 
		
		var scroll_event_fired = false;
		
		$(window).on('scroll', function() {
			
			scroll_event_fired = true;
			
		});
		
		/* 
		Checks every 300 ms if a scroll event has been fired.
		*/
		setInterval( function() {
					
			if( scroll_event_fired ) {
				
				/* 
				Stop code below from being executed until the next scroll event. 
				*/
				scroll_event_fired = false; 
				
				var is_hidden =  $scrolltop_link.data('hidden'); 
				
				/* 
				Display the scroll top link when the page is scrolled 
				down the height of half a viewport from top,  Hide it otherwise. 
				
				after half scroll for top top button to appear
				if ( $( this ).scrollTop() >  $( this ).height() / 2 )
				
				scroll 200px down before the scroll to top button appears
				if ( $( this ).scrollTop() > 200)
				
				*/
				if ( $( this ).scrollTop()  != 0) {
					
					if( is_hidden ) {
						
						$scrolltop_link.fadeIn(600).data('hidden', 0);
						
					}
				}
				
				else {
					
					if( !is_hidden ) {
						
						$scrolltop_link.slideUp().data('hidden', 1);
			
					}
				}
				
			}
			
		}, 300); 
		
	}

})(jQuery);

/*Smooth Scrolling*/
$(function() {
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});