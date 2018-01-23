;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.JNDeepDiff = factory());
}(this, (function () {
    'use strict';

    //�ҳ�ָ������������֮��Ĳ���
    function findDiff(args) {
        var diffData = {};
        //����ȽϷ�ʽ��Ĭ�ϸ���Id�ֶαȽ�
        if (args.arrayComparer === undefined || (typeof (args.arrayComparer) !== 'string' && typeof (args.arrayComparer) !== 'function')) {
            args.arrayComparer = 'id';
        }
        for (var eb in args.newData) {
            //����Id�Ǳ����
            if (eb === 'id') {
                diffData[eb] = args.newData[eb];
            }
                //����Ƕ�����˵���ǻ������ϣ��������� ����ֵ�����ֶ�
            else if (realTypeOf(args.newData[eb]) === 'object') {
                if (args.oldData[eb] === undefined || args.newData[eb].id !== args.oldData[eb].id) {
                    diffData[eb] = args.newData[eb];
                }
            }
                //��������飬��˵������ϸ
            else if (Array.isArray(args.newData[eb])) {
                if (Array.isArray(args.oldData[eb])) {
                    diffData[eb] = [];
                    for (var i = 0; i < args.newData[eb].length; i++) {
                        var oldEntitys = findEntity(args.oldData[eb], args.newData[eb][i], args.arrayComparer);
                        if (oldEntitys) {
                            //�ݹ�
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
                //�������͵��ֶΣ����֣��ַ�����������
            else if (args.newData[eb] !== undefined) {
                if (args.oldData[eb] === undefined || args.newData[eb] !== args.oldData[eb]) {
                    diffData[eb] = args.newData[eb];
                }
            }
        }
        return diffData;
    }

    //����ָ��������Id��ָ����ʵ�������в��ң���������򷵻ظ�ʵ���������������򷵻� null
    function findEntity(oldEntitys, newEntity, arrayComparer) {
        if (typeof (arrayComparer) === 'string') {
            if (newEntity[arrayComparer] === undefined) {
                throw new Error('arrayComparer ���� ' + arrayComparer + ' ����������в����ڣ����飡');
            }
            for (var i = 0; i < oldEntitys.length; i++) {
                if (oldEntitys[i][arrayComparer] === undefined) {
                    throw new Error('arrayComparer ���� ' + arrayComparer + ' ����������в����ڣ����飡');
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