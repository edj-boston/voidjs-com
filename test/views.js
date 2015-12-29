var jsdom  = require('jsdom').jsdom,
    fs     = require('fs'),
    moment = require('moment'),
    zlib   = require('zlib');


// Helper to instantiate JSDom
function loadDocument(data) {
    return jsdom(data.toString(), {
        url : 'http://localhost:3000/'
    }).defaultView.document;
}


describe('The dynamically generated HTML index file...', function() {

    var handle = 'build/index.html';
    var buf, document;

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
            document = loadDocument(data);
            done();
        });
    });

    it('Should contain a <title> element', function() {
        document.getElementsByTagName('title')[0].innerHTML
            .should.equal('VoidJS');
    });

    it('Should contain two <h1> elements', function() {
        document.getElementsByTagName('h1').length
            .should.equal(2);
    });

    it('Should contain copyright text with the current year', function() {
        document.getElementById('copyright').innerHTML
            .should.containEql(moment().format('YYYY'));
    });

});