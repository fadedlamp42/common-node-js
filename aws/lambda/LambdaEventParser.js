const assert = require('@barchart/common-js/lang/assert'),
	attributes = require('@barchart/common-js/lang/attributes'),
	Enum = require('@barchart/common-js/lang/Enum'),
	is = require('@barchart/common-js/lang/is'),
	promise = require('@barchart/common-js/lang/promise');

const FailureReason = require('@barchart/common-js/api/failures/FailureReason'),
	FailureType = require('@barchart/common-js/api/failures/FailureType');

module.exports = (() => {
	'use strict';

	/**
	 * A wrapper around a Lambda function's event argument.
	 *
	 * @public
	 * @param {Object} event
	 */
	class LambdaEventParser {
		constructor(event) {
			assert.argumentIsRequired(event, 'event', Object);

			this._event = event;
		}

		/**
		 * Indicates if the consumer wants a plain text response, as evidenced
		 * by a "mode=text" querystring value.
		 *
		 * @public
		 * @returns {Boolean}
		 */
		get plainText() {
			return this.getQuerystring('mode') === 'text';
		}

		/**
		 * Reads the context data (from custom authorizer).
		 *
		 * @public
		 * @param {String} key
		 * @returns {*|undefined}
		 */
		getContext(key) {
			return read(this._event.requestContext.authorizer, key);
		}

		/**
		 * Retrieves a value from path parameters.
		 *
		 * @public
		 * @param {String} key
		 * @returns {String|undefined}
		 */
		getPath(key) {
			return read(this._event.pathParameters, key);
		}

		/**
		 * Retrieves a value from querystring parameters.
		 *
		 * @public
		 * @param {String} key
		 * @returns {String|undefined}
		 */
		getQuerystring(key) {
			return read(this._event.queryStringParameters, key);
		}

		/**
		 * Retrieves the body (or a property from the body).
		 *
		 * @public
		 * @param {String=} key
		 * @returns {*}
		 */
		getBody(key) {
			let payload;

			if (is.object(this._event.body)) {
				payload = this._event.body;
			} else {
				payload = this._event.body;
			}

			if (is.string(key)) {
				return read(payload, key);
			} else {
				return payload;
			}
		}

		/**
		 * Attempts to determine the correct schema based on the querystring.
		 *
		 * @public
		 * @param {Function} type
		 * @returns {Schema|null}
		 */
		getSchema(type) {
			assert.argumentIsValid(base, 'base', x => is.extension(Enum, base), 'is an enumeration');

			const code = this.getQuerystring('schema');

			let schema;

			if (code) {
				schema = Enum.fromCode(type, code);
			} else {
				schema = type.CLIENT;
			}

			return schema || null;
		}

		/**
		 * Attempts to serialize JSON string into the given schema
		 *
		 * @param {String} jsonString
		 * @param {Schema} schema
		 * @param {String} description
		 * @returns {String}
		 */
		parseSchema(jsonString, schema, description) {
			return promise.build((resolve, reject) => {
				let serialized;

				try {
					const reviver = schema.schema.getReviver();

					resolve(JSON.parse(jsonString, reviver));
				} catch (e) {
					const failure = FailureReason.forRequest({ endpoint: { description: (description || 'deserialize JSON string') } })
						.addItem(FailureType.SCHEMA_VALIDATION_FAILURE, { key: e.key, name: e.name });

					reject(failure);
				}
			});
		}
	}

	function read(object, key) {
		assert.argumentIsRequired(key, 'key', String);

		if (is.object(object)) {
			return attributes.read(object, key);
		} else {
			return null;
		}
	}

	return LambdaEventParser;
})();