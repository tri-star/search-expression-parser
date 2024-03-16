import { Term, Token, operatorTokenChars, termList, terms } from '@/lib/token'
import { escapeRegExp } from '@/text-utils'

/**
 * パース処理の状態を保持するクラス
 */
class ParseContext {
  private source: string
  private position: number
  private tokens: Token[]

  constructor() {
    this.source = ''
    this.position = 0
    this.tokens = []
  }

  init(source: string) {
    this.source = source
    this.position = 0
    this.tokens = []
  }

  pushToken(token: Token) {
    this.tokens.push(token)
  }

  /**
   * 指定した文字数分パースを進める
   */
  consume(length: number) {
    this.position += length
  }

  getTokens() {
    return this.tokens
  }

  /**
   * 現在位置以降のソースを返す
   */
  currentSource() {
    return this.source.slice(this.position)
  }

  /**
   * 現在位置から指定も自分だけ抜き出す。(先には進まない)
   */
  peekSource(length: number) {
    return this.source.slice(this.position, this.position + length)
  }

  currentPosition() {
    return this.position
  }
}

/**
 * パースエラーに関する情報を含んだクラス
 */
class ParseError extends Error {
  constructor(
    message: string,
    public context: ParseContext,
  ) {
    super(`${message} (position: ${context.currentPosition()})`)
  }
}

/**
 * 入力文字列をトークンに分割する処理を行うクラス
 */
export class Lexer {
  private context: ParseContext

  constructor() {
    this.context = new ParseContext()
  }

  /**
   * トークン分割処理
   */
  tokenize(source: string): Token[] {
    this.context.init(source)

    this.parseJoinExpression()

    return this.context.getTokens()
  }

  /**
   * 「title=123」などの、キーワードと値の組み合わせをパースする
   */
  parseExpression() {
    this.consumeWhiteSpace()
    this.expectTerm()
    this.consumeWhiteSpace()
    this.expectString('=')
    this.context.pushToken({ type: 'EQUAL' })
    this.consumeWhiteSpace()
    this.expectValue()
    this.consumeWhiteSpace()
  }

  /**
   * AND(*),OR(+)のパースを行う
   */
  parseJoinExpression() {
    this.parseExpression()
    this.consumeWhiteSpace()
    if (this.tryString('+')) {
      this.context.pushToken({ type: 'OR' })
      this.context.consume(1)
      this.parseJoinExpression()
    }
    if (this.tryString('*')) {
      this.context.pushToken({ type: 'AND' })
      this.context.consume(1)
      this.parseJoinExpression()
    }
  }

  /**
   * title, bodyなどの"="の左辺部分のパースを行う
   */
  expectTerm() {
    const matched = this.context.currentSource().match(/^[A-Za-z]+/)
    const termString = matched?.[0]
    if (termString === undefined) {
      throw new ParseError('キーワードが見つかりません', this.context)
    }
    if (!termList.includes(termString as Term)) {
      throw new ParseError('キーワードが見つかりません', this.context)
    }
    this.context.pushToken({ type: 'TERM', value: termString as Term })
    this.context.consume(termString.length)
  }

  /**
   * title, bodyなどの"="の右辺部分のパースを行う
   */
  expectValue() {
    const operators = operatorTokenChars.map((s) => escapeRegExp(s)).join('')
    const valueRegExp = new RegExp(`[^${operators}\s]+`)

    const matched = this.context.currentSource().match(valueRegExp)
    const valueString = (matched?.[0] ?? '').trim()
    if (valueString === '') {
      throw new ParseError('値が見つかりません', this.context)
    }
    this.context.pushToken({ type: 'STRING', value: valueString as Term })
    this.context.consume(valueString.length)
  }

  /**
   * 現在位置に指定された文字列があるかを確認する。
   * (例：現在位置に「=」があるか確認する)
   */
  private tryString(s: string) {
    const slicedString = this.context.peekSource(s.length)
    return slicedString === s
  }

  /**
   * 現在位置に指定された文字列があるかを確認し、見つかった場合読み進める。なければエラーを投げる。
   */
  private expectString(s: string) {
    if (!this.tryString(s)) {
      throw new ParseError(`「${s}」が見つかりません。`, this.context)
    }
    this.context.consume(s.length)
    return s
  }

  /**
   * スペースを読み飛ばす
   */
  private consumeWhiteSpace() {
    const matched = this.context.currentSource().match(/^\s+/)
    if (matched === null) {
      return
    }
    this.context.consume(matched[0].length)
  }
}
