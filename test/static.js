var fs = require('fs');


describe('The assets copied from the src/static directory...', function() {

    it('Should include a favicon file', function(done) {
        fs.stat('build/favicon.ico', function(err) {
            if ( err) throw err;
            done();
        });
    });

    it('Should include a robots.txt file', function(done) {
        fs.stat('build/robots.txt', function(err) {
            if (err) throw err;
            done();
        });
    });

});