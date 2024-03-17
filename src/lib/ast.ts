import { Term } from '@/lib/token'

export type AstNode =
  | {
      type: 'AND' | 'OR'
      left: AstNode
      right: AstNode
    }
  | {
      type: 'EXPRESSION'
      term: Term
      value: string
    }
