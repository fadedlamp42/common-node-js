const log4js = require('log4js'),
	Stream = require('stream');

const assert = require('common/lang/assert'),
	is = require('common/lang/is');

const DataType = require('./../schema/definitions/DataType'),
	Serializer = require('./../schema/serialization/Serializer'),
	Table = require('./../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/aws/dynamo/stream/DynamoStreamValidator');

	/**
	 * A Node.js stream transform which checks to see if an
	 * object can be converted to a form suitable for saving
	 * to a DynamoDB table.
	 *
	 * @public
	 */
	class DynamoStreamValidator extends Stream.Transform {
		/**
		 * @public
		 * @param {Table} table - The desired schema.
		 * @param {Object} map - A map of property names to {@link Attribute} names (attributes not included in the map will be ignored).
		 * @param {Boolean=} silent - If true, errors will be suppressed, instead warnings will be written to the logs.
		 */
		constructor(table, map, silent) {
			super({ objectMode: true });

			assert.argumentIsRequired(table, 'table', Table, 'Table');
			assert.argumentIsRequired(map, 'map', Object);
			assert.argumentIsOptional(silent, 'silent', Boolean);

			this._table = table;

			const attributes = this._table.attributes;

			this._transforms = Object.keys(map).map((incoming) => {
				const outgoing = map[incoming];

				return {
					incoming: incoming,
					attribute: attributes.find(a => a.name === outgoing)
				};
			});

			const ensureKeys = (keys, source) => {
				keys.forEach((k) => {
					if (!this._transforms.some(t => t.attribute.name == k.attribute.name)) {
						throw new Error(`Unable to construct validator, the "map" is missing a ${source} Key property [ ${k.attribute.name} ]`);
					}
				});
			};

			ensureKeys(this._table.keys, 'table');

			this._table.indicies.forEach((i) => {
				ensureKeys(i.keys, `[ ${i.name} ] index`);
			});

			this._silent = is.boolean(silent) && silent;

			this._counter = 0;
			this._failures = 0;
		}

		/**
		 * The number of validation failures processed.
		 *
		 * @returns {number}
		 */
		get failureCount() {
			return this._failures;
		}

		_transform(chunk, encoding, callback) {
			this._counter = this._counter + 1;

			let message = null;

			if (is.object(chunk)) {
				this._transforms.every((transform) => {
					const incoming = transform.incoming;

					if (chunk.hasOwnProperty(incoming)) {
						try {
							if (!Serializer.canCoerce(chunk[incoming], transform.attribute.dataType)) {
								message = `Validation [ ${this._counter} ] for [ ${this._table.name} ] failed unable to coerce [ ${incoming} ] property.`;
							}
						} catch(e) {
							logger.error(e);

							message = `Validation [ ${this._counter} ] for [ ${this._table.name} ] failed, unexpected error thrown.`;
						}
					} else {
						message = `Validation [ ${this._counter} ] for [ ${this._table.name} ] failed, expected property missing.`;
					}

					return message === null;
				}, { });
			} else {
				message = `Validation [ ${this._counter} ] for [ ${this._table.name} ] failed, unexpected input type.`;
			}

			if (message === null) {
				callback(null, chunk);
			} else {
				this._failures = this._failures + 1;

				if (this._silent) {
					logger.warn(message);

					if (logger.isTraceEnabled() && chunk) {
						logger.trace(chunk);
					}

					message = null;
				}

				let error;

				if (message === null) {
					error = null;
				} else {
					error = new Error(message);
				}

				callback(error, null);
			}
		}

		toString() {
			return '[DynamoStreamValidator]';
		}
	}

	return DynamoStreamValidator;
})();