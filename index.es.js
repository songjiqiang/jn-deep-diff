'use strict';

var $scope;
var conflict;
var conflictResolution = [];
if (typeof global === 'object' && global) {
    $scope = global;
} else if (typeof window !== 'undefined') {
    $scope = window;
} else {
    $scope = {};
}
conflict = $scope.JNDeepDiff;
if (conflict) {
    conflictResolution.push(
      function () {
          if ('undefined' !== typeof conflict && $scope.JNDeepDiff === findDiff) {
              $scope.JNDeepDiff = conflict;
              conflict = undefined;
          }
      });
}

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

Object.defineProperties(findDiff, {

    findDiff: {
        value: findDiff,
        enumerable: true
    },
    isConflict: {
        value: function () {
            return 'undefined' !== typeof conflict;
        },
        enumerable: true
    },
    noConflict: {
        value: function () {
            if (conflictResolution) {
                conflictResolution.forEach(function (it) {
                    it();
                });
                conflictResolution = null;
            }
            return findDiff;
        },
        enumerable: true
    }
});

export default findDiff;