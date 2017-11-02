// Main javascript file.

(function($) {

  /**
   * Activate the .menu-toggle element that will expand/hide the
   * menu on mobile screens.
   */
  var initMenuToggle = function(target) {
    var $toggleButton = $(target);
    var selector = $($toggleButton.data('toggle'));
    var $menuContainer = $(selector);

    $toggleButton.on('click touch', function(e){
      e.preventDefault();

      // Toggle button class and aria-expanded value.
      var ariaExpanded = $toggleButton.attr('aria-expanded') == "true";
      $toggleButton.toggleClass('expanded').attr('aria-expanded', !ariaExpanded);
      $menuContainer.toggleClass('expanded');
      if (ariaExpanded) {
        // We are collapsing; reset submenu items.
        $('.menu-item').removeClass('active');
        $('.menu-item.current-menu-parent').addClass('active');
      }
    });
  };

  /**
   * Activate touch states for login sub menu.
   */
  var initSubMenuToggle = function(target) {
    var $subMenu = $(target);
    var $hoverTarget = $(target).parent('.menu-item');

    // Disable click on the "Client Login" menu element.
    $hoverTarget.find('> a').on('click', function(e){
      e.preventDefault();
    });
  };

  /**
   * Create .menu-primary .sub-menu toggle.
   */
  var initMenuPrimarySubMenu = function(target) {
    var $subMenu = $(target);
    var $subMenuToggle = $('.sub-menu-toggle');

    // Initial active state.
    $('.menu-item.current-menu-parent').addClass('active');

    $subMenuToggle.on('click touch', function(e) {
      e.preventDefault();
      $(this).parent('.menu-item').toggleClass('active');
    });

  };

  /**
   * Reset the nav element states on screen resize.
   */
  var resetNavOnScreenResize = function() {
    mediaCheck({
      media: '(min-width: 62em)',
      entry: function() {
        // Reset to "not expanded" state.
        $('.menu-toggle').removeClass('expanded').attr('aria-expanded', false);
        $($('.menu-toggle').data('toggle')).removeClass('expanded');
        $('.menu-item').removeClass('active');
      },
      exit: function() {
        // Reset submenus.
        $('.menu-item').removeClass('active');
        $('.menu-item.current-menu-parent').addClass('active');

        $('.menu-item.menu-item-has-children > a').on('click touch', function(e){
          e.preventDefault();
          $(this).parent().toggleClass('active');
        });

        var primaryMenuLink = $('.menu-primary').find('.menu-item').not('.menu-item-has-children');
        primaryMenuLink.on('click', function (e) {
          $('.menu-toggle').removeClass('expanded').attr('aria-expanded', false);
          $('.main-navigation__nav').removeClass('expanded');
        });
      }
    });
  };

  var updateHeaderOnScreenResize = function() {
    // Get Main Nav height.
    var $header = $('.site-header');
    var $mobileNav = $('.main-navigation__nav');
    var $viewportHeight = $(window).height();

    mediaCheck({
      media: '(max-width: 62em)',
      entry: function() {
        $mobileNav.css('max-height', $viewportHeight - $header.outerHeight() + 'px');
      },
      exit: function() {
        $mobileNav.css('max-height', 'none');
      }
    });
  }

  /**
   * Make the Resources filter form dynamic.
   */
  var ajaxifyResourcesFilter = function(target) {
    $filterForm = $(target);
    $('.search-submit', $filterForm).hide();

    // Initialize filter forms if hash present.
    if (window.location.hash.length) {
      $('.form-clear').removeClass('disabled');

      var paramsHash = getAddressParams($.address.path());
      var args = {};
      args['filter'] = {
        resource_type: paramsHash.hasOwnProperty('type') ? paramsHash.type : null,
        resource_topic: paramsHash.hasOwnProperty('topic') ? paramsHash.topic : null
      };
      args['order'] = paramsHash.hasOwnProperty('order') ? paramsHash.order.toLowerCase() : 'desc';
      args['page'] = paramsHash.hasOwnProperty('page') ? paramsHash.page : '1';
      args['per_page'] = 9;

      // Update selected values of filter form.
      if (paramsHash.hasOwnProperty('type')) {
        $('select[name="type"]', $filterForm).val(paramsHash.type).selectric('refresh');
      }
      if (paramsHash.hasOwnProperty('topic')) {
        $('select[name="topic"]', $filterForm).val(paramsHash.topic).selectric('refresh');
      }
      if (paramsHash.hasOwnProperty('order')) {
        $('select[name="order"]', $filterForm).val(paramsHash.order).selectric('refresh');
      };
    }

    // Ajaxify select form inputs.
    $('select', $filterForm).on('change', function(e) {
      e.preventDefault();

      $('.form-clear').removeClass('disabled');

      // Gather select values and update.
      var urlParams = {};
      $('select', $filterForm).each(function() {
        urlParams[$(this).attr('name')] = $(this).val();
      });
      // Page is always reset to 1.
      urlParams['page'] = 1;
      $.address.path($.param(urlParams));
    });

    // Ajaxify pager links.
    var resourcePagerClickHandler = function(e) {
      e.preventDefault();

      if ($.isNumeric($(this).data('page'))) {
        var urlParams = getAddressParams($.address.path());
        urlParams['page'] = $(this).data('page');
        $.address.path($.param(urlParams));
      }

      var $resourceGrid = $('.resources-grid').offset().top;

      $('html, body').animate({
        scrollTop: $resourceGrid - 200
      }, 600);
    }
    $('#js-resources-pagination a.page-numbers').bind('click', resourcePagerClickHandler);

    // Listener for address update - update content.
    // @todo Paginate this.
    // https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/
    $.address.change(function(e) {
      var paramsHash = getAddressParams($.address.path());
      var args = {};
      args['filter'] = {
        resource_type: paramsHash.hasOwnProperty('type') ? paramsHash.type : null,
        resource_topic: paramsHash.hasOwnProperty('topic') ? paramsHash.topic : null
      };
      args['order'] = paramsHash.hasOwnProperty('order') ? paramsHash.order.toLowerCase() : 'desc';
      args['page'] = paramsHash.hasOwnProperty('page') ? paramsHash.page : '1';
      args['per_page'] = 9;

      // Update selected values of filter form.
      if (paramsHash.hasOwnProperty('type')) {
        $('select[name="type"]', $filterForm).val(paramsHash.type);
      }
      if (paramsHash.hasOwnProperty('topic')) {
        $('select[name="topic"]', $filterForm).val(paramsHash.topic);
      }
      if (paramsHash.hasOwnProperty('order')) {
        $('select[name="order"]', $filterForm).val(paramsHash.order);
      }

      // REST API request.
      $.ajax({
        url: '/wp-json/wp/v2/resource',
        data: args,
        dataType: 'json',
        success: function(response, textStatus, jqXHR) {
          // Update grid container content.
          $('#js-resources-container').html('');

          var numResults = jqXHR.getResponseHeader('X-WP-Total');
          var numPages = jqXHR.getResponseHeader('X-WP-TotalPages');
          var currentPage = args.hasOwnProperty('page') ? args.page : 1;

          if (response.length && numResults > 0) {
            // Has results.
            $(response).each(function() {
              $('#js-resources-container').append(this.zm_grid_display);
            });

            // Show/hide pagination.
            if (numPages > 1) {
              var paginationOutput = '<ul class="page-numbers">';
              if (currentPage > 1) {
                paginationOutput += '<li><a class="previous page-numbers" data-page="' + (parseInt(currentPage) - 1) + '" href="#">Previous</a></li>';
              }
              for (var i = 1; i <= numPages; i++) {
                if (i == currentPage) {
                   paginationOutput += '<li><span class="page-numbers current" data-page="' + i + '">' + i + '</span></li>';
                }
                else {
                  paginationOutput += '<li><a class="page-numbers" data-page="' + i + '" href="#">' + i + '</a></li>';
                }
              }
              if (currentPage < numPages) {
                paginationOutput += '<li><a class="next page-numbers" data-page="' + (parseInt(currentPage) + 1) + '" href="#">Next</a></li>';
              }
              paginationOutput += '</ul>';
              $('#js-resources-pagination').html(paginationOutput);
              // Reattach click handler.
              $('#js-resources-pagination a.page-numbers').bind('click', resourcePagerClickHandler);
            }
            else {
              $('#js-resources-pagination').html('');
            }
          }
          else {
            // No results.
            $('#js-resources-container').html('<h4>No results found.</h4>');
            $('#js-resources-pagination').html('');
          }
        },
        error: function(response) {
          console.log('An error occured');
        }
      });
    });

  };

  /**
   * Initialize the Slick carousel.
   */
  var initSlickCarousel = function() {
    var $clientCarousel = $('.js-client-carousel');

    if ($clientCarousel.length) {
      $clientCarousel.slick({
        autoplay: true,
        arrows: false,
        slidesToShow: 4,
        infinite: true,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 992,
            settings: {
              slidesToShow: 3
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2
            }
          }
        ]
      });
    }
  }

  /**
   * Creator page - swap accordion image.
   */
  var initCreatorAccordion = function() {
    var $zmCreatorGif = $('#zm-creator-gif');

    $('.zm-accordion .panel-collapse').on('show.bs.collapse', function () {
      var $pc = $(this),
        gifSrc = $pc.data('gif-src');

      $zmCreatorGif.attr('src', gifSrc);
    });
  }

  /**
   * Make the nav sticky.
   */
  function stickyNav() {
    var $header = $('.site-header');
    var headerHeight = $header.height();
    var stickyClass = 'is-sticky';

    if ($(this).scrollTop() > headerHeight) {
      $header.addClass(stickyClass);
    } else {
      $header.removeClass(stickyClass);
    }
  }

  /**
   * Tooltips
   */
  var Tooltips = (function (element) {
    var elem          = element || $('.js-popover');
    var trigger       = '.popover-trigger';
    var triggerTarget = '.popover-body';

    function init(e) {
      $(trigger).on('click', toggleTooltip);

      $('html').on('click', function () {
        $(trigger).removeClass('active');
        $(trigger).next(triggerTarget).removeClass('active');
      });

      $(triggerTarget).find('.popover-cta').on('click', scrollToDiv);
    }

    function toggleTooltip(e) {
      e.preventDefault();
      e.stopPropagation();

      $(this).toggleClass('active');
      $(this).next(triggerTarget).toggleClass('active');
    }

    return {
      init: init()
    }
  });

  // Utility functions below.

  function throttle(fn, wait) {
    var time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        fn();
        time = Date.now();
      }
    };
  }

  /**
   * Get params from URI string.
   * @return object
   */
  function getAddressParams(str) {
    // str = str.replace('/', '');
    // if ( ! str ) {
    //   return null;
    // }
    return str.replace('/', '').split('&').reduce(function(acc, val) {
      var pair = val.split('=');
      if (pair[0] && pair[1]) {
        acc[pair[0]] = pair[1];
      }
      return acc;
    }, {});
  }

  /**
   * Careers Scroll div to top of Viewport on click
   */
  var scrollToDiv = function(e) {
    var offset;
    var elem       = $(e.currentTarget).attr('href').replace(/^\//, '');
        elem       = $(elem);
    var elemOffset = elem.offset().top;
    var elemHeight = elem.outerHeight();
    var winHeight  = $(window).height();
    var headerHeight = $('.site-header').outerHeight();

    e.preventDefault();

    if (elemHeight < winHeight) {
      offset = elemOffset - ((winHeight / 2) - (elemHeight / 2));
    } else {
      offset = elemOffset;
    }

    if ($('.site-header').hasClass('is-sticky')) {
      $('html, body').animate({ scrollTop: elemOffset - headerHeight }, 600);
    } else {
      $('html, body').animate({ scrollTop: elemOffset - (headerHeight * 2) }, 600);
    }

    // If homepage, update hash.
    if (window.location.pathname == '/') {
      window.location.hash = '#' + $(elem).attr('id');
    }
  };

  /**
   * If hitting homepage anchor link from nav menu, trigger scroll.
   */
  var initPageLoadScrollToDiv = function() {
    var offset;
    var elem = $(window.location.hash);
    var elemOffset = elem.offset().top;
    var elemHeight = elem.outerHeight();
    var winHeight = $(window).height();
    var headerHeight = $('.site-header').outerHeight();

    if (elemHeight < winHeight) {
      offset = elemOffset - ((winHeight / 2) - (elemHeight / 2));
    } else {
      offset = elemOffset;
    }

    $('html, body').scrollTop(elemOffset - (headerHeight * 2));
  };

  /**
   * Call custom methods in the document ready call.
   */
  $(document).ready(function(){

    $('html').removeClass('no-js').addClass('js');

    $(window).on('load scroll resize', stickyNav)
             .on('load resize', throttle(updateHeaderOnScreenResize, 250));

    if (window.location.pathname == '/' && window.location.hash) {
      initPageLoadScrollToDiv();
    }

    $('.menu-primary').on('click', 'a', scrollToDiv);

    $('.js-careers-list').on('click', 'a', scrollToDiv);

    initSlickCarousel();

    if ($('.menu-toggle').length) {
      initMenuToggle($('.menu-toggle'));
    }

    if ($('.js-filter-toggle').length) {
      initMenuToggle($('.js-filter-toggle'));

      $('select').selectric({
        maxHeight: 300,
        arrowButtonMarkup: '<b class="button icon-plus-100"></b>',
        responsive: true,
      });
    }

    if ($('.menu-secondary .sub-menu-container').length) {
      initSubMenuToggle($('.menu-secondary .sub-menu-container'));
    }

    if ($('.menu-primary .sub-menu').length) {
      initMenuPrimarySubMenu($('.menu-primary .sub-menu'));
    }

    resetNavOnScreenResize();

    // init Tooltips.
    if ($('.js-popover').length) {
      var tooltips = new Tooltips();
    }

    if ($('.resources-filters').length) {
      ajaxifyResourcesFilter($('.resources-filters'));
    }

    if ($('#zm-creator-gif').length) {
      initCreatorAccordion();
    }

  });
})(jQuery);
