import { AstNode } from '@/lib/ast'
import { Parser } from '@/lib/service/parser'
import { TOKEN_TYPES, Token } from '@/lib/token'
import { describe, expect, test } from 'vitest'

describe('parser', () => {
  test.each([
    {
      title: '単一の式：title=test',
      tokens: [
        {
          type: TOKEN_TYPES.TERM,
          value: 'title',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'test',
        },
      ] satisfies Token[],
      expected: {
        type: 'EXPRESSION',
        term: 'title',
        value: 'test',
      } satisfies AstNode,
    },
    {
      title: 'OR演算：title=test + body=some',
      tokens: [
        {
          type: TOKEN_TYPES.TERM,
          value: 'title',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'test',
        },
        {
          type: TOKEN_TYPES.OR,
        },
        {
          type: TOKEN_TYPES.TERM,
          value: 'body',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'some',
        },
      ] satisfies Token[],
      expected: {
        type: 'OR',
        left: {
          type: 'EXPRESSION',
          term: 'title',
          value: 'test',
        },
        right: {
          type: 'EXPRESSION',
          term: 'body',
          value: 'some',
        },
      } satisfies AstNode,
    },
    {
      title: 'AND演算：title=test * body=some',
      tokens: [
        {
          type: TOKEN_TYPES.TERM,
          value: 'title',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'test',
        },
        {
          type: TOKEN_TYPES.AND,
        },
        {
          type: TOKEN_TYPES.TERM,
          value: 'body',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'some',
        },
      ] satisfies Token[],
      expected: {
        type: 'AND',
        left: {
          type: 'EXPRESSION',
          term: 'title',
          value: 'test',
        },
        right: {
          type: 'EXPRESSION',
          term: 'body',
          value: 'some',
        },
      } satisfies AstNode,
    },
    {
      title:
        'AND,OR両方含む場合：title=test + body=some * issued=">=2024-01-01"',
      tokens: [
        {
          type: TOKEN_TYPES.TERM,
          value: 'title',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'test',
        },
        {
          type: TOKEN_TYPES.OR,
        },
        {
          type: TOKEN_TYPES.TERM,
          value: 'body',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: 'some',
        },
        {
          type: TOKEN_TYPES.AND,
        },
        {
          type: TOKEN_TYPES.TERM,
          value: 'issued',
        },
        {
          type: TOKEN_TYPES.EQUAL,
        },
        {
          type: TOKEN_TYPES.STRING,
          value: '>=2024-01-01',
        },
      ] satisfies Token[],
      expected: {
        type: 'OR',
        left: {
          type: 'EXPRESSION',
          term: 'title',
          value: 'test',
        },
        right: {
          type: 'AND',
          left: {
            type: 'EXPRESSION',
            term: 'body',
            value: 'some',
          },
          right: {
            type: 'EXPRESSION',
            term: 'issued',
            value: '>=2024-01-01',
          },
        },
      } satisfies AstNode,
    },
  ])(
    '$title',
    ({
      title,
      tokens,
      expected,
    }: {
      title: string
      tokens: Token[]
      expected: AstNode
    }) => {
      const parser = new Parser()
      const tree = parser.parse(tokens)
      expect(tree).toEqual(expected)
    },
  )
})
