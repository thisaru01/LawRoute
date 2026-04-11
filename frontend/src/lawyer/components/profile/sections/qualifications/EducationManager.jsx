/* Smarter Legal Education Suggestions v1.1 */
import React, { useState } from "react";
import { School, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuggestionInput } from "./components/SuggestionInput";

export default function EducationManager({
  form,
  isEditing,
  onChange,
}) {
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(-1);
  const [educationForm, setEducationForm] = useState({
    degree: "",
    institute: "",
    graduationYear: "",
  });

  const currentYear = new Date().getFullYear();
  const minYear = 1950;

  const eduYear = Number(educationForm.graduationYear);
  const isEduYearValid = !educationForm.graduationYear || (eduYear >= minYear && eduYear <= currentYear);
  const eduYearError = educationForm.graduationYear && !isEduYearValid
    ? `Year must be between ${minYear} and ${currentYear}`
    : null;

  const handleAddEducation = () => {
    if (!educationForm.degree || !educationForm.institute || !!eduYearError) return;
    const newList = [
      ...(form.education || []),
      {
        ...educationForm,
        graduationYear: Number(educationForm.graduationYear),
      },
    ];
    onChange("education")({ target: { value: newList } });
    setEducationForm({ degree: "", institute: "", graduationYear: "" });
    setIsAddingEducation(false);
  };

  const handleUpdateEducation = (index) => {
    if (!!eduYearError) return;
    const newList = [...(form.education || [])];
    newList[index] = {
      ...educationForm,
      graduationYear: Number(educationForm.graduationYear),
    };
    onChange("education")({ target: { value: newList } });
    setEditingEducationIndex(-1);
  };

  const handleDeleteEducation = (index) => {
    const newList = (form.education || []).filter((_, i) => i !== index);
    onChange("education")({ target: { value: newList } });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Education <span className="text-red-600 font-bold text-lg">*</span>
        </h3>
        {isEditing && !isAddingEducation && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => {
              setIsAddingEducation(true);
              setEducationForm({ degree: "", institute: "", graduationYear: "" });
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Education
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {form.education?.map((edu, idx) => (
          <div key={idx} className="group relative pr-10">
            {editingEducationIndex === idx ? (
              <div className="grid gap-3 p-5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <SuggestionInput
                  placeholder="Degree (e.g., Bachelor of Laws)"
                  value={educationForm.degree}
                  type="degree"
                  onChange={(val) =>
                    setEducationForm({
                      ...educationForm,
                      degree: val,
                    })
                  }
                />
                <SuggestionInput
                  placeholder="Institute (e.g., University of Colombo)"
                  value={educationForm.institute}
                  type="university"
                  onChange={(val) =>
                    setEducationForm({
                      ...educationForm,
                      institute: val,
                    })
                  }
                />
                <div className="space-y-1">
                  <Input
                    type="number"
                    placeholder="Graduation Year"
                    value={educationForm.graduationYear}
                    min={minYear}
                    max={currentYear}
                    className={eduYearError ? "border-red-400 focus-visible:ring-red-200" : "bg-white"}
                    onChange={(e) =>
                      setEducationForm({
                        ...educationForm,
                        graduationYear: e.target.value,
                      })
                    }
                  />
                  {eduYearError && (
                    <p className="text-[10px] text-red-500 font-medium pl-1">{eduYearError}</p>
                  )}
                </div>
                <div className="flex justify-end items-center gap-4 mt-1">
                  <button
                    type="button"
                    className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setEditingEducationIndex(-1)}
                  >
                    Cancel
                  </button>
                  <Button
                    size="sm"
                    className="bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg px-5 disabled:opacity-50 transition-all font-semibold"
                    onClick={() => handleUpdateEducation(idx)}
                    disabled={!!eduYearError || !educationForm.graduationYear}
                  >
                    {eduYearError ? "Fix Year" : "Save Entry"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-start p-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <School className="w-6 h-6" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <h4 className="text-[15px] font-bold text-foreground truncate group-hover:text-blue-600 transition-colors">
                    {edu.degree}
                  </h4>
                  <p className="text-sm font-medium text-muted-foreground/80 mt-0.5">
                    {edu.institute}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <p className="text-[11px] font-bold tracking-tight text-muted-foreground uppercase opacity-70">
                      Class of {edu.graduationYear}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isEditing && editingEducationIndex !== idx && (
              <div className="absolute right-0 top-0 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white border shadow-sm text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                  onClick={() => {
                    setEditingEducationIndex(idx);
                    setEducationForm(edu);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white border shadow-sm text-gray-400 hover:text-red-600 hover:border-red-200 transition-all"
                  onClick={() => handleDeleteEducation(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {isAddingEducation && (
          <div className="grid gap-4 p-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/20 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SuggestionInput
              placeholder="Degree (e.g., Bachelor of Laws)"
              value={educationForm.degree}
              type="degree"
              onChange={(val) =>
                setEducationForm({
                  ...educationForm,
                  degree: val,
                })
              }
            />
            <SuggestionInput
              placeholder="Institute (e.g., University of Colombo)"
              value={educationForm.institute}
              type="university"
              onChange={(val) =>
                setEducationForm({
                  ...educationForm,
                  institute: val,
                })
              }
            />
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Graduation Year"
                value={educationForm.graduationYear}
                min={minYear}
                max={currentYear}
                className={eduYearError ? "border-red-400 focus-visible:ring-red-200" : "bg-white"}
                onChange={(e) =>
                  setEducationForm({
                    ...educationForm,
                    graduationYear: e.target.value,
                  })
                }
              />
              {eduYearError && (
                <p className="text-[11px] text-red-500 font-medium pl-1">{eduYearError}</p>
              )}
            </div>
            <div className="flex justify-end items-center gap-6 mt-1">
              <button
                type="button"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsAddingEducation(false)}
              >
                Cancel
              </button>
              <Button
                size="sm"
                className="bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg px-6 py-5 disabled:opacity-50 transition-all font-bold shadow-md active:scale-95"
                onClick={handleAddEducation}
                disabled={!!eduYearError || !educationForm.graduationYear}
              >
                {eduYearError ? "Fix Year" : "Add Entry"}
              </Button>
            </div>
          </div>
        )}

        {!form.education?.length && !isAddingEducation && (
          <div className="text-center py-4 text-sm text-muted-foreground border rounded-xl border-dashed md:col-span-2">
            No education details added yet.
          </div>
        )}
      </div>
    </div>
  );
}
