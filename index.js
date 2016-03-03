'use strict';

var defaults = require('lodash.defaults');

var baseOptions = {
	arity: 0,
	index: -1,
	fallback: false,
	async: true,
	error: true,
	'void': false,
	spread: false
};

module.exports = exports = withDefaults(baseOptions);

function withDefaults(defaultOptions) {

	function applyDefaults(options) {
		return defaults({}, options, defaultOptions);
	}

	function nify(fn, options) {
		if (typeof fn !== 'function') {
			throw new Error('An input function was expected');
		}

		return nodeify(fn, applyDefaults(options));
	}

	function mergeDefaults(options) {
		return withDefaults(applyDefaults(options));
	}

	nify.defaults = mergeDefaults;
	return nify;
}

function nodeify(fn, options) {
	var arity = toInteger(options.arity, baseOptions.arity);
	var index = toInteger(options.index, baseOptions.index);

	return wrapFunction(fn.name, (arity > 0) ? arity : fn.length + 1, nodeified);

	function nodeified() {
		var argsCount = (arity > 0) ? arity : arguments.length;
		var callbackIndex = (index >= 0) ? index : (argsCount + index);

		var args = Array.prototype.slice.call(arguments, 0, argsCount);

		var callback = (callbackIndex >= 0) && (callbackIndex < args.length)
			? args.splice(callbackIndex, 1)[0]
			: undefined;

		if (typeof callback !== 'function') {
			if (options.fallback) {
				// Fallback to the promise mode
				return fn.apply(this, arguments);
			} else {
				throw new Error('Argument ' + callbackIndex + ' was expected to be a callback');
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
			if (options.async) {
				process.nextTick(function onNextTick() {
					handler(arg);
				});
			} else {
				handler(arg);
			}
		}

		function onFullfilled(value) {
			if (options.void) {
				callback();
			} else if (options.spread && Array.isArray(value)) {
				callback.apply(null, [null].concat(value));
			} else {
				callback(null, value);
			}
		}

		function onRejected(reason) {
			if (!reason || (options.error && !(reason instanceof Error))) {
				var error = new Error(String(reason));
				error.cause = reason;
				callback(error);
			} else {
				callback(reason);
			}
		}
	}
}

function toInteger(value, defaultValue) {
	value = Number(value);
	return (value % 1 === 0) ? value : defaultValue;
}

function wrapFunction(name, arity, fn) { // eslint-disable-line no-unused-vars
	var args = new Array(arity);

	for (var index = 0; index < arity; index++) {
		args[index] = 'arg' + index;
	}

	var signature = 'function ' + (name || '') + '(' + args.join(', ') + ') ';
	var body = '{ return fn.apply(this, arguments); }';

	return eval('(' + signature + body + ')'); // eslint-disable-line no-eval
}

function checkThenable(value) {
	var type = typeof value;
	if ((type !== 'object') && (type !== 'function')) {
		return null;
	}

	var then = value.then;
	return (typeof then === 'function') ? then : null;
}
