import React, { useState } from "react";
import { School, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            onClick={() => setIsAddingEducation(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Education
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {form.education?.map((edu, idx) => (
          <div key={idx} className="group relative pr-10">
            {editingEducationIndex === idx ? (
              <div className="grid gap-3 p-4 rounded-xl border bg-gray-50/50">
                <Input
                  placeholder="Degree (e.g., Bachelor of Laws)"
                  value={educationForm.degree}
                  onChange={(e) =>
                    setEducationForm({
                      ...educationForm,
                      degree: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Institute (e.g., University of Colombo)"
                  value={educationForm.institute}
                  onChange={(e) =>
                    setEducationForm({
                      ...educationForm,
                      institute: e.target.value,
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
                    className={eduYearError ? "border-red-400 focus-visible:ring-red-200" : ""}
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
                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEducationIndex(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-black text-white px-4 disabled:opacity-50"
                    onClick={() => handleUpdateEducation(idx)}
                    disabled={!!eduYearError || !educationForm.graduationYear}
                  >
                    {eduYearError ? "Fix Year" : "Save Entry"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[14px] font-bold text-foreground truncate">
                    {edu.degree}
                  </h4>
                  <p className="text-xs font-medium text-muted-foreground">
                    {edu.institute}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {edu.graduationYear}
                  </p>
                </div>
              </div>
            )}
            {isEditing && editingEducationIndex !== idx && (
              <div className="absolute right-0 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-blue-600"
                  onClick={() => {
                    setEditingEducationIndex(idx);
                    setEducationForm(edu);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-red-600"
                  onClick={() => handleDeleteEducation(idx)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {isAddingEducation && (
          <div className="grid gap-3 p-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30">
            <Input
              placeholder="Degree (e.g., Bachelor of Laws)"
              value={educationForm.degree}
              onChange={(e) =>
                setEducationForm({
                  ...educationForm,
                  degree: e.target.value,
                })
              }
            />
            <Input
              placeholder="Institute (e.g., University of Colombo)"
              value={educationForm.institute}
              onChange={(e) =>
                setEducationForm({
                  ...educationForm,
                  institute: e.target.value,
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
                className={eduYearError ? "border-red-400 focus-visible:ring-red-200" : ""}
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
            <div className="flex justify-end gap-2 mt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingEducation(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-black text-white px-4 disabled:opacity-50"
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
