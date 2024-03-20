// category=test/example*(title="test"+body="example test"A[20])*issued=">=2024-01-01"

// expr := condition_1 '+' condition_1 | condition_1 '-' condition_1 | condition_1
// condition_1 := condition_2 '*' condition_2 | condition_2
// condition_2 := term '=' value | '(' expr ')'
// term := 'title' | 'body' | 'issued'
// value := '"' string '"' | '\'' string '\'' | [^+-*\(\)=]+?

export const TOKEN_TYPE_LIST = [
  'OR',
  'AND',
  'LPAREN',
  'RPAREN',
  'EQUAL',
  'STRING',
  'TERM',
] as const
export type TokenType = (typeof TOKEN_TYPE_LIST)[number]
export const TOKEN_TYPES = Object.fromEntries(
  TOKEN_TYPE_LIST.map((t) => [t, t] as const),
) as { [K in TokenType]: K }

export const operatorTokenChars = ['+', '*', '(', ')', '=', '"', "'"]

export const TERM_LIST = ['title', 'body', 'issued'] as const
export type Term = (typeof TERM_LIST)[number]
export const TERMS = Object.fromEntries(
  TERM_LIST.map((t) => [t, t] as const),
) as { [K in Term]: K }

export type Token =
  | {
      type: 'OR' | 'AND' | 'LPAREN' | 'RPAREN' | 'EQUAL'
    }
  | {
      type: 'STRING'
      value: string
    }
  | {
      type: 'TERM'
      value: 'title' | 'body' | 'issued'
    }
