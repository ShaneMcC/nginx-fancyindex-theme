var content = $('body > div.container > div > div');
var table = $('table', content);
var hasHTML = false;

// Allow HEADER.html and FOOTER.html files to work to replace us entirely.
// This is fairly horrible code, and disabled by default.
function replaceHTML() {
	var hasHeader = false;
	var headerData = undefined;
	var footerData = undefined;
	$('a[href="HEADER.html" i],a[href="FOOTER.html" i]').each(function(i, el) {
		hasHTML = true;

		var filename = $(el).attr('href');
		$.get(filename, function(data) {
			if (filename.toLowerCase() == 'header.html') {
				headerData = data;
			} else if (filename.toLowerCase() == 'footer.html') {
				footerData = data;
			}

			if (headerData != undefined && footerData != undefined) {
				document.open();
				document.write(headerData);
				document.write(table.wrap('<div>').parent().html());
				document.write(footerData);
				document.close();
			}
		});
	});
}

// Allow readme files to be displayed.
function showReadme() {
	$('a[href="README.md" i],a[href="README" i],a[href="README.txt" i]').each(function(i, el) {
		var filename = $(el).attr('href');

		$.get(filename, function(data) {
			var e = $('<div id="README"></div>');
			e.append('<hr>');

			if (filename.toLowerCase() == 'readme.md') {
				var converter = new showdown.Converter();
				converter.setFlavor('github');
				var div = $('<div>');
				div.html(converter.makeHtml(data));
				e.append(div);
			} else {
				var pre = $('<pre>');
				pre.text(data);
				e.append(pre);
			}

			content.append(e);
		});

		return false;
	});
}

// Nicer Breadcrumb.
function replaceBreadcrumbs() {
	var breadcrumb = content[0].childNodes[1];

	var breadcrumbHTML = '<nav aria-label="breadcrumb"><ol class="breadcrumb" id="breadcrumb">';

	var bits = breadcrumb.textContent.trim().replace(/\/$/, '').split('/');
	var path = '';
	bits.forEach(function(item, idx) {
		path += item + '/';

		if (idx == 0) { item = 'home'; }

		if (idx == bits.length -1) {
			breadcrumbHTML += '<li class="breadcrumb-item active" aria-current="page">' + item + '</li>';
		} else {
			breadcrumbHTML += '<li class="breadcrumb-item"><a href="' + path + '">' + item + '</a></li>';
		}
	});

	breadcrumbHTML += '</ol></nav>';

	content[0].replaceChild($(breadcrumbHTML)[0], breadcrumb);
}

// Fix up the table to include icons and look a bit nicer.
function fixTable() {
	var table = $('#list');

	// Make table pretty
	table.removeAttr("cellpadding");
	table.removeAttr("cellspacing");
	table.addClass(['table', 'table-sm', 'table-hover', 'text-nowrap', 'table-striped', 'table-borderless']);

	// Fix header
	header = $('tr', table)[0];
	header.remove();
	thead = $('<thead>');
	thead.addClass(['thead-dark']);
	thead.append(header);
	table.prepend(thead);
	$(header).prepend($('<th class="col-auto"></th>'));
	$('th:gt(1)', header).addClass(['col-auto', 'd-none', 'd-md-table-cell']);

	// Remove "Parent Directory"
	$('a[href^="../"]', table).closest('tr').remove();

	// Per-Row changes.
	$('tbody tr', table).each(function() {
		// Add Icon Column
		var icon = $('<td></td>');
		icon.addClass(['col-auto']);
		var filename = $('td:first a', this).attr('href').replace(/\?.*$/, '');

		var iconName = '';

		if (filename.endsWith('/')) {
			iconName = 'fas fa-folder';
		} else {
			iconName = 'far fa-file-alt';
		}

		icon.append($('<i class="' + iconName + '" aria-hidden="true"></i>'));

		$(this).prepend(icon);

		// Hide other columns on mobile except icon and filename.
		$('td:gt(1)', this).addClass(['col-auto', 'd-none', 'd-md-table-cell']);
		$('td:eq(1)', this).addClass(['col']);
	});
}

// Do all of the above.
$(function() {
	try {
		// replaceHTML();

		if (!hasHTML) {
			replaceBreadcrumbs();
			fixTable();
			showReadme();
		}
	} finally {
		$('#mainContent').show();
	}
});
