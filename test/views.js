'use strict';

const argv = require('yargs').argv,
    fs     = require('fs'),
    jsdom  = require('jsdom').jsdom,
    moment = require('moment');


// Helper to instantiate JSDom
function loadDocument (data) {
    const port = argv.p || 3000;
    return jsdom(data.toString(), {
        url : `http://localhost:${port}/`
    }).defaultView.document;
}


describe('The dynamically generated HTML index file...', () => {
    let document;

    it('Should exist', done => {
        fs.readFile('build/index.html', (err, data) => {
            if (err) throw err;
            document = loadDocument(data);
            done();
        });
    });

    it('Should contain a <title> element', () => {
        document.getElementsByTagName('title')[0].innerHTML
            .should.equal('VoidJS');
    });

    it('Should contain two <h1> elements', () => {
        document.getElementsByTagName('h1').length
            .should.equal(2);
    });

    it('Should contain copyright text with the current year', () => {
        document.getElementById('copyright').innerHTML
            .should.containEql(moment().format('YYYY'));
    });
});
