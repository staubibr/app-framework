'use strict';

import Core from '../tools/core.js';
import Dom from '../tools/dom.js';

import Select from './select.js';

export default Core.Templatable("Basic.UI.List", class List extends Select {
	
	constructor(container, options) {
		super(container, options);
	}
	
	Template() {
		return '<select handle="root" multiple></select>';
	}
});