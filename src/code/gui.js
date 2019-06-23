Wasabee.gui = {
	exampleButton: {},
	exampleDialog: {},
};

Wasabee.gui.exampleButton.insert = function() {
	$('#toolbox').append(Wasabee.static.html.exampleButton);
};

Wasabee.gui.exampleDialog.open = function() {
	var dlg = dialog({
		html: Wasabee.static.html.exampleDialog,
		id: 'this-plugin-example-dialog',
		dialogClass: 'this-plugin-class',
		title: 'some title',
		width: 320,
		minHeight: 200,
	});
	this.dialog = dlg;
};



