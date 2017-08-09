const array = require('common/lang/array'),
	assert = require('common/lang/assert'),
	is = require('common/lang/is'),
	object = require('common/lang/object');

const Action = require('./Action'),
	Filter = require('./Filter'),
	Table = require('./../../schema/definitions/Table');

module.exports = (() => {
	'use strict';

	/**
	 * An set of instructions for conditional updates, inserts, or
	 * deletes.
	 *
	 * @public
	 * @param {Table} table
	 * @param {Filter} filter
	 * @param {String=} description
	 * @param {Object=} item
	 */
	class Conditional extends Action {
		constructor(table, filter, description) {
			super(table, null, (description || '[Unnamed Conditional]'));

			this._filter = filter;
		}

		/**
		 * The conditional {@link Filter} (i.e. the collection of conditional
		 * {@link Expression} instances).
		 *
		 * @public
		 * @returns {Filter}
		 */
		get filter() {
			return this._filter;
		}

		/**
		 * Throws an {@link Error} if the instance is invalid.
		 *
		 * @public
		 */
		validate() {
			if (!(this.table instanceof Table)) {
				throw new Error('Table data type is invalid.');
			}

			if (!(this._filter instanceof Filter)) {
				throw new Error('Filter data type is invalid.');
			}

			this._filter.validate();
		}

		/**
		 * Outputs an object suitable for running a "conditional" operation
		 * using the DynamoDB SDK. Please note, the object may be incomplete
		 * (e.g. an "Item" property is needed to call the AWS "putItem" function).
		 *
		 * @returns {Object}
		 */
		toConditionalSchema() {
			this.validate();

			const schema = {
				TableName: this.table.name
			};

			const expressionData = Action.getExpressionData(this._filter);

			schema.ConditionExpression = expressionData.components.join(' and ');

			if (object.keys(expressionData.aliases).length !== 0) {
				schema.ExpressionAttributeValues = expressionData.aliases;
			}

			return schema;
		}

		toString() {
			return '[Conditional]';
		}
	}

	return Conditional;
})();