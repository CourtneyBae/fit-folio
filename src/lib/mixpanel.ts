import mixpanel from 'mixpanel-browser'

mixpanel.init('4cebf8724eb13b6377399cf232d2afc1', {
  track_pageview: true,
  persistence: 'localStorage',
})

export const track = (event: string, props?: Record<string, unknown>) => {
  mixpanel.track(event, props)
}

export const identify = (userId: string, props?: { name?: string; email?: string }) => {
  mixpanel.identify(userId)
  if (props) mixpanel.people.set({ $name: props.name, $email: props.email })
}

export const reset = () => mixpanel.reset()

export default mixpanel
