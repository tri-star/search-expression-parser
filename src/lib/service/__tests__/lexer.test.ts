import { Lexer } from '@/lib/service/lexer'
import { Token, tokenTypes } from '@/lib/token'
import { describe, expect, test } from 'vitest'

describe('lexer', () => {
  test.each([
    {
      title: 'title=123',
      input: 'title=123',
      expected: [
        { type: tokenTypes.TERM, value: 'title' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: '123' },
      ] satisfies Token[],
    },
    {
      title: 'title = 123',
      input: 'title = 123',
      expected: [
        { type: tokenTypes.TERM, value: 'title' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: '123' },
      ] satisfies Token[],
    },
    {
      title: 'title = 123 + body = 456',
      input: 'title = 123 + body = 456',
      expected: [
        { type: tokenTypes.TERM, value: 'title' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: '123' },
        { type: tokenTypes.OR },
        { type: tokenTypes.TERM, value: 'body' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: '456' },
      ] satisfies Token[],
    },
    {
      title: 'title = 123 * body = 456',
      input: 'title = 123 * body = 456',
      expected: [
        { type: tokenTypes.TERM, value: 'title' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: '123' },
        { type: tokenTypes.AND },
        { type: tokenTypes.TERM, value: 'body' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: '456' },
      ] satisfies Token[],
    },
    {
      title:
        'クォート内は通常のテキストとして処理される： title = "keyword=abcbcd * test=123"',
      input: 'title = "keyword=abcbcd * test=123"',
      expected: [
        { type: tokenTypes.TERM, value: 'title' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: 'keyword=abcbcd * test=123' },
      ] satisfies Token[],
    },
    {
      title: 'クォートのエスケープ： title = "abc\\"bcd"',
      input: 'title = "abc\\"bcd"',
      expected: [
        { type: tokenTypes.TERM, value: 'title' },
        { type: tokenTypes.EQUAL },
        { type: tokenTypes.STRING, value: 'abc"bcd' },
      ] satisfies Token[],
    },
  ])('$title', ({ title, input, expected }) => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize(input)
    expect(tokens).toStrictEqual(expected)
  })
})
