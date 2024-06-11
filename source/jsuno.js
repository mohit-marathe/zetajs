/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

Module.jsuno = {
    getProxyTarget: Symbol('getProxyTarget'),

    isEmbindInOutParam: function(obj) {
        if (obj === undefined || obj === null) {
            return false;
        }
        const prot = Object.getPrototypeOf(obj);
        return 'constructor' in prot && typeof prot.constructor.name === 'string'
            && prot.constructor.name.startsWith('uno_InOutParam_');
    },

    isEmbindSequence: function(obj) {
        if (obj === undefined || obj === null) {
            return false;
        }
        const prot = Object.getPrototypeOf(obj);
        return 'constructor' in prot && typeof prot.constructor.name === 'string'
            && prot.constructor.name.startsWith('uno_Sequence');
    },

    getEmbindSequenceCtor: function(componentType) {
        let typename = componentType.toString();
        let name = 'uno_Sequence';
        let n = 1;
        while (typename.startsWith('[]')) {
            typename = typename.substr(2);
            ++n;
        }
        if (n !== 1) {
            name += n;
        }
        name += '_' + typename.replace(/ /g, '_').replace(/\./g, '$');
        return Module[name];
    },

    translateToEmbind: function(obj, type, toDelete) {
        switch (type.getTypeClass()) {
        case Module.uno.com.sun.star.uno.TypeClass.ANY:
            if ('type' in obj && obj.type instanceof Module.uno_Type && 'val' in obj) {
                const any = new Module.uno_Any(
                    obj.type, Module.jsuno.translateToEmbind(obj.val, obj.type, toDelete));
                toDelete.push(any);
                return any;
            }
            break;
        case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
            if (Array.isArray(obj)) {
                const ctype = type.getSequenceComponentType();
                const seq = new (Module.jsuno.getEmbindSequenceCtor(ctype))(
                    obj.length, Module.uno_Sequence.FromSize);
                for (let i = 0; i !== obj.length; ++i) {
                    seq.set(i, Module.jsuno.translateToEmbind(obj[i], ctype, toDelete));
                }
                toDelete.push(seq);
                return seq;
            }
            break;
        case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
            if (obj !== null && type.toString() !== 'com.sun.star.uno.XInterface') {
                const target = obj[Module.jsuno.getProxyTarget];
                const handle = target === undefined ? obj : target;
                if (handle instanceof ClassHandle) {
                    const embindType = 'uno_Type_' + type.toString().replace(/\./g, '$');
                    if (embindType === handle.$$.ptrType.registeredClass.name) {
                        return obj;
                    } else {
                        return Module.jsuno.proxy(Module[embindType].query(obj));
                    }
                }
            }
            break;
        }
        return obj;
    },

    translateToAny: function(obj, type) {
        let any;
        let owning;
        if (obj instanceof Module.uno_Any) {
            any = obj;
            owning = false;
        } else {
            let fromType;
            let val;
            const toDelete = [];
            if (type.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.ANY) {
                switch (typeof obj) {
                case 'undefined':
                    fromType = Module.uno_Type.Void();
                    val = obj;
                    break;
                case 'boolean':
                    fromType = Module.uno_Type.Boolean();
                    val = obj;
                    break;
                case 'number':
                    fromType = Number.isInteger(obj) && obj >= -0x80000000 && obj < 0x80000000
                        ? Module.uno_Type.Long()
                        : Number.isInteger(obj) && obj >= 0 && obj < 0x100000000
                        ? Module.uno_Type.UnsignedLong()
                        : Module.uno_Type.Double();
                    val = obj;
                    break;
                case 'bigint':
                    fromType = obj < 0x8000000000000000n
                        ? Module.uno_Type.Hyper() : Module.uno_Type.UnsignedHyper();
                    val = obj;
                    break;
                case 'string':
                    fromType = Module.uno_Type.String();
                    val = obj;
                    break;
                case 'object':
                    if (obj === null) {
                        fromType = Module.uno_Type.Interface('com.sun.star.uno.XInterface');
                        val = obj;
                    } else if (obj instanceof Module.uno_Type) {
                        fromType = Module.uno_Type.Type();
                        val = obj;
                    } else if ('type' in obj && obj.type instanceof Module.uno_Type && 'val' in obj)
                    {
                        fromType = obj.type;
                        val = Module.jsuno.translateToEmbind(obj.val, obj.type, toDelete);
                    } else {
                        throw new Error('TODO');
                    }
                    break;
                default:
                    throw new Error(
                        'bad UNO method call argument ' + obj);
                }
            } else {
                fromType = type;
                val = Module.jsuno.translateToEmbind(obj, type, toDelete);
            }
            any = new Module.uno_Any(fromType, val);
            owning = true;
            toDelete.forEach((val) => val.delete());
        }
        return {any, owning};
    },

    translateFromEmbind: function(val, type) {
        switch (type.getTypeClass()) {
        case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
            return Boolean(val);
        case Module.uno.com.sun.star.uno.TypeClass.ANY:
            return {type: val.getType(),
                    val: Module.jsuno.translateFromEmbind(val.get(), val.getType())};
        case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
            {
                const arr = [];
                for (let i = 0; i !== val.size(); ++i) {
                    const elm = val.get(i);
                    arr.push(
                        Module.jsuno.translateFromEmbind(elm, type.getSequenceComponentType()));
                    if (Module.jsuno.isEmbindSequence(elm) || elm instanceof Module.uno_Any) {
                        elm.delete();
                    }
                }
                return arr;
            }
        case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
            return Module.jsuno.proxy(val);
        default:
            return val;
        }
    },

    translateFromAny: function(any, type) {
        if (type.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.ANY) {
            return {type: any.getType(),
                    val: Module.jsuno.translateFromEmbind(any.get(), any.getType())};
        } else {
            const val1 = any.get();
            const val2 = Module.jsuno.translateFromEmbind(val1, any.getType());
            if (Module.jsuno.isEmbindSequence(val1)) {
                val1.delete();
            }
            return val2;
        }
    },

    translateFromAnyAndDelete: function(any, type) {
        const val = Module.jsuno.translateFromAny(any, type);
        any.delete();
        return val;
    },

    proxy: function(unoObject) {
        if (unoObject === null) {
            return null;
        }
        if (Module.uno === undefined) {
            Module.uno = init_unoembind_uno(Module);
        }
        const arg = new Module.uno_Any(
            Module.uno_Type.Interface('com.sun.star.uno.XInterface'), unoObject);
        const args = new Module.uno_Sequence_any([arg]);
        const invoke = Module.uno.com.sun.star.script.XInvocation2.query(
            Module.uno.com.sun.star.script.Invocation.create(
                Module.getUnoComponentContext()).createInstanceWithArguments(args));
        arg.delete();
        args.delete();
        return new Proxy(unoObject, {
            get(target, prop) {
                if (prop === Module.jsuno.getProxyTarget) {
                    return target;
                } else if (prop === '$$') {
                    return Reflect.get(target, prop);
                } else if (invoke.hasMethod(prop)) {
                    const info = invoke.getInfoForName(prop, true);
                    return function() {
                        if (arguments.length != info.aParamTypes.size()) {
                            throw new Error(
                                'bad number of arguments in call to ' + prop + ', expected ' +
                                    info.aParamTypes.size() + ' vs. actual ' + arguments.length);
                        }
                        const args = new Module.uno_Sequence_any(
                            info.aParamTypes.size(), Module.uno_Sequence.FromSize);
                        const deleteArgs = [];
                        for (let i = 0; i !== info.aParamTypes.size(); ++i) {
                            switch (info.aParamModes.get(i)) {
                            case Module.uno.com.sun.star.reflection.ParamMode.IN:
                                {
                                    const {any, owning} = Module.jsuno.translateToAny(
                                        arguments[i], info.aParamTypes.get(i));
                                    args.set(i, any);
                                    if (owning) {
                                        deleteArgs.push(any);
                                    }
                                    break;
                                }
                            case Module.uno.com.sun.star.reflection.ParamMode.INOUT:
                                if (Module.jsuno.isEmbindInOutParam(arguments[i])) {
                                    const val = arguments[i].val;
                                    if (info.aParamTypes.get(i).getTypeClass()
                                        === Module.uno.com.sun.star.uno.TypeClass.ANY)
                                    {
                                        args.set(i, val);
                                        val.delete();
                                    } else {
                                        const any = new Module.uno_Any(
                                            info.aParamTypes.get(i), val);
                                        if (Module.jsuno.isEmbindSequence(val)) {
                                            val.delete();
                                        }
                                        args.set(i, any);
                                        deleteArgs.push(any);
                                    }
                                } else {
                                    const {any, owning} = Module.jsuno.translateToAny(
                                        arguments[i].val, info.aParamTypes.get(i));
                                    args.set(i, any);
                                    if (owning) {
                                        deleteArgs.push(any);
                                    }
                                }
                                break;
                            }
                        }
                        const outparamindex_out = new Module.uno_InOutParam_sequence_short;
                        const outparam_out = new Module.uno_InOutParam_sequence_any;
                        let ret;
                        try {
                            ret = invoke.invoke(prop, args, outparamindex_out, outparam_out);
                        } catch (e) {
                            outparamindex_out.delete();
                            outparam_out.delete();
                            const [type, message] = getExceptionMessage(e);
                            if (type === 'com::sun::star::reflection::InvocationTargetException') {
                                //TODO: get at the wrapped exception
                                decrementExceptionRefcount(e);
                                throw new Error('TODO: unidentified UNO exception');
                            } else {
                                //TODO:
                                throw e;
                            }
                        } finally {
                            deleteArgs.forEach((arg) => arg.delete());
                            args.delete();
                        }
                        outparamindex = outparamindex_out.val;
                        outparamindex_out.delete();
                        outparam = outparam_out.val;
                        outparam_out.delete();
                        for (let i = 0; i !== outparamindex.size(); ++i) {
                            const j = outparamindex.get(i);
                            if (Module.jsuno.isEmbindInOutParam(arguments[j])) {
                                const val = outparam.get(i);
                                if (info.aParamTypes.get(j).getTypeClass()
                                    === Module.uno.com.sun.star.uno.TypeClass.ANY)
                                {
                                    arguments[j].val = val;
                                } else {
                                    const val2 = val.get();
                                    arguments[j].val = val2;
                                    if (Module.jsuno.isEmbindSequence(val2)) {
                                        val2.delete();
                                    }
                                }
                                val.delete();
                            } else {
                                arguments[j].val = Module.jsuno.translateFromAnyAndDelete(
                                outparam.get(i), info.aParamTypes.get(j));
                            }
                        }
                        outparamindex.delete();
                        outparam.delete();
                        return Module.jsuno.translateFromAnyAndDelete(ret, info.aType);
                    };
                } else if (invoke.hasProperty(prop)) {
                    const info = invoke.getInfoForName(prop, true);
                    let ret;
                    try {
                        ret = invoke.getValue(prop);
                    } catch (e) {
                        const [type, message] = getExceptionMessage(e);
                        if (type === 'com::sun::star::reflection::InvocationTargetException') {
                            //TODO: get at the wrapped exception
                            decrementExceptionRefcount(e);
                            throw new Error('TODO: unidentified UNO exception');
                        } else {
                            //TODO:
                            throw e;
                        }
                    }
                    return Module.jsuno.translateFromAnyAndDelete(ret, info.aType);
                } else {
                    throw new Error('get unknown property ' + prop);
                }
            },
            set(target, prop, value) {
                if (invoke.hasProperty(prop)) {
                    const info = invoke.getInfoForName(prop, true);
                    if (info.PropertyAttribute
                        & Module.uno.com.sun.star.beans.PropertyAttribute.READONLY)
                    {
                        throw new Error('set readonly property ' + prop);
                    }
                    const {any, owning} = Module.jsuno.translateToAny(value, info.aType);
                    try {
                        invoke.setValue(prop, any);
                    } catch (e) {
                        const [type, message] = getExceptionMessage(e);
                        if (type === 'com::sun::star::reflection::InvocationTargetException') {
                            //TODO: get at the wrapped exception
                            decrementExceptionRefcount(e);
                            throw new Error('TODO: unidentified UNO exception');
                        } else {
                            //TODO:
                            throw e;
                        }
                    } finally {
                        if (owning) {
                            any.delete();
                        }
                    }
                } else {
                    throw new Error('set unknown property ' + prop);
                }
            }
        });
    },
};

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
