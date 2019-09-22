import React  from "react"
import { createSubscriber, useSubscriber } from "../src/index"
import { render } from "react-dom"


const counterSubscriber = createSubscriber({count: 0, foo: 10})

function CounterDisplay() {
	let {data, update} = useSubscriber(counterSubscriber)
	return (
		<div>
			<button onClick={() => update({count: data.count - 1})}>-</button>
			<span>{data.count}</span>
			<button onClick={() => update({count: data.count + 1})}>+</button>
		</div>
	)
}
function FooDisplay() {
	// Only update when foo change
	let {data, update} = useSubscriber(counterSubscriber, ['foo'])
	console.log('Only update when foo change', data.foo)
	return (
		<div>
			<button onClick={() => update({foo: data.foo - 1})}>-</button>
			<span>{data.foo}</span>
			<button onClick={() => update({foo: data.foo + 1})}>+</button>
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
