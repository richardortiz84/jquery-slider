// GitHub Repository - https://github.com/richardortiz84/jquery-slider

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
			touchoffsetx: null,
			movex: undefined,
			index: 0,
			longTouch: undefined,
			scrollbarFadeTimer: null,

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
				this.setupElements();

				this.updatePagination();

				if ( !this.checkSetup() ) {
					return;
				}

				this.calculateWidth();
				this.animate();
				this.options.onRefresh(this);
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
					if ( this.el.container.find('div.sliderPagination').length > 0 ) {
						this.el.container.find('div.sliderPagination').remove();
					}

					var html = '<div class="sliderPagination"><div>';
					var ellipsis = '<span class="ellipsis"><span>&nbsp;</span></span>';
					var leftArrow = '<p><span class="left-arrow">&#9664;</span>';
					var rightArrow = '<span class="right-arrow">&#9654;</span></p>';
					var leftRight = '<div class="left">&nbsp;</div><div class="right">&nbsp;</div></div>';

					if ( this.options.paginationType == 'scrollbar' ) {
						html += '<div class="scrollbar"><div class="container"><div class="bar"></div></div></div>';
						leftRight = '';
					} else if ( this.options.paginationType == 'ellipsis' ) {
						html += leftArrow;

						if ( this.options.ellipsisDisplay == 'fixed' ) {
							for ( var i = 0; (i < 3 && i < this.el.slides.length); i++ ) {
								html += ellipsis;
							}
						} else { //default
							for ( var i = 0; i < this.el.slides.length; i++ ) {
								html += ellipsis;
							}
						}

						html += rightArrow;
					} else { //default
						html += leftArrow + '<span class="current"></span> <span>of</span> <span class="total"></span>' + rightArrow;
					}

					html += '</div>'+leftRight+'</div>';

					var pagination = $(html);
					this.el.container.append(pagination);
					this.el.pagination = pagination;

					pagination.find('div.left').off(touchStartEvent).on(touchStartEvent, function(event) {
				        slider.prev();
				    });

				    pagination.find('div.right').off(touchStartEvent).on(touchStartEvent, function(event) {
				        slider.next();
				    });

				    if ( this.options.paginationType == 'scrollbar' ) {
				    	pagination.find('div.bar').off(touchStartEvent).on(touchStartEvent, function(event) {
				    		slider.touchstartx = event.originalEvent.touches ? event.originalEvent.touches[0].pageX : event.pageX;
				    		slider.touchoffsetx = slider.touchstartx - slider.el.pagination.find('div.bar').position().left;
				    	});

				    	pagination.find('div.scrollbar > div.container').off(touchStartEvent).on(touchStartEvent, function(event) {
				    		event.stopPropagation();
				    		event.preventDefault();

				    		if ( slider.options.scrollWithBarOnly == true ) {
				    			if ( $(event.target) != slider.el.pagination.find('div.bar') ) {
				    				return false;
				    			}
				    		}

				    		slider.startScrollBar(event);

				    		$(this).on(touchMoveEvent, function(event) {
				    			slider.moveScrollBar(event);
				    		});

				    		$(this).on(touchStopEvent + ' ' + touchCancelEvent, function(event) {
				    			slider.endScrollBar(event);
				    		});
				    	});
				    }
				}

				this.el.container.toggleClass('slider', true);
			},

			bindUIEvents: function() {
				this.el.holder.on(touchStartEvent, function(event) {
					slider.start(event);

					slider.el.holder.on(touchMoveEvent, function(event) {
						slider.move(event);
					});

					slider.el.holder.on(touchStopEvent + ' ' + touchCancelEvent, function(event) {
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

		  		if ( this.options.paginationType == 'scrollbar' ) {
		  			var scrollbar = this.el.pagination.find('div.scrollbar'),
									scrollbarContainer = scrollbar.find('div.container'),
									bar = scrollbarContainer.find('div.bar'),
									containerWidth = scrollbarContainer.width(),
									barWidth = bar.outerWidth(true),
									perc = 0,
									offset = 0;

					if ( this.options.scrollBarFade == true ) {
						scrollbar.removeClass('fadeOut');
					}

					if (this.movex < ((this.el.slides.length-1) * this.el.container.width())) {
						perc = (this.movex / ((this.el.slides.length-1) * this.el.container.width()));
					} else {
						if ( this.touchstartx > this.touchmovex ) {
							perc = 1;
						} else {
							perc = ((((this.el.slides.length-1) * this.el.container.width())+this.movex) / ((this.el.slides.length) * this.el.container.width()))
						}
					}

					offset = (containerWidth-barWidth)*perc;
					bar.addClass('animate').css('transform', 'translate3d(' + offset + 'px,0,0)');
				}

		  		if ( this.index > 0 ) {
			  		event.stopPropagation();
			  		event.preventDefault();
			  	}
			},

			end: function(event) {
				slider.el.holder.off(touchMoveEvent).off(touchStopEvent + ' ' + touchCancelEvent);
		  		// Calculate the distance swiped.
		  		if ( this.movex != 0 ) {
			  		var absMove = Math.abs(this.index*this.slideWidth - this.movex);

			  		// Calculate the index. All other calculations are based on the index.
			  		if (absMove > this.slideWidth/4 || this.longTouch === false) {
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

			startScrollBar: function(event) {
				event.stopPropagation();
			  	event.preventDefault();

				// Get the original touch position.
				this.movex = 0;
				this.touchmovex = this.touchstartx = event.originalEvent.touches ? event.originalEvent.touches[0].pageX : event.pageX;
				
				if ( this.touchoffsetx == null ) {
					this.touchmovex = this.touchstartx;
					this.touchoffsetx = this.el.pagination.find('div.bar').width()/2;
				}

				// The movement gets all janky if there's a transition on the elements.
			  	this.el.container.find('.animate').removeClass('animate');

				this.animateScrollbar();
			},

			moveScrollBar: function(event) {
				event.stopPropagation();
			  	event.preventDefault();

			  	// Continuously return touch position.
		 	 	this.touchmovex = event.originalEvent.touches ? event.originalEvent.touches[0].pageX : event.pageX;

				this.animateScrollbar();
			},

			endScrollBar: function(event) {
				event.stopPropagation();
			  	event.preventDefault();

			  	var scrollbar = this.el.pagination.find('div.scrollbar'),
					scrollbarContainer = scrollbar.find('div.container'),
					bar = scrollbarContainer.find('div.bar'),
					containerWidth = scrollbarContainer.width(),
					barWidth = bar.outerWidth(true),
					perc, offset;

				offset = Math.max( 0, Math.min( (containerWidth-barWidth), this.touchmovex-this.touchoffsetx-scrollbarContainer.position().left));
				offset = Math.max( 0, Math.min( containerWidth, (offset+barWidth) ) );
		 	 	perc = offset / containerWidth;

		 	 	slide = Math.floor((this.el.slides.length-1)*perc);

		 	 	this.animate(slide);
				this.el.pagination.find('div.scrollbar > div.container').off(touchMoveEvent).off(touchStopEvent + ' ' + touchCancelEvent);
		  		
		  		this.touchoffsetx = null;
			},

			animateScrollbar: function() {
				var scrollbar = this.el.pagination.find('div.scrollbar'),
					scrollbarContainer = scrollbar.find('div.container'),
					bar = scrollbarContainer.find('div.bar'),
					containerWidth = scrollbarContainer.width(),
					barWidth = bar.outerWidth(true),
					perc, offset;

				if ( this.options.scrollBarFade == true ) {
					scrollbar.removeClass('fadeOut');
				}

			  	offset = Math.max( 0, Math.min( (containerWidth-barWidth), this.touchmovex-this.touchoffsetx-scrollbarContainer.position().left));
			  	bar.css('transform', 'translate3d(' + offset + 'px,0,0)');

			  	offset = Math.max( 0, Math.min( containerWidth, (offset+barWidth) ) );
		 	 	perc = offset / containerWidth;

		 	 	this.el.holder.css('transform','translate3d(-' + (((this.el.slides.length-1) * this.slideWidth)*perc) + 'px,0,0)');
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
						this.el.pagination.css('visibility', 'visible');

						 if ( this.options.paginationType == 'scrollbar' ) {
						 	this.el.pagination.find('.left-arrow').css('visibility', 'hidden');
							this.el.pagination.find('.right-arrow').css('visibility', 'hidden');

							var scrollbar = this.el.pagination.find('div.scrollbar'),
								scrollbarContainer = scrollbar.find('div.container'),
								bar = scrollbarContainer.find('div.bar'),
								containerWidth = scrollbarContainer.width(),
								barWidth = bar.outerWidth(true),
								perc = this.index/(this.el.slides.length-1),
								offset = (containerWidth-barWidth)*perc;

							bar.addClass('animate').css('transform', 'translate3d(' + offset + 'px,0,0)');
							if ( this.options.scrollBarFade == true ) {
								if ( this.scrollbarFadeTimer ) {
									clearTimeout(this.scrollbarFadeTimer);
								}
								scrollbar.removeClass('fadeOut');
								this.scrollbarFadeTimer = setTimeout(function() {
									scrollbar.addClass('fadeOut');
								}, 2000);
							}
						 } else if ( this.options.paginationType == 'ellipsis' ) {
							this.el.pagination.find('.left-arrow').css('visibility', 'hidden');
							this.el.pagination.find('.right-arrow').css('visibility', 'hidden');

							if ( this.options.ellipsisDisplay == 'fixed' ) {
								this.el.pagination.find('span.ellipsis.current').removeClass('current');
								if ( this.index < 1 ) {
									this.el.pagination.find('span.ellipsis:eq(0)').addClass('current');
								} else if ( this.index == (this.el.slides.length-1) ) {
									this.el.pagination.find('span.ellipsis:eq(2)').addClass('current');
								} else {
									this.el.pagination.find('span.ellipsis:eq(1)').addClass('current');
								}
							} else { //default
								var leftArrow, rightArrow, ellipsis, p, canfit;

								leftArrow = this.el.pagination.find('span.left-arrow').outerWidth(true);
								rightArrow = this.el.pagination.find('span.right-arrow').outerWidth(true);
								ellipsis = this.el.pagination.find('span.ellipsis').outerWidth(true);
								p = this.el.pagination.children('div:not(.left):not(.right)').children('p');

								canfit = Math.floor((this.slideWidth-leftArrow-rightArrow) / ellipsis);

								var offset = 0;

								if ( this.index < (Math.floor(canfit/2)) ) {
									offset = 0;
								} else if ( this.index >= ((this.el.slides.length-1)-(Math.floor(canfit/2))) ) {
									offset = leftArrow + (((this.el.slides.length-1)-canfit)*ellipsis) - rightArrow;
								} else {
									offset = leftArrow + (((this.index-1)-(Math.floor(canfit/2)))*ellipsis);
								}

								p.css('width', (leftArrow+rightArrow+(ellipsis*this.el.slides.length)) + 'px');
								p.addClass('animate').css('transform', 'translate3d(-' + offset + 'px,0,0)');

								this.el.pagination.find('span.ellipsis.current').removeClass('current');
								this.el.pagination.find('span.ellipsis:eq('+this.index+')').addClass('current');
							}
						} else { //default
							if ( this.index < 1 ) {
								this.el.pagination.find('.left-arrow').css('visibility', 'hidden');
							} else {
								this.el.pagination.find('.left-arrow').css('visibility', 'visible');
							}
							if ( this.el.slides.length <= 1 || (this.index >= (this.el.slides.length-1)) ) {
								this.el.pagination.find('.right-arrow').css('visibility', 'hidden');
							} else {
								this.el.pagination.find('.right-arrow').css('visibility', 'visible');
							}

							this.el.pagination.find('.current').html((this.index+1));
							this.el.pagination.find('.total').html(this.el.slides.length);
						}
					} else {
						this.el.pagination.css('visibility', 'hidden');
					}
				}
			},

			currentSlide: function() {
				var slide = null;

				if ( this.el.slides.length ) {
					slide = this.el.container.find('div.slide-wrapper:eq('+slider.index+')');
				}

				return slide;
			},

			totalSlides: function() {
				return this.el.slides.length;
			}
		};

		$.data(el, "slider", slider);

		slider.init();
	}

	$.slider.defaults = {
	    beforeAnimation: function(){},
	    afterAnimation: function(){},
	    init: function(){},
	    onRefresh: function(){},
	    showPagination: true,
	    paginationType: 'numbers',  // types: numbers, ellipsis
	    ellipsisDisplay: 'default', // displays: default, fixed
	    scrollWithBarOnly: false, // only starts scroll when user moves the scrollbar and not the container
	    scrollBarFade: false,
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
