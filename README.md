# nify

> Nodeify a promise-returning function

Transform a promise-returning function into another function, that accepts a node-style callback as its last argument.

This is useful in at least three situations:

1. You want to switch your asynchronous code to promises, while still exposing a legacy node-style API.

2. You are using node-style callbacks for you asynchronous code, and want to use a promise-oriented API.

3. You are using promises for your asynchronous code, and want to deal with an API that provides a node-style callback to be called (such as [Mongoose middlewares](http://mongoosejs.com/docs/middleware.html)).

Similar features are supported out of the box by some promise libraries, such as [`Bluebird#asCallback`](http://bluebirdjs.com/docs/api/ascallback.html) or [`Q#nodeify`](https://github.com/kriskowal/q/wiki/API-Reference#promisenodeifycallback). Instead, this module is intended to work with any [Promises/A+](https://promisesaplus.com/) implementation, including native ES2015 promises.

See also [`pify`](https://github.com/sindresorhus/pify) for the reverse transformation, also called *promisification*.

## Installation

```shell
npm install --save nify
```

## Usage

*Let's assume that `findUser` is a promise-returning function.*

```javascript
// Node-style callback with nify
nify(findUser)(id, function (error, user) {
    if (error) {
        console.error('Error: ' + error);
    } else {
        console.log('User: ' + user.email);
    }
});

// Promise equivalent
findUser(id).then(
    function (user) {
        console.log('User: ' + user.email);
    },
    function (error) {
        console.error('Error: ' + error);
    }
);
```

## API

### nify(input, [options])

Returns a *nodeified* version of the given `input` function.

### nify.defaults([options])

Returns a wrapper of `nify`, with the given `options` set as defaults.

Example with [Mongoose middlewares](http://mongoosejs.com/docs/middleware.html), assuming that `myPreSaveHook` and `myPostSaveHook` are promise-returning functions:

```javascript
var hookify = nify.defaults({
    arity: 1,
    async: false,
    void: true
});

mySchema.pre('save', hookify(myPreSaveHook));
mySchema.post('save', hookify(myPostSaveHook, {arity: 2}));
```

### Options

#### arity

Type: integer  
Default: `0`

Define the arity of the output function ([`Function.length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length)). By default, this is guessed from the input function: original arity + 1 for the callback.

When this option is set, the received argument list is also tuncated to match the specified arity.

#### index

Type: integer  
Default: `-1`

Define the position at which the callback argument is expected. Negative indices are relative to the end of the arguments list (which my be altered by the `arity` option).

#### fallback

Type: boolean  
Default: `false`

Allow the output function to silently fall back on the promise mode when no callback is given. The default behavior is to throw an error.

#### async

Type: boolean  
Default: `true`

Force the callback to be called asynchronously, even if the input function returns a non-promise value or throws a synchronous error.

#### error

Type: boolean  
Default: `true`

Force all rejection reasons to be instances of `Error`. When this option is set, any non-`Error` rejection reason is wrapped in an `Error` instance. The original value is attached to the wrapper through the `.cause` property.

Regardless of this option, any *falsy* rejection reason is wrapped like above.

#### void

Type: boolean  
Default: `false`

In case of success, ignore the resulting value and call the callback without any argument.

#### spread

Type: boolean  
Default: `false`

If the resulting value is an array, use its items as multiple arguments for the callback.

## License

[MIT](https://github.com/connesc/nify/blob/master/LICENSE)
