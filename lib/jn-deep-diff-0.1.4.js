;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.JNDeepDiff = factory());
}(this, (function () {
    'use strict';

    //找出指定的两个对象之间的差异
    function findDiff(args) {
        var diffData = {};
        //数组比较方式：默认根据Id字段比较
        if (args.arrayComparer === undefined || (typeof (args.arrayComparer) !== 'string' && typeof (args.arrayComparer) !== 'function')) {
            args.arrayComparer = 'id';
        }
        for (var eb in args.newData) {
            //主键Id是必须的
            if (eb === 'id') {
                diffData[eb] = args.newData[eb];
            }
                //如果是对象，则说明是基础资料，辅助资料 等三值对象字段
            else if (realTypeOf(args.newData[eb]) === 'object') {
                if (args.oldData[eb] === undefined || args.newData[eb].id !== args.oldData[eb].id) {
                    diffData[eb] = args.newData[eb];
                }
            }
                //如果是数组，则说明是明细
            else if (Array.isArray(args.newData[eb])) {
                if (Array.isArray(args.oldData[eb])) {
                    diffData[eb] = [];
                    for (var i = 0; i < args.newData[eb].length; i++) {
                        var oldEntitys = findEntity(args.oldData[eb], args.newData[eb][i], args.arrayComparer);
                        if (oldEntitys) {
                            //递归
                            var diffEntity = findDiff({
                                oldData: oldEntitys,
                                newData: args.newData[eb][i],
                                arrayComparer: args.arrayComparer
                            });
                            diffData[eb].push(diffEntity);
                        } else {
                            diffData[eb].push(args.newData[eb][i]);
                        }
                    }
                } else {
                    diffData[eb] = args.newData[eb];
                }
            }
                //其他类型的字段（数字，字符串，布尔）
            else if (args.newData[eb] !== undefined) {
                if (args.oldData[eb] === undefined || args.newData[eb] !== args.oldData[eb]) {
                    diffData[eb] = args.newData[eb];
                }
            }
        }
        return diffData;
    }

    //根据指定的主键Id在指定的实体数组中查找，如果存在则返回该实体对象，如果不存在则返回 null
    function findEntity(oldEntitys, newEntity, arrayComparer) {
        if (typeof (arrayComparer) === 'string') {
            if (newEntity[arrayComparer] === undefined) {
                throw new Error('arrayComparer 参数 ' + arrayComparer + ' 在数组对象中不存在，请检查！');
            }
            for (var i = 0; i < oldEntitys.length; i++) {
                if (oldEntitys[i][arrayComparer] === undefined) {
                    throw new Error('arrayComparer 参数 ' + arrayComparer + ' 在数组对象中不存在，请检查！');
                }
                if (oldEntitys[i][arrayComparer] === newEntity[arrayComparer]) {
                    return oldEntitys[i];
                }
            }
        } else {
            return arrayComparer(oldEntitys, newEntity);
        }
        return null;
    }

    function realTypeOf(subject) {
        var type = typeof subject;
        if (type !== 'object') {
            return type;
        }
        if (subject === Math) {
            return 'math';
        } else if (subject === null) {
            return 'null';
        } else if (Array.isArray(subject)) {
            return 'array';
        } else if (Object.prototype.toString.call(subject) === '[object Date]') {
            return 'date';
        } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
            return 'regexp';
        }
        return 'object';
    }

    return { findDiff: findDiff };

})));