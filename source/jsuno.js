/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

Module.jsuno_init = new Promise(function (resolve, reject) {
    Module.jsuno_init$resolve = function() {
        const getProxyTarget = Symbol('getProxyTarget');
        function isEmbindInOutParam(obj) {
            if (obj === undefined || obj === null) {
                return false;
            }
            const prot = Object.getPrototypeOf(obj);
            return 'constructor' in prot && typeof prot.constructor.name === 'string'
                && prot.constructor.name.startsWith('uno_InOutParam_');
        };
        function isEmbindSequence(obj) {
            if (obj === undefined || obj === null) {
                return false;
            }
            const prot = Object.getPrototypeOf(obj);
            return 'constructor' in prot && typeof prot.constructor.name === 'string'
                && prot.constructor.name.startsWith('uno_Sequence');
        };
        function getEmbindSequenceCtor(componentType) {
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
        };
        function getTypeDescriptionManager() {
            const tdmAny = Module.getUnoComponentContext().getValueByName(
                '/singletons/com.sun.star.reflection.theTypeDescriptionManager');
            const tdm = Module.uno.com.sun.star.container.XHierarchicalNameAccess.query(
                tdmAny.get());
            tdmAny.delete();
            return tdm;
        };
        function translateTypeDescription(td) {
            switch (td.getTypeClass()) {
            case Module.uno.com.sun.star.uno.TypeClass.VOID:
                return Module.uno_Type.Void();
            case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
                return Module.uno_Type.Boolean();
            case Module.uno.com.sun.star.uno.TypeClass.BYTE:
                return Module.uno_Type.Byte();
            case Module.uno.com.sun.star.uno.TypeClass.SHORT:
                return Module.uno_Type.Short();
            case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_SHORT:
                return Module.uno_Type.UnsignedShort();
            case Module.uno.com.sun.star.uno.TypeClass.LONG:
                return Module.uno_Type.Long();
            case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_LONG:
                return Module.uno_Type.UnsignedLong();
            case Module.uno.com.sun.star.uno.TypeClass.HYPER:
                return Module.uno_Type.Hyper();
            case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_HYPER:
                return Module.uno_Type.UnsignedHyper();
            case Module.uno.com.sun.star.uno.TypeClass.FLOAT:
                return Module.uno_Type.Float();
            case Module.uno.com.sun.star.uno.TypeClass.DOUBLE:
                return Module.uno_Type.Double();
            case Module.uno.com.sun.star.uno.TypeClass.CHAR:
                return Module.uno_Type.Char();
            case Module.uno.com.sun.star.uno.TypeClass.STRING:
                return Module.uno_Type.String();
            case Module.uno.com.sun.star.uno.TypeClass.TYPE:
                return Module.uno_Type.Type();
            case Module.uno.com.sun.star.uno.TypeClass.ANY:
                return Module.uno_Type.Any();
            case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
                return Module.uno_Type.Sequence(
                    translateTypeDescription(
                        Module.uno.com.sun.star.reflection.XIndirectTypeDescription.query(td)
                            .getReferencedType()));
            case Module.uno.com.sun.star.uno.TypeClass.ENUM:
                return Module.uno_Type.Enum(td.getName());
            case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
                return Module.uno_Type.Struct(td.getName());
            case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
                return Module.uno_Type.Exception(td.getName());
            case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
                return Module.uno_Type.Interface(td.getName());
            default:
                throw new Error(
                    'bad type description ' + td.getName() + ' type class ' + td.getTypeClass());
            }
        };
        function translateToEmbind(obj, type, toDelete) {
            switch (type.getTypeClass()) {
            case Module.uno.com.sun.star.uno.TypeClass.ANY:
                {
                    const {any, owning} = translateToAny(obj, Module.uno_Type.Any());
                    if (owning) {
                        toDelete.push(any);
                    }
                    return any;
                }
            case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
                if (Array.isArray(obj)) {
                    const ctype = type.getSequenceComponentType();
                    const seq = new (getEmbindSequenceCtor(ctype))(
                        obj.length, Module.uno_Sequence.FromSize);
                    for (let i = 0; i !== obj.length; ++i) {
                        seq.set(i, translateToEmbind(obj[i], ctype, toDelete));
                    }
                    toDelete.push(seq);
                    return seq;
                }
                break;
            case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
            case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
                {
                    const val = {};
                    function walk(td) {
                        const base = td.getBaseType();
                        if (base !== null) {
                            walk(Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                                base));
                        }
                        const types = td.getMemberTypes();
                        const names = td.getMemberNames();
                        for (let i = 0; i !== types.size(); ++i) {
                            const name = names.get(i);
                            val[name] = translateToEmbind(
                                obj[name], translateTypeDescription(types.get(i)), toDelete);
                        }
                        types.delete();
                        names.delete();
                    };
                    const tdAny = getTypeDescriptionManager().getByHierarchicalName(
                        type.toString());
                    const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                        tdAny.get());
                    tdAny.delete();
                    walk(td);
                    return val;
                }
            case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
                if (obj !== null) {
                    const target = obj[getProxyTarget];
                    const handle = target === undefined ? obj : target;
                    if (handle instanceof ClassHandle) {
                        if (type.toString() === 'com.sun.star.uno.XInterface') {
                            return handle;
                        }
                        const embindType = 'uno_Type_' + type.toString().replace(/\./g, '$');
                        if (embindType === handle.$$.ptrType.registeredClass.name) {
                            return handle;
                        } else {
                            return Module[embindType].query(handle);
                        }
                    }
                }
                break;
            }
            return obj;
        };
        function translateToAny(obj, type) {
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
                            break;
                        } else if (obj instanceof Module.uno_Type) {
                            fromType = Module.uno_Type.Type();
                            val = obj;
                            break;
                        } else if (obj instanceof Any) {
                            fromType = obj.type;
                            val = translateToEmbind(obj.val, obj.type, toDelete);
                            break;
                        } else {
                            const tag = obj[Module.unoTagSymbol];
                            if (tag !== undefined) {
                                if (tag.kind === 'enumerator') {
                                    fromType = Module.uno_Type.Enum(tag.type);
                                    val = obj;
                                    break;
                                } else if (tag.kind === 'struct-instance') {
                                    fromType = Module.uno_Type.Struct(tag.type);
                                    val = translateToEmbind(obj, fromType, toDelete);
                                    break;
                                } else if (tag.kind === 'exception-instance') {
                                    fromType = Module.uno_Type.Exception(tag.type);
                                    val = translateToEmbind(obj, fromType, toDelete);
                                    break;
                                }
                            }
                        }
                        // fallthrough
                    default:
                        throw new Error('bad UNO method call argument ' + obj);
                    }
                } else {
                    fromType = type;
                    val = translateToEmbind(obj, type, toDelete);
                }
                any = new Module.uno_Any(fromType, val);
                owning = true;
                toDelete.forEach((val) => val.delete());
            }
            return {any, owning};
        };
        function translateFromEmbind(val, type) {
            switch (type.getTypeClass()) {
            case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
                return Boolean(val);
            case Module.uno.com.sun.star.uno.TypeClass.ANY:
                return new Any(val.getType(), translateFromEmbind(val.get(), val.getType()));
            case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
                {
                    const arr = [];
                    for (let i = 0; i !== val.size(); ++i) {
                        const elm = val.get(i);
                        arr.push(translateFromEmbind(elm, type.getSequenceComponentType()));
                        if (isEmbindSequence(elm) || elm instanceof Module.uno_Any) {
                            elm.delete();
                        }
                    }
                    return arr;
                }
            case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
            case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
                {
                    const obj = {};
                    function walk(td) {
                        const base = td.getBaseType();
                        if (base !== null) {
                            walk(Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                                base));
                        }
                        const types = td.getMemberTypes();
                        const names = td.getMemberNames();
                        for (let i = 0; i !== types.size(); ++i) {
                            const name = names.get(i);
                            obj[name] = translateFromEmbind(
                                val[name], translateTypeDescription(types.get(i)));
                        }
                        types.delete();
                        names.delete();
                    };
                    const tdAny = getTypeDescriptionManager().getByHierarchicalName(
                        type.toString());
                    const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(
                        tdAny.get());
                    tdAny.delete();
                    walk(td);
                    return obj;
                }
            case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
                return proxy(val);
            default:
                return val;
            }
        };
        function translateFromAny(any, type) {
            if (type.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.ANY) {
                return new Any(any.getType(), translateFromEmbind(any.get(), any.getType()));
            } else {
                const val1 = any.get();
                const val2 = translateFromEmbind(val1, any.getType());
                if (isEmbindSequence(val1)) {
                    val1.delete();
                }
                return val2;
            }
        };
        function translateFromAnyAndDelete(any, type) {
            const val = translateFromAny(any, type);
            any.delete();
            return val;
        };
        function proxy(unoObject) {
            if (unoObject === null) {
                return null;
            }
            const prox = {};
            prox[getProxyTarget] = unoObject;
            // css.script.XInvocation2::getInfo invents additional members (e.g., an attribute "Foo"
            // if there is a method "getFoo"), so better determine the actual set of members via
            // css.lang.XTypeProvider::getTypes:
            const typeprov = Module.uno.com.sun.star.lang.XTypeProvider.query(unoObject);
            if (typeprov !== null) {
                const arg = new Module.uno_Any(
                    Module.uno_Type.Interface('com.sun.star.uno.XInterface'), unoObject);
                const args = new Module.uno_Sequence_any([arg]);
                const invoke = Module.uno.com.sun.star.script.XInvocation2.query(
                    Module.uno.com.sun.star.script.Invocation.create(
                        Module.getUnoComponentContext()).createInstanceWithArguments(args));
                arg.delete();
                args.delete();
                function invokeMethod(name, args) {
                    const info = invoke.getInfoForName(name, true);
                    if (args.length != info.aParamTypes.size()) {
                        throw new Error(
                            'bad number of arguments in call to ' + name + ', expected ' +
                                info.aParamTypes.size() + ' vs. actual ' + args.length);
                    }
                    const unoArgs = new Module.uno_Sequence_any(
                        info.aParamTypes.size(), Module.uno_Sequence.FromSize);
                    const deleteArgs = [];
                    for (let i = 0; i !== info.aParamTypes.size(); ++i) {
                        switch (info.aParamModes.get(i)) {
                        case Module.uno.com.sun.star.reflection.ParamMode.IN:
                            {
                                const {any, owning} = translateToAny(
                                    args[i], info.aParamTypes.get(i));
                                unoArgs.set(i, any);
                                if (owning) {
                                    deleteArgs.push(any);
                                }
                                break;
                            }
                        case Module.uno.com.sun.star.reflection.ParamMode.INOUT:
                            if (isEmbindInOutParam(args[i])) {
                                const val = args[i].val;
                                if (info.aParamTypes.get(i).getTypeClass()
                                    === Module.uno.com.sun.star.uno.TypeClass.ANY)
                                {
                                    unoArgs.set(i, val);
                                    val.delete();
                                } else {
                                    const any = new Module.uno_Any(info.aParamTypes.get(i), val);
                                    if (isEmbindSequence(val)) {
                                        val.delete();
                                    }
                                    unoArgs.set(i, any);
                                    deleteArgs.push(any);
                                }
                            } else {
                                const {any, owning} = translateToAny(
                                    args[i].val, info.aParamTypes.get(i));
                                unoArgs.set(i, any);
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
                        ret = invoke.invoke(name, unoArgs, outparamindex_out, outparam_out);
                    } catch (e) {
                        outparamindex_out.delete();
                        outparam_out.delete();
                        const exc = catchUnoException(e);
                        if (exc.type == 'com.sun.star.reflection.InvocationTargetException') {
                            throwUnoException(exc.val.TargetException);
                        } else {
                            throwUnoException(exc);
                        }
                    } finally {
                        deleteArgs.forEach((arg) => arg.delete());
                        unoArgs.delete();
                    }
                    const outparamindex = outparamindex_out.val;
                    outparamindex_out.delete();
                    const outparam = outparam_out.val;
                    outparam_out.delete();
                    for (let i = 0; i !== outparamindex.size(); ++i) {
                        const j = outparamindex.get(i);
                        if (isEmbindInOutParam(args[j])) {
                            const val = outparam.get(i);
                            if (info.aParamTypes.get(j).getTypeClass()
                                === Module.uno.com.sun.star.uno.TypeClass.ANY)
                            {
                                args[j].val = val;
                            } else {
                                const val2 = val.get();
                                args[j].val = val2;
                                if (isEmbindSequence(val2)) {
                                    val2.delete();
                                }
                            }
                            val.delete();
                        } else {
                            args[j].val = translateFromAnyAndDelete(
                                outparam.get(i), info.aParamTypes.get(j));
                        }
                    }
                    outparamindex.delete();
                    outparam.delete();
                    return translateFromAnyAndDelete(ret, info.aType);
                };
                function invokeGetter(name) {
                    const info = invoke.getInfoForName(name, true);
                    const ret = invoke.getValue(name);
                    return translateFromAnyAndDelete(ret, info.aType);
                };
                function invokeSetter(name, value) {
                    const info = invoke.getInfoForName(name, true);
                    const deleteArgs = [];
                    const {any, owning} = translateToAny(value, info.aType);
                    if (owning) {
                        deleteArgs.push(any);
                    }
                    invoke.setValue(name, any);
                };
                prox.queryInterface = function() {
                    return invokeMethod('queryInterface', arguments); };
                const seen = {'com.sun.star.uno.XInterface': true};
                function walk(td) {
                    const iname = td.getName();
                    if (!Object.hasOwn(seen, iname)) {
                        seen[iname] = true;
                        if (td.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.INTERFACE) {
                            throw new Error('not a UNO interface type: ' + iname);
                        }
                        const itd = Module.uno.com.sun.star.reflection.XInterfaceTypeDescription2
                              .query(td);
                        const bases = itd.getBaseTypes();
                        for (let i = 0; i !== bases.size(); ++i) {
                            walk(bases.get(i));
                        }
                        bases.delete();
                        const mems = itd.getMembers();
                        for (let i = 0; i !== mems.size(); ++i) {
                            const name = mems.get(i).getMemberName();
                            const atd = Module.uno.com.sun.star.reflection
                                  .XInterfaceAttributeTypeDescription.query(mems.get(i));
                            if (atd !== null) {
                                Object.defineProperty(prox, name, {
                                    enumerable: true,
                                    get() { return invokeGetter(name); },
                                    set: atd.isReadOnly()
                                        ? undefined
                                        : function(value) { return invokeSetter(name, value); }});
                            } else {
                                prox[name] = function() { return invokeMethod(name, arguments); };
                            }
                        }
                        mems.delete();
                    }
                };
                const tdm = getTypeDescriptionManager();
                const types = typeprov.getTypes();
                for (let i = 0; i != types.size(); ++i) {
                    const td = tdm.getByHierarchicalName(types.get(i).toString());
                    walk(Module.uno.com.sun.star.reflection.XTypeDescription.query(td.get()));
                    td.delete();
                }
                types.delete();
            }
            return prox;
        };
        function singleton(name) {
            return function(context) {
                const any = context.getValueByName('/singletons/' + name);
                if (any.type.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.INTERFACE
                    || any.val === null)
                {
                    throwUnoException(
                        new uno.com.sun.star.uno.DeploymentException(
                            {Message: 'cannot get singeleton ' + name}));
                }
                return any.val;
            };
        };
        function service(name, td) {
            const obj = {};
            const ctors = td.getConstructors();
            for (let i = 0; i !== ctors.size(); ++i) {
                const ctor = ctors.get(i);
                if (ctor.isDefaultConstructor()) {
                    obj.create = function(context) {
                        const ifc = context.getServiceManager().createInstanceWithContext(
                            name, context);
                        if (ifc === null) {
                            throwUnoException(
                                new uno.com.sun.star.uno.DeploymentException(
                                    {Message:
                                     'cannot instantiate single-interface service ' + name}));
                        }
                        return ifc;
                    };
                } else {
                    obj[ctor.getName()] = function() {
                        const context = arguments[0];
                        const args = [];
                        const params = ctor.getParameters();
                        for (let j = 0; j !== params.size(); ++j) {
                            const param = params.get(j);
                            if (param.isRestParameter()) {
                                for (; j + 1 < arguments.length; ++j) {
                                    args.push(arguments[j + 1]);
                                }
                                break;
                            } else {
                                let arg = arguments[j + 1];
                                if (param.getType().getTypeClass()
                                    !== Module.uno.com.sun.star.uno.TypeClass.ANY)
                                {
                                    arg = new Any(translateTypeDescription(param.getType()), arg);
                                }
                                args.push(arg);
                            }
                        }
                        params.delete();
                        const ifc = context.getServiceManager()
                              .createInstanceWithArgumentsAndContext(name, args, context);
                        if (ifc === null) {
                            throwUnoException(
                                new uno.com.sun.star.uno.DeploymentException(
                                    {Message:
                                     'cannot instantiate single-interface service ' + name}));
                        }
                        return ifc;
                    };
                }
            }
            ctors.delete();
            return obj;
        };
        function defaultValue(type) {
            switch (type.getTypeClass()) {
            case Module.uno.com.sun.star.uno.TypeClass.BOOLEAN:
                return false;
            case Module.uno.com.sun.star.uno.TypeClass.BYTE:
            case Module.uno.com.sun.star.uno.TypeClass.SHORT:
            case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_SHORT:
            case Module.uno.com.sun.star.uno.TypeClass.LONG:
            case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_LONG:
            case Module.uno.com.sun.star.uno.TypeClass.FLOAT:
            case Module.uno.com.sun.star.uno.TypeClass.DOUBLE:
                return 0;
            case Module.uno.com.sun.star.uno.TypeClass.HYPER:
            case Module.uno.com.sun.star.uno.TypeClass.UNSIGNED_HYPER:
                return 0n;
            case Module.uno.com.sun.star.uno.TypeClass.CHAR:
                return '\0';
            case Module.uno.com.sun.star.uno.TypeClass.STRING:
                return '';
            case Module.uno.com.sun.star.uno.TypeClass.TYPE:
                return Module.uno_Type.Void();
            case Module.uno.com.sun.star.uno.TypeClass.ANY:
                return undefined;
            case Module.uno.com.sun.star.uno.TypeClass.SEQUENCE:
                return [];
            case Module.uno.com.sun.star.uno.TypeClass.ENUM:
                {
                    const tdAny = getTypeDescriptionManager().getByHierarchicalName(
                        type.toString());
                    const td = Module.uno.com.sun.star.reflection.XEnumTypeDescription.query(
                        tdAny.get());
                    tdAny.delete();
                    const names = td.getEnumNames();
                    const first = names.get(0);
                    names.delete();
                    return Module['uno_Type_' + type.toString().replace(/\./g, '$')][first];
                }
            case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
                {
                    //TODO: Make val an instanceof the corresponding struct constructor function:
                    const tdAny = getTypeDescriptionManager().getByHierarchicalName(
                        type.toString());
                    const td = Module.uno.com.sun.star.reflection.XTypeDescription.query(
                        tdAny.get());
                    tdAny.delete();
                    const members = {};
                    computeMembers(td, members);
                    const val = {};
                    populate(val, [], members);
                    return val;
                }
            case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
                return null;
            default:
                throw new Error('bad member type ' + type);
            }
        }
        function TypeArgumentIndex(index) { this.index = index; };
        function computeMembers(type, obj) {
            const td = Module.uno.com.sun.star.reflection.XCompoundTypeDescription.query(type);
            const base = td.getBaseType();
            if (base !== null) {
                computeMembers(base, obj);
            }
            const types = td.getMemberTypes();
            const names = td.getMemberNames();
            for (let i = 0; i !== types.size(); ++i) {
                const memtype = types.get(i);
                let val;
                if (memtype.getTypeClass() === Module.uno.com.sun.star.uno.TypeClass.UNKNOWN) {
                    const paramName = memtype.getName();
                    const std = Module.uno.com.sun.star.reflection.XStructTypeDescription.query(
                        type);
                    const params = std.getTypeParameters();
                    let index = 0;
                    for (; index !== params.size(); ++index) {
                        if (params.get(index) === paramName) {
                            break;
                        }
                    }
                    params.delete();
                    val = new TypeArgumentIndex(index);
                } else {
                    val = defaultValue(translateTypeDescription(memtype));
                }
                obj[names.get(i)] = val;
            }
            types.delete();
            names.delete();
        };
        function populate(obj, types, members, values) {
            for (let i in members) {
                let val;
                if (values !== undefined && i in values) {
                    val = values[i];
                } else {
                    val = members[i];
                    if (val instanceof TypeArgumentIndex) {
                        val = defaultValue(types[val.index]);
                    }
                }
                obj[i] = val;
            }
        };
        function instantiationName(templateName, types) {
            let name = templateName + '<';
            for (let i = 0; i !== types.length; ++i) {
                if (i !== 0) {
                    name += ',';
                }
                name += types[i];
            }
            return name + '>';
        }
        function unoidlProxy(path, embindObject) {
            return new Proxy({}, {
                get(target, prop) {
                    if (!Object.hasOwn(target, prop)) {
                        const name = path + '.' + prop;
                        const tdm = getTypeDescriptionManager();
                        const tdAny = tdm.getByHierarchicalName(name);
                        const td = Module.uno.com.sun.star.reflection.XTypeDescription.query(
                            tdAny.get());
                        tdAny.delete();
                        switch (td.getTypeClass()) {
                        case Module.uno.com.sun.star.uno.TypeClass.ENUM:
                            target[prop] = embindObject[prop];
                            target[prop][Module.unoTagSymbol] = {kind: 'enum', type: name};
                            break;
                        case Module.uno.com.sun.star.uno.TypeClass.STRUCT:
                            {
                                const members = {};
                                computeMembers(td, members);
                                const params = Module.uno.com.sun.star.reflection
                                      .XStructTypeDescription.query(td).getTypeParameters();
                                const paramCount = params.size();
                                params.delete();
                                if (paramCount === 0) {
                                    target[prop] = function(values) {
                                        populate(this, [], members, values);
                                        this[Module.unoTagSymbol] = {
                                            kind: 'struct-instance', type: name};
                                    };
                                } else {
                                    target[prop] = function(types, values) {
                                        if (types.length !== paramCount) {
                                            throw new Error(
                                                'bad number of type arguments in call to ' + name +
                                                    ', expected ' + paramCount + ' vs. actual ' +
                                                    types.length);
                                        }
                                        populate(this, types, members, values);
                                        this[Module.unoTagSymbol] = {
                                            kind: 'struct-instance',
                                            type: instantiationName(name, types)};
                                    };
                                }
                                target[prop][Module.unoTagSymbol] = {kind: 'struct', type: name};
                                break;
                            }
                        case Module.uno.com.sun.star.uno.TypeClass.EXCEPTION:
                            {
                                const members = {};
                                computeMembers(td, members);
                                target[prop] = function(values) {
                                    populate(this, [], members, values);
                                    this[Module.unoTagSymbol] = {
                                        kind: 'exception-instance', type: name};
                                };
                                target[prop][Module.unoTagSymbol] = {kind: 'exception', type: name};
                                break;
                            }
                        case Module.uno.com.sun.star.uno.TypeClass.INTERFACE:
                            target[prop] = {[Module.unoTagSymbol]: {kind: 'interface', type: name}};
                            break;
                        case Module.uno.com.sun.star.uno.TypeClass.MODULE:
                            target[prop] = unoidlProxy(name, embindObject[prop]);
                            break;
                        case Module.uno.com.sun.star.uno.TypeClass.SINGLETON:
                            target[prop] = singleton(name);
                            break;
                        case Module.uno.com.sun.star.uno.TypeClass.SERVICE:
                            {
                                const std = Module.uno.com.sun.star.reflection
                                      .XServiceTypeDescription2.query(td);
                                if (std.isSingleInterfaceBased()) {
                                    target[prop] = service(name, std);
                                }
                                break;
                            }
                        case Module.uno.com.sun.star.uno.TypeClass.CONSTANTS:
                            target[prop] = embindObject[prop];
                            break;
                        }
                    }
                    return target[prop];
                }
            });
        };
        function Any(type, val) {
            this.type = type;
            this.val = val;
        };
        function throwUnoException(exception) {
            const {any, owning} = translateToAny(exception, Module.uno_Type.Any());
            const toDelete = [];
            if (owning) {
                toDelete.push(any);
            }
            Module.throwUnoException(any.getType(), any.get(), toDelete);
        };
        function catchUnoException(exception) {
            return translateFromAnyAndDelete(
                Module.catchUnoException(exception), Module.uno_Type.Any());
        };
        const uno = new Proxy({}, {
            get(target, prop) {
                if (!Object.hasOwn(target, prop)) {
                    const tdm = getTypeDescriptionManager();
                    const td = tdm.getByHierarchicalName(prop);
                    td.delete();
                    target[prop] = unoidlProxy(prop, Module.uno[prop]);
                }
                return target[prop];
            }
        });
        Module.jsuno = {
            type: {
                void: Module.uno_Type.Void(),
                boolean: Module.uno_Type.Boolean(),
                byte: Module.uno_Type.Byte(),
                short: Module.uno_Type.Short(),
                unsigned_short: Module.uno_Type.UnsignedShort(),
                long: Module.uno_Type.Long(),
                unsigned_long: Module.uno_Type.UnsignedLong(),
                hyper: Module.uno_Type.Hyper(),
                unsigned_hyper: Module.uno_Type.UnsignedHyper(),
                float: Module.uno_Type.Float(),
                double: Module.uno_Type.Double(),
                char: Module.uno_Type.Char(),
                string: Module.uno_Type.String(),
                type: Module.uno_Type.Type(),
                any: Module.uno_Type.Any(),
                sequence: Module.uno_Type.Sequence,
                enum(name) {
                    if (typeof name === 'function' && Object.hasOwn(name, Module.unoTagSymbol)
                        && name[Module.unoTagSymbol].kind === 'enum')
                    {
                        name = name[Module.unoTagSymbol].type;
                    }
                    return Module.uno_Type.Enum(name);
                },
                struct(name) {
                    if (typeof name === 'function' && Object.hasOwn(name, Module.unoTagSymbol)
                        && name[Module.unoTagSymbol].kind === 'struct')
                    {
                        name = name[Module.unoTagSymbol].type;
                    }
                    return Module.uno_Type.Struct(name);
                },
                exception(name) {
                    if (typeof name === 'function' && Object.hasOwn(name, Module.unoTagSymbol)
                        && name[Module.unoTagSymbol].kind === 'exception')
                    {
                        name = name[Module.unoTagSymbol].type;
                    }
                    return Module.uno_Type.Exception(name);
                },
                interface(name) {
                    if (typeof name === 'object' && Object.hasOwn(name, Module.unoTagSymbol)
                        && name[Module.unoTagSymbol].kind === 'interface')
                    {
                        name = name[Module.unoTagSymbol].type;
                    }
                    return Module.uno_Type.Interface(name);
                }
            },
            Any,
            fromAny: function(val) { return val instanceof Any ? val.val : val; },
            sameUnoObject: function(obj1, obj2) {
                return Module.sameUnoObject(
                    translateToEmbind(
                        obj1, Module.uno_Type.Interface('com.sun.star.uno.XInterface'), []),
                    translateToEmbind(
                        obj2, Module.uno_Type.Interface('com.sun.star.uno.XInterface'), []));
            },
            getUnoComponentContext: function() {
                return proxy(Module.getUnoComponentContext());
            },
            throwUnoException,
            catchUnoException,
            uno,
            unoObject: function(interfaces, obj) {
                const wrapper = {};
                const seen = {
                    'com.sun.star.lang.XTypeProvider': true, 'com.sun.star.uno.XInterface': true};
                function walk(td) {
                    const iname = td.getName();
                    if (!Object.hasOwn(seen, iname)) {
                        seen[iname] = true;
                        if (td.getTypeClass() !== Module.uno.com.sun.star.uno.TypeClass.INTERFACE) {
                            throw new Error('not a UNO interface type: ' + iname);
                        }
                        const itd = Module.uno.com.sun.star.reflection.XInterfaceTypeDescription2
                              .query(td);
                        const bases = itd.getBaseTypes();
                        for (let i = 0; i !== bases.size(); ++i) {
                            walk(bases.get(i));
                        }
                        bases.delete();
                        const mems = itd.getMembers();
                        for (let i = 0; i !== mems.size(); ++i) {
                            const atd = Module.uno.com.sun.star.reflection
                                  .XInterfaceAttributeTypeDescription.query(mems.get(i));
                            if (atd !== null) {
                                const aname = atd.getMemberName();
                                const type = translateTypeDescription(atd.getType());
                                wrapper['get' + aname] = function() {
                                    return translateToEmbind(
                                        obj['get' + aname].apply(obj), type, []);
                                };
                                if (!atd.isReadOnly()) {
                                    wrapper['set' + aname] = function() {
                                        obj['set' + aname].apply(
                                            obj, [translateFromEmbind(arguments[0], type)]);
                                    };
                                }
                            } else {
                                const mtd = Module.uno.com.sun.star.reflection
                                      .XInterfaceMethodTypeDescription.query(mems.get(i));
                                const mname = mtd.getMemberName();
                                const retType = translateTypeDescription(mtd.getReturnType());
                                const params = [];
                                const descrs = mtd.getParameters();
                                for (let j = 0; j !== descrs.size(); ++j) {
                                    const descr = descrs.get(j);
                                    params.push({
                                        type: translateTypeDescription(descr.getType()),
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
                                                arg.val = translateFromEmbind(
                                                    arguments[i].val, params[i].type);
                                            }
                                        } else {
                                            arg = translateFromEmbind(arguments[i], params[i].type);
                                        }
                                        args.push(arg);
                                    }
                                    const ret = translateToEmbind(
                                        obj[mname].apply(obj, args), retType, []);
                                    for (let i = 0; i !== params.length; ++i) {
                                        if (params[i].dirOut) {
                                            arguments[i].val = translateToEmbind(
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
                const tdm = getTypeDescriptionManager();
                const interfaceNames = [];
                interfaces.forEach((i) => {
                    let name = i;
                    if (typeof name === 'object' && Object.hasOwn(name, Module.unoTagSymbol)
                        && name[Module.unoTagSymbol].kind === 'interface')
                    {
                        name = name[Module.unoTagSymbol].type;
                    } else if (name instanceof Module.uno_Type
                               && (name.getTypeClass()
                                   === Module.uno.com.sun.star.uno.TypeClass.INTERFACE))
                    {
                        name = name.toString();
                    }
                    interfaceNames.push(name);
                    const td = tdm.getByHierarchicalName(name);
                    walk(Module.uno.com.sun.star.reflection.XTypeDescription.query(td.get()));
                    td.delete();
                })
                return proxy(Module.unoObject(interfaceNames, wrapper));
            }
        };
        resolve();
    };
    Module.jsuno_init$reject = reject;
});

Module.uno_init.then(function() { Module.jsuno_init$resolve(); });

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
