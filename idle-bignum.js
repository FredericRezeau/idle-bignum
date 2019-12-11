/**
 * @overview idle-bignum.
 * @copyright 2019 Frederic 경진 Rezeau
 * @license [MIT]{@link https://github.com/FredericRezeau/idle-bignum/blob/master/LICENSE}
 */

(function (namespace) {
    "use strict";

    // Power of 10 names (only multiple of 3 for Engineering Notation).
    // Using  Conway-Wechsler notation system. http://mrob.com/pub/math/largenum.html#conway-wechsler
    // Note: Any name added to the list will be picked up automatically by the BigNum class.
    var powTenToName = {
        "0": "",
        "3": "thousand",
        "6": "million",
        "9": "billion",
        "12": "trillion",
        "15": "quadrillion",
        "18": "quintillion",
        "21": "sextillion",
        "24": "septillion",
        "27": "octillion",
        "30": "nonillion",
        "33": "decillion",
        "36": "undecillion",
        "39": "duodecillion",
        "42": "tredecillion",
        "45": "quattuordecillion",
        "48": "quindecillion",
        "51": "sedecillion",
        "54": "septendecillion",
        "57": "octodecillion",
        "60": "novendecillion",
        "63": "vigintillion",
        "66": "unvigintillion",
        "69": "duovigintillion",
        "72": "tresvigintillion",
        "75": "quattuorvigintillion",
        "78": "quinvigintillion",
        "81": "sesvigintillion",
        "84": "septemvigintillion",
        "87": "octovigintillion",
        "90": "novemvigintillion",
        "93": "trigintillion",
        "96": "untrigintillion",
        "99": "duotrigintillion",
        "102": "trestrigintillion",
        "105": "quattuortrigintillion",
        "108": "quintrigintillion",
        "111": "sestrigintillion",
        "114": "septentrigintillion",
        "117": "octotrigintillion",
        "120": "noventrigintillion",
        "123": "quadragintillion",
        "126": "unquadragintillion",
        "129": "duoquadragintillion",
        "132": "tresquadragintillion",
        "135": "quattuorquadragintillion",
        "138": "quinquadragintillion",
        "141": "sesquadragintillion",
        "144": "septenquadragintillion",
        "147": "octoquadragintillion",
        "150": "novenquadragintillion",
        "153": "quinquagintillion",
        "156": "unquinquagintillion",
        "159": "duoquinquagintillion",
        "162": "tresquinquagintillion",
        "165": "quattuorquinquagintillion",
        "168": "quinquinquagintillion",
        "171": "sesquinquagintillion",
        "174": "septenquinquagintillion",
        "177": "octoquinquagintillion",
        "180": "novenquinquagintillion",
        "183": "sexagintillion",
        "186": "unsexagintillion",
        "189": "duosexagintillion",
        "192": "tresexagintillion",
        "195": "quattuorsexagintillion",
        "198": "quinsexagintillion",
        "201": "sesexagintillion",
        "204": "septensexagintillion",
        "207": "octosexagintillion",
        "210": "novensexagintillion",
        "213": "septuagintillion",
        "216": "unseptuagintillion",
        "219": "duoseptuagintillion",
        "222": "treseptuagintillion",
        "225": "quattuorseptuagintillion",
        "228": "quinseptuagintillion",
        "231": "seseptuagintillion",
        "234": "septenseptuagintillion",
        "237": "octoseptuagintillion",
        "240": "novenseptuagintillion",
        "243": "octogintillion",
        "246": "unoctogintillion",
        "249": "duooctogintillion",
        "252": "tresoctogintillion",
        "255": "quattuoroctogintillion",
        "258": "quinoctogintillion",
        "261": "sexoctogintillion",
        "264": "septemoctogintillion",
        "267": "octooctogintillion",
        "270": "novemoctogintillion",
        "273": "nonagintillion",
        "276": "unnonagintillion",
        "279": "duononagintillion",
        "282": "trenonagintillion",
        "285": "quattuornonagintillion",
        "288": "quinnonagintillion",
        "291": "senonagintillion",
        "294": "septenonagintillion",
        "297": "octononagintillion",
        "300": "novenonagintillion",
        "303": "centillion"
    };

    var MAX_MAGNITUDE = 12; // Max power magnitude diff for operands.
    var TEN_CUBED = 1e3; // Used for normalizing numbers.

    // Big number.
    namespace.BigNum = function (value, exp) {
        if (!(this instanceof namespace.BigNum)) {
            throw new Error("Constructor called as a function.");
        }
        this.value = value;
        this.exp = exp ? exp : 0;
    };

    // Normalize a number (Engineering notation).
    namespace.BigNum.prototype.normalize = function () {
        if (this.value < 1 && this.exp !== 0) {
            // e.g. 0.1E6 is converted to 100E3 ([0.1, 6] = [100, 3])
            this.value *= TEN_CUBED;
            this.exp -= 3;
        }
        else if (this.value >= TEN_CUBED) {
            // e.g. 10000E3 is converted to 10E6 ([10000, 3] = [10, 6])
            while (this.value >= TEN_CUBED) {
                this.value *= 1 / TEN_CUBED;
                this.exp += 3;
            }
        }
        else if (this.value <= 0) {
            // Negative flag is set but negative number operations are not supported.
            this.negative = this.value < 0 ? true : false;
            this.exp = 0;
            this.value = 0;
        }
    };

    // Compute the equivalent number at 1.Eexp (note: assumes exp is greater than this.exp).
    namespace.BigNum.prototype.align = function (exp) {
        const d = exp - this.exp;
        if (d > 0) {
            this.value = ((d <= MAX_MAGNITUDE) ? this.value / Math.pow(10, d) : 0);
            this.exp = exp;
        }
    };

    // Add a number to this number.
    namespace.BigNum.prototype.add = function (bigNum) {
        if (bigNum.exp < this.exp) {
            bigNum.align(this.exp);
        }
        else {
            namespace.BigNum.prototype.align.call(this, bigNum.exp);
        }
        this.value += bigNum.value;
        namespace.BigNum.prototype.normalize.call(this);
    };

    // Subtract a number from this number.
    namespace.BigNum.prototype.substract = function (bigNum) {
        if (bigNum.exp < this.exp) {
            bigNum.align(this.exp);
        }
        else {
            namespace.BigNum.prototype.align.call(this, bigNum.exp);
        }
        this.value -= bigNum.value;
        namespace.BigNum.prototype.normalize.call(this);
    };

    // Multiply this number by factor.
    namespace.BigNum.prototype.multiply = function (factor) {
        // We do not support negative numbers.
        if (factor >= 0) {
            this.value *= factor;
            namespace.BigNum.prototype.normalize.call(this);
        }
    };

    // Divide this number by divisor.
    namespace.BigNum.prototype.divide = function (divisor) {
        if (divisor > 0) {
            this.value /= divisor;
            namespace.BigNum.prototype.normalize.call(this);
        }
    };

    // getValue. Return the number value as string.
    namespace.BigNum.prototype.getValue = function (precision) {
        return Number(this.value.toFixed(precision ? precision : 3)).toString();
    };

    // getExpName. Return the exponent name as string.
    namespace.BigNum.prototype.getExpName = function () {
        return powTenToName[this.exp.toString()];
    };

    // getExp. Return the exponent as string.
    namespace.BigNum.prototype.getExp = function () {
        return this.exp.toString();
    };

    // toString.
    namespace.BigNum.prototype.toString = function () {
        return this.value.toString() + "^" + powTenToName[this.exp.toString()];
    };

})(window.Idle = window.Idle || {});
