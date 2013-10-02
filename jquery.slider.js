(function ($) {
  	$.slider = function(el, options) {
  		var $el = $(el);

		var slider = {
			options: $.extend({}, $.slider.defaults, options),
			el: {
			  	container: $el,
			  	holder: $el.find('.slides'),
			  	slides: $el.find('.slides').find('.slide-wrapper'),
			  	pagination: null
			},

			slideWidth: $el.width(),
			touchstartx: undefined,
			touchmovex: undefined,
			movex: undefined,
			index: 0,
			longTouch: undefined,

			init: function() {
				this.setup();

				if ( !this.checkSetup() ) {
					return;
				}

				this.setupElements();
			  	this.bindUIEvents();
			  	this.calculateWidth();
			  	this.updatePagination();
			  	
			  	this.options.init(this);

			  	this.animate(0);
			},

			refresh: function() {
				this.setup();

				if ( !this.checkSetup() ) {
					return;
				}

				this.calculateWidth();
				this.updatePagination();
				this.animate();
			},

			setup: function() {
				this.el.holder = this.el.container.find('.slides');
			  	this.el.slides = this.el.holder.find('.slide-wrapper');
			},

			checkSetup: function() {
				if ( !this.el.holder.length ) {
					console.log('Slide holder not found, need div with class of slides');
					return false;
				}

				if ( !this.el.slides.length ) {
					console.log('Slider setup needs slides');
					return false;
				}

				return true;
			},

			setupElements: function() {
				if ( this.options.showPagination ) {
					var pagination = $('<div class="sliderPagination"><p><span class="left-arrow">&#9664;</span><span class="current"></span> of <span class="total"></span><span class="right-arrow">&#9654;</span></p><div class="left">&nbsp;</div><div class="right">&nbsp;</div></div></div>');
					this.el.container.append(pagination);
					this.el.pagination = pagination;

					pagination.find('div.left').on( 'touchstart mouseup', function() {
				        slider.prev();
				    });

				    pagination.find('div.right').on('touchstart mouseup', function() {
				        slider.next();
				    });
				}

				this.el.container.addClass('slider');
			},

			bindUIEvents: function() {
				this.el.holder.on("touchstart mousedown", function(event) {
					slider.start(event);

					slider.el.holder.on("touchmove mousemove", function(event) {
						slider.move(event);
					});

					slider.el.holder.on("touchend mouseup touchcancel mousecancel", function(event) {
						slider.end(event);
					});
				});
			},

			calculateWidth: function() {
				var width = this.el.slides.length * this.el.container.width();

				this.el.holder.css('width', width + 'px');
				this.el.slides.css('width', this.el.container.width() + 'px');
			},

			start: function(event) {
			  	// Test for flick.
			  	this.longTouch = false;
			  	setTimeout(function() {
			    	slider.longTouch = true;
			  	}, 250);

				// Get the original touch position.
				this.movex = this.touchmovex = 0;
				this.touchstartx = event.originalEvent.touches ? event.originalEvent.touches[0].pageX : event.pageX;

			  	// The movement gets all janky if there's a transition on the elements.
			  	this.el.container.find('.animate').removeClass('animate');

			  	if ( this.index > 0 ) {
			  		event.stopPropagation();
			  		event.preventDefault();
			  	}
			},

			move: function(event) {
		  		// Continuously return touch position.
		 	 	this.touchmovex = event.originalEvent.touches ? event.originalEvent.touches[0].pageX : event.pageX;
		  		// Calculate distance to translate holder.
		  		this.movex = this.index*this.slideWidth + (this.touchstartx - this.touchmovex);
		  		// Defines the speed the images should move at.
		  		var panx = 100-this.movex/6;
		  		if (this.movex < ((this.el.slides.length-1) * this.el.container.width())) { // Makes the holder stop moving when there is no more content.
		    		this.el.holder.css('transform','translate3d(-' + this.movex + 'px,0,0)');
		  		}

		  		if ( this.index > 0 ) {
			  		event.stopPropagation();
			  		event.preventDefault();
			  	}
			},

			end: function(event) {
				slider.el.holder.off("touchmove mousemove").off("touchend mouseup touchcancel mousecancel");
				console.log('end');
		  		// Calculate the distance swiped.
		  		if ( this.movex != 0 ) {
			  		var absMove = Math.abs(this.index*this.slideWidth - this.movex);

			  		// Calculate the index. All other calculations are based on the index.
			  		if (absMove > this.slideWidth/2 || this.longTouch === false) {
			    		if (this.movex > this.index*this.slideWidth && this.index < (this.el.slides.length-1)) {
			      			this.index++;
			      			this.animate();
			    		} else if (this.movex < this.index*this.slideWidth && this.index > 0) {
			      			this.index--;
			      			this.animate();
			    		}
			  		} else if ( this.longTouch ) {
			  			// snap back to current slide
			  			this.animate();
			  		}
			  	}     
		  		
		  		if ( this.index > 0 ) {
			  		event.stopPropagation();
			  		event.preventDefault();
			  	}
			},

			animate: function(i) {
				if ( i !== undefined ) this.index = i;
				if ( this.index < 0 ) this.index = 0;
				if ( this.index >= this.el.slides.length ) this.index = this.el.slides.length-1;

				this.el.container.one( 'webkitTransitionEnd', function() {
					slider.options.afterAnimation(slider);
				});

				this.options.beforeAnimation(this);
				this.updatePagination();
				// Move and animate the elements.
		  		this.el.holder.addClass('animate').css('transform', 'translate3d(-' + this.index*this.slideWidth + 'px,0,0)');
			},

			first: function() {
				this.animate(0);
			},

			next: function() {
				if ( this.index < (this.el.slides.length-1) ) {
					this.index++;
					this.animate();
				}
			},

			last: function() {
				this.animate(this.el.slides.length-1);
			},

			prev: function() {
				if ( this.index > 0 ) {
					this.index--;
					this.animate();
				}
			},

			updatePagination: function() {
				if ( this.el.pagination && this.el.pagination.length ) {
					if ( this.el.slides.length ) {
						this.el.pagination.show();
						this.el.pagination.find('.current').html((this.index+1));
						this.el.pagination.find('.total').html(this.el.slides.length);
						if ( this.index < 1 ) {
							this.el.pagination.find('.left-arrow').hide();
						} else {
							this.el.pagination.find('.left-arrow').show();
						}
						if ( this.el.slides.length <= 1 || (this.index >= (this.el.slides.length-1)) ) {
							this.el.pagination.find('.right-arrow').hide();
						} else {
							this.el.pagination.find('.right-arrow').show();
						}
					} else {
						this.el.pagination.hide();
					}
				}
			}
		};

		$.data(el, "slider", slider);

		slider.init();
	}

	$.slider.defaults = {
	    beforeAnimation: function(){},
	    afterAnimation: function(){},
	    init: function(){},
	    showPagination: true
  	}

	$.fn.slider = function(options) {
		if (options === undefined) options = {};

		if (typeof options === "object") {
		  	return this.each(function() {
        		new $.slider(this, options);
      		});
		} else {
		  	var $slider = $(this).data('slider');

		  	switch (options) {
		    	case "next": $slider.next(); break;
		    	case "prev":
		    	case "previous": $slider.prev(); break;
		    	case "first": $slider.first(); break;
		    	case "last": $slider.last(); break;
		    	case "refresh": $slider.refresh(); break;
		    	default: if (typeof options === "number") $slider.animate(options);
		  	}
		}
	}
})(jQuery);
