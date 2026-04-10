import React, { useState } from "react";
import { Languages, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageManager({
  form,
  isEditing,
  onChange,
  LANGUAGE_OPTIONS,
}) {
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [languageForm, setLanguageForm] = useState("");

  const handleAddLanguage = () => {
    if (!languageForm.trim()) return;
    const newList = [...(form.languages || []), languageForm.trim()];
    onChange("languages")({ target: { value: newList } });
    setLanguageForm("");
    setIsAddingLanguage(false);
  };

  const handleDeleteLanguage = (index) => {
    const newList = (form.languages || []).filter((_, i) => i !== index);
    onChange("languages")({ target: { value: newList } });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Communication Languages
        </h3>
        {isEditing && !isAddingLanguage && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setIsAddingLanguage(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Language
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {form.languages?.map((lang, idx) => (
          <div key={idx} className="relative group">
            <Badge
              variant="secondary"
              className="pl-3 pr-8 py-1.5 font-medium bg-gray-50 text-gray-700 border-gray-200"
            >
              <Languages className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              {lang}
            </Badge>
            {isEditing && (
              <button
                onClick={() => handleDeleteLanguage(idx)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {isAddingLanguage && (
          <div className="flex items-center gap-2">
            <Select
              value={languageForm}
              onValueChange={(value) => setLanguageForm(value)}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.filter(
                  (opt) => !form.languages?.includes(opt.value)
                ).map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600 disabled:opacity-50"
              onClick={handleAddLanguage}
              disabled={!languageForm}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400"
              onClick={() => {
                setIsAddingLanguage(false);
                setLanguageForm("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {!form.languages?.length && !isAddingLanguage && (
          <p className="text-sm text-muted-foreground italic">
            No languages added.
          </p>
        )}
      </div>
    </div>
  );
}
