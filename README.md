# 検索式パーサーの実装デモ

## 概要

以下のような検索式をパースしASTを構築するデモです。

BNF

```
expr := condition_1 '+' condition_1 | condition_1 '-' condition_1 | condition_1
condition_1 := condition_2 '*' condition_2 | condition_2
condition_2 := term '=' value | '(' expr ')'
term := 'title' | 'body' | 'issued'
value := '"' string '"' | '\'' string '\'' | [^+-*\(\)=]+?
```

入力例

```
category=outdoor/food * (body = 麺 + body=肉) * issued=">=2019-01-01"
```

変換結果

```ts
{
  type: 'AND',
  left: {
    type: 'EXPRESSION',
    term: 'category',
    value: 'outdoor/food'
  },
  right: {
    type: 'AND',
    left: {
      type: 'OR',
      left: {
        type: 'EXPRESSION',
        term: 'body',
        value: '麺'
      },
      right: {
        type: 'EXPRESSION',
        term: 'body',
        value: '肉'
      }
    },
    right: {
      type: 'EXPRESSION',
      term: 'issued',
      value: '>=2019-01-01'
    }
  }
}
```
