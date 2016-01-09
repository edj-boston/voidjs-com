var fs   = require('fs'),
    zlib = require('zlib');


describe('The dynamically concatenated and minified CSS...', () => {

    var handle = 'build/css/all.min.css';
    var buf = null;
    var str = '';

    it('Should exist', (done) => {
        fs.readFile(handle, (err, data) => {
            if (err) throw err;
            buf = data;
            done();
        });
    });

    it('Should be gzipped', (done) => {
        zlib.gunzip(buf, (err, data) => {
            if (err) throw err;
            str = data;
            done();
        });
    });

    it('Should contain Bootstrap styles', () => {
        str.indexOf('Bootstrap').should.not.equal(-1);
    });

    it('Should contain custom styles', () => {
        str.indexOf('Custom Styles').should.not.equal(-1);
    });

    it('Should contain custom fonts', () => {
        str.indexOf('Custom Fonts').should.not.equal(-1);
    });

    it('Should contain Font Awesome styles', () => {
        str.indexOf('Font Awesome').should.not.equal(-1);
    });

});