'use client'

import { ReactNode } from 'react'
import { Button, ButtonProps } from './ui/button'

export default function OnChainOpButton(
  props: {
    isSubmitting?: boolean
    isWaitingForConfirmation?: boolean
    submittingContent?: ReactNode
    waitingContent?: ReactNode
    children?: ReactNode
  } & Omit<ButtonProps, 'loading'>
) {
  const {
    isSubmitting,
    isWaitingForConfirmation,
    submittingContent,
    waitingContent,
    children,
    ...otherProps
  } = props

  let content = children
  if (isSubmitting) {
    content = submittingContent
  } else if (isWaitingForConfirmation) {
    content = waitingContent
  }
  return (
    <Button {...otherProps} loading={isSubmitting || isWaitingForConfirmation}>
      {content}
    </Button>
  )
}
