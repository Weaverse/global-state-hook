import React from "react"

type State = object | any
type Listener = (newState: State) => void

export interface ISubscription {
	subscribe: (fn: Listener) => void,
	unsubscribe: (fn: Listener) => void,
	listener: Listener[],
	state: State
}

export function createSubscription(initialState = {}): ISubscription {
	let state = { ...initialState }
	let listener: Listener[] = []
	function subscribe(fn: Listener) {
		listener.push(fn)
	}
	function unsubscribe(fn: Listener) {
		listener = listener.filter(f => f !== fn)
	}

	return { subscribe, unsubscribe, listener, state }
}

export interface IStateUpdater {
	setState: (newState: State) => void
	state: State
}

export function useSubscription(subscriber: ISubscription, pick: string[] = []): IStateUpdater {
	const { state } = subscriber
	const [, setUpdate] = React.useState()

	function setState(newState: State) {
		Object.assign(state, newState)
		subscriber.listener.forEach(fn => fn(newState))
	}

	React.useEffect(() => {
		const updater = (d: State) => {
			if (pick.length) {
				if (Object.keys(d).find(k => pick.includes(k))) {
					setUpdate(d)
				}
				return
			}
			setUpdate(d)
		}
		subscriber.subscribe(updater)
		return () => {
			subscriber.unsubscribe(updater)
		}
	}, [])
	return { state, setState }
}
