'use strict';

const fs = require('fs');


describe('The dynamically concatenated and minified CSS...', () => {

    let str;

    it('Should exist', done => {
        fs.readFile('build/css/all.min.css', (err, data) => {
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
