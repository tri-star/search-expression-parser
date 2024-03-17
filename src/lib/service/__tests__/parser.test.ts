import { AstNode } from '@/lib/ast'
import { Parser } from '@/lib/service/parser'
import { TOKEN_TYPES, Token } from '@/lib/token'
import { describe, expect, test } from 'vitest'

describe('parser', () => {
  test.each([
    {
      title: 'title=test',
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
