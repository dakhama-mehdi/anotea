const _ = require('lodash');
const { Transform } = require('stream');

let transformObject = (callback, options = { ignoreFirstLine: false, ignoreEmpty: false }) => {
    let lines = 0;
    return new Transform({
        objectMode: true,
        transform: async function(data, encoding, next) {
            if ((options.ignoreEmpty && _.isEmpty(data)) ||
                (options.ignoreFirstLine && lines++ === 0)) {
                return next();
            }

            let res = await callback(data);
            this.push(res);
            next();
        }
    });
};
module.exports = {
    transformObject: transformObject,
    ignoreEmpty: () => transformObject(data => data, { ignoreEmpty: true }),
    ignoreFirstLine: () => transformObject(data => data, { ignoreFirstLine: true }),
    jsonStream: wrapper => {
        let chunksSent = 0;
        return new Transform({
            objectMode: true,
            transform: function(data, encoding, callback) {
                if (chunksSent === 0) {
                    if (wrapper.object) {
                        let value = JSON.stringify(wrapper.object);
                        value = value.substring(0, value.length - 1);
                        value += String(`,"${wrapper.objectPropertyName}":[`);
                        this.push(Buffer.from(value));
                    } else {
                        this.push(Buffer.from('['));
                    }
                }
                if (chunksSent++ > 0) {
                    this.push(Buffer.from(','));
                }

                this.push(JSON.stringify(data));
                callback();
            },
            flush: function(callback) {
                if (chunksSent === 0) {
                    //nothing sent
                    if (wrapper.object) {
                        let value = _.cloneDeep(wrapper.object);
                        value[wrapper.objectPropertyName] = [];
                        this.push(Buffer.from(JSON.stringify(value)));
                    } else {
                        this.push(Buffer.from('[]'));
                    }
                } else {
                    //Close json properly
                    this.push(Buffer.from(']'));
                    if (wrapper.object) {
                        this.push(Buffer.from('}'));
                    }
                }
                return callback();
            }
        });
    }
};
