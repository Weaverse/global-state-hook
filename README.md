<p align="right">
  <strong>
    <a href="README.md">English</a>
  </strong>
  <br/>
  <sup><em>(Please contribute translations!)</em></sup>
</p>

# Use Global State Hook

> 200 bytes for exactly what you need to manage React state


## Install

```sh
npm install --save global-state-hook
```

## Example

```tsx
import React  from "react"
import { createSubscription, useSubscription } from "global-state-hook"
import { render } from "react-dom"


const counterSubscription = createSubscription({count: 0, foo: 10})

function CounterDisplay() {
	let {state, setState} = useSubscription(counterSubscription)
	return (
		<div>
			<button onClick={() => setState({count: state.count - 1})}>-</button>
			<span>{state.count}</span>
			<button onClick={() => setState({count: state.count + 1})}>+</button>
		</div>
	)
}
function FooDisplay() {
	// Only update when foo change
	let {state, update} = useSubscription(counterSubscription, ['foo'])
	console.log('Only update when foo change', state.foo)
	return (
		<div>
			<button onClick={() => update({foo: state.foo - 1})}>-</button>
			<span>{state.foo}</span>
			<button onClick={() => update({foo: state.foo + 1})}>+</button>
		</div>
	)
}

function App() {
	return (
		<>
			<CounterDisplay />
			<FooDisplay/>
		</>
	)
}

render(<App />, document.getElementById("root"))
```

## API

### `createSubscription(initialState)`
### `useSubscription(subscriber, pick: string[])`
