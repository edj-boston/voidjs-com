// External dependencies
var assert = require('assert'),
    should = require('should'),
    fs     = require('fs');


// Test to see if dynamically created CSS is well-formed
describe('The dynamically concatenated and minified CSS...', function() {

    it('Should exist', function() {
        if( !fs.existsSync('build/css/all.min.css') ) {
            throw Error('/css/all.min.css does not exist');
        }
    });

});