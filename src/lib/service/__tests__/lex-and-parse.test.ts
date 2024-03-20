import { AstNode } from '@/lib/ast'
import { Lexer } from '@/lib/service/lexer'
import { Parser } from '@/lib/service/parser'
import { describe, expect, test } from 'vitest'

describe('lex-and-parse', () => {
  describe('正常な式', () => {
    test.each([
      {
        title: '単一の式',
        input: 'title=test',
        expected: {
          type: 'EXPRESSION',
          term: 'title',
          value: 'test',
        } satisfies AstNode,
      },
      {
        title: '複数のOR',
        input: 'title=test + body = some + issued=">=2024-01-01"',
        expected: {
          type: 'OR',
          left: {
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
          },
          right: {
            type: 'EXPRESSION',
            term: 'issued',
            value: '>=2024-01-01',
          },
        } satisfies AstNode,
      },
      {
        title: 'ANDとORの結合順: ANDが優先される',
        input: 'title=test + body=some * issued=">=2024-01-01" + title=abc',
        expected: {
          type: 'OR',
          left: {
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
          },
          right: {
            type: 'EXPRESSION',
            term: 'title',
            value: 'abc',
          },
        } satisfies AstNode,
      },
      {
        title: 'クォートとクォートのエスケープ',
        input: 'title="test + test2" + body = "test \\" test2"',
        expected: {
          type: 'OR',
          left: {
            type: 'EXPRESSION',
            term: 'title',
            value: 'test + test2',
          },
          right: {
            type: 'EXPRESSION',
            term: 'body',
            value: 'test " test2',
          },
        } satisfies AstNode,
      },
      {
        title: '括弧による連結',
        input:
          '((title="test" + body="test")+(title="sample" + body="sample"))*issued=">=2024-01-01"',
        expected: {
          type: 'AND',
          left: {
            type: 'OR',
            left: {
              type: 'OR',
              left: {
                type: 'EXPRESSION',
                term: 'title',
                value: 'test',
              },
              right: {
                type: 'EXPRESSION',
                term: 'body',
                value: 'test',
              },
            },
            right: {
              type: 'OR',
              left: {
                type: 'EXPRESSION',
                term: 'title',
                value: 'sample',
              },
              right: {
                type: 'EXPRESSION',
                term: 'body',
                value: 'sample',
              },
            },
          },
          right: {
            type: 'EXPRESSION',
            term: 'issued',
            value: '>=2024-01-01',
          },
        } satisfies AstNode,
      },
      {
        title: '値が空文字',
        input: 'title=""+body=""',
        expected: {
          type: 'OR',
          left: {
            type: 'EXPRESSION',
            term: 'title',
            value: '',
          },
          right: {
            type: 'EXPRESSION',
            term: 'body',
            value: '',
          },
        } satisfies AstNode,
      },
    ])(
      '$title',
      ({
        title,
        input,
        expected,
      }: {
        title: string
        input: string
        expected: AstNode
      }) => {
        const lexer = new Lexer()
        const tokens = lexer.tokenize(input)

        const parser = new Parser()
        const tree = parser.parse(tokens)

        expect(tree).toStrictEqual(expected)
      },
    )
  })

  describe('NGな式', () => {
    test.each([
      {
        title: 'いきなり：")"',
        input: ')',
        expected: /キーワードが見つかりません/,
      },
      {
        title: 'いきなり："="',
        input: ')',
        expected: /キーワードが見つかりません/,
      },
      {
        title: 'いきなり："+"',
        input: ')',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '無効なキーワード：subject',
        input: 'subject=aaa',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '無効なキーワード："body"',
        input: 'subject=aaa+"body"=test',
        expected: /キーワードが見つかりません/,
      },
      {
        title: 'キーワード直後が無効',
        input: 'title+aaa',
        expected: /「=」が見つかりません。/,
      },
      {
        title: 'クォートが閉じていない',
        input: 'title="aaaaa+body=aaa',
        expected: /クォートが閉じられていません/,
      },
      {
        title: '値の途中からクォートが始まる',
        input: 'title=aaa"aa"+body=aaa',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '括弧が閉じていない(1)',
        input: '(title=aaaaa+body=aaa',
        expected: /括弧の対応が取れていません/,
      },
      {
        title: '括弧が閉じていない(2)',
        input: 'title=aaaaa+(body=aaa',
        expected: /括弧の対応が取れていません/,
      },
      {
        title: '括弧の位置が不正(1)',
        input: 'title=(aaaaa+body=aaa',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '括弧の位置が不正(2)',
        input: 'title=aaaaa)+body=aaa',
        expected: /括弧の対応が取れていません/,
      },
      {
        title: '括弧の位置が不正(3)',
        input: 'title=aaaaa+body=aaa()',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '括弧の位置が不正(4)',
        input: 'title=aaaaa(+)body=aaa',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '括弧の位置が不正(5)',
        input: 'title=aaa(a)a+body=aaa',
        expected: /キーワードが見つかりません/,
      },
      {
        title: '括弧の数が不正(1)',
        input: '((title=aaaaa)+body=aaa',
        expected: /括弧の対応が取れていません/,
      },
      {
        title: '括弧の数が不正(2)',
        input: '(title=aaaaa))+body=aaa',
        expected: /括弧の対応が取れていません/,
      },
    ])(
      '$title',
      ({
        title,
        input,
        expected,
      }: {
        title: string
        input: string
        expected: string | RegExp
      }) => {
        try {
          const lexer = new Lexer()
          const tokens = lexer.tokenize(input)

          const parser = new Parser()
          parser.parse(tokens)
          throw new Error('例外が発生しませんでした')
        } catch (e) {
          if ((e as Error).stack) {
            console.log((e as Error).stack)
          }
          expect((e as Error).message).toMatch(expected)
        }
      },
    )
  })
})
