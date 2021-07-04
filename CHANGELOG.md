# 1.7.4

- Adds `onSend` option.

```ts
createState({
  ...,
  options: {
    onSend(eventName, payload, didCauseUpdate) => {
      // Some kind of logging?
      // logger.log(eventName, payload, didCauseUpdate)
    }
  }
})
```

# 1.7.2

- Removes ES5 support.
- Adds `forceData` helper.
