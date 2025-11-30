'use client'

import { useState, useRef } from 'react'
import FormSalarie from './FormSalarie'

interface Perimetre {
  id: string
  nom: string
}

interface FormSalarieWrapperProps {
  perimetres: Perimetre[]
  onSave?: () => void
}

export default function FormSalarieWrapper({ perimetres, onSave }: FormSalarieWrapperProps) {
  const refreshListRef = useRef<(() => void) | null>(null)

  const handleSave = async () => {
    if (onSave) {
      onSave()
    }
  }

  return (
    <FormSalarie perimetres={perimetres} onSave={handleSave} />
  )
}

