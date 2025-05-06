'use client'

import React, { useId } from 'react'
import { cn } from '@lib/util/cn'

export type TextareaProps = {
  label?: string
  name: string
  id?: string
  value?: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  placeholder?: string
  className?: string
  errorMessage?: string
  required?: boolean
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  id,
  value,
  onChange,
  rows = 3,
  placeholder,
  className,
  errorMessage,
  required = false,
}) => {
  const generatedId = useId()
  const textareaId = id || `${name}-${generatedId}`

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-black mb-1"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={cn(
          "w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
          errorMessage && "border-red-500",
          className
        )}
        required={required}
      />
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  )
}

export default Textarea 