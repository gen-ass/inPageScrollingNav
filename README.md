# inPageScrollingNav
A navigation for scrolling to sections on a page. The navigation state gets updated during scrolling by user and there is an optional button to allow opening and closing of the navigation menu. There is also an option for updating browser address bar with proper hash tag corresponding to current selected navigation item.

Demo: https://smohadjer.github.io/inPageScrollingNav/demo.html

options:

updateAddressBar: true | false
updateAddressBar by default is false, if set to true, nav link's hash tag will be added to browser's address bar whenever a nav item is clicked.

offset: value | function(){}
offset can be a fixed value or a function that returns a value. It allows scrolling not to a top of viewport and is useful in cases when a page has a position fixed header on top.
