'use strict';

var fs = require('fs');


describe('The dynamically concatenated and minified CSS...', () => {

    var handle = 'build/css/all.min.css';
    var str;

    it('Should exist', (done) => {
        fs.readFile(handle, (err, data) => {
            if (err) throw err;
            str = data.toString();
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