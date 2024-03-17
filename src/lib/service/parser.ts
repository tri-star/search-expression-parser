import { AstNode } from '@/lib/ast'
import { TOKEN_TYPES, Term, Token, TokenType } from '@/lib/token'

class ParseContext {
  private tokens: Token[]
  private astTree: AstNode | undefined
  private position: number
  private length: number

  private parenthesisLevel: number

  constructor() {
    this.tokens = []
    this.position = 0
    this.length = 0
    this.parenthesisLevel = 0
  }

  init(tokens: Token[]) {
    this.tokens = tokens
    this.position = 0
    this.length = tokens.length
    this.parenthesisLevel = 0
  }

  consume() {
    this.position++
  }

  peek() {
    return this.tokens[this.position]
  }

  isEof() {
    return this.position >= this.length
  }

  enterParenthesis() {
    this.parenthesisLevel += 1
  }

  leaveParenthesis() {
    this.parenthesisLevel -= 1
    if (this.parenthesisLevel) {
      throw new ParseError({
        message: '括弧の対応が取れていません',
        expect: ')',
        got: '',
      })
    }
  }

  isParenthesisClosed() {
    return this.parenthesisLevel === 0
  }
}

class ParseError extends Error {
  constructor({
    message,
    expect,
    got,
  }: {
    message: string
    expect: string
    got: string
  }) {
    super(`${message} expected: ${expect}, got: ${got}`)
  }
}

/**
 * トークンの一覧をパースし、AstNodeを構築する。
 *
 * 括弧や演算子の結合順序を意識したツリーを構築します。
 */
export class Parser {
  private context: ParseContext

  constructor() {
    this.context = new ParseContext()
  }

  parse(tokens: Token[]) {
    this.context.init(tokens)
    const tree = this.parseOrExpression()

    if (this.tryToken(TOKEN_TYPES.RPAREN)) {
      throw new ParseError({
        message: '括弧の対応が取れていません',
        expect: 'TERM',
        got: 'RPAREN',
      })
    }

    if (!this.context.isParenthesisClosed()) {
      throw new ParseError({
        message: '括弧の対応が取れていません',
        expect: ')',
        got: '',
      })
    }

    return tree
  }

  parseOrExpression(): AstNode {
    let current = this.parseAndExpression()

    while (!this.context.isEof()) {
      if (!this.tryToken(TOKEN_TYPES.OR)) {
        return current
      }

      this.context.consume()
      const rightNode = this.parseAndExpression()
      current = {
        type: 'OR',
        left: current,
        right: rightNode,
      }
    }
    return current
  }

  parseAndExpression(): AstNode {
    let current = this.parseExpression()

    while (!this.context.isEof()) {
      if (!this.tryToken(TOKEN_TYPES.AND)) {
        return current
      }

      this.context.consume()
      const rightNode = this.parseExpression()
      current = {
        type: 'AND',
        left: current,
        right: rightNode,
      }
    }
    return current
  }

  parseExpression(): AstNode {
    if (this.tryToken(TOKEN_TYPES.LPAREN)) {
      return this.parseParenthesis()
    }

    const term = this.expectTermToken()
    this.expectToken(TOKEN_TYPES.EQUAL)
    const value = this.expectStringToken()
    return {
      type: 'EXPRESSION',
      term: term.value,
      value: value.value,
    }
  }

  parseParenthesis(): AstNode {
    this.context.enterParenthesis()
    this.expectToken(TOKEN_TYPES.LPAREN)
    const node = this.parseOrExpression()
    this.expectToken(TOKEN_TYPES.RPAREN)
    this.context.leaveParenthesis()
    return node
  }

  tryToken(tokenType: TokenType) {
    if (this.context.isEof()) {
      return false
    }
    const token = this.context.peek()
    return token.type === tokenType
  }

  expectToken(tokenType: TokenType) {
    if (this.context.isEof()) {
      new ParseError({
        message: '無効なトークンです',
        expect: tokenType,
        got: 'EOF',
      })
    }
    const token = this.context.peek()
    if (token.type === tokenType) {
      this.context.consume()
      return token
    }
    throw new ParseError({
      message: '無効なトークンです',
      expect: tokenType,
      got: token.type,
    })
  }

  expectTermToken() {
    const token = this.context.peek()
    if (token.type === TOKEN_TYPES.TERM) {
      this.context.consume()
      return token
    }
    throw new ParseError({
      message: '無効なトークンです',
      expect: 'TERM',
      got: token.type,
    })
  }

  expectStringToken() {
    const token = this.context.peek()
    if (token.type === TOKEN_TYPES.STRING) {
      this.context.consume()
      return token
    }
    throw new ParseError({
      message: '無効なトークンです',
      expect: 'STRING',
      got: token.type,
    })
  }
}
