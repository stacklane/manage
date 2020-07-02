/**
 * Separate JS file to assist with 'defer' loading which requires a 'src'
 */
(function() {
    'use strict';
    if (typeof App === "undefined") alert('Initialization Error: Missing class App');
    const app = document.documentElement.querySelector('manage-app');
    if (!(app instanceof App)) alert('Initialization Error: manage-app != App');
    app.ready();
})();