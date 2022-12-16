const log4js = require('log4js');

const attributes = require('@fadedlamp42/common-js/lang/attributes'),
	is = require('@fadedlamp42/common-js/lang/is');

const MutateResultProcessor = require('./MutateResultProcessor');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('data/processors/DeleteResultProcessor');

	class DeleteResultProcessor extends MutateResultProcessor {
		constructor(configuration) {
			super(configuration);
		}

		_processItem(resultItemToProcess, configurationToUse) {
			if (!(is.string(configurationToUse) || is.string(configurationToUse.propertyName))) {
				return;
			}

			attributes.erase(resultItemToProcess, configurationToUse.propertyName || configurationToUse);
		}

		toString() {
			return '[DeleteResultProcessor]';
		}
	}

	return DeleteResultProcessor;
})();