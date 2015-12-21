var fs   = require('fs'),
    zlib = require('zlib');


describe('The dynamically concatenated and minified CSS...', function() {

    var handle = 'build/css/all.min.css';
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
            str = data;
            done();
        });
    });

    it('Should contain Bootstrap styles', function() {
        str.indexOf('Bootstrap').should.not.equal(-1);
    });

    it('Should contain custom styles', function() {
        str.indexOf('Custom Styles').should.not.equal(-1);
    });

    it('Should contain custom fonts', function() {
        str.indexOf('Custom Fonts').should.not.equal(-1);
    });

    it('Should contain Font Awesome styles', function() {
        str.indexOf('Font Awesome').should.not.equal(-1);
    });

});