'use strict';

var fs = require('fs');


describe('The assets copied from the src/static directory...', () => {

    it('Should include a favicon file', (done) => {
        fs.stat('build/favicon.ico', (err) => {
            if ( err) throw err;
            done();
        });
    });

    it('Should include a robots.txt file', (done) => {
        fs.stat('build/robots.txt', (err) => {
            if (err) throw err;
            done();
        });
    });

});