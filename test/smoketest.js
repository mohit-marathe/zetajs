/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

// Adapted test code from <https://git.libreoffice.org/core>
// unotest/source/embindtest/embindtest.js; requires a LibreOffice configured with --enable-dbgutil
// to have the org.libreoffice.embindtest UNOIDL entities available:

Module.addOnPostRun(function() {
    Module.initUno();
    const css = Module.uno.com.sun.star;
    const context = Module.jsuno.getUnoComponentContext();
    const test = Module.jsuno.singleton('org.libreoffice.embindtest.Test', context);
    {
        const v = test.getBoolean();
        console.assert(v === true);
        console.assert(test.isBoolean(true));
    }
    {
        const v = test.getByte();
        console.assert(v === -12);
        console.assert(test.isByte(-12));
    }
    {
        const v = test.getShort();
        console.assert(v === -1234);
        console.assert(test.isShort(-1234));
    }
    {
        const v = test.getUnsignedShort();
        console.assert(v === 54321);
        console.assert(test.isUnsignedShort(54321));
    }
    {
        const v = test.getLong();
        console.assert(v === -123456);
        console.assert(test.isLong(-123456));
    }
    {
        const v = test.getUnsignedLong();
        console.assert(v === 3456789012);
        console.assert(test.isUnsignedLong(3456789012));
    }
    {
        const v = test.getHyper();
        console.assert(v === -123456789n);
        console.assert(test.isHyper(-123456789n));
    }
    {
        const v = test.getUnsignedHyper();
        console.assert(v === 9876543210n);
        console.assert(test.isUnsignedHyper(9876543210n));
    }
    {
        const v = test.getFloat();
        console.assert(v === -10.25);
        console.assert(test.isFloat(-10.25));
    }
    {
        const v = test.getDouble();
        console.assert(v === 100.5);
        console.assert(test.isDouble(100.5));
    }
    {
        const v = test.getChar();
        console.assert(v === 'Ö');
        console.assert(test.isChar('Ö'));
    }
    {
        const v = test.getString();
        console.assert(v === 'hä');
        console.assert(test.isString('hä'));
    }
    {
        const v = test.getType();
        console.assert(v.toString() === 'long');
        console.assert(test.isType(v));
        console.assert(test.isType(Module.uno_Type.Long()));
    }
    {
        const v = test.getEnum();
        console.assert(v === Module.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(test.isEnum(Module.uno.org.libreoffice.embindtest.Enum.E_2));
    }
    {
        const v = test.getStruct();
        console.assert(v.m1 === -123456);
        console.assert(v.m2 === 100.5);
        console.assert(v.m3 === 'hä');
        console.assert(test.isStruct({m1: -123456, m2: 100.5, m3: 'hä'}));
    }
    {
        const v = test.getAnyVoid();
        console.assert(v.val === undefined);
        console.assert(test.isAnyVoid(v));
        console.assert(test.isAnyVoid(undefined));
    }
    {
        const v = test.getAnyBoolean();
        console.assert(v.val === true);
        console.assert(test.isAnyBoolean(v));
        console.assert(test.isAnyBoolean(true));
    }
    {
        const v = test.getAnyByte();
        console.assert(v.val === -12);
        console.assert(test.isAnyByte(v));
        console.assert(test.isAnyByte(new Module.jsuno.Any(Module.uno_Type.Byte(), -12)));
    }
    {
        const v = test.getAnyShort();
        console.assert(v.val === -1234);
        console.assert(test.isAnyShort(v));
        console.assert(test.isAnyShort(new Module.jsuno.Any(Module.uno_Type.Short(), -1234)));
    }
    {
        const v = test.getAnyUnsignedShort();
        console.assert(v.val === 54321);
        console.assert(test.isAnyUnsignedShort(v));
        console.assert(test.isAnyUnsignedShort(
            new Module.jsuno.Any(Module.uno_Type.UnsignedShort(), 54321)));
    }
    {
        const v = test.getAnyLong();
        console.assert(v.val === -123456);
        console.assert(test.isAnyLong(v));
        console.assert(test.isAnyLong(-123456));
    }
    {
        const v = test.getAnyUnsignedLong();
        console.assert(v.val === 3456789012);
        console.assert(test.isAnyUnsignedLong(v));
        console.assert(test.isAnyUnsignedLong(3456789012));
    }
    {
        const v = test.getAnyHyper();
        console.assert(v.val === -123456789n);
        console.assert(test.isAnyHyper(v));
        console.assert(test.isAnyHyper(-123456789n));
    }
    {
        const v = test.getAnyUnsignedHyper();
        console.assert(v.val === 9876543210n);
        console.assert(test.isAnyUnsignedHyper(v));
        console.assert(test.isAnyUnsignedHyper(
            new Module.jsuno.Any(Module.uno_Type.UnsignedHyper(), 9876543210n)));
    }
    {
        const v = test.getAnyFloat();
        console.assert(v.val === -10.25);
        console.assert(test.isAnyFloat(v));
        console.assert(test.isAnyFloat(new Module.jsuno.Any(Module.uno_Type.Float(), -10.25)));
    }
    {
        const v = test.getAnyDouble();
        console.assert(v.val === 100.5);
        console.assert(test.isAnyDouble(v));
        console.assert(test.isAnyDouble(100.5));
    }
    {
        const v = test.getAnyChar();
        console.assert(v.val === 'Ö');
        console.assert(test.isAnyChar(v));
        console.assert(test.isAnyChar(new Module.jsuno.Any(Module.uno_Type.Char(), 'Ö')));
    }
    {
        const v = test.getAnyString();
        console.assert(v.val === 'hä');
        console.assert(test.isAnyString(v));
        console.assert(test.isAnyString('hä'));
    }
    {
        const v = test.getAnyType();
        console.assert(v.val.toString() === 'long');
        console.assert(test.isAnyType(v));
        console.assert(test.isAnyType(Module.uno_Type.Long()));
    }
    {
        const v = test.getAnySequence();
        console.assert(v.val.length === 3);
        console.assert(v.val[0] === 'foo');
        console.assert(v.val[1] === 'barr');
        console.assert(v.val[2] === 'bazzz');
        console.assert(test.isAnySequence(v));
        const s = new Module.uno_Sequence_string(["foo", "barr", "bazzz"]);
        const a = new Module.uno_Any(Module.uno_Type.Sequence(Module.uno_Type.String()), s);
        console.assert(test.isAnySequence(a));
        a.delete();
        console.assert(test.isAnySequence(
            new Module.jsuno.Any(Module.uno_Type.Sequence(Module.uno_Type.String()), s)));
        s.delete();
        console.assert(test.isAnySequence(
            new Module.jsuno.Any(
                Module.uno_Type.Sequence(Module.uno_Type.String()), ["foo", "barr", "bazzz"])));
    }
    {
        const v = test.getAnyEnum();
        console.assert(v.val === Module.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(test.isAnyEnum(v));
        console.assert(test.isAnyEnum(
            new Module.jsuno.Any(
                Module.uno_Type.Enum('org.libreoffice.embindtest.Enum'),
                Module.uno.org.libreoffice.embindtest.Enum.E_2)));
        //TODO: console.assert(test.isAnyEnum(Module.uno.org.libreoffice.embindtest.Enum.E_2));
    }
    {
        const v = test.getAnyStruct();
        console.assert(v.val.m1 === -123456);
        console.assert(v.val.m2 === 100.5);
        console.assert(v.val.m3 === 'hä');
        console.assert(test.isAnyStruct(v));
        console.assert(test.isAnyStruct(
            new Module.jsuno.Any(
                Module.uno_Type.Struct('org.libreoffice.embindtest.Struct'),
                {m1: -123456, m2: 100.5, m3: 'hä'})));
    }
    {
        const v = test.getAnyException();
        console.assert(v.val.Message.startsWith('error'));
        console.assert(v.val.Context === null);
        console.assert(v.val.m1 === -123456);
        console.assert(v.val.m2 === 100.5);
        console.assert(v.val.m3 === 'hä');
        console.assert(test.isAnyException(v));
        console.assert(test.isAnyException(
            new Module.jsuno.Any(
                Module.uno_Type.Exception('org.libreoffice.embindtest.Exception'),
                {Message: 'error', Context: null, m1: -123456, m2: 100.5, m3: 'hä'})));
    }
    {
        const v = test.getAnyInterface();
        console.assert(Module.sameUnoObject(v.val, test));
        console.assert(test.isAnyInterface(v));
        console.assert(test.isAnyInterface(
            new Module.jsuno.Any(
                Module.uno_Type.Interface('org.libreoffice.embindtest.XTest'), test)));
    }
    {
        const v = test.getSequenceBoolean();
        console.assert(v.length === 3);
        console.assert(v[0] === true);
        console.assert(v[1] === true);
        console.assert(v[2] === false);
        console.assert(test.isSequenceBoolean(v));
    }
    {
        const v = test.getSequenceByte();
        console.assert(v.length === 3);
        console.assert(v[0] === -12);
        console.assert(v[1] === 1);
        console.assert(v[2] === 12);
        console.assert(test.isSequenceByte(v));
    }
    {
        const v = test.getSequenceShort();
        console.assert(v.length === 3);
        console.assert(v[0] === -1234);
        console.assert(v[1] === 1);
        console.assert(v[2] === 1234);
        console.assert(test.isSequenceShort(v));
    }
    {
        const v = test.getSequenceUnsignedShort();
        console.assert(v.length === 3);
        console.assert(v[0] === 1);
        console.assert(v[1] === 10);
        console.assert(v[2] === 54321);
        console.assert(test.isSequenceUnsignedShort(v));
    }
    {
        const v = test.getSequenceLong();
        console.assert(v.length === 3);
        console.assert(v[0] === -123456);
        console.assert(v[1] === 1);
        console.assert(v[2] === 123456);
        console.assert(test.isSequenceLong(v));
    }
    {
        const v = test.getSequenceUnsignedLong();
        console.assert(v.length === 3);
        console.assert(v[0] === 1);
        console.assert(v[1] === 10);
        console.assert(v[2] === 3456789012);
        console.assert(test.isSequenceUnsignedLong(v));
    }
    {
        const v = test.getSequenceHyper();
        console.assert(v.length === 3);
        console.assert(v[0] === -123456789n);
        console.assert(v[1] === 1n);
        console.assert(v[2] === 123456789n);
        console.assert(test.isSequenceHyper(v));
    }
    {
        const v = test.getSequenceUnsignedHyper();
        console.assert(v.length === 3);
        console.assert(v[0] === 1n);
        console.assert(v[1] === 10n);
        console.assert(v[2] === 9876543210n);
        console.assert(test.isSequenceUnsignedHyper(v));
    }
    {
        const v = test.getSequenceFloat();
        console.assert(v.length === 3);
        console.assert(v[0] === -10.25);
        console.assert(v[1] === 1.5);
        console.assert(v[2] === 10.75);
        console.assert(test.isSequenceFloat(v));
    }
    {
        const v = test.getSequenceDouble();
        console.assert(v.length === 3);
        console.assert(v[0] === -100.5);
        console.assert(v[1] === 1.25);
        console.assert(v[2] === 100.75);
        console.assert(test.isSequenceDouble(v));
    }
    {
        const v = test.getSequenceChar();
        console.assert(v.length === 3);
        console.assert(v[0] === 'a');
        console.assert(v[1] === 'B');
        console.assert(v[2] === 'Ö');
        console.assert(test.isSequenceChar(v));
    }
    {
        const v = test.getSequenceString();
        console.assert(v.length === 3);
        console.assert(v[0] === 'foo');
        console.assert(v[1] === 'barr');
        console.assert(v[2] === 'bazzz');
        console.assert(test.isSequenceString(v));
    }
    {
        const v = test.getSequenceType();
        console.assert(v.length === 3);
        console.assert(v[0].toString() === 'long');
        console.assert(v[1].toString() === 'void');
        console.assert(v[2].toString() === '[]org.libreoffice.embindtest.Enum');
        console.assert(test.isSequenceType(v));
        const s = new Module.uno_Sequence_type([
            Module.uno_Type.Long(), Module.uno_Type.Void(),
            Module.uno_Type.Sequence(Module.uno_Type.Enum('org.libreoffice.embindtest.Enum'))]);
        console.assert(test.isSequenceType(s));
        s.delete();
        console.assert(test.isSequenceType([
            Module.uno_Type.Long(), Module.uno_Type.Void(),
            Module.uno_Type.Sequence(Module.uno_Type.Enum('org.libreoffice.embindtest.Enum'))]));
    }
    {
        const v = test.getSequenceAny();
        console.assert(v.length === 3);
        console.assert(v[0].val === -123456);
        console.assert(v[1].val === undefined);
        console.assert(v[2].val.length === 3);
        console.assert(v[2].val[0] === Module.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v[2].val[1] === Module.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(v[2].val[2] === Module.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(test.isSequenceAny(v));
    }
    {
        const v = test.getSequenceSequenceString();
        console.assert(v.length === 3);
        console.assert(v[0].length === 0);
        console.assert(v[1].length === 2);
        console.assert(v[1][0] === 'foo');
        console.assert(v[1][1] === 'barr');
        console.assert(v[2].length === 1);
        console.assert(v[2][0] === 'baz');
        console.assert(test.isSequenceSequenceString(v));
    }
    {
        const v = test.getSequenceEnum();
        console.assert(v.length === 3);
        console.assert(v[0] === Module.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v[1] === Module.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(v[2] === Module.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(test.isSequenceEnum(v));
    }
    {
        const v = test.getSequenceStruct();
        console.assert(v.length === 3);
        console.assert(v[0].m1 === -123456);
        console.assert(v[0].m2 === -100.5);
        console.assert(v[0].m3 === 'foo');
        console.assert(v[1].m1 === 1);
        console.assert(v[1].m2 === 1.25);
        console.assert(v[1].m3 === 'barr');
        console.assert(v[2].m1 === 123456);
        console.assert(v[2].m2 === 100.75);
        console.assert(v[2].m3 === 'bazzz');
        console.assert(test.isSequenceStruct(v));
    }
    {
        const v = test.getNull();
        console.assert(v === null);
        console.assert(test.isNull(v));
    }
    {
        const v = css.task.XJob.query(test);
        console.assert(v === null);
    }
    {
        const v1 = {};
        const v2 = {};
        const v3 = {};
        const v4 = {};
        const v5 = {};
        const v6 = {};
        const v7 = {};
        const v8 = {};
        const v9 = {};
        const v10 = {};
        const v11 = {};
        const v12 = {};
        const v13 = {};
        const v14 = {};
        const v15 = {};
        const v16 = {};
        const v17 = {};
        const v18 = {};
        test.getOut(
            v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18);
        console.assert(v1.val === true);
        console.assert(v2.val === -12);
        console.assert(v3.val === -1234);
        console.assert(v4.val === 54321);
        console.assert(v5.val === -123456);
        console.assert(v6.val === 3456789012);
        console.assert(v7.val === -123456789n);
        console.assert(v8.val === 9876543210n);
        console.assert(v9.val === -10.25);
        console.assert(v10.val === 100.5);
        console.assert(v11.val === 'Ö');
        console.assert(v12.val === 'hä');
        console.assert(v13.val.toString() === 'long');
        console.assert(v14.val.val === -123456)
        console.assert(v15.val.length === 3);
        console.assert(v15.val[0] === 'foo');
        console.assert(v15.val[1] === 'barr');
        console.assert(v15.val[2] === 'bazzz');
        console.assert(v16.val === Module.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v17.val.m1 === -123456);
        console.assert(v17.val.m2 === 100.5);
        console.assert(v17.val.m3 === 'hä');
        console.assert(Module.sameUnoObject(v18.val, test));
    }
    {
        const v1 = new Module.uno_InOutParam_boolean;
        const v2 = new Module.uno_InOutParam_byte;
        const v3 = new Module.uno_InOutParam_short;
        const v4 = new Module.uno_InOutParam_unsigned_short;
        const v5 = new Module.uno_InOutParam_long;
        const v6 = new Module.uno_InOutParam_unsigned_long;
        const v7 = new Module.uno_InOutParam_hyper;
        const v8 = new Module.uno_InOutParam_unsigned_hyper;
        const v9 = new Module.uno_InOutParam_float;
        const v10 = new Module.uno_InOutParam_double;
        const v11 = new Module.uno_InOutParam_char;
        const v12 = new Module.uno_InOutParam_string;
        const v13 = new Module.uno_InOutParam_type;
        const v14 = new Module.uno_InOutParam_any;
        const v15 = new Module.uno_InOutParam_sequence_string;
        const v16 = new Module.uno_InOutParam_org$libreoffice$embindtest$Enum;
        const v17 = new Module.uno_InOutParam_org$libreoffice$embindtest$Struct;
        const v18 = new Module.uno_InOutParam_org$libreoffice$embindtest$XTest;
        test.getOut(
            v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16, v17, v18);
        console.assert(v1.val === 1); //TODO: true
        console.assert(v2.val === -12);
        console.assert(v3.val === -1234);
        console.assert(v4.val === 54321);
        console.assert(v5.val === -123456);
        console.assert(v6.val === 3456789012);
        console.assert(v7.val === -123456789n);
        console.assert(v8.val === 9876543210n);
        console.assert(v9.val === -10.25);
        console.assert(v10.val === 100.5);
        console.assert(v11.val === 'Ö');
        console.assert(v12.val === 'hä');
        console.assert(v13.val.toString() === 'long');
        console.assert(v14.val.get() === -123456)
        console.assert(v15.val.size() === 3);
        console.assert(v15.val.get(0) === 'foo');
        console.assert(v15.val.get(1) === 'barr');
        console.assert(v15.val.get(2) === 'bazzz');
        console.assert(v16.val === Module.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v17.val.m1 === -123456);
        console.assert(v17.val.m2 === 100.5);
        console.assert(v17.val.m3 === 'hä');
        console.assert(Module.sameUnoObject(v18.val, test));
        v1.delete();
        v2.delete();
        v3.delete();
        v4.delete();
        v5.delete();
        v6.delete();
        v7.delete();
        v8.delete();
        v9.delete();
        v10.delete();
        v11.delete();
        v12.delete();
        v13.delete();
        v14.val.delete();
        v14.delete();
        v15.val.delete();
        v15.delete();
        v16.delete();
        v17.delete();
        v18.delete();
    }
    try {
        test.throwRuntimeException();
        console.assert(false);
    } catch (e) {
        const exc = Module.jsuno.catchUnoException(e);
        console.assert(exc.type == 'com.sun.star.uno.RuntimeException');
        console.assert(exc.val.Message.startsWith('test'));
    }
    test.StringAttribute = 'hä';
    console.assert(test.StringAttribute === 'hä');
    try {
        Module.jsuno.singleton('unknown', context);
        console.assert(false);
    } catch (e) {
        const exc = Module.jsuno.catchUnoException(e);
        console.assert(exc.type == 'com.sun.star.uno.DeploymentException');
        console.assert(exc.val.Message.startsWith('cannot get singeleton unknown'));
    }
    try {
        Module.jsuno.service('com.sun.star.reflection.CoreReflection');
        console.assert(false);
    } catch (e) {
        const exc = Module.jsuno.catchUnoException(e);
        console.assert(exc.type == 'com.sun.star.uno.DeploymentException');
        console.assert(
            exc.val.Message.startsWith(
                'unknown single-interface service com.sun.star.reflection.CoreReflection'));
    }
    {
        const urifac = Module.jsuno.service('com.sun.star.uri.UriReferenceFactory').create(context);
        //...
    }
    {
        const propbag = Module.jsuno.service('com.sun.star.beans.PropertyBag').createWithTypes(
            context, [Module.uno_Type.Boolean(), Module.uno_Type.Long()], false, false);
        //...
    }

    const obj = Module.jsuno.unoObject(
        ['com.sun.star.task.XJob', 'com.sun.star.task.XJobExecutor'],
        {
            execute(args) {
                if (args.length !== 1 || args[0].Name !== 'name') {
                    Module.throwUnoException(
                        Module.uno_Type.Exception('com.sun.star.lang.IllegalArgumentException'),
                        {Message: 'bad args', Context: null, ArgumentPosition: 0});
                }
                console.log('Hello ' + args[0].Value.val);
                return new Module.jsuno.Any(Module.uno_Type.Void());
            },
            trigger(event) { console.log('Ola ' + event); }
        });
    test.passJob(obj);
    test.passJobExecutor(obj);
    test.passInterface(obj);
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
