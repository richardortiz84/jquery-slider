jquery-slider
=============

Jquery Plugin - Basic Slider

This is a very basic slider for use with jquery for PhoneGap applications. The slides are responsive and will resize
to fit the container they are placed in. The slides use hardware acceleration to transition between slides.

HTML Markup:
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
  
Basic usage:
  var slider = $("#slider").slider();
