"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Lock, Users, ChevronDown } from "lucide-react"
import { useState } from "react"

export type PrivacyLevel = "public" | "friends" | "private"

interface PrivacySelectorProps {
  defaultValue?: PrivacyLevel
  onChange?: (value: PrivacyLevel) => void
}

export function PrivacySelector({ defaultValue = "public", onChange }: PrivacySelectorProps) {
  const [value, setValue] = useState<PrivacyLevel>(defaultValue)

  const handleSelect = (newValue: PrivacyLevel) => {
    setValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const options = {
    public: {
      icon: Globe,
      label: "Public",
      description: "Anyone can see this post",
    },
    friends: {
      icon: Users,
      label: "Friends",
      description: "Only your friends can see this post",
    },
    private: {
      icon: Lock,
      label: "Private",
      description: "Only you can see this post",
    },
  }

  const selected = options[value]
  const SelectedIcon = selected.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <SelectedIcon className="h-4 w-4" />
          <span>{selected.label}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(options).map(([key, option]) => {
          const Icon = option.icon
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleSelect(key as PrivacyLevel)}
              className="flex items-start gap-2 py-2"
            >
              <Icon className="h-4 w-4 mt-0.5" />
              <div>
                <div>{option.label}</div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
