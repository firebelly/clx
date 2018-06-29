// CLX Splash - Firebelly 2018
/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/flickity/dist/flickity.pkgd.min.js"
//=include "../bower_components/jquery.easing/js/jquery.easing.min.js"
//=include "../bower_components/imagesloaded/imagesloaded.pkgd.min.js"

// Good Design for Good Reason for Good Namespace
var CLX = (function($) {
  var breakpointIndicatorString,
      breakpoint_lg,
      breakpoint_md,
      breakpoint_sm,
      breakpoint_xs,
      adminBarHeight,
      footerImageHeight,
      delayed_resize_timer,
      nav_timer,
      page_at;

  /**
   * Initialize all functions
   */
  function _init() {
    _resize();
    _initNewsletterForm();
    page_at = window.location.pathname;

    $('.mobile-nav-toggle,.mobile-nav-close').on('click', function(e) {
      e.preventDefault();
      $('body').toggleClass('mobile-nav-open');
    });

    $('.clx-elements').on('click', function(e) {
      location.href = '/';
    });

    // Nav behavior
    $('.site-nav a').on('click', function(e) {
      var $this = $(this);
      var $li = $this.parents('li:first');
      var href = $this.attr('href');
      var hrefSplit = href.split('#');

      // Mobile support for ul.children
      if (Modernizr.touchevents && $li.hasClass('dropdown')) {
        e.preventDefault();
        $('.site-nav li').not($li).removeClass('open');
        $li.toggleClass('open');
        return;
      }

      // Close mobile nav
      $('body').removeClass('mobile-nav-open');

      // Just scroll down to section if anchor link on same page
      if (hrefSplit.length && page_at == hrefSplit[0] && hrefSplit[0] != '#') {
        e.preventDefault();
        e.target.blur();
        _scrollBody('#' + hrefSplit[1], 500);
      }
    });
    // Wait a moment before initializing rollover bg if user just clicked to a different section
    setTimeout(function() {
      $('.site-nav ul li').on('mousemove', function() {
        clearTimeout(nav_timer);
        $('.site-header').addClass('bg');
      }).on('mouseleave', function() {
        clearTimeout(nav_timer);
        nav_timer = setTimeout(function() {
          $('.site-header').removeClass('bg');
        }, 500);
      });
    }, 500);

    $(window).on('load', function() {
      $('.page-wrapper').imagesLoaded().done(function() {
        _fixOverflow();

        $(window).on('resize', function() {
          clearTimeout(delayed_resize_timer);
          delayed_resize_timer = setTimeout(_fixOverflow, 250);
        });
      });
      // Scroll down to hash after page load
      if (window.location.hash) {
        _scrollBody(window.location.hash - 80, 500);
      }
    });

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

  function _fixOverflow() {
    if (breakpoint_md) {
      // Setting body-wrapper height and overflow:hidden after page load to avoid Chrome's odd behavior of determining height from absolute position items (causing layout issues)
      footerImageHeight = $('.footer-image').length ? $('.footer-image').outerHeight() - 80 : 0;
      adminBarHeight = $('#adminbar').length ? $('#adminbar').outerHeight() : 0;
      $('.body-wrapper').height($('.site-header').outerHeight() + $('.page-wrapper').outerHeight() + $('.site-footer').outerHeight() + footerImageHeight + adminBarHeight).css('overflow','hidden');
    } else {
      $('.body-wrapper').css('height','');
    }
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

  function _scrollBody(el, duration) {
    var headerOffset = 0;
    if ($(el).length) {
      $('html, body').animate({scrollTop: $(el).offset().top + headerOffset}, duration, 'easeInOutSine');
    }
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
