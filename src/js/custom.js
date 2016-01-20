/*!
 * Custom JavaScript
 */

$(document).ready(() => {
    // Open external links in new window
    $('a.external').click(() => {
        const url = $(this).attr('href');
        window.open(url, 'new');
        return false;
    });

    // Build left nav
    $('h2').each((i, el) => {
        const nav = $('#left-nav');
        const li = $('<li>');
        const id = $(el).attr('id');
        const a = $('<a/>')
            .html($(el).text())
            .attr('href', `#${id}`);

        $(li).append(a);
        $(nav).append(li);
    });
});
