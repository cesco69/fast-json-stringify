'use strict'

const test = require('tap').test
const { DateTime } = require('luxon')
const { validate } = require('./util')
const build = require('..')

test('render a date in a string as JSON', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string'
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, JSON.stringify(toStringify))
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a date in a string when format is date-format as ISOString', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'date-time'
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, JSON.stringify(toStringify))
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a nullable date in a string when format is date-format as ISOString', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'date-time',
    nullable: true
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, JSON.stringify(toStringify))
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a date in a string when format is date as YYYY-MM-DD', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'date'
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, `"${DateTime.fromJSDate(toStringify).toISODate()}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a nullable date in a string when format is date as YYYY-MM-DD', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'date',
    nullable: true
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, `"${DateTime.fromJSDate(toStringify).toISODate()}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('verify padding for rendered date in a string when format is date', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'date'
  }
  const toStringify = new Date(2020, 0, 1, 0, 0, 0, 0)

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, `"${DateTime.fromJSDate(toStringify).toISODate()}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a date in a string when format is time as kk:mm:ss', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'time'
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, `"${DateTime.fromJSDate(toStringify).toFormat('HH:mm:ss')}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a nullable date in a string when format is time as kk:mm:ss', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'time',
    nullable: true
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, `"${DateTime.fromJSDate(toStringify).toFormat('HH:mm:ss')}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a midnight time', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'time'
  }
  const midnight = new Date(new Date().setHours(24))

  const stringify = build(schema)
  const output = stringify(midnight)

  t.equal(output, `"${DateTime.fromJSDate(midnight).toFormat('HH:mm:ss')}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('verify padding for rendered date in a string when format is time', (t) => {
  t.plan(2)

  const schema = {
    title: 'a date in a string',
    type: 'string',
    format: 'time'
  }
  const toStringify = new Date(2020, 0, 1, 1, 1, 1, 1)

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, `"${DateTime.fromJSDate(toStringify).toFormat('HH:mm:ss')}"`)
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('render a nested object in a string when type is date-format as ISOString', (t) => {
  t.plan(2)

  const schema = {
    title: 'an object in a string',
    type: 'object',
    properties: {
      date: {
        type: 'string',
        format: 'date-time'
      }
    }
  }
  const toStringify = { date: new Date() }

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, JSON.stringify(toStringify))
  t.ok(validate(JSON.parse(output), schema), 'valid schema')
})

test('serializing null value', t => {
  const input = { updatedAt: null }

  function createSchema (properties) {
    return {
      title: 'an object in a string',
      type: 'object',
      properties
    }
  }

  t.plan(3)

  t.test('type::string', t => {
    t.plan(3)

    t.test('format::date-time', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: 'string',
          format: 'date-time'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":""}')
      t.notOk(validate(JSON.parse(output), schema), 'an empty string is not a date-time format')
    })

    t.test('format::date', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: 'string',
          format: 'date'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":""}')
      t.notOk(validate(JSON.parse(output), schema), 'an empty string is not a date format')
    })

    t.test('format::time', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: 'string',
          format: 'time'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":""}')
      t.notOk(validate(JSON.parse(output), schema), 'an empty string is not a time format')
    })
  })

  t.test('type::array', t => {
    t.plan(6)

    t.test('format::date-time', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: ['string'],
          format: 'date-time'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":""}')
      t.notOk(validate(JSON.parse(output), schema), 'an empty string is not a date-time format')
    })

    t.test('format::date', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: ['string'],
          format: 'date'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":""}')
      t.notOk(validate(JSON.parse(output), schema), 'an empty string is not a date format')
    })

    t.test('format::date', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: ['string'],
          format: 'date'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":""}')
      t.notOk(validate(JSON.parse(output), schema), 'an empty string is not a date format')
    })

    t.test('format::time, Date object', t => {
      t.plan(1)

      const schema = {
        oneOf: [
          {
            type: 'object',
            properties: {
              updatedAt: {
                type: ['string', 'number'],
                format: 'time'
              }
            }
          }
        ]
      }

      const date = new Date()
      const input = { updatedAt: date }
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, JSON.stringify({ updatedAt: DateTime.fromJSDate(date).toFormat('HH:mm:ss') }))
    })

    t.test('format::time, Date object', t => {
      t.plan(1)

      const schema = {
        oneOf: [
          {
            type: ['string', 'number'],
            format: 'time'
          }
        ]
      }

      const date = new Date()
      const stringify = build(schema)
      const output = stringify(date)

      t.equal(output, `"${DateTime.fromJSDate(date).toFormat('HH:mm:ss')}"`)
    })

    t.test('format::time, Date object', t => {
      t.plan(1)

      const schema = {
        oneOf: [
          {
            type: ['string', 'number'],
            format: 'time'
          }
        ]
      }

      const stringify = build(schema)
      const output = stringify(42)

      t.equal(output, JSON.stringify(42))
    })
  })

  t.test('type::array::nullable', t => {
    t.plan(3)

    t.test('format::date-time', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: ['string', 'null'],
          format: 'date-time'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":null}')
      t.ok(validate(JSON.parse(output), schema), 'valid schema')
    })

    t.test('format::date', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: ['string', 'null'],
          format: 'date'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":null}')
      t.ok(validate(JSON.parse(output), schema), 'valid schema')
    })

    t.test('format::time', t => {
      t.plan(2)

      const prop = {
        updatedAt: {
          type: ['string', 'null'],
          format: 'time'
        }
      }

      const schema = createSchema(prop)
      const stringify = build(schema)
      const output = stringify(input)

      t.equal(output, '{"updatedAt":null}')
      t.ok(validate(JSON.parse(output), schema), 'valid schema')
    })
  })
})

test('Validate Date object as string type', (t) => {
  t.plan(1)

  const schema = {
    oneOf: [
      { type: 'string' }
    ]
  }
  const toStringify = new Date()

  const stringify = build(schema)
  const output = stringify(toStringify)

  t.equal(output, JSON.stringify(toStringify))
})

test('nullable date', (t) => {
  t.plan(1)

  const schema = {
    anyOf: [
      {
        format: 'date',
        type: 'string',
        nullable: true
      }
    ]
  }

  const stringify = build(schema)

  const data = new Date()
  const result = stringify(data)

  t.same(result, `"${DateTime.fromJSDate(data).toISODate()}"`)
})
