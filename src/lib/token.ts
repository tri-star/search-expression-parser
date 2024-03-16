
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
export type TokenType = typeof tokenTypeList[number]
const tokenTypes = Object.fromEntries(tokenTypeList.map(t => [t, t] as const)) as {[K in TokenType]: K}

export type Token = {
  type: 'PLUS' | 'MINUS' | 'MULTIPLY' | 'LPAREN' | 'RPAREN' | 'EQUAL'
} | {
  type: 'STRING'
  value: string
} | {
  type: 'TERM'
  value: 'title' | 'body' | 'issued'
}
