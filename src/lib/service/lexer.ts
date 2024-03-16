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

  currentSource() {
    return this.source.slice(this.position)
  }

  peekSource(length: number) {
    return this.source.slice(this.position, this.position + length)
  }

  currentPosition() {
    return this.position
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

export class Lexer {
  tokenize(source: string): Token[] {
    const context = new ParseContext(source)

    this.parseJoinExpression(context)

    return context.getTokens()
  }

  parseExpression(context: ParseContext) {
    this.consumeWhiteSpace(context)
    const term = this.expectTerm(context)
    this.consumeWhiteSpace(context)
    this.expectString(context, '=')
    context.pushToken({ type: 'EQUAL' })
    this.consumeWhiteSpace(context)
    this.expectValue(context)
    this.consumeWhiteSpace(context)
  }

  parseJoinExpression(context: ParseContext) {
    this.parseExpression(context)
    this.consumeWhiteSpace(context)
    if (this.tryString(context, '+')) {
      context.pushToken({ type: 'OR' })
      context.consume(1)
      this.parseJoinExpression(context)
    }
    if (this.tryString(context, '*')) {
      context.pushToken({ type: 'AND' })
      context.consume(1)
      this.parseJoinExpression(context)
    }
  }

  expectTerm(context: ParseContext) {
    const matched = context.currentSource().match(/^[A-Za-z]+/)
    const termString = matched?.[0]
    if (termString === undefined) {
      throw new ParseError(
        'キーワードが見つかりません',
        context.currentPosition(),
      )
    }
    if (!termList.includes(termString as Term)) {
      throw new ParseError(
        'キーワードが見つかりません',
        context.currentPosition(),
      )
    }
    context.pushToken({ type: 'TERM', value: termString as Term })
    context.consume(termString.length)
  }

  expectValue(context: ParseContext) {
    const operators = operatorTokenChars.map((s) => escapeRegExp(s)).join('')
    const valueRegExp = new RegExp(`[^${operators}\s]+`)

    const matched = context.currentSource().match(valueRegExp)
    const valueString = (matched?.[0] ?? '').trim()
    if (valueString === '') {
      throw new ParseError('値が見つかりません', context.currentPosition())
    }
    context.pushToken({ type: 'STRING', value: valueString as Term })
    context.consume(valueString.length)
  }
  tryString(context: ParseContext, s: string) {
    const slicedString = context.peekSource(s.length)
    return slicedString === s
  }

  expectString(context: ParseContext, s: string) {
    if (!this.tryString(context, s)) {
      throw new ParseError(
        `「${s}」が見つかりません。`,
        context.currentPosition(),
      )
    }
    context.consume(s.length)
    return s
  }

  consumeWhiteSpace(context: ParseContext) {
    const matched = context.currentSource().match(/^\s+/)
    if (matched === null) {
      return
    }
    context.consume(matched[0].length)
  }
}
