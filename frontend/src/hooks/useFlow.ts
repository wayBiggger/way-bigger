import { useEffect, useState, useCallback } from 'react'
import fcl, { configureFCL } from '@/services/flow/fclConfig'

type FlowUser = {
  addr?: string | null
  loggedIn?: boolean
}

export function useFlow() {
  const [user, setUser] = useState<FlowUser>({ addr: null, loggedIn: false })
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    configureFCL()
    setInitialised(true)
    const unsub = fcl.currentUser().subscribe(setUser)
    return () => { unsub() }
  }, [])

  const logIn = useCallback(() => fcl.authenticate(), [])
  const logOut = useCallback(() => fcl.unauthenticate(), [])
  const signMessage = useCallback(async (message: string) => {
    const hexMsg = Buffer.from(message).toString('hex')
    const res = await fcl.currentUser().signUserMessage(hexMsg)
    return res
  }, [])

  return { user, initialised, logIn, logOut, signMessage }
}

export default useFlow


