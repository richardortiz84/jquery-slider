jquery-slider
=============

Jquery Plugin - Basic Slider

This is a very basic slider for use with jquery for mobile and web applications. The slides are responsive and will resize
to fit the container they are placed in. The slides use hardware acceleration to transition between slides and also respond
to touch events for a much smoother native feel on mobile browsers and hybrid applications.

##HTML Markup:
```html
  <div id="slider">
      <div class="slides">
          <div class="slide-wrapper">
              <div class="slide">
                <p>Slide 1</p>
              </div>
          </div>
          <div class="slide-wrapper">
              <div class="slide">
                <p>Slide 2</p>
              </div>
          </div>
          <div class="slide-wrapper">
              <div class="slide">
                <p>Slide 3</p>
              </div>
          </div>
          <div class="slide-wrapper">
              <div class="slide">
                <p>Slide 4</p>
              </div>
          </div>
      </div>
  </div>
```
##Basic usage:
```html
var slider = $("#slider").slider();
```
##Advanced usage:
```html
var slider = $("#slider").slider({
  afterAnimation: function(slider) {
    var currentSlide = slider.currentSlide();
    var totalSlides = slider.totalSlides();
    
    // do something with the current slide
  }
});
```
##Options:
```html
  beforeAnimation       Function to be called before slides start animation
  afterAnimation        Function be called after slides finish animation
  init                  Function to be called during slider initialization
  showpagination        Boolean to hide or show slide indicators
  paginationType        String declaring type of pagination to display
                        numbers  - Will display numbers, 1 of 12
                        ellipsis - Will display circlular dots
  ellipsisDisplay       String declaring how to display ellipsis pagination indicators
                        default  - Will display one dot per slide
                        fixed - Will display 3 dots, left indicating first slide, right
                        indicating last slide, center indicating all others in between
```
