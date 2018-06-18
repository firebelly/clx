// CLX Splash - Firebelly 2018
/*jshint latedef:false*/

//=include "../bower_components/jquery/dist/jquery.js"

// Good Design for Good Reason for Good Namespace
var CLX = (function($) {

  /**
   * Initialize all functions
   */
  function _init() {
    _injectSvgDefs();
    _initNewsletterForm();
  }

  /**
   * Pull in svg-defs.svg to body for <use> tags
   */
  function _injectSvgDefs() {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', 'assets/dist/svgs-defs.svg', true);
    ajax.send();
    ajax.onload = function(e) {
      var div = document.createElement('div');
      div.classList.add('hidden');
      div.innerHTML = ajax.responseText;
      document.body.insertBefore(div, document.body.childNodes[0]);
    };
  }

  /**
   * Ajaxify newsletter signup form
   */
  function _initNewsletterForm() {
    $('form.newsletter').each(function() {
      var $form = $(this);
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
              $form.removeClass('working').find('input[name=subscribe]').val('Notify Me');
            });
        }
      });
    });
  }

  // Public functions
  return {
    init: _init
  };

})(jQuery);

// Fire up the mothership
jQuery(document).ready(CLX.init);
