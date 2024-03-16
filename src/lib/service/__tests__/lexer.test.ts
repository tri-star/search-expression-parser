import { Lexer } from '@/lib/service/lexer'
import { Token, TOKEN_TYPES } from '@/lib/token'
import { describe, expect, test } from 'vitest'

describe('lexer', () => {
  test.each([
    {
      title: 'title=123',
      input: 'title=123',
      expected: [
        { type: TOKEN_TYPES.TERM, value: 'title' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: '123' },
      ] satisfies Token[],
    },
    {
      title: 'title = 123',
      input: 'title = 123',
      expected: [
        { type: TOKEN_TYPES.TERM, value: 'title' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: '123' },
      ] satisfies Token[],
    },
    {
      title: 'title = 123 + body = 456',
      input: 'title = 123 + body = 456',
      expected: [
        { type: TOKEN_TYPES.TERM, value: 'title' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: '123' },
        { type: TOKEN_TYPES.OR },
        { type: TOKEN_TYPES.TERM, value: 'body' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: '456' },
      ] satisfies Token[],
    },
    {
      title: 'title = 123 * body = 456',
      input: 'title = 123 * body = 456',
      expected: [
        { type: TOKEN_TYPES.TERM, value: 'title' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: '123' },
        { type: TOKEN_TYPES.AND },
        { type: TOKEN_TYPES.TERM, value: 'body' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: '456' },
      ] satisfies Token[],
    },
    {
      title:
        'クォート内は通常のテキストとして処理される： title = "keyword=abcbcd * test=123"',
      input: 'title = "keyword=abcbcd * test=123"',
      expected: [
        { type: TOKEN_TYPES.TERM, value: 'title' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: 'keyword=abcbcd * test=123' },
      ] satisfies Token[],
    },
    {
      title: 'クォートのエスケープ： title = "abc\\"bcd"',
      input: 'title = "abc\\"bcd"',
      expected: [
        { type: TOKEN_TYPES.TERM, value: 'title' },
        { type: TOKEN_TYPES.EQUAL },
        { type: TOKEN_TYPES.STRING, value: 'abc"bcd' },
      ] satisfies Token[],
    },
  ])('$title', ({ title, input, expected }) => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize(input)
    expect(tokens).toStrictEqual(expected)
  })
})
