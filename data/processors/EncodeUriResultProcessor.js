const log4js = require('log4js');

const attributes = require('@fadedlamp42/common-js/lang/attributes'),
	is = require('@fadedlamp42/common-js/lang/is');

const MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/EncodeUriResultProcessor');

	class EncodeUriResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			const propertyName = configurationToUse.propertyName;
			const propertyValue = attributes.read(resultItemToProcess, propertyName);

			if (is.string(propertyValue)) {
				attributes.write(resultItemToProcess, propertyName, encodeURIComponent(propertyValue));
			}
		}

		toString() {
			return '[EncodeUriResultProcessor]';
		}
	}

	return EncodeUriResultProcessor;
})();