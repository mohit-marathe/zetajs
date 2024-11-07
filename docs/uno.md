# The zetajs UNO Mapping

The mapping between [UNO types](http://www.openoffice.org/udk/common/man/typesystem.html) and zetajs JavaScript types is as follows:

- UNO `VOID`:  As a UNO interface method return type it maps to JavaScript `void`.  As a value type contained in a UNO `ANY` value it maps to the JavaScript Undefined type.

- UNO `BOOLEAN` maps to the JavaScript Boolean type.

- UNO `BYTE` maps to the JavaScript Number type's integer values in the interval from &minus;2<sup>7</sup> (inclusive) to 2<sup>7</sup> (exclusive).

- UNO `SHORT` maps to the JavaScript Number type's integer values in the interval from &minus;2<sup>15</sup> (inclusive) to 2<sup>15</sup> (exclusive).

- UNO `UNSIGNED SHORT` maps to the JavaScript Number type's integer values in the interval from 0 (inclusive) to 2<sup>16</sup> (exclusive).

- UNO `LONG` maps to the JavaScript Number type's integer values in the interval from &minus;2<sup>31</sup> (inclusive) to 2<sup>31</sup> (exclusive).

- UNO `UNSIGNED LONG` maps to the JavaScript Number type's integer values in the interval from 0 (inclusive) to 2<sup>32</sup> (exclusive).

- UNO `HYPER` maps to the JavaScript BigInt type's values in the interval from &minus;2<sup>63</sup> (inclusive) to 2<sup>63</sup> (exclusive).

- UNO `UNSIGNED HYPER` maps to the JavaScript BigInt type's values in the interval from 0 (inclusive) to 2<sup>64</sup> (exclusive).

- UNO `FLOAT` maps to the JavaScript Number type`s values that correspond to values of the IEEE&nbsp;754 binary32 interchange format.

- UNO `DOUBLE` maps to the JavaScript Number type.

- UNO `CHAR` maps to the JavaScript String type's one-element values.

- UNO `STRING` maps to the JavaScript String type's values that correspond to valid UTF-16 strings, up to the JavaScript length limit of 2<sup>53</sup>&minus;1 UTF16 code units.

- UNO `TYPE` maps to opaque JavaScript objects, see the documentation of `zetajs.type` at [Starting Points: Using zetajs](start.md#using-zetajs).

- UNO `ANY` maps to the combined set of wrapped and unwrapped representations:

    - Any value of UNO type `ANY` can map to a wrapped representation, which is an opaque JavaScript object that has a `type` property (containing a zetajs representation of a value of UNO type `TYPE`) and a `val` property (containing a zetajs representation of a value of the given UNO type).

    - A value of UNO type `ANY` where the contained UNO value is of any of the UNO types `VOID`, `BOOLEAN`, `LONG`, `HYPER`, `STRING`, `TYPE`, a UNO enum type, a UNO struct type, or a UNO exception type, can also be mapped to an unwrapped representation, which directly maps to the JavaScript representation of the contained UNO value.

    See the documentation of `zetajs.Any` and `zetajs.fromAny` at [Starting Points: Using zetajs](start.md#using-zetajs).

- UNO sequence types map to JavaScript Arrays with corresponding element value constraints, up to the JavaScript length limit of 2<sup>32</sup>&minus;1 elements.

- UNO struct and exception types map to opaque JavaScript objects, where each member with name <var>N</var> maps to a property with property name <var>N</var> and with corresponding value constraints.  See the documentation of the `zetajs.uno` dictionary at [Starting Points: Using zetajs](start.md#using-zetajs) for corresponding constructor functions.

- UNO interface types map to the JavaScript Null type for null references, and to opaque JavaScript objects for non-null references.  (A zetajs representation referencing a given UNO object has direct access to all the UNO interface methods and attribute getters and setters implemented by that object.  Thus, such zetajs representations are not tied to specific UNO interface types.)
