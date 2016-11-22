/*
 * @name          inPageScrollingNav
 * @version       1.0
 * @lastmodified  2016-11-22
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
				var $section = $(selector);

				if ($section.length) {
					sections.push($section);
				}
			});

			pluginInstance.scrolled = false;
			pluginInstance.setEventHandlers($navItems);

			setInterval(function() {
				if (pluginInstance.scrolled) {
					pluginInstance.scrolled = false;
					pluginInstance.setActiveSection(sections, $navItems);
				}
			}, 250);
		},

		setEventHandlers: function($navItems) {
			var pluginInstance = this;
			var pageIsScrollingByScript = false;


			$navItems.on('click', function(e) {

				if (!pluginInstance.options.updateAddressBar) {
					e.preventDefault();
				}

				var $link = $(this).find('a');
				var hash = $link.attr('href');

				pageIsScrollingByScript = true;

				$('html, body').stop().animate({
					scrollTop: $(hash).offset().top
				}, 1000, 'easeOutCubic', function(e) {
					//console.log('animation ended');
					pageIsScrollingByScript = false;
				});

				$(this).addClass('selected').siblings().removeClass('selected');
			});

			//we only care for scrolling by user so we ignore scroll events
			//fired since user clicked on a nav item
			$(window).on('scroll', function(e) {
				if (!pageIsScrollingByScript) {
					pluginInstance.scrolled = true;
				}
			});
		},

		setActiveSection: function(sections, $navItems) {
			var pluginInstance = this;
			var result = pluginInstance.getCurrentSection(sections);
			var $section = result.$section;
			var index = result.index;

			if ($section === undefined) {
				//console.log('no section found');
				return;
			}

			var $navItem = $navItems.eq(index);

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
			$firstSection.offset().top < sctop + windowHeight/2
		) {
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
