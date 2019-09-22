import React from "react"
import { createSubscription, useSubscription } from "../src/index"
import { render } from "react-dom"


const counterSubscription = createSubscription({ count: 0, foo: 10 })
const textSubscription = createSubscription({ value: "The text will sync together" })

const useCounter = () => {
	let { state, setState } = useSubscription(counterSubscription, ["count"])
	const increment = () => setState({ count: state.count + 1 })
	const decrement = () => setState({ count: state.count + 1 })
	return { count: state.count, increment, decrement }

}

function CounterDisplay() {
	let { count, increment, decrement } = useCounter()
	return (
		<div>
			<button onClick={decrement}>-</button>
			<span>{count}</span>
			<button onClick={increment}>+</button>
		</div>
	)
}
function FooDisplay() {
	// Only update when foo change
	let { state, setState } = useSubscription(counterSubscription, ["foo"])
	console.log("Only update when foo change", state.foo)
	return (
		<div>
			<button onClick={() => setState({ foo: state.foo - 1 })}>-</button>
			<span>{state.foo}</span>
			<button onClick={() => setState({ foo: state.foo + 1 })}>+</button>
		</div>
	)
}

const useTextValue = () => {
	let { state, setState } = useSubscription(textSubscription)
	const onChange = e => setState({ value: e.target.value })
	return { value: state.value, onChange }
}

function Text() {
	let { value, onChange } = useTextValue()
	return <div>
		<input value={value} onChange={onChange}/>
	</div>
}


function App() {
	return (
		<>
			<CounterDisplay />
			<FooDisplay/>
			<Text/>

			{/*You can put the Text component anywhere*/}
			<Text/>
		</>
	)
}

render(<App />, document.getElementById("root"))
