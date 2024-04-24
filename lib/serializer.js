'use strict'

// eslint-disable-next-line
const STR_ESCAPE = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/

const JSON_STR_BEGIN_OBJECT = '{'
const JSON_STR_END_OBJECT = '}'
const JSON_STR_BEGIN_ARRAY = '['
const JSON_STR_END_ARRAY = ']'
const JSON_STR_COMMA = ','
const JSON_STR_COLONS = ':'
const JSON_STR_QUOTE = '"'
const JSON_STR_EMPTY_OBJECT = JSON_STR_BEGIN_OBJECT + JSON_STR_END_OBJECT
const JSON_STR_EMPTY_ARRAY = JSON_STR_BEGIN_ARRAY + JSON_STR_END_ARRAY
const JSON_STR_EMPTY_STRING = JSON_STR_QUOTE + JSON_STR_QUOTE
const JSON_STR_NULL = 'null'
module.exports = class Serializer {
  constructor (options) {
    switch (options && options.rounding) {
      case 'floor':
        this.parseInteger = Math.floor
        break
      case 'ceil':
        this.parseInteger = Math.ceil
        break
      case 'round':
        this.parseInteger = Math.round
        break
      case 'trunc':
      default:
        this.parseInteger = Math.trunc
        break
    }
    this._options = options
  }

  asInteger (i) {
    if (Number.isInteger(i)) {
      return '' + i
    } else if (typeof i === 'bigint') {
      return i.toString()
    }
    /* eslint no-undef: "off" */
    const integer = this.parseInteger(i)
    // check if number is Infinity or NaN
    // eslint-disable-next-line no-self-compare
    if (integer === Infinity || integer === -Infinity || integer !== integer) {
      throw new Error(`The value "${i}" cannot be converted to an integer.`)
    }
    return '' + integer
  }

  asNumber (i) {
    // fast cast to number
    const num = +i
    // check if number is NaN
    // eslint-disable-next-line no-self-compare
    if (num !== num) {
      throw new Error(`The value "${i}" cannot be converted to a number.`)
    } else if (num === Infinity || num === -Infinity) {
      return JSON_STR_NULL
    } else {
      return '' + num
    }
  }

  asBoolean (bool) {
    return bool && 'true' || 'false' // eslint-disable-line
  }

  asDateTime (date) {
    if (date === null) return JSON_STR_EMPTY_STRING
    if (date instanceof Date) {
      return JSON_STR_QUOTE + date.toISOString() + JSON_STR_QUOTE
    }
    if (typeof date === 'string') {
      return JSON_STR_QUOTE + date + JSON_STR_QUOTE
    }
    throw new Error(`The value "${date}" cannot be converted to a date-time.`)
  }

  asDate (date) {
    if (date === null) return JSON_STR_EMPTY_STRING
    if (date instanceof Date) {
      return JSON_STR_QUOTE + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10) + JSON_STR_QUOTE
    }
    if (typeof date === 'string') {
      return JSON_STR_QUOTE + date + JSON_STR_QUOTE
    }
    throw new Error(`The value "${date}" cannot be converted to a date.`)
  }

  asTime (date) {
    if (date === null) return JSON_STR_EMPTY_STRING
    if (date instanceof Date) {
      return JSON_STR_QUOTE + new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(11, 19) + JSON_STR_QUOTE
    }
    if (typeof date === 'string') {
      return JSON_STR_QUOTE + date + JSON_STR_QUOTE
    }
    throw new Error(`The value "${date}" cannot be converted to a time.`)
  }

  asString (str) {
    const len = str.length
    if (len < 42) {
      // magically escape strings for json
      // relying on their charCodeAt
      // everything below 32 needs JSON.stringify()
      // every string that contain surrogate needs JSON.stringify()
      // 34 and 92 happens all the time, so we
      // have a fast case for them
      let result = ''
      let last = -1
      let point = 255
      // eslint-disable-next-line
      for (var i = 0; i < len; i++) {
        point = str.charCodeAt(i)
        if (
          point === 0x22 || // '"'
          point === 0x5c // '\'
        ) {
          last === -1 && (last = 0)
          result += str.slice(last, i) + '\\'
          last = i
        } else if (point < 32 || (point >= 0xD800 && point <= 0xDFFF)) {
          // The current character is non-printable characters or a surrogate.
          return JSON.stringify(str)
        }
      }
      return (last === -1 && (JSON_STR_QUOTE + str + JSON_STR_QUOTE)) || (JSON_STR_QUOTE + result + str.slice(last) + JSON_STR_QUOTE)
    } else if (len < 5000 && STR_ESCAPE.test(str) === false) {
      // Only use the regular expression for shorter input. The overhead is otherwise too much.
      return JSON_STR_QUOTE + str + JSON_STR_QUOTE
    } else {
      return JSON.stringify(str)
    }
  }

  asUnsafeString (str) {
    return JSON_STR_QUOTE + str + JSON_STR_QUOTE
  }

  getState () {
    return this._options
  }

  jsonStrings () {
    return {
      JSON_STR_BEGIN_OBJECT,
      JSON_STR_END_OBJECT,
      JSON_STR_BEGIN_ARRAY,
      JSON_STR_END_ARRAY,
      JSON_STR_COMMA,
      JSON_STR_COLONS,
      JSON_STR_QUOTE,
      JSON_STR_EMPTY_OBJECT,
      JSON_STR_EMPTY_ARRAY,
      JSON_STR_EMPTY_STRING,
      JSON_STR_NULL
    }
  }

  static restoreFromState (state) {
    return new Serializer(state)
  }
}
