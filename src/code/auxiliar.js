// Auxiliar functions, these functions must not call other functions outside Wasabee
Wasabee.aux = {};

Wasabee.aux.isNonEmptyString = function(o) {
	return typeof o == 'string' && o.trim().length > 0;
};


