---
layout: full.html
algolia: true
title: log
order: 400
---

# log

{{{since "1.0.0"}}}

These methods can be used to send messages to Kuzzle's log system.  
Different log level are provided, and lower priority levels may be ignored depending on how the Kuzzle server is configured.

The lower a log level is, the higher its priority.

## `error`

{{{since "1.0.0"}}}

Priority: 0 (highest priority)

```js
context.log.error('error message');
```

## `warn`

{{{since "1.0.0"}}}

Priority: 1

```js
context.log.warn('warn message');
```

## `info`

{{{since "1.0.0"}}}

Priority: 2

```js
context.log.info('info message');
```

## `verbose`

{{{since "1.0.0"}}}

Priority: 3

```js
context.log.verbose('verbose message');
```

## `debug`

{{{since "1.0.0"}}}

Priority: 4

```js
context.log.debug('debug message');
```

## `silly`

{{{since "1.0.0"}}}

Priority: 5 (lowest priority)

```js
context.log.silly('silly message');
```
