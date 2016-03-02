'use strict';

module.exports = exports = nify;

function nify(fn, options) {
	if (typeof fn !== 'function') {
		throw new Error('An input function was expected');
	}

	options = Object(options);
	var spread = Boolean(options.spread);
	var strict = Boolean(options.strict);
	var sync = Boolean(options.sync);

	return function nodeified() {
		var args = Array.prototype.slice.call(arguments);
		var callback = args.pop();

		if (typeof callback !== 'function') {
			if (strict) {
				throw new Error('A callback was expected as a last argument');
			} else {
				// Fallback to the promise mode
				return fn.apply(this, arguments);
			}
		}

		var result;
		try {
			result = fn.apply(this, args);
		} catch (error) {
			// Catch synchronous errors
			handleSync(onRejected, error);
			return;
		}

		var then = checkThenable(result);
		if (then) {
			then.call(result, onFullfilled, onRejected);
		} else {
			// Handle non-promise values
			handleSync(onFullfilled, result);
		}

		function handleSync(handler, arg) {
			if (sync) {
				handler(arg);
			} else {
				process.nextTick(function onNextTick() {
					handler(arg);
				});
			}
		}

		function onFullfilled(value) {
			if (spread && Array.isArray(value)) {
				callback.apply(null, [null].concat(value));
			} else {
				callback(null, value);
			}
		}

		function onRejected(reason) {
			if (reason) {
				callback(reason);
			} else {
				var wrapper = new Error(String(reason));
				wrapper.cause = reason;
				callback(wrapper);
			}
		}
	};
}

function checkThenable(value) {
	var type = typeof value;
	if ((type !== 'object') && (type !== 'function')) {
		return null;
	}

	var then = value.then;
	return (typeof then === 'function') ? then : null;
}
