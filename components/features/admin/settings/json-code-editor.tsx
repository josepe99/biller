"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function JsonCodeEditor({
  value,
  onChange,
  disabled = false,
  error = '',
  placeholder = '{\n  "key": "value"\n}'
}: JsonCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);

  // Update line numbers when content changes
  useEffect(() => {
    const lines = value.split('\n');
    const numbers = lines.map((_, index) => (index + 1).toString());
    setLineNumbers(numbers);
  }, [value]);

  // Handle tab key for proper indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Set cursor position after the inserted spaces
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Handle bracket auto-completion
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const inputValue = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    onChange(inputValue);
  };

  // Auto-format JSON (basic)
  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch (error) {
      // Don't format if invalid JSON
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text/plain');
    
    try {
      // Try to format pasted JSON
      const parsed = JSON.parse(pastedText);
      const formatted = JSON.stringify(parsed, null, 2);
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + formatted + value.substring(end);
      onChange(newValue);
    } catch {
      // If not valid JSON, paste as-is
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + pastedText + value.substring(end);
      onChange(newValue);
    }
  };

  return (
    <div className="relative flex flex-col h-full min-h-[300px] border rounded-md overflow-hidden">
      {/* Header with format button */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b text-xs">
        <span className="text-muted-foreground font-mono">JSON Editor</span>
        <button
          type="button"
          onClick={formatJson}
          disabled={disabled || !!error}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Formatear
        </button>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 min-h-0">
        {/* Line numbers */}
        <div className="select-none bg-muted/20 px-2 py-2 text-xs font-mono text-muted-foreground border-r min-w-[3rem] text-right">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-5">
              {num}
            </div>
          ))}
        </div>

        {/* Code editor */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "resize-none border-0 focus:ring-0 font-mono text-sm leading-5 min-h-full",
              "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
              error && "text-destructive"
            )}
            style={{
              lineHeight: '1.25rem', // Match line numbers
              tabSize: 2,
              whiteSpace: 'pre'
            }}
          />
          
          {/* JSON syntax highlighting overlay could be added here */}
          {error && (
            <div className="absolute bottom-2 left-2 right-2 bg-destructive/10 border border-destructive/20 rounded p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Footer with helpful tips */}
      <div className="px-3 py-2 bg-muted/20 border-t text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Tip: Usa Tab para indentar, Ctrl+V para pegar y auto-formatear</span>
          <span>{value.split('\n').length} líneas</span>
        </div>
      </div>
    </div>
  );
}