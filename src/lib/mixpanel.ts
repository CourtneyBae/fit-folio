import mixpanel from 'mixpanel-browser'

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN as string, {
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
