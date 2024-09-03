/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4; fill-column: 100 -*- */

'use strict';

// Adapted test code from <https://git.libreoffice.org/core>
// unotest/source/embindtest/embindtest.js; requires a LibreOffice configured with --enable-dbgutil
// to have the org.libreoffice.embindtest UNOIDL entities available:

Module.jsuno.then(function(jsuno) {
    const css = jsuno.uno.com.sun.star;
    const context = jsuno.getUnoComponentContext();
    const test = jsuno.uno.org.libreoffice.embindtest.Test.create(context);
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
        console.assert(test.isType(jsuno.type.long));
    }
    {
        const v = test.getEnum();
        console.assert(v === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(test.isEnum(jsuno.uno.org.libreoffice.embindtest.Enum.E_2));
    }
    {
        const v = test.getStruct();
        console.assert(v.m1 === true);
        console.assert(v.m2 === -12);
        console.assert(v.m3 === -1234);
        console.assert(v.m4 === 54321);
        console.assert(v.m5 === -123456);
        console.assert(v.m6 === 3456789012);
        console.assert(v.m7 === -123456789n);
        console.assert(v.m8 === 9876543210n);
        console.assert(v.m9 === -10.25);
        console.assert(v.m10 === 100.5);
        console.assert(v.m11 === 'Ö');
        console.assert(v.m12 === 'hä');
        console.assert(v.m13.toString() === 'long');
        console.assert(jsuno.fromAny(v.m14) === -123456);
        console.assert(v.m15.length === 3);
        console.assert(v.m15[0] === 'foo');
        console.assert(v.m15[1] === 'barr');
        console.assert(v.m15[2] === 'bazzz');
        console.assert(v.m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v.m17.m === -123456);
        console.assert(v.m18.m1.m === 'foo');
        console.assert(v.m18.m2 === -123456);
        console.assert(jsuno.fromAny(v.m18.m3) === -123456);
        console.assert(v.m18.m4.m === 'barr');
        console.assert(jsuno.sameUnoObject(v.m19, test));
        console.assert(
            test.isStruct({
                m1: true, m2: -12, m3: -1234, m4: 54321, m5: -123456, m6: 3456789012,
                m7: -123456789n, m8: 9876543210n, m9: -10.25, m10: 100.5, m11: 'Ö', m12: 'hä',
                m13: jsuno.type.long, m14: -123456, m15: ['foo', 'barr', 'bazzz'],
                m16: jsuno.uno.org.libreoffice.embindtest.Enum.E_2, m17: {m: -123456},
                m18: {m1: {m: 'foo'}, m2: -123456, m3: -123456, m4: {m: 'barr'}}, m19: test}));
        console.assert(
            test.isStruct(new jsuno.uno.org.libreoffice.embindtest.Struct({
                m1: true, m2: -12, m3: -1234, m4: 54321, m5: -123456, m6: 3456789012,
                m7: -123456789n, m8: 9876543210n, m9: -10.25, m10: 100.5, m11: 'Ö', m12: 'hä',
                m13: jsuno.type.long, m14: -123456, m15: ['foo', 'barr', 'bazzz'],
                m16: jsuno.uno.org.libreoffice.embindtest.Enum.E_2,
                m17: new jsuno.uno.org.libreoffice.embindtest.StructLong({m: -123456}),
                m18: new jsuno.uno.org.libreoffice.embindtest.Template(
                    [jsuno.type.any,
                     jsuno.type.struct(
                         jsuno.uno.org.libreoffice.embindtest.StructString)],
                    {m1: new jsuno.uno.org.libreoffice.embindtest.StructString({m: 'foo'}),
                     m2: -123456, m3: -123456,
                     m4: new jsuno.uno.org.libreoffice.embindtest.StructString({m: 'barr'})}),
                m19: test})));
        const def = new jsuno.uno.org.libreoffice.embindtest.Struct();
        console.assert(def.m1 === false);
        console.assert(def.m2 === 0);
        console.assert(def.m3 === 0);
        console.assert(def.m4 === 0);
        console.assert(def.m5 === 0);
        console.assert(def.m6 === 0);
        console.assert(def.m7 === 0n);
        console.assert(def.m8 === 0n);
        console.assert(def.m9 === 0);
        console.assert(def.m10 === 0);
        console.assert(def.m11 === '\0');
        console.assert(def.m12 === '');
        console.assert(def.m13.toString() === 'void');
        console.assert(jsuno.fromAny(def.m14) === undefined);
        console.assert(def.m15.length === 0);
        console.assert(def.m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(def.m17.m === 0);
        console.assert(def.m18.m1.m === '');
        console.assert(def.m18.m2 === 0);
        console.assert(jsuno.fromAny(def.m18.m3) === undefined);
        console.assert(def.m18.m4.m === '');
        console.assert(def.m19 === null);
    }
    {
        const v = test.getTemplate();
        console.assert(v.m1.m === 'foo');
        console.assert(v.m2 === -123456);
        console.assert(jsuno.fromAny(v.m3) === -123456);
        console.assert(v.m4.m === 'barr');
        console.assert(
            test.isTemplate(
                new jsuno.uno.org.libreoffice.embindtest.Template(
                    [jsuno.type.any,
                     jsuno.type.struct(jsuno.uno.org.libreoffice.embindtest.StructString)],
                    {m1: new jsuno.uno.org.libreoffice.embindtest.StructString({m: 'foo'}),
                     m2: -123456, m3: -123456,
                     m4: new jsuno.uno.org.libreoffice.embindtest.StructString({m: 'barr'})})));
        const def = new jsuno.uno.org.libreoffice.embindtest.Template(
            [jsuno.type.any, jsuno.type.struct(jsuno.uno.org.libreoffice.embindtest.StructString)]);
        console.assert(def.m1.m === '');
        console.assert(def.m2 === 0);
        console.assert(jsuno.fromAny(def.m3) === undefined);
        console.assert(def.m4.m === '');
    }
    {
        const v = test.getAnyVoid();
        console.assert(jsuno.fromAny(v) === undefined);
        console.assert(test.isAnyVoid(v));
        console.assert(test.isAnyVoid(undefined));
    }
    {
        const v = test.getAnyBoolean();
        console.assert(jsuno.fromAny(v) === true);
        console.assert(test.isAnyBoolean(v));
        console.assert(test.isAnyBoolean(true));
    }
    {
        const v = test.getAnyByte();
        console.assert(jsuno.fromAny(v) === -12);
        console.assert(test.isAnyByte(v));
        console.assert(test.isAnyByte(new jsuno.Any(jsuno.type.byte, -12)));
    }
    {
        const v = test.getAnyShort();
        console.assert(jsuno.fromAny(v) === -1234);
        console.assert(test.isAnyShort(v));
        console.assert(test.isAnyShort(new jsuno.Any(jsuno.type.short, -1234)));
    }
    {
        const v = test.getAnyUnsignedShort();
        console.assert(jsuno.fromAny(v) === 54321);
        console.assert(test.isAnyUnsignedShort(v));
        console.assert(test.isAnyUnsignedShort(new jsuno.Any(jsuno.type.unsigned_short, 54321)));
    }
    {
        const v = test.getAnyLong();
        console.assert(jsuno.fromAny(v) === -123456);
        console.assert(test.isAnyLong(v));
        console.assert(test.isAnyLong(-123456));
    }
    {
        const v = test.getAnyUnsignedLong();
        console.assert(jsuno.fromAny(v) === 3456789012);
        console.assert(test.isAnyUnsignedLong(v));
        console.assert(test.isAnyUnsignedLong(3456789012));
    }
    {
        const v = test.getAnyHyper();
        console.assert(jsuno.fromAny(v) === -123456789n);
        console.assert(test.isAnyHyper(v));
        console.assert(test.isAnyHyper(-123456789n));
    }
    {
        const v = test.getAnyUnsignedHyper();
        console.assert(jsuno.fromAny(v) === 9876543210n);
        console.assert(test.isAnyUnsignedHyper(v));
        console.assert(test.isAnyUnsignedHyper(
            new jsuno.Any(jsuno.type.unsigned_hyper, 9876543210n)));
    }
    {
        const v = test.getAnyFloat();
        console.assert(jsuno.fromAny(v) === -10.25);
        console.assert(test.isAnyFloat(v));
        console.assert(test.isAnyFloat(new jsuno.Any(jsuno.type.float, -10.25)));
    }
    {
        const v = test.getAnyDouble();
        console.assert(jsuno.fromAny(v) === 100.5);
        console.assert(test.isAnyDouble(v));
        console.assert(test.isAnyDouble(100.5));
    }
    {
        const v = test.getAnyChar();
        console.assert(jsuno.fromAny(v) === 'Ö');
        console.assert(test.isAnyChar(v));
        console.assert(test.isAnyChar(new jsuno.Any(jsuno.type.char, 'Ö')));
    }
    {
        const v = test.getAnyString();
        console.assert(jsuno.fromAny(v) === 'hä');
        console.assert(test.isAnyString(v));
        console.assert(test.isAnyString('hä'));
    }
    {
        const v = test.getAnyType();
        console.assert(jsuno.fromAny(v).toString() === 'long');
        console.assert(test.isAnyType(v));
        console.assert(test.isAnyType(jsuno.type.long));
    }
    {
        const v = test.getAnySequence();
        console.assert(jsuno.fromAny(v).length === 3);
        console.assert(jsuno.fromAny(v)[0] === 'foo');
        console.assert(jsuno.fromAny(v)[1] === 'barr');
        console.assert(jsuno.fromAny(v)[2] === 'bazzz');
        console.assert(test.isAnySequence(v));
        const s = new Module.uno_Sequence_string(["foo", "barr", "bazzz"]);
        const strType = Module.uno_Type.String();
        const seqType = Module.uno_Type.Sequence(strType);
        strType.delete();
        const a = new Module.uno_Any(seqType, s);
        seqType.delete();
        console.assert(test.isAnySequence(a));
        a.delete();
        console.assert(test.isAnySequence(
            new jsuno.Any(jsuno.type.sequence(jsuno.type.string), s)));
        s.delete();
        console.assert(test.isAnySequence(
            new jsuno.Any(jsuno.type.sequence(jsuno.type.string), ["foo", "barr", "bazzz"])));
    }
    {
        const v = test.getAnyEnum();
        console.assert(jsuno.fromAny(v) === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(test.isAnyEnum(v));
        console.assert(test.isAnyEnum(jsuno.uno.org.libreoffice.embindtest.Enum.E_2));
    }
    {
        const v = test.getAnyStruct();
        console.assert(jsuno.fromAny(v).m1 === true);
        console.assert(jsuno.fromAny(v).m2 === -12);
        console.assert(jsuno.fromAny(v).m3 === -1234);
        console.assert(jsuno.fromAny(v).m4 === 54321);
        console.assert(jsuno.fromAny(v).m5 === -123456);
        console.assert(jsuno.fromAny(v).m6 === 3456789012);
        console.assert(jsuno.fromAny(v).m7 === -123456789n);
        console.assert(jsuno.fromAny(v).m8 === 9876543210n);
        console.assert(jsuno.fromAny(v).m9 === -10.25);
        console.assert(jsuno.fromAny(v).m10 === 100.5);
        console.assert(jsuno.fromAny(v).m11 === 'Ö');
        console.assert(jsuno.fromAny(v).m12 === 'hä');
        console.assert(jsuno.fromAny(v).m13.toString() === 'long');
        console.assert(jsuno.fromAny(jsuno.fromAny(v).m14) === -123456);
        console.assert(jsuno.fromAny(v).m15.length === 3);
        console.assert(jsuno.fromAny(v).m15[0] === 'foo');
        console.assert(jsuno.fromAny(v).m15[1] === 'barr');
        console.assert(jsuno.fromAny(v).m15[2] === 'bazzz');
        console.assert(jsuno.fromAny(v).m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(jsuno.fromAny(v).m17.m === -123456);
        console.assert(jsuno.fromAny(v).m18.m1.m === 'foo');
        console.assert(jsuno.fromAny(v).m18.m2 === -123456);
        console.assert(jsuno.fromAny(jsuno.fromAny(v).m18.m3) === -123456);
        console.assert(jsuno.fromAny(v).m18.m4.m === 'barr');
        console.assert(jsuno.sameUnoObject(jsuno.fromAny(v).m19, test));
        console.assert(test.isAnyStruct(v));
        console.assert(test.isAnyStruct(
            new jsuno.uno.org.libreoffice.embindtest.Struct(
                {m1: true, m2: -12, m3: -1234, m4: 54321, m5: -123456, m6: 3456789012,
                 m7: -123456789n, m8: 9876543210n, m9: -10.25, m10: 100.5, m11: 'Ö', m12: 'hä',
                 m13: jsuno.type.long, m14: -123456, m15: ['foo', 'barr', 'bazzz'],
                 m16: jsuno.uno.org.libreoffice.embindtest.Enum.E_2,
                 m17: new jsuno.uno.org.libreoffice.embindtest.StructLong({m: -123456}),
                 m18: {
                     m1: new jsuno.uno.org.libreoffice.embindtest.StructString({m: 'foo'}),
                     m2: -123456, m3: -123456,
                     m4: new jsuno.uno.org.libreoffice.embindtest.StructString({m: 'barr'})},
                 m19: test})));
    }
    {
        const v = test.getAnyException();
        console.assert(jsuno.fromAny(v).Message.startsWith('error'));
        console.assert(jsuno.fromAny(v).Context === null);
        console.assert(jsuno.fromAny(v).m1 === -123456);
        console.assert(jsuno.fromAny(v).m2 === 100.5);
        console.assert(jsuno.fromAny(v).m3 === 'hä');
        console.assert(test.isAnyException(v));
        console.assert(test.isAnyException(
            new jsuno.uno.org.libreoffice.embindtest.Exception(
                {Message: 'error', m1: -123456, m2: 100.5, m3: 'hä'})));
    }
    {
        const v = test.getAnyInterface();
        console.assert(jsuno.sameUnoObject(jsuno.fromAny(v), test));
        console.assert(test.isAnyInterface(v));
        console.assert(test.isAnyInterface(
            new jsuno.Any(jsuno.type.interface(jsuno.uno.org.libreoffice.embindtest.XTest), test)));
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
            jsuno.type.long, jsuno.type.void,
            jsuno.type.sequence(jsuno.type.enum(jsuno.uno.org.libreoffice.embindtest.Enum))]);
        console.assert(test.isSequenceType(s));
        s.delete();
        console.assert(test.isSequenceType([
            jsuno.type.long, jsuno.type.void,
            jsuno.type.sequence(jsuno.type.enum(jsuno.uno.org.libreoffice.embindtest.Enum))]));
    }
    {
        const v = test.getSequenceAny();
        console.assert(v.length === 3);
        console.assert(jsuno.fromAny(v[0]) === -123456);
        console.assert(jsuno.fromAny(v[1]) === undefined);
        console.assert(jsuno.fromAny(v[2]).length === 3);
        console.assert(jsuno.fromAny(v[2])[0] === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(jsuno.fromAny(v[2])[1] === jsuno.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(jsuno.fromAny(v[2])[2] === jsuno.uno.org.libreoffice.embindtest.Enum.E_10);
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
        console.assert(v[0] === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v[1] === jsuno.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(v[2] === jsuno.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(test.isSequenceEnum(v));
    }
    {
        const v = test.getSequenceStruct();
        console.assert(v.length === 3);
        console.assert(v[0].m1 === true);
        console.assert(v[0].m2 === -12);
        console.assert(v[0].m3 === -1234);
        console.assert(v[0].m4 === 1);
        console.assert(v[0].m5 === -123456);
        console.assert(v[0].m6 === 1);
        console.assert(v[0].m7 === -123456789n);
        console.assert(v[0].m8 === 1n);
        console.assert(v[0].m9 === -10.25);
        console.assert(v[0].m10 === -100.5);
        console.assert(v[0].m11 === 'a');
        console.assert(v[0].m12 === 'hä');
        console.assert(v[0].m13.toString() === 'long');
        console.assert(jsuno.fromAny(v[0].m14) === -123456);
        console.assert(v[0].m15.length === 0);
        console.assert(v[0].m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v[0].m17.m === -123456);
        console.assert(v[0].m18.m1.m === 'foo');
        console.assert(v[0].m18.m2 === -123456);
        console.assert(jsuno.fromAny(v[0].m18.m3) === -123456);
        console.assert(v[0].m18.m4.m === 'barr');
        console.assert(jsuno.sameUnoObject(v[0].m19, test));
        console.assert(v[1].m1 === true);
        console.assert(v[1].m2 === 1);
        console.assert(v[1].m3 === 1);
        console.assert(v[1].m4 === 10);
        console.assert(v[1].m5 === 1);
        console.assert(v[1].m6 === 10);
        console.assert(v[1].m7 === 1n);
        console.assert(v[1].m8 === 10n);
        console.assert(v[1].m9 === 1.5);
        console.assert(v[1].m10 === 1.25);
        console.assert(v[1].m11 === 'B');
        console.assert(v[1].m12 === 'barr');
        console.assert(v[1].m13.toString() === 'void');
        console.assert(jsuno.fromAny(v[1].m14) === undefined);
        console.assert(v[1].m15.length === 2);
        console.assert(v[1].m15[0] === 'foo');
        console.assert(v[1].m15[1] === 'barr');
        console.assert(v[1].m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(v[1].m17.m === 1);
        console.assert(v[1].m18.m1.m === 'baz');
        console.assert(v[1].m18.m2 === 1);
        console.assert(jsuno.fromAny(v[1].m18.m3) === undefined);
        console.assert(v[1].m18.m4.m === 'foo');
        console.assert(v[1].m19 === null);
        console.assert(v[2].m1 === false);
        console.assert(v[2].m2 === 12);
        console.assert(v[2].m3 === 1234);
        console.assert(v[2].m4 === 54321);
        console.assert(v[2].m5 === 123456);
        console.assert(v[2].m6 === 3456789012);
        console.assert(v[2].m7 === 123456789n);
        console.assert(v[2].m8 === 9876543210n);
        console.assert(v[2].m9 === 10.75);
        console.assert(v[2].m10 === 100.75);
        console.assert(v[2].m11 === 'Ö');
        console.assert(v[2].m12 === 'bazzz');
        console.assert(v[2].m13.toString() === '[]org.libreoffice.embindtest.Enum');
        console.assert(jsuno.fromAny(v[2].m14).length === 3);
        console.assert(
            jsuno.fromAny(v[2].m14)[0] === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(jsuno.fromAny(v[2].m14)[1] === jsuno.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(
            jsuno.fromAny(v[2].m14)[2] === jsuno.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(v[2].m15.length === 1);
        console.assert(v[2].m15[0] === 'baz');
        console.assert(v[2].m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(v[2].m17.m === 123456);
        console.assert(v[2].m18.m1.m === 'barr');
        console.assert(v[2].m18.m2 === 123456);
        console.assert(jsuno.fromAny(v[2].m18.m3).length === 3);
        console.assert(
            jsuno.fromAny(v[2].m18.m3)[0] === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(
            jsuno.fromAny(v[2].m18.m3)[1] === jsuno.uno.org.libreoffice.embindtest.Enum.E3);
        console.assert(
            jsuno.fromAny(v[2].m18.m3)[2] === jsuno.uno.org.libreoffice.embindtest.Enum.E_10);
        console.assert(v[2].m18.m4.m === 'bazz');
        console.assert(jsuno.sameUnoObject(v[2].m19, test));
        console.assert(test.isSequenceStruct(v));
    }
    {
        const v = test.getNull();
        console.assert(v === null);
        console.assert(test.isNull(v));
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
        console.assert(jsuno.fromAny(v14.val) === -123456)
        console.assert(v15.val.length === 3);
        console.assert(v15.val[0] === 'foo');
        console.assert(v15.val[1] === 'barr');
        console.assert(v15.val[2] === 'bazzz');
        console.assert(v16.val === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v17.val.m1 === true);
        console.assert(v17.val.m2 === -12);
        console.assert(v17.val.m3 === -1234);
        console.assert(v17.val.m4 === 54321);
        console.assert(v17.val.m5 === -123456);
        console.assert(v17.val.m6 === 3456789012);
        console.assert(v17.val.m7 === -123456789n);
        console.assert(v17.val.m8 === 9876543210n);
        console.assert(v17.val.m9 === -10.25);
        console.assert(v17.val.m10 === 100.5);
        console.assert(v17.val.m11 === 'Ö');
        console.assert(v17.val.m12 === 'hä');
        console.assert(v17.val.m13.toString() === 'long');
        console.assert(jsuno.fromAny(v17.val.m14) === -123456);
        console.assert(v17.val.m15.length === 3);
        console.assert(v17.val.m15[0] === 'foo');
        console.assert(v17.val.m15[1] === 'barr');
        console.assert(v17.val.m15[2] === 'bazzz');
        console.assert(v17.val.m16 === jsuno.uno.org.libreoffice.embindtest.Enum.E_2);
        console.assert(v17.val.m17.m === -123456);
        console.assert(v17.val.m18.m1.m === 'foo');
        console.assert(v17.val.m18.m2 === -123456);
        console.assert(jsuno.fromAny(v17.val.m18.m3) === -123456);
        console.assert(v17.val.m18.m4.m === 'barr');
        console.assert(jsuno.sameUnoObject(v17.val.m19, test));
        console.assert(jsuno.sameUnoObject(v18.val, test));
    }
    try {
        test.throwRuntimeException();
        console.assert(false);
    } catch (e) {
        const exc = jsuno.catchUnoException(e);
        console.assert(exc.type == 'com.sun.star.uno.RuntimeException');
        console.assert(jsuno.fromAny(exc).Message.startsWith('test'));
    }
    try {
        jsuno.throwUnoException(
            new css.lang.WrappedTargetException(
                {Message: 'wrapped', Context: test,
                 TargetException: new css.uno.RuntimeException(
                     {Message: 'test', Context: test})}));
        console.assert(false);
    } catch (e) {
        const exc = jsuno.catchUnoException(e);
        console.assert(exc.type == 'com.sun.star.lang.WrappedTargetException');
        console.assert(jsuno.fromAny(exc).Message.startsWith('wrapped'));
        console.assert(jsuno.sameUnoObject(exc.val.Context, test));
        console.assert(
            jsuno.fromAny(exc).TargetException.type == 'com.sun.star.uno.RuntimeException');
        console.assert(jsuno.fromAny(exc).TargetException.val.Message.startsWith('test'));
        console.assert(
            jsuno.sameUnoObject(jsuno.fromAny(jsuno.fromAny(exc).TargetException).Context, test));
    }
    console.assert(test.StringAttribute === 'hä');
    test.StringAttribute = 'foo';
    console.assert(test.StringAttribute === 'foo');
    {
        const tdm = jsuno.uno.com.sun.star.beans.theIntrospection(context);
        //...
    }
    {
        const urifac = jsuno.uno.com.sun.star.uri.UriReferenceFactory.create(context);
        //...
    }
    {
        const propbag = jsuno.uno.com.sun.star.beans.PropertyBag.createWithTypes(
            context, [jsuno.type.boolean, jsuno.type.long], false, false);
        //...
    }

    const objImpl = {
        execute(args) {
            if (args.length !== 1 || args[0].Name !== 'name') {
                jsuno.throwUnoException(
                    new css.lang.IllegalArgumentException({Message: 'bad args'}));
            }
            console.log('Hello ' + jsuno.fromAny(args[0].Value));
            return undefined;
        },
        trigger(event) { console.log('Ola ' + event); },
        the_LongAttribute: -123456,
        getLongAttribute() { return this.the_LongAttribute; },
        setLongAttribute(value) { this.the_LongAttribute = value; },
        the_StringAttribute: 'hä',
        getStringAttribute() { return this.the_StringAttribute; },
        setStringAttribute(value) { this.the_StringAttribute = value; },
        getReadOnlyAttribute() { return true; }
    };
    // Watch for a "Finalized: objImpl" log line in the console (but see
    // <https://github.com/emscripten-core/emscripten/pull/22488> "Let leakWarning carry the string
    // representation, not the stack itself"):
    Module.jsunoSmoketestFinalizationRegistry = new FinalizationRegistry(
        value => console.log('Finalized: ' + value));
    Module.jsunoSmoketestFinalizationRegistry.register(objImpl, 'objImpl');
    const obj = jsuno.unoObject(
        [css.task.XJob, css.task.XJobExecutor, jsuno.uno.org.libreoffice.embindtest.XAttributes],
        objImpl);
    console.assert(
        jsuno.fromAny(
            obj.queryInterface(jsuno.type.interface(jsuno.uno.org.libreoffice.embindtest.XTest)))
            === undefined);
    console.assert(
        jsuno.sameUnoObject(
            jsuno.fromAny(obj.queryInterface(jsuno.type.interface(css.uno.XInterface))), obj));
    console.assert(
        jsuno.sameUnoObject(
            jsuno.fromAny(
                obj.queryInterface(
                    jsuno.type.interface(jsuno.uno.org.libreoffice.embindtest.XAttributes))),
            obj));
    test.passJob(obj);
    test.passJobExecutor(obj);
    test.passInterface(obj);
    obj.trigger('from JS');
    console.assert(obj.LongAttribute === -123456);
    obj.LongAttribute = 789;
    console.assert(obj.LongAttribute === 789);
    console.assert(obj.StringAttribute === 'hä');
    obj.StringAttribute = 'foo';
    console.assert(obj.StringAttribute === 'foo');
    console.assert(obj.ReadOnlyAttribute === true);
    try {
        obj.ReadOnlyAttribute = false;
        console.assert(false);
    } catch (e) {}
    console.assert(test.checkAttributes(obj));
});

/* vim:set shiftwidth=4 softtabstop=4 expandtab cinoptions=b1,g0,N-s cinkeys+=0=break: */
