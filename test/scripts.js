'use strict';

const fs = require('fs');


describe('The dynamically concatenated and minified JS...', () => {
    let str;

    it('Should exist', done => {
        fs.readFile('build/js/all.min.js', (err, data) => {
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
