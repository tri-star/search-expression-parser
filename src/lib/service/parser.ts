import { AstNode } from '@/lib/ast'
import { TOKEN_TYPES, Term, Token, TokenType } from '@/lib/token'

class ParseContext {
  private tokens: Token[]
  private astTree: AstNode | undefined
  private position: number
  private length: number

  constructor() {
    this.tokens = []
    this.position = 0
    this.length = 0
  }

  init(tokens: Token[]) {
    this.tokens = tokens
    this.position = 0
    this.length = tokens.length
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
    return this.parseOrExpression()
  }

  parseOrExpression() {
    const leftNode = this.parseAndExpression()

    if (!this.tryToken(TOKEN_TYPES.OR)) {
      return leftNode
    }

    this.context.consume()
    const rightNode = this.parseAndExpression()
    return {
      type: 'OR',
      left: leftNode,
      right: rightNode,
    }
  }

  parseAndExpression() {
    const leftNode = this.parseExpression()

    if (!this.tryToken(TOKEN_TYPES.AND)) {
      return leftNode
    }

    this.context.consume()
    const rightNode = this.parseExpression()
    return {
      type: 'AND',
      left: leftNode,
      right: rightNode,
    }
  }

  parseExpression(): AstNode {
    const term = this.expectTermToken()
    this.expectToken(TOKEN_TYPES.EQUAL)
    const value = this.expectStringToken()
    return {
      type: 'EXPRESSION',
      term: term.value,
      value: value.value,
    }
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
