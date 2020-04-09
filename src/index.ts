import React from "react"

type State = object | any
type Listener = (newState: State) => void

export interface ISubscription {
	subscribe: (fn: Listener) => void
	unsubscribe: (fn: Listener) => void
	listener: Listener[]
	state: State
}

export function createSubscription(initialState: any = {}): ISubscription {
	const state = initialState || {}
	let listener: Listener[] = []
	const subscribe = (fn: Listener) => listener.push(fn)
	const unsubscribe = (fn: Listener) =>
		(listener = listener.filter((f) => f !== fn))
	return { subscribe, unsubscribe, listener, state }
}

export interface IStateUpdater {
	setState: (newState: State, callback?: (newState: State) => void) => void
	state: State
	changed: any
}

export function useSubscription(
	subscriber: ISubscription,
	pick: string[] = [],
): IStateUpdater {
	const [changed, setUpdate] = React.useState({})
	const setState = React.useCallback((newState: State, callback = () => {}) => {
		subscriber.state =
			newState &&
			typeof newState === "object" &&
			newState.constructor === Object
				? Object.assign({}, subscriber.state, newState)
				: newState
		subscriber.listener.forEach((fn) => fn(newState))
		callback(newState)
	}, [])
	const mounted = React.useRef(true)

	const updater = React.useCallback((nextState: State) => {
		if (
			mounted.current &&
			(!pick.length ||
				typeof nextState !== "object" ||
				nextState.constructor !== Object ||
				Object.keys(nextState).find((k) => pick.includes(k)))
		) {
			setUpdate({})
		}
	}, [])
	React.useEffect(() => {
		subscriber.subscribe(updater)
		return () => {
			mounted.current = false
			subscriber.unsubscribe(updater)
		}
	}, [])
	React.useDebugValue(subscriber.state)
	return { state: subscriber.state, setState, changed }
}
