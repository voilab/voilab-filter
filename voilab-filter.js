/*jslint node: true, unparam: true, nomen: true */
(function () {
    'use strict';

    var lodash = require('lodash'),
        prebuilt = {
            toInteger: function (value) {
                if (value) {
                    return parseInt(value, 10);
                }
                return value;
            },
            toNumber: function (value) {
                return Number(value);
            },
            toBoolean: function (value) {
                value = value + "";
                switch (value.toLowerCase().trim()) {
                    case "true":
                    case "yes":
                    case "1":
                        return true;
                    case "false":
                    case "no":
                    case "0":
                    case null:
                        return false;
                    default:
                        return Boolean(value);
                }
            }
        },
        filter = function (record, mapper) {
            if (lodash.isArray(record)) {
                return lodash.map(record, function (u) {
                    return filter(u, mapper);
                });
            }

            return lodash.mapValues(record, function (value, key) {

                // if mapper value is a function, just run it with value as only parameter
                if (lodash.isFunction(mapper[key])) {
                    return mapper[key](value);
                }

                // if mapper value is an Object, usually it's because 'value' is
                // also an object or an Array. Here we call recursively filter() function
                // on the value children.
                if (lodash.isObject(mapper[key])) {
                    if (lodash.isArray(value)) {
                        return lodash.map(value, function (child) {
                            return filter(child, mapper[key]);
                        });
                    }
                    if (lodash.isObject(value)) {
                        return filter(value, mapper[key]);
                    }

                    // if 'value' is not an array, neither an object, we cannot apply filter, but in an
                    // incredible will of doing something, we return the mapper value.
                    return mapper[key];
                }

                // if mapper value is a String:
                // 1. check in prebuilt functions
                // 2. check in lodash built-in functions
                // 3. nothing found, return the mapper value
                if (lodash.isString(mapper[key])) {
                    if (prebuilt[mapper[key]] !== undefined) {
                        return prebuilt[mapper[key]](value);
                    }
                    if (lodash.has(lodash, mapper[key])) {
                        return lodash[mapper[key]](value);
                    }

                    return mapper[key];
                }

                // otherwise, no mapping found, return value...
                return value;
            });
        };

    module.exports = filter;
}());