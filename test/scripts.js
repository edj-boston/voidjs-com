var should = require('should'),
    fs     = require('fs'),
    zlib   = require('zlib');


describe('The dynamically concatenated and minified JS...', function() {

    var handle = 'build/js/all.min.js';
    var buf = null;
    var str = '';

    it('Should exist', function(done) {
        fs.readFile(handle, function(err, data) {
            if (err) throw err;
            buf = data;
            done();
        });
    });

    it('Should be gzipped', function(done) {
        zlib.gunzip(buf, function(err, data) {
            if (err) throw err;
            str = data.toString();
            done();
        });
    });

    it('Should contain jQuery', function() {
        str.should.containEql('jQuery');
    });

    it('Should contain Bootstrap', function() {
        str.should.containEql('Bootstrap');
    });

    it('Should contain custom JavaScript', function() {
        str.should.containEql('Custom JavaScript');
    });

    it('Should contain Google Analytics', function() {
        str.should.containEql('Google Analytics');
    });

});