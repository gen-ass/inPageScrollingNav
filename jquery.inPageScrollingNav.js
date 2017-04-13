/*
 * @name          inPageScrollingNav
 * @version       1.1.0
 * @lastmodified  2017-04-13
 * @author        Saeid Mohadjer
 *
 * Licensed under the MIT License
 */

;(function($) {
	'use strict';

	var pluginName = 'inPageScrollingNav',
	defaults = {};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.$element = $(element);
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// methods
	var methods = {
		init: function() {
			var pluginInstance = this;
			var sections = [];
			var $navItems = pluginInstance.$element.find('li');

			//populate sections array
			$navItems.find('a').each(function() {
				var selector = $(this).attr('href');

				if (selector.charAt(0) === '#') {
					var $section = $(selector);

					if ($section.length) {
						sections.push($section);
					}
				}
			});

			pluginInstance.scrolled = false;
			pluginInstance.setEventHandlers($navItems);

			setInterval(function() {
				if (pluginInstance.scrolled) {
					pluginInstance.scrolled = false;
					pluginInstance.updateNavState(sections, $navItems);
				}
			}, 250);

			//if URL has a hash tag corresponding to a section scroll to that
			//section and update nav state. This is useful when sections dont'
			//have id on page load and their id is added via js later.
			/*
			var hash = window.location.hash;
			if (hash.length > 0) {
				pluginInstance.scrollToSection(hash, function() {
					pluginInstance.updateNavState(sections, $navItems);
				});
			}
			*/
		},

		setEventHandlers: function($navItems) {
			var pluginInstance = this;

			pluginInstance.pageIsScrollingByScript = false;

			//close button
			(function() {
				var $nav = pluginInstance.$element;
				var $btn = $nav.find('button');

				if ($btn.length === 0) {
					return;
				}

				var text = $btn.text();
				var altText = $btn.data('alt-text');

				$btn.on('click', function() {
					$nav.toggleClass('closed');

					if ($btn.text() === text) {
						$btn.text(altText);
					} else {
						$btn.text(text);
					}
				});
			})();

			$navItems.on('click', function(e) {
				if (!pluginInstance.options.updateAddressBar) {
					e.preventDefault();
				}

				pluginInstance.scrollToSection($(this).find('a').attr('href'));
				pluginInstance.updateNav($(this));
			});

			//we only care for scrolling by user so we ignore scroll events
			//fired since user clicked on a nav item
			$(window).on('scroll', function(e) {
				if (!pluginInstance.pageIsScrollingByScript) {
					pluginInstance.scrolled = true;
				}
			});
		},

		scrollToSection: function(selector, callback) {
			var pluginInstance = this;

			pluginInstance.pageIsScrollingByScript = true;

			$('html, body').stop().animate({
				scrollTop: $(selector).offset().top
			}, 1000, 'easeOutCubic', function(e) {
				//console.log('animation ended');
				pluginInstance.pageIsScrollingByScript = false;

				if (callback) {
					callback();
				}
			});
		},

		updateNavState: function(sections, $navItems) {
			var pluginInstance = this;
			var result = pluginInstance.getCurrentSection(sections);

			if (result.$section !== undefined) {
				var $navItem = $navItems.eq(result.index);
				pluginInstance.updateNav($navItem);
			}
		},

		updateNav: function($navItem) {
			$navItem.addClass('selected').siblings().removeClass('selected');
		},

		getCurrentSection: function(sections) {
			var pluginInstance = this;
			var sctop = $(window).scrollTop();
			var $currentSection;
			var sectionFound = false;
			var windowHeight = $(window).height();
			var $lastSection = sections[sections.length - 1];
			var lastSectionBottom = $lastSection.offset().top + $lastSection.height();
			var $firstSection = sections[0];
			var index;

			$.each(sections, function(key, value) {
				var $section = value;
				var top = $section.offset().top;
				var bottom = $section.offset().top + $section.height();

				//if a section's top is above center of viewport and it's bottom below it we consider it the current section
				if ( bottom > sctop + windowHeight/2  && top < sctop + windowHeight/2) {
					sectionFound = true;
					$currentSection = $section;
					index = key;
					return false;
				}
			});

			//if no section is found and we are above first section
			if (!sectionFound && $firstSection.offset().top > sctop &&
			$firstSection.offset().top < sctop + windowHeight/2) {
				$currentSection = $firstSection;
				index = 0;
			}

			///if no section is found and we have scrolled below last section
			if (!sectionFound && lastSectionBottom < sctop + windowHeight/2) {
				$currentSection = $lastSection;
				index = sections.length - 1;
			}

			return {
				'$section': $currentSection,
				'index': index
			}
		}
	};

	// build
	$.extend(Plugin.prototype, methods);

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);
