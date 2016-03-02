# nify

> Nodeify a promise-returning function

Transform a promise-returning function into another function, that accepts a node-style callback as its last argument.

This is useful in at least three situations:

1. You want to switch your asynchronous code to promises, while still exposing a legacy node-style API.

2. You are using node-style callbacks for you asynchronous code, and want to use a promise-oriented API.

3. You are using promises for your asynchronous code, and want to deal with an API that provides a node-style callback to be called (such as [Mongoose middlewares](http://mongoosejs.com/docs/middleware.html)).

Similar features are supported out of the box by some promise libraries, such as [`Bluebird#asCallback`](http://bluebirdjs.com/docs/api/ascallback.html) or [`Q#nodeify`](https://github.com/kriskowal/q/wiki/API-Reference#promisenodeifycallback). Instead, this module is intended to work with any [Promises/A+](https://promisesaplus.com/) implementation, including native ES2015 promises.

See also [`pify`](https://github.com/sindresorhus/pify) for the reverse transform, also called *promisification*.

## Installation

```shell
npm install --save nify
```

## Usage

*Let's suppose that `findUser` is a promise-returning function.*

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

## License

[MIT](https://github.com/connesc/nify/blob/master/LICENSE)
