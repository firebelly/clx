// CLX Splash - Firebelly 2018
/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/flickity/dist/flickity.pkgd.min.js"

// Good Design for Good Reason for Good Namespace
var CLX = (function($) {
  var breakpointIndicatorString,
      breakpoint_lg,
      breakpoint_md,
      breakpoint_sm,
      breakpoint_xs;

  /**
   * Initialize all functions
   */
  function _init() {
    _initNewsletterForm();

    // Homepage
    if ($('body.page-home').length) {
      flkty = new Flickity('.featured-carousel', {
        cellSelector: 'article.featured',
        pageDots: false,
        prevNextButtons: true,
        groupCells: false,
        autoPlay: 5000,
        adaptiveHeight: true,
        wrapAround: true,
        selectedAttraction: 0.2,
        friction: 0.8,
        arrowShape: 'M36.13 26 18 44.268 18 55.732 36.13 74 42.176 67.909 31.747 57.403 25.821 54.057 26.414 52.628 31.747 54.299 82 54.299 82 45.698 31.747 45.698 26.414 47.372 25.821 45.94 31.747 42.594 42.176 32.091z'
      });
    }

    // Selects that jump to URLs
    $(document).on('change', 'select.jumpSelect', function(e) {
      var jumpTo = $(this).find(':selected').val();
      location.href = jumpTo;
    });
  }

  /**
   * Ajaxify newsletter signup form
   */
  function _initNewsletterForm() {
    $('form.newsletter').each(function() {
      var $form = $(this);
      $form.find('input').on('focus change', function() {
        $form.addClass('interacted');
      });
      $form.on('submit', function(e) {
        e.preventDefault();
        if ($form.hasClass('working')) {
          return false;
        }
        if ($form.find('input[name=EMAIL]').val()=='') {
          $form.find('.status').addClass('error').text('Error: Please enter an email.');
        } else {
          $form.addClass('working').find('input[name=subscribe]').val('Sending...');
          $.getJSON($form.attr('action'), $form.serialize())
            .done(function(data) {
              if (data.result != 'success') {
                if (data.msg.match(/already subscribed/)) {
                  $form.find('.status').addClass('error').text('Error: You are already subscribed to our newsletter.');
                } else {
                  $form.find('.status').addClass('error').text('Error: ' + data.msg);
                }
              } else {
                $form.addClass('success').find('.status').removeClass('error').html('Thank you for signing up to the newsletter!<br>Check your email for confirmation');
              }
            })
            .fail(function() {
              $form.find('.status').addClass('error').text('Error: There was an error subscribing. Please try again.');
            })
            .always(function() {
              $form.removeClass('working').find('input[name=subscribe]').val('Submit');
            });
        }
      });
    });
  }

  /**
   * Called in quick succession as window is resized
   */
  function _resize() {
    // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
    breakpointIndicatorString = window.getComputedStyle(
      document.querySelector('#breakpoint-indicator'), ':after'
    ).getPropertyValue('content')
    .replace(/['"]+/g, '');

    // Determine current breakpoint
    breakpoint_lg = breakpointIndicatorString === 'lg';
    breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_lg;
    breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;
    breakpoint_xs = breakpointIndicatorString === 'xs' || breakpoint_sm;
  }


  // Public functions
  return {
    init: _init,
    resize: _resize
  };

})(jQuery);

// Fire up the mothership & zigzag
jQuery(document).ready(CLX.init);
jQuery(window).on('resize', CLX.resize);
