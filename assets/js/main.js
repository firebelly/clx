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
      breakpoint_nav,
      breakpoint_sm,
      adminBarHeight,
      footerImageHeight,
      delayed_resize_timer,
      nav_timer,
      page_at,
      $aboutModal;

  /**
   * Initialize all functions
   */
  function _init() {
    _resize();
    _initNewsletterForm();
    page_at = window.location.pathname;

    _initNav();

    // Esc handlers
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        _closeAboutModal();
      }
    });

    // After page load, run janky fixOverflow and check for hash
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

    // Editable donation link
    $('.footer-block.donate a:last').addClass('arrow').append(' <svg class="icon-arrow" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg>');

    // Selects that jump to URLs
    $(document).on('change', 'select.jumpSelect', function(e) {
      var jumpTo = $(this).find(':selected').val();
      location.href = jumpTo;
    });

    // Page-specific inits
    if ($('body.page-home').length) {
      _initHomepage();
    }
    if ($('body.page-about').length) {
      _initAbout();
    }
  }

  /**
   * About page functionality
   */
  function _initAbout() {
    // Build team member modal markup and behavior
    $aboutModal = $('<div class="modal"><div class="grid"><div class="photo one-third"></div><div class="bio-wrap two-thirds"></div></div><div class="grid nav"><div class="one-third">&nbsp;</div></div></div>').appendTo('body');
    $('<div class="one-third"><a href="#" class="arrow left"><svg class="icon-arrow" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg> Previous Member</a></div>').appendTo($aboutModal.find('.nav')).on('click', function(e) {
      e.preventDefault();
      var prevMember = $('#our-team li.active').prev().length ? $('#our-team li.active').prev() : $('#our-team li:last');
      prevMember.trigger('click');
    });
    $('<div class="one-third"><a href="#" class="arrow">Next Member <svg class="icon-arrow" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg></a></div>').appendTo($aboutModal.find('.nav')).on('click', function(e) {
      e.preventDefault();
      var nextMember = $('#our-team li.active').next().length ? $('#our-team li.active').next() : $('#our-team li:first');
      nextMember.trigger('click');
    });
    $('<svg class="icon-close" aria-hidden="true" role="presentation"><use xlink:href="#icon-close"/></svg>').appendTo($aboutModal).on('click', function(e) {
      e.preventDefault();
      _closeAboutModal();
    });

    // Open modals for team members on click
    $('#our-team li').on('click', function(e) {
      e.preventDefault();
      $('#our-team li').removeClass('active');
      $(this).addClass('active');
      $aboutModal.addClass('active');
      _populateAboutModal();
      _positionAboutModal();
      _scrollBody('#our-team', 500);
    });

    // Reposition modal on window resize
    $(window).on('resize', _positionAboutModal);
  }
  /**
   * Populate team member modal with HTML from source element
   */
  function _populateAboutModal() {
    $aboutModal.find('.bio-wrap').empty();
    // Copy html from active person
    $aboutModal.find('.photo').html($('#our-team li.active article').html());
    // Move bio over
    $aboutModal.find('.photo .bio').appendTo($aboutModal.find('.bio-wrap'));
  }

  /**
   * Set top of team member modal to where Our Team is
   */
  function _positionAboutModal() {
    if (!$aboutModal.hasClass('active')) {
      return;
    }
    var ourTeamPos = $('#our-team').offset();
    $aboutModal.css({ top: ourTeamPos.top });
  }

  /**
   * Close team member modal on escape or clicking X icon
   */
  function _closeAboutModal() {
    $aboutModal.removeClass('active').css('top', '-9999em');
  }

  /**
   * Homepage functionality
   */
   function _initHomepage() {
    // Featured carousel
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

  /**
   * Mobile and desktop nav behavior
   */
  function _initNav() {
    // Mobile hamburger and X close icons toggle mobile nav
    $('.mobile-nav-toggle,.mobile-nav-close').on('click', function(e) {
      e.preventDefault();
      $('body').toggleClass('mobile-nav-open');
    });

    // Mobile CLX arrangement at top-right is the home button
    $('.clx-elements').on('click', function(e) {
      if (!breakpoint_nav) {
        location.href = '/';
      }
    });

    // Handle clicks on nav a elements
    $('.site-nav a').on('click', function(e) {
      var $this = $(this);
      var $li = $this.parents('li:first');
      var href = $this.attr('href');
      var hrefSplit = href.split('#');

      // Mobile support for ul.children, slide in/out child options
      if (!breakpoint_nav && $li.hasClass('dropdown')) {
        e.preventDefault();
        $('.site-nav li').not($li).removeClass('open');
        $li.toggleClass('open');
        return;
      }

      // Close mobile nav on click (if item just scrolls page down)
      $('body').removeClass('mobile-nav-open');

      // Just scroll down to section if anchor link on same page
      if (hrefSplit.length && page_at == hrefSplit[0] && hrefSplit[0] != '#') {
        e.preventDefault();
        e.target.blur();
        _scrollBody('#' + hrefSplit[1], 500);
      }
    });

    // Show white bg on nav hover...
    $('.site-nav ul li.dropdown').on('mousemove', function() {
      clearTimeout(nav_timer);
      $('.site-header').addClass('bg');
    });
    // ...hide on leave after brief pause
    $('.site-nav').on('mouseleave', function() {
      clearTimeout(nav_timer);
      nav_timer = setTimeout(function() {
        $('.site-header').removeClass('bg');
      }, 350);
    });
  }

  /**
   * Janky fix for large SVG bg elements fighting Chrome's absolute-position-elements-changing-viewport behavior
   */
  function _fixOverflow() {
    if (breakpoint_nav) {
      // Setting body-wrapper height and overflow:hidden after page load to avoid Chrome's odd behavior of determining height from absolute position items (causing layout issues)
      footerImageHeight = $('.footer-image').length ? $('.footer-image').outerHeight() - 80 : 0;
      // adminBarHeight = $('#adminbar').length ? $('#adminbar').outerHeight() : 0;
      $('.body-wrapper').height($('.site-header').outerHeight() + $('.page-wrapper').outerHeight() + $('.site-footer').outerHeight() + footerImageHeight).css('overflow','hidden');
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
          $form.addClass('working');
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
              $form.removeClass('working');
            });
        }
      });
    });
  }

  /**
   * Scroll body to element
   */
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
    breakpoint_nav = breakpointIndicatorString === 'nav' || breakpoint_lg;
    breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_nav;
    breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;
  }


  /**
   * Public functions
   */
  return {
    init: _init,
    resize: _resize
  };

})(jQuery);

// Fire up the mothership & zigzag
jQuery(document).ready(CLX.init);
jQuery(window).on('resize', CLX.resize);
