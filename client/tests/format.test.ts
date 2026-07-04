import test from 'node:test'
import assert from 'node:assert/strict'
import { textValue, arrayValue, label } from '../src/lib/format.js'

test('textValue returns the string when given a string', () => {
  assert.equal(textValue('hello'), 'hello')
})

test('textValue returns empty string for undefined', () => {
  assert.equal(textValue(undefined), '')
})

test('textValue returns empty string for an array', () => {
  assert.equal(textValue(['a', 'b']), '')
})

test('arrayValue returns the array when given an array', () => {
  assert.deepEqual(arrayValue(['a', 'b']), ['a', 'b'])
})

test('arrayValue returns empty array for a string', () => {
  assert.deepEqual(arrayValue('not-array'), [])
})

test('arrayValue returns empty array for undefined', () => {
  assert.deepEqual(arrayValue(undefined), [])
})

test('label capitalizes hyphenated words', () => {
  assert.equal(label('add-material'), 'Add Material')
})

test('label capitalizes a single word', () => {
  assert.equal(label('course'), 'Course')
})
