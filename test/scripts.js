'use strict';

var fs = require('fs');


describe('The dynamically concatenated and minified JS...', () => {

    var handle = 'build/js/all.min.js';
    var str;

    it('Should exist', (done) => {
        fs.readFile(handle, (err, data) => {
            if (err) throw err;
            str = data.toString();
            done();
        });
    });

    it('Should contain jQuery', () => {
        str.should.containEql('jQuery');
    });

    it('Should contain Bootstrap', () => {
        str.should.containEql('Bootstrap');
    });

    it('Should contain custom JavaScript', () => {
        str.should.containEql('Custom JavaScript');
    });

    it('Should contain Google Analytics', () => {
        str.should.containEql('Google Analytics');
    });

});