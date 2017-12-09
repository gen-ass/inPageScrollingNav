/*
 * @name          inPageScrollingNav
 * @version       1.4.0
 * @lastmodified  09.12.2017
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
			var self = this;
			var $navItems = self.$element.children();

			self.scrolled = false;
			self.pageIsScrollingByScript = false;
			self.sections = self.getSections($navItems);
			self.setEventHandlers($navItems);

			setInterval(function() {
				if (self.scrolled) {
					//console.log('scrolled');
					self.scrolled = false;
					self.updateNavState(self.sections, $navItems);
				}
			}, 250);

			//if URL has a hash tag corresponding to a section scroll to that
			//section and update nav state. This is useful when sections dont'
			//have id on page load and their id is added via js later or when we
			//we have a fixed header on top of viewport masking sections
			var hash = window.location.hash;
			var callback = function() {
				self.updateNavState(self.sections, $navItems);
			};

			if (hash.length > 0 && $(hash).length > 0) {
				// use setTimeout so scrollToSection runs after browser's native jumping to hash tag of URL
				setTimeout(function() {
					self.scrollToSection(hash, callback);
				}, 0);
			}
		},

		getSections: function($navItems) {
			var self = this;
			var arr = [];

			$navItems.find('a').each(function() {
				var selector = $(this).attr('href');
				var $section = $(selector);

				if ($section.length) {
					arr.push($section);
				}
			});

			return arr;
		},

		setEventHandlers: function($navItems) {
			var self = this;

			$navItems.on('click', function(e) {
				if (!self.options.updateURLHash) {
					e.preventDefault();
				}

				var sectionId = $(this).find('a').attr('href').split('#')[1];
				var $section = $('#' + sectionId);

				self.scrollToSection($(this).find('a').attr('href'));
				self.updateNav($(this));
			});

			//we only care for scrolling by user so we ignore scroll events
			//fired since user clicked on a nav item
			$(window).on('scroll', function(e) {
				if (!self.pageIsScrollingByScript) {
					self.scrolled = true;
				}
			});
		},

		scrollToSection: function(selector, callback) {
			var self = this;
			var offset = 0;
			var easing = self.options.easing || 'linear';

			if (self.options.offset) {
				if (typeof self.options.offset === 'function') {
					offset = self.options.offset();
				} else {
					offset = self.options.offset;
				}
			}

			self.pageIsScrollingByScript = true;

			$('html, body').stop().animate({
				scrollTop: $(selector).offset().top - offset
			}, 1000, easing).promise().done(function() {
				self.pageIsScrollingByScript = false;
				if (callback) {
					callback();
				}
			});
		},

		updateNavState: function(sections, $navItems) {
			var self = this;
			var result = self.getCurrentSection(sections);

			if (result.$section !== undefined) {
				var $navItem = $navItems.eq(result.index);
				self.updateNav($navItem);
			}
		},

		updateNav: function($navItem) {
			$navItem.addClass('selected').siblings().removeClass('selected');
		},

		getCurrentSection: function(sections) {
			var self = this;
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
