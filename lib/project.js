const objectpath = require('object-path');

module.exports = (item, filter) => {
	if (Object.keys(filter).length > 0) {
		var result = {};
		Object.keys(filter).map(key => {
			result[key] = objectpath.get(item, key);
		});
		return result;
	} else {
		return item;
	};
};