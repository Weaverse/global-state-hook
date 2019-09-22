import React from "react"

type State = object
type Listener = (data: State) => void

interface ISubscriber {
	subscribe: (fn: Listener) => void,
	unsubscribe: (fn: Listener) => void,
	listener: Listener[],
	data: object | any
}

export function createSubscriber(initialState = {}): ISubscriber {
	let data = { ...initialState }
	let listener: Listener[] = []
	function subscribe(fn: Listener) {
		listener.push(fn)
	}
	function unsubscribe(fn: Listener) {
		listener = listener.filter(f => f !== fn)
	}
	return { subscribe, unsubscribe, listener, data }
}

interface IUpdater {
	update: (newData: State) => void
	data: object | any
}

export function useSubscriber(subscriber: ISubscriber, pick: string[] = []): IUpdater {
	const { data } = subscriber
	const [, setUpdate] = React.useState()
	function update(newData: State) {
		Object.assign(data, newData)
		subscriber.listener.forEach(fn => fn(newData))
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
	return { data, update }
}
