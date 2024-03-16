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
      title: '+',
      input: '1+2',
      expected: [
        { type: tokenTypes.STRING, value: '1' },
        { type: tokenTypes.PLUS },
        { type: tokenTypes.STRING, value: '2' },
      ] satisfies Token[],
    },
  ])('$title', ({ title, input, expected }) => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize(input)
    expect(tokens).toStrictEqual(expected)
  })
})
