const log4js = require('log4js'),
	process = require('process');

const assert = require('@barchart/common-js/lang/assert'),
	FailureReason = require('@barchart/common-js/api/failures/FailureReason'),
	FailureType = require('@barchart/common-js/api/failures/FailureType');

const LambdaEventParser = require('./LambdaEventParser'),
	LambdaResponder = require('./LambdaResponder');

module.exports = (() => {
	'use strict';

	/**
	 * Static helper utilities for a Lambda function.
	 *
	 * @public
	 */
	class LambdaHelper {
		constructor() {

		}

		/**
		 * Configures and returns a log4js logger.
		 *
		 * @public
		 * @returns {Object}
		 */
		static getLogger(configuration) {
			if (logger === null) {
				log4js.configure(configuration);

				logger = log4js.getLogger();
			}

			return logger;
		}

		/**
		 * Builds and returns a new {@link LambdaEventParser}.
		 *
		 * @public
		 * @param {Object} event
		 * @returns {LambdaEventParser}
		 */
		static getEventParser(event) {
			return new LambdaEventParser(event);
		}

		/**
		 * Builds and returns a new {@link LambdaResponder}.
		 *
		 * @public
		 * @param {Function} callback
		 * @returns {LambdaEventParser}
		 */
		static getResponder(callback) {
			return new LambdaResponder(callback);
		}

		/**
		 * Starts a promise chain for the Lambda function, invoking the processor,
		 * responding with the processor's result, and, if necessary, responding with
		 * any uncaught exceptions.
		 *
		 * @public
		 * @param {String} description - Human-readable description of the operation.
		 * @param {Object} event - The Lambda's event data.
		 * @param {Function} callback - The Lambda's callback function.
		 * @param {LambdaHelper~processor} processor - The processor that is invoked to perform the work.
		 * @returns {Promise.<TResult>}
		 */
		static process(description, event, callback, processor) {
			let parser;
			let responder;

			return Promise.resolve()
				.then(() => {
					parser = LambdaHelper.getEventParser(event);
					responder = LambdaHelper.getResponder(callback);

					assert.argumentIsRequired(description, 'description', String);
					assert.argumentIsRequired(processor, 'processor', Function);

					if (parser.plainText) {
						responder.setPlainText();
					}

					return Promise.resolve(processor(parser, responder));
				}).then((response) => {
					responder.send(response);
				}).catch((e) => {
					let failure;

					if (e instanceof FailureReason) {
						failure = e;
					} else {
						failure = FailureReason.forRequest({ endpoint: { description: description }})
							.addItem(FailureType.REQUEST_GENERAL_FAILURE);
					}

					if (responder) {
						responder.sendError(failure);
					}
				});
		}
		
		toString() {
			return 'LambdaHelper';
		}
	}

	let logger = null;

	/**
	 * A callback used to execute the Lambda operation's work.
	 *
	 * @public
	 * @callback LambdaHelper~processor
	 * @param {LambdaEventParser} parser
	 * @param {LambdaResponder} responder
	 */

	return LambdaHelper;
})();