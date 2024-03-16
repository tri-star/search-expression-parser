import { Term, Token, operatorTokenChars, termList, terms } from '@/lib/token'
import { escapeRegExp } from '@/text-utils'

class ParseContext {
  private source: string
  private position: number
  private tokens: Token[]

  constructor(source: string) {
    this.source = source
    this.position = 0
    this.tokens = []
  }

  pushToken(token: Token) {
    this.tokens.push(token)
  }

  consume(length: number) {
    this.position += length
  }

  getTokens() {
    return this.tokens
  }

  expectTerm() {
    const matched = this.source.slice(this.position).match(/^[A-Za-z]+/)
    const termString = matched?.[0]
    if (termString === undefined) {
      throw new ParseError('キーワードが見つかりません', this.position)
    }
    if (!termList.includes(termString as Term)) {
      throw new ParseError('キーワードが見つかりません', this.position)
    }
    this.pushToken({ type: 'TERM', value: termString as Term })
    this.consume(termString.length)
  }

  expectValue() {
    const operators = operatorTokenChars.map((s) => escapeRegExp(s)).join('')
    const valueRegExp = new RegExp(`[^${operators}\s]+`)

    const matched = this.source.slice(this.position).match(valueRegExp)
    const valueString = (matched?.[0] ?? '').trim()
    if (valueString === '') {
      throw new ParseError('値が見つかりません', this.position)
    }
    this.pushToken({ type: 'STRING', value: valueString as Term })
    this.consume(valueString.length)
  }

  peekString(s: string) {
    const slicedString =
      this.source.slice(this.position, this.position + s.length) ?? ''
    return slicedString === s
  }

  expectString(s: string) {
    if (!this.peekString(s)) {
      throw new ParseError(`「${s}」が見つかりません。`, this.position)
    }
    this.consume(s.length)
    return s
  }

  consumeWhiteSpace() {
    const matched = this.source.slice(this.position).match(/^\s+/)
    if (matched === null) {
      return
    }
    this.consume(matched[0].length)
  }
}

export class Lexer {
  tokenize(source: string): Token[] {
    const context = new ParseContext(source)

    this.parseOrExpression(context)

    return context.getTokens()
  }

  parseExpression(context: ParseContext) {
    context.consumeWhiteSpace()
    const term = context.expectTerm()
    context.consumeWhiteSpace()
    context.expectString('=')
    context.pushToken({ type: 'EQUAL' })
    context.consumeWhiteSpace()
    context.expectValue()
    context.consumeWhiteSpace()
  }

  parseOrExpression(context: ParseContext) {
    this.parseExpression(context)
    context.consumeWhiteSpace()
    if (context.peekString('+')) {
      context.pushToken({ type: 'OR' })
      context.consume(1)
      this.parseOrExpression(context)
    }
  }
}

class ParseError extends Error {
  constructor(
    message: string,
    public position: number,
  ) {
    super(`${message} (position: ${position})}`)
  }
}
