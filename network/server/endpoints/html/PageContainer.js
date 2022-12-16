const assert = require('@fadedlamp42/common-js/lang/assert');

const Container = require('./../Container'),
	PageEndpoint = require('./PageEndpoint');

module.exports = (() => {
	'use strict';

	class PageContainer extends Container {
		constructor(port, path, secure, useSession, secureRedirect) {
			super(port, path, secure);

			assert.argumentIsOptional(useSession, 'useSession', Boolean);
			assert.argumentIsOptional(secureRedirect, 'secureRedirect', Boolean);

			this._useSession = useSession || false;
			this._secureRedirect = secureRedirect || false;
		}

		_getEndpointType() {
			return PageEndpoint;
		}

		getUsesSession() {
			return this._useSession;
		}

		getSecureRedirect() {
			return this._secureRedirect;
		}

		toString() {
			return '[PageContainer]';
		}
	}

	return PageContainer;
})();