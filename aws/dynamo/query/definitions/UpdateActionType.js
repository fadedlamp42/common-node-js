const Enum = require('@fadedlamp42/common-js/lang/Enum');

const UpdateOperatorType = require('./UpdateOperatorType');

module.exports = (() => {
	'use strict';

	/**
	 * Defines update action types for UpdateItem operation.
	 *
	 * @public
	 * @extends {Enum}
	 * @param {String} code
	 * @param {String} description
	 * @param {String} keyword
	 * @param {Array<UpdateOperatorType>} allowedOperators
	 */
	class UpdateActionType extends Enum {
		constructor(code, description, keyword, allowedOperators) {
			super(code, description, keyword);

			this._keyword = keyword;
			this._operators = allowedOperators || [ ];
		}

		/**
		 * Keyword for action to be used in DyanmoDB query language.
		 *
		 * @public
		 * @returns {String}
		 */
		get keyword() {
			return this._keyword;
		}

		/**
		 * An array of supported operator types.
		 *
		 * @return {Array<UpdateOperatorType>}
		 */
		get operators() {
			return this._operators;
		}

		/**
		 * Add.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get ADD() {
			return add;
		}

		/**
		 * Delete.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get DELETE() {
			return del;
		}

		/**
		 * Set.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get SET() {
			return set;
		}

		/**
		 * Remove.
		 *
		 * @public
		 * @returns {UpdateActionType}
		 */
		static get REMOVE() {
			return remove;
		}

		toString() {
			return `[UpdateActionType (code=${this.code}, description=${this.description})]`;
		}
	}

	const add = new UpdateActionType('add', 'add', 'ADD', [ UpdateOperatorType.SPACE ]);
	const del = new UpdateActionType('delete', 'delete', 'DELETE', [ UpdateOperatorType.SPACE ]);
	const set = new UpdateActionType('set', 'set', 'SET', [ UpdateOperatorType.EQUALS, UpdateOperatorType.EQUALS_IF_NOT_EXISTS, UpdateOperatorType.MINUS, UpdateOperatorType.PLUS, UpdateOperatorType.LIST_APPEND ]);
	const remove = new UpdateActionType('remove', 'remove', 'REMOVE', [ UpdateOperatorType.EMPTY ]);

	return UpdateActionType;
})();
