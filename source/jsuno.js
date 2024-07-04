/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

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

    getTypeDescriptionManager: function() {
        const tdmAny = Module.getUnoComponentContext().getValueByName(
            '/singletons/com.sun.star.reflection.theTypeDescriptionManager');
        const tdm = Module.uno.com.sun.star.container.XHierarchicalNameAccess.query(tdmAny.get());
        tdmAny.delete();
        return tdm;
    },

    translateTypeDescription: function(td) {
        switch (td.getTypeClass()) {
        case Module.uno.com.sun.star.uno.TypeClass.VOID:
            return new Module.uno_Type.Void();
        case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
            return new Module.uno_Type.Boolean();
        case Module.uno.com.sun.star.uno.TypeClass.BYTE:
            return new Module.uno_Type.Byte();
        case Module.uno.com.sun.star.uno.TypeClass.SHORT:
            return new Module.uno_Type.Short();
        case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_SHORT:
            return new Module.uno_Type.UnsignedShort();
        case Module.uno.com.sun.star.uno.TypeClass.LONG:
            return new Module.uno_Type.Long();
        case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_LONG:
            return new Module.uno_Type.UnsignedLong();
        case Module.uno.com.sun.star.uno.TypeClass.HYPER:
            return new Module.uno_Type.Hyper();
        case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_HYPER:
            return new Module.uno_Type.UnsignedHyper();
        case Module.uno.com.sun.star.uno.TypeClass.FLOAT:
            return new Module.uno_Type.Float();
        case Module.uno.com.sun.star.uno.TypeClass.DOUBLE:
            return new Module.uno_Type.Double();
        case Module.uno.com.sun.star.uno.TypeClass.CHAR:
            return new Module.uno_Type.Char();
        case Module.uno.com.sun.star.uno.TypeClass.STRING:
            return new Module.uno_Type.String();
        case Module.uno.com.sun.star.uno.TypeClass.TYPE:
            return new Module.uno_Type.Type();
        case Module.uno.com.sun.star.uno.TypeClass.ANY:
            return new Module.uno_Type.Any();
        case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
            return new Module.uno_Type.Sequence(
                Module.jsuno.translateTypeDescription(
                    Module.uno.com.sun.star.reflection.XIndirectTypeDescription.query(td)
                        .getReferencedType()));
        case Module.uno.com.sun.star.uno.TypeClass.ENUM:
            return new Module.uno_Type.Enum(td.getName());
        case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
            return new Module.uno_Type.Struct(td.getName());
        case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
            return new Module.uno_Type.Exception(td.getName());
        case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
            return new Module.uno_Type.Interface(td.getName());
        default:
            throw new Error(
                'bad type description ' + td.getName() + ' type class ' + td.getTypeClass());
        }
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
        case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
        case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
            {
                const val = {};
                const walk = function(td) {
                    const base = td.getBaseType();
                    if (base !== null) {
                        walk(Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                            base));
                    }
                    const types = td.getMemberTypes();
                    const names = td.getMemberNames();
                    for (let i = 0; i !== types.size(); ++i) {
                        const name = names.get(i);
                        val[name] = Module.jsuno.translateToEmbind(
                            obj[name], Module.jsuno.translateTypeDescription(types.get(i)),
                            toDelete);
                    }
                    types.delete();
                    names.delete();
                };
                const tdAny = Module.jsuno.getTypeDescriptionManager().getByHierarchicalName(
                    type.toString());
                const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                    tdAny.get());
                tdAny.delete();
                walk(td);
                return obj;
            }
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
        case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
        case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
            {
                const obj = {};
                const walk = function(td) {
                    const base = td.getBaseType();
                    if (base !== null) {
                        walk(Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                            base));
                    }
                    const types = td.getMemberTypes();
                    const names = td.getMemberNames();
                    for (let i = 0; i !== types.size(); ++i) {
                        const name = names.get(i);
                        obj[name] = Module.jsuno.translateFromEmbind(
                            val[name], Module.jsuno.translateTypeDescription(types.get(i)));
                    }
                    types.delete();
                    names.delete();
                };
                const tdAny = Module.jsuno.getTypeDescriptionManager().getByHierarchicalName(
                    type.toString());
                const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                    tdAny.get());
                tdAny.delete();
                walk(td);
                return obj;
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
        Module.initUno();
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
                            const exc = Module.jsuno.catchUnoException(e);
                            if (exc.type == 'com.sun.star.reflection.InvocationTargetException') {
                                Module.jsuno.throwUnoException(exc.val.TargetException);
                            } else {
                                Module.jsuno.throwUnoException(exc);
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

    throwUnoException: function(any) { Module.throwUnoException(any.type, any.val); },

    catchUnoException: function(exception) {
        return Module.jsuno.translateFromAnyAndDelete(
            Module.catchUnoException(exception), new Module.uno_Type.Any());
    },

    unoObject: function(interfaces, obj) {
        const wrapper = {};
        const seen = {'com.sun.star.lang.XTypeProvider': true, 'com.sun.star.uno.XInterface': true};
        const walk = function(td) {
            const iname = td.getName();
            if (!Object.hasOwn(seen, iname)) {
                seen[iname] = true;
                if (td.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.INTERFACE) {
                    throw new Error('not a UNO interface type: ' + iname);
                }
                const itd = Module.uno.com.sun.star.reflection.XInterfaceTypeDescription2.query(td);
                const bases = itd.getBaseTypes();
                for (let i = 0; i !== bases.size(); ++i) {
                    walk(bases.get(i));
                }
                bases.delete();
                const mems = itd.getMembers();
                for (let i = 0; i !== mems.size(); ++i) {
                    const atd =
                       Module.uno.com.sun.star.reflection.XInterfaceAttributeTypeDescription
                           .query(mems.get(i));
                    if (atd !== null) {
                        const aname = atd.getMemberName();
                        const type = Module.jsuno.translateTypeDescription(atd.getType());
                        wrappers['get' + aname] = function() {
                            return Module.jsuno.translateToEmbind(
                                obj['get' + aname].apply(obj), type, []);
                        };
                        if (!atd.isReadOnly()) {
                            wrappers['set' + aname] = function() {
                                obj['set' + aname].apply(
                                    obj, [Module.jsuno.translateFromEmbind(arguments[0], type)]);
                            };
                        }
                    } else {
                        const mtd =
                            Module.uno.com.sun.star.reflection.XInterfaceMethodTypeDescription
                                .query(mems.get(i));
                        const mname = mtd.getMemberName();
                        const retType = Module.jsuno.translateTypeDescription(mtd.getReturnType());
                        const params = [];
                        const descrs = mtd.getParameters();
                        for (let j = 0; j !== descrs.size(); ++j) {
                            const descr = descrs.get(j);
                            params.push({
                                type: Module.jsuno.translateTypeDescription(descr.getType()),
                                dirIn: descr.isIn(), dirOut: descr.isOut()});
                        }
                        descrs.delete();
                        wrapper[mname] = function() {
                            const args = [];
                            for (let i = 0; i !== params.length; ++i) {
                                let arg;
                                if (params[i].dirOut) {
                                    arg = {};
                                    if (params[i].dirIn) {
                                        arg.val = Module.jsuno.translateFromEmbind(
                                            arguments[i].val, params[i].type);
                                    }
                                } else {
                                    arg = Module.jsuno.translateFromEmbind(
                                        arguments[i], params[i].type);
                                }
                                args.push(arg);
                            }
                            const ret = Module.jsuno.translateToEmbind(
                                obj[mname].apply(obj, args), retType, []);
                            for (let i = 0; i !== params.length; ++i) {
                                if (params[i].dirOut) {
                                    arguments[i].val = Module.jsuno.translateToEmbind(
                                        args[i].val, params[i].type, []);
                                }
                            }
                            return ret;
                        };
                    }
                }
                mems.delete();
            }
        };
        const tdm = Module.jsuno.getTypeDescriptionManager();
        interfaces.forEach((i) => {
            const td = tdm.getByHierarchicalName(i);
            walk(Module.uno.com.sun.star.reflection.XTypeDescription.query(td.get()));
            td.delete();
        })
        Module.MyFinalizationRegistry.register(wrapper, 'wrapper finalized');
        return Module.jsuno.proxy(Module.unoObject(interfaces, wrapper));
    },
};

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
