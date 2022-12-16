const log4js = require('log4js');

const assert = require('@fadedlamp42/common-js/lang/assert'),
	Disposable = require('@fadedlamp42/common-js/lang/Disposable');

module.exports = (() => {
	'use strict';

	const logger = log4js.getLogger('common-node/messaging/publishers/Publisher');

	/**
	 * A {@link Bus} component that processes publish-subscribe
	 * semantics, where the exact implementation is up to the
	 * inheritor.
	 *
	 * @public
	 * @extends {Disposable}
	 * @abstract
	 * @param {RegExp[]=} suppressExpressions
	 */
	class Publisher extends Disposable {
		constructor(suppressExpressions) {
			super();

			if (suppressExpressions) {
				assert.argumentIsArray(suppressExpressions, 'suppressExpressions', RegExp, 'RegExp');
			}

			this._suppressExpressions = suppressExpressions || [ ];
			
			this._startPromise = null;
			this._started = false;
		}

		start() {
			if (this.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			if (this._startPromise === null) {
				this._startPromise = Promise.resolve()
					.then(() => {
						return this._start();
					}).then(() => {
						this._started = true;

						return this._started;
					});
			}

			return this._startPromise;
		}

		_start() {
			return;
		}

		publish(messageType, payload) {
			assert.argumentIsRequired(messageType, 'messageType', String);

			if (!this._started) {
				throw new Error('The publisher has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			let publishPromise;

			if (checkSuppression(messageType, this._suppressExpressions)) {
				logger.trace('Suppressing publish for [', messageType, ']');

				publishPromise = Promise.resolve(Disposable.getEmpty());
			} else {
				publishPromise = Promise.resolve()
					.then(() => {
						return this._publish(messageType, payload);
					});
			}

			return publishPromise;
		}

		_publish(messageType, payload) {
			return;
		}

		subscribe(messageType, handler) {
			assert.argumentIsRequired(messageType, 'messageType', String);
			assert.argumentIsRequired(handler, 'handler', Function);

			if (!this._started) {
				throw new Error('The publisher has not started.');
			}

			if (this.getIsDisposed()) {
				throw new Error('The message publisher has been disposed');
			}

			let subscribePromise;

			if (checkSuppression(messageType, this._suppressExpressions)) {
				logger.debug('Suppressing subscription to [', messageType, ']');

				subscribePromise = Promise.resolve(Disposable.getEmpty());
			} else {
				subscribePromise = Promise.resolve()
					.then(() => {
						return this._subscribe(messageType, handler);
					});
			}

			return subscribePromise;
		}

		_subscribe(messageType, handler) {
			return Disposable.getEmpty();
		}

		_onDispose() {
			return;
		}

		toString() {
			return '[Publisher]';
		}
	}

	function checkSuppression(messageType, suppressExpressions) {
		return suppressExpressions.length !== 0 && suppressExpressions.some((suppressExpression) => {
			return suppressExpression.test(messageType);
		});
	}

	return Publisher;
})();
