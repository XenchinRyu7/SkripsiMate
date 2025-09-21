import React, { useState } from 'react'
import { Button } from './ui/button'
import { ChevronDown, FileText, Download, FileDown } from 'lucide-react'

interface ExportDropdownProps {
  onExport: (format: 'json' | 'markdown' | 'pdf') => void
}

export default function ExportDropdown({ onExport }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = (format: 'json' | 'markdown' | 'pdf') => {
    onExport(format)
    setIsOpen(false)
  }

  const exportOptions = [
    {
      format: 'pdf' as const,
      label: 'Export to PDF',
      icon: FileText,
      description: 'Export as PDF document'
    },
    {
      format: 'markdown' as const,
      label: 'Export to Markdown',
      icon: Download,
      description: 'Export as Markdown file'
    },
    {
      format: 'json' as const,
      label: 'Export to JSON',
      icon: FileDown,
      description: 'Export as JSON file'
    }
  ]

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <FileText className="h-4 w-4" />
        <span>Export</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-20">
            {exportOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center space-x-3 group"
                >
                  <IconComponent className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
