// category=test/example*(title="test"+body="example test"A[20])*issued=">=2024-01-01"

// expr := condition_1 '+' condition_1 | condition_1 '-' condition_1 | condition_1
// condition_1 := condition_2 '*' condition_2 | condition_2
// condition_2 := term '=' value | '(' expr ')'
// term := 'title' | 'body' | 'issued'
// value := '"' string '"' | '\'' string '\'' | [^+-*\(\)=]+?

export const tokenTypeList = [
  'PLUS',
  'MINUS',
  'MULTIPLY',
  'LPAREN',
  'RPAREN',
  'EQUAL',
  'STRING',
  'TERM',
] as const
export type TokenType = (typeof tokenTypeList)[number]
export const tokenTypes = Object.fromEntries(
  tokenTypeList.map((t) => [t, t] as const),
) as { [K in TokenType]: K }

export const operatorTokenChars = ['+', '-', '*', '(', ')', '=']

export const termList = ['title', 'body', 'issued'] as const
export type Term = (typeof termList)[number]
export const terms = Object.fromEntries(
  termList.map((t) => [t, t] as const),
) as { [K in Term]: K }

export type Token =
  | {
      type: 'PLUS' | 'MINUS' | 'MULTIPLY' | 'LPAREN' | 'RPAREN' | 'EQUAL'
    }
  | {
      type: 'STRING'
      value: string
    }
  | {
      type: 'TERM'
      value: 'title' | 'body' | 'issued'
    }
