// CLX - Firebelly 2018
/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"
//=include "../bower_components/jquery.fitvids/jquery.fitvids.js"
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
      $aboutModal,
      $body;

  /**
   * Initialize all functions
   */
  function _init() {
    $body = $('body');
    _resize();
    _initNewsletterForm();
    page_at = window.location.pathname;

    _initNav();
    _initSearch();

    // Fit them vids!
    $('.site-main').fitVids();

    // Keyboard navigation and esc handlers
    $(document).keyup(function(e) {
      // esc
      if (e.keyCode === 27) {
        _closeAboutModal();
        _closeSearch();
      }
      // <-
      if (e.keyCode === 37) {
        if ($('.prev-member').length && $('.page-about .modal.active').length) {
          $('.prev-member').trigger('click');
        }
      }
      // ->
      if (e.keyCode === 39) {
        if ($('.next-member').length && $('.page-about .modal.active').length) {
          $('.next-member').trigger('click');
        }
      }
    });

    // Smoothscroll links
    $('a.smoothscroll').click(function(e) {
      e.preventDefault();
      _scrollBody($(this).attr('href'), 500);
    });

    // After page load, run janky fixOverflow and check for hash
    $(window).on('load', function() {
      $body.addClass('loaded');
      $('.page-wrapper').imagesLoaded().done(function() {
        _fixOverflow();
      });
      _fixOverflow();
      setTimeout(_fixOverflow, 3000);
    });

    // Add superfluous gradient overlay to .article-grid .image-wraps for hover state
    $('.article-grid article .image-wrap').each(function() {
      $('<div class="gradient"></div>').appendTo(this);
    });

    // Resize selects to selected item (currently always the first which is the "title") so rightside arrow is flush with text
    $('.select').each(function() {
      var tmp = $('<span>' + $(this).find('select :selected').text() + '</span>').appendTo(this);
      var tmp_width = tmp.width();
      var $this = $(this);
      tmp.remove();
      $this.find('select').width(tmp_width);
      // Wait a second to apply .sized to trigger showing the icon-arrow
      setTimeout(function() {
        $this.addClass('sized');
      }, 250);
    });

    // Add .button class to a elements in p.button-block (Redactor button-blocks)
    $('.user-content p.button-block a').addClass('button');

    // Add curly quotes to blockquotes
    $('.user-content blockquote').each(function() {
      $('<span class="openquote">&ldquo;</span>').prependTo(this);
      $('<span class="closequote">&rdquo;</span>').appendTo(this);
    });

    // Editable donation link needs an arrow svg
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
    // Clicking outside of modal closes modal
    $(document).on('click touchend', 'body.modal-active', function(e) {
      $target = $(e.target);
      // Make sure target isn't modal, a modal element, or one of the links in #our-team-modals
      if (!$target.hasClass('modal') && $target.parents('.modal').length + $target.parents('#our-team-modals').length === 0) {
        _closeAboutModal();
      }
    });

    $(window).on('load', function() {
      // Check if linking to single person that has a popup
      if (window.location.hash && window.location.hash.match(/^#person/)) {
        var person_slug = window.location.hash.replace('#person-', '');
        if ($('#our-team-modals [data-slug="'+person_slug+'"]').length) {
          $('#our-team-modals [data-slug="'+person_slug+'"]').trigger('click');
        } else {
          _scrollBody('#our-team-modals', 500);
        }
      }
    });


    // Build team member modal markup and behavior
    $aboutModal = $('<div class="modal"><div class="grid"><div class="photo one-third"></div><div class="bio-wrap two-thirds"></div></div><div class="grid nav"><div class="one-third">&nbsp;</div></div></div>').appendTo('body');
    // Previous member link
    $('<div class="one-third prev-member"><a href="#" class="arrow left"><svg class="icon-arrow" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg> Previous Member</a></div>').appendTo($aboutModal.find('.nav')).on('click', function(e) {
      e.preventDefault();
      var prevMember = $('#our-team-modals li.active').prev().length ? $('#our-team-modals li.active').prev() : $('#our-team-modals li:last');
      prevMember.trigger('click');
    });
    // Next member link
    $('<div class="one-third next-member"><a href="#" class="arrow">Next Member <svg class="icon-arrow" aria-hidden="true" role="presentation"><use xlink:href="#icon-arrow"/></svg></a></div>').appendTo($aboutModal.find('.nav')).on('click', function(e) {
      e.preventDefault();
      var nextMember = $('#our-team-modals li.active').next().length ? $('#our-team-modals li.active').next() : $('#our-team-modals li:first');
      nextMember.trigger('click');
    });
    // Close button
    $('<a href="#" class="close"><svg class="icon-close" aria-hidden="true" role="presentation"><use xlink:href="#icon-close"/></svg></a>').appendTo($aboutModal).on('click', function(e) {
      e.preventDefault();
      _closeAboutModal();
    });

    // Open modals for team members on click
    $('#our-team-modals li').on('click', function(e) {
      e.preventDefault();
      $('#our-team-modals li').removeClass('active');
      $(this).addClass('active');
      $aboutModal.addClass('active');

      _populateAboutModal();
      // Scroll up to modal on desktop (mobile modal is placed on active person)
      if (breakpoint_nav) {
        _scrollBody('#our-team-modals', 500);
      } else {
        _scrollBody('#our-team-modals li.active', 500, -40);
      }
      window.location.hash = '#person-' + $(this).attr('data-slug');
    });

    // Reposition modal on window resize
    $(window).on('resize', _positionAboutModal);
  }
  /**
   * Populate team member modal with HTML from source element
   */
  function _populateAboutModal() {
    $aboutModal.addClass('dimmed').find('.bio-wrap').empty();
    // Copy html from active person
    $aboutModal.find('.photo').html($('#our-team-modals li.active article').html());
    // Move bio over
    $aboutModal.find('.photo .bio').appendTo($aboutModal.find('.bio-wrap'));
    setTimeout(function() {
      $body.addClass('modal-active');
      $aboutModal.removeClass('dimmed');
    }, 150);
    _positionAboutModal();
  }

  /**
   * Set top of team member modal to where Our Team is
   */
  function _positionAboutModal() {
    if (!$aboutModal.hasClass('active')) {
      return;
    }
    var modalTop;
    if (breakpoint_nav) {
      modalTop = $('#our-team-modals').offset().top;
    } else {
      modalTop = $('#our-team-modals li.active').offset().top - 40;
    }
    $aboutModal.css({ top: modalTop });
  }

  /**
   * Close team member modal on escape or clicking X icon
   */
  function _closeAboutModal() {
    if ($aboutModal) {
      $aboutModal.removeClass('active').css('top', '-9999em');
      $body.removeClass('modal-active');
      history.replaceState('', document.title, window.location.pathname);
    }
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
      selectedAttraction: 0.01,
      friction: 0.2,
      dragThreshold: 10,
      arrowShape: 'M36.13 26 18 44.268 18 55.732 36.13 74 42.176 67.909 31.747 57.403 25.821 54.057 26.414 52.628 31.747 54.299 82 54.299 82 45.698 31.747 45.698 26.414 47.372 25.821 45.94 31.747 42.594 42.176 32.091z'
    });
  }

  /**
   * Search behavior for mobile & desktop
   */
  function _initSearch() {
    $('.search-toggle, .nav-search').on('click', function(e) {
      e.preventDefault();
      $('body').toggleClass('search-open');
      $('#search-modal input[name=q]').focus();
    });
    // Init (X) search-clear button behavior
    $('.search-form input[name=q]').on('change keyup', _toggleClearSearch);
    $('.search-form .search-clear').on('click', function(e) {
      e.preventDefault();
      $(this).parents('.search-form:first').find('input[name=q]').val('').focus();
      _toggleClearSearch();
    });
    $(document).on('click', '#search-modal a.close', function(e) {
      e.preventDefault();
      _closeSearch();
    });
    _toggleClearSearch();
  }
  function _closeSearch() {
    $('body').removeClass('search-open');
  }
  function _toggleClearSearch() {
    // Show/hide (X) clear button for search inputs
    $('.search-form').each(function() {
      $(this).find('.q-wrap').toggleClass('has-text', $(this).find('input[name=q]').val() !== '');
    });
  }

  /**
   * Nav behavior for mobile and desktop
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
                $form.addClass('success').find('.status').removeClass('error').html('Thank you for signing up to the newsletter!<br><br>Check your email for confirmation.');
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
  function _scrollBody(el, duration, offset) {
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    if ($(el).length) {
      $('html, body').animate({scrollTop: $(el).offset().top + offset}, duration, 'easeInOutSine');
    }
  }

  /**
   * Called in quick succession as window is resized
   */
  function _resize() {
    // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
    breakpointIndicatorString = window.getComputedStyle(
      document.querySelector('#top'), ':after'
    ).getPropertyValue('content').replace(/['"]+/g, '');

    // Determine current breakpoint
    breakpoint_lg = breakpointIndicatorString === 'lg';
    breakpoint_nav = breakpointIndicatorString === 'nav' || breakpoint_lg;
    breakpoint_md = breakpointIndicatorString === 'md' || breakpoint_nav;
    breakpoint_sm = breakpointIndicatorString === 'sm' || breakpoint_md;

    // Slower resize events
    clearTimeout(delayed_resize_timer);
    delayed_resize_timer = setTimeout(_fixOverflow, 250);
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
