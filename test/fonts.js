var fs = require('fs');


describe('The build/fonts directory...', function() {

    var files = [];

    before(function(done) {
        fs.readdir('build/fonts/', function(err, arr) {
            if (err) throw err;
            files = arr;
            done();
        });
    });

    it('Should include the right font files', function() {
        files.should.containEql('fontawesome-webfont.eot');
        files.should.containEql('fontawesome-webfont.svg');
        files.should.containEql('fontawesome-webfont.ttf');
        files.should.containEql('fontawesome-webfont.woff');
    });

    it('Should include Gotham font files', function() {
        files.should.containEql('Gotham-Light.eot');
        files.should.containEql('Gotham-Light.svg');
        files.should.containEql('Gotham-Light.ttf');
        files.should.containEql('Gotham-Light.woff');
    });

    it('Should include Open-Sans font files', function() {
        files.should.containEql('Open-Sans.eot');
        files.should.containEql('Open-Sans.svg');
        files.should.containEql('Open-Sans.ttf');
        files.should.containEql('Open-Sans.woff');
    });

    it('Should include SourceCodePro font files', function() {
        files.should.containEql('SourceCodePro.eot');
        files.should.containEql('SourceCodePro.svg');
        files.should.containEql('SourceCodePro.ttf');
        files.should.containEql('SourceCodePro.woff');
    });

});