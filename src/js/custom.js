$(document).ready(function() {

    // Open external links in new window
    $('a.external').click(function(e) {
        var url = $(this).attr('href');
        window.open(url, 'new');
        return false;
    });

    // Build left nav
    $('h2').each(function(i, el) {
        var nav = $('#left-nav');
        var li = $('<li>');
        var a = $('<a/>')
            .html($(el).text())
            .attr('href', '#' + ($(el).attr('id')));

        $(li).append(a);

        $(nav).append(li);
    });
});