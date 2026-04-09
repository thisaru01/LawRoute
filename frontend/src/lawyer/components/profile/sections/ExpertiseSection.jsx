import React, { useState } from "react";
import { 
  Briefcase, 
  Pencil, 
  Plus, 
  Languages, 
  ShieldCheck, 
  Trash2, 
  X, 
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpertiseSection({
  form,
  isEditing,
  isSaving,
  onChange,
  onSave,
  setIsEditing,
}) {
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [editingLanguageIndex, setEditingLanguageIndex] = useState(-1);
  const [languageForm, setLanguageForm] = useState("");

  const [isAddingPracticeArea, setIsAddingPracticeArea] = useState(false);
  const [editingPracticeAreaIndex, setEditingPracticeAreaIndex] = useState(-1);
  const [practiceAreaForm, setPracticeAreaForm] = useState({
    level: "intermediate",
  });

  // --- Work History Space (Migrated) ---
  const [isAddingWorkHistory, setIsAddingWorkHistory] = useState(false);
  const [editingWorkHistoryIndex, setEditingWorkHistoryIndex] = useState(-1);
  const [workHistoryForm, setWorkHistoryForm] = useState({
    lawFirm: "",
    position: "",
    startDate: "",
    endDate: "",
    responsibilities: "",
    majorCasesSummary: "",
  });

  const handleAddWorkHistory = () => {
    if (!workHistoryForm.lawFirm || !workHistoryForm.position) return;
    const newList = [...(form.workHistory || []), workHistoryForm];
    onChange("workHistory")({ target: { value: newList } });
    setWorkHistoryForm({
      lawFirm: "",
      position: "",
      startDate: "",
      endDate: "",
      responsibilities: "",
      majorCasesSummary: "",
    });
    setIsAddingWorkHistory(false);
  };

  const handleUpdateWorkHistory = (index) => {
    const newList = [...form.workHistory];
    newList[index] = workHistoryForm;
    onChange("workHistory")({ target: { value: newList } });
    setEditingWorkHistoryIndex(-1);
  };

  const handleDeleteWorkHistory = (index) => {
    const newList = form.workHistory.filter((_, i) => i !== index);
    onChange("workHistory")({ target: { value: newList } });
  };

  const handleAddLanguage = () => {
    if (!languageForm.trim()) return;
    const newList = [...(form.languages || []), languageForm.trim()];
    onChange("languages")({ target: { value: newList } });
    setLanguageForm("");
    setIsAddingLanguage(false);
  };

  const handleDeleteLanguage = (index) => {
    const newList = form.languages.filter((_, i) => i !== index);
    onChange("languages")({ target: { value: newList } });
  };

  const handleAddPracticeArea = () => {
    if (!practiceAreaForm.name) return;
    const newList = [...(form.practiceAreas || []), practiceAreaForm];
    onChange("practiceAreas")({ target: { value: newList } });
    setPracticeAreaForm({ name: "", level: "intermediate" });
    setIsAddingPracticeArea(false);
  };

  const handleUpdatePracticeArea = (index) => {
    const newList = [...form.practiceAreas];
    newList[index] = practiceAreaForm;
    onChange("practiceAreas")({ target: { value: newList } });
    setEditingPracticeAreaIndex(-1);
  };

  const handleDeletePracticeArea = (index) => {
    const newList = form.practiceAreas.filter((_, i) => i !== index);
    onChange("practiceAreas")({ target: { value: newList } });
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-gray-200/60">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-blue-600">
              <Briefcase className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Expertise & Experience</CardTitle>
              <CardDescription>
                Showcase your skills, specializations, and professional journey.
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 border-gray-200 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 mr-1.5 text-gray-700" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* 1. Languages Section */}
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
                <Input
                  size="sm"
                  className="h-8 w-32"
                  placeholder="e.g., Sinhala"
                  value={languageForm}
                  onChange={(e) => setLanguageForm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddLanguage()}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-green-600"
                  onClick={handleAddLanguage}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-400"
                  onClick={() => setIsAddingLanguage(false)}
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

        <Separator />

        {/* 2. Practice Areas Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Practice Areas
            </h3>
            {isEditing && !isAddingPracticeArea && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsAddingPracticeArea(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Area
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.practiceAreas?.map((area, idx) => (
              <div key={idx} className="group relative pr-10">
                {editingPracticeAreaIndex === idx ? (
                  <div className="grid gap-2 p-3 rounded-lg border bg-gray-50/50">
                    <Input
                      size="sm"
                      placeholder="Area Name"
                      value={practiceAreaForm.name}
                      onChange={(e) =>
                        setPracticeAreaForm({
                          ...practiceAreaForm,
                          name: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={practiceAreaForm.level}
                      onValueChange={(v) =>
                        setPracticeAreaForm({ ...practiceAreaForm, level: v })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex justify-end gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingPracticeAreaIndex(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs bg-blue-600 text-white"
                        onClick={() => handleUpdatePracticeArea(idx)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-foreground">
                        {area.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600/80 uppercase tracking-wider">
                        {area.level || "Intermediate"}
                      </p>
                    </div>
                  </div>
                )}
                {isEditing && editingPracticeAreaIndex !== idx && (
                  <div className="absolute right-0 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-blue-600"
                      onClick={() => {
                        setEditingPracticeAreaIndex(idx);
                        setPracticeAreaForm(area);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => handleDeletePracticeArea(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isAddingPracticeArea && (
              <div className="grid gap-2 p-3 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/30">
                <Input
                  size="sm"
                  placeholder="e.g., Civil Law"
                  value={practiceAreaForm.name}
                  onChange={(e) =>
                    setPracticeAreaForm({
                      ...practiceAreaForm,
                      name: e.target.value,
                    })
                  }
                />
                <Select
                  value={practiceAreaForm.level}
                  onValueChange={(v) =>
                    setPracticeAreaForm({ ...practiceAreaForm, level: v })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsAddingPracticeArea(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs bg-blue-600 text-white"
                    onClick={handleAddPracticeArea}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 3. Work History Section (Migrated Internal UI) */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Professional Experience
            </h3>
            {isEditing && !isAddingWorkHistory && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsAddingWorkHistory(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Role
              </Button>
            )}
          </div>

          <div className="space-y-6 relative">
            {/* Timeline vertical line */}
            {(form.workHistory?.length || 0) > 1 && (
              <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
            )}

            {form.workHistory?.map((job, idx) => (
              <div key={idx} className="relative pl-10 group">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-9 h-9 rounded-xl bg-white border-2 border-blue-50 shadow-sm flex items-center justify-center text-blue-600 -ml-[2px] z-10 group-hover:border-blue-200 transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>

                {editingWorkHistoryIndex === idx ? (
                  <div className="grid gap-3 p-5 rounded-2xl border bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">
                          Firm Name
                        </label>
                        <Input
                          size="sm"
                          value={workHistoryForm.lawFirm}
                          onChange={(e) =>
                            setWorkHistoryForm({
                              ...workHistoryForm,
                              lawFirm: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">
                          Position
                        </label>
                        <Input
                          size="sm"
                          value={workHistoryForm.position}
                          onChange={(e) =>
                            setWorkHistoryForm({
                              ...workHistoryForm,
                              position: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          size="sm"
                          value={workHistoryForm.startDate?.split("T")[0]}
                          onChange={(e) =>
                            setWorkHistoryForm({
                              ...workHistoryForm,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">
                          End Date
                        </label>
                        <Input
                          type="date"
                          size="sm"
                          value={workHistoryForm.endDate?.split("T")[0]}
                          onChange={(e) =>
                            setWorkHistoryForm({
                              ...workHistoryForm,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Responsibilities
                      </label>
                      <textarea
                        className="w-full text-sm rounded-md border border-input p-2 bg-transparent outline-none focus:ring-1 focus:ring-blue-400"
                        rows={3}
                        value={workHistoryForm.responsibilities}
                        onChange={(e) =>
                          setWorkHistoryForm({
                            ...workHistoryForm,
                            responsibilities: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">
                        Major Cases
                      </label>
                      <textarea
                        className="w-full text-sm rounded-md border border-input p-2 bg-transparent outline-none focus:ring-1 focus:ring-blue-400"
                        rows={2}
                        value={workHistoryForm.majorCasesSummary}
                        onChange={(e) =>
                          setWorkHistoryForm({
                            ...workHistoryForm,
                            majorCasesSummary: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingWorkHistoryIndex(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 px-6 text-white"
                        onClick={() => handleUpdateWorkHistory(idx)}
                      >
                        Update Experience
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pr-8">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-bold text-foreground leading-none">
                        {job.position}
                      </h4>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            onClick={() => {
                              setEditingWorkHistoryIndex(idx);
                              setWorkHistoryForm(job);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteWorkHistory(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-[15px] font-semibold text-blue-600/90 mb-1">
                      {job.lawFirm}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mb-4">
                      {job.startDate
                        ? new Date(job.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                        : ""}{" "}
                      —{" "}
                      {job.endDate
                        ? new Date(job.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                        : "Present"}
                    </p>
                    <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
                      <div className="pl-4 border-l-2 border-gray-100">
                        <p>{job.responsibilities}</p>
                      </div>
                      {job.majorCasesSummary && (
                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100/50">
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Notable Cases
                          </h5>
                          <p className="text-gray-500 italic">
                            {job.majorCasesSummary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAddingWorkHistory && (
              <div className="pl-10 relative">
                <div className="absolute left-0 top-1.5 w-9 h-9 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 -ml-[2px] z-10">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="grid gap-3 p-6 rounded-2xl border-2 border-dashed border-blue-100 bg-blue-50/30">
                  <h4 className="text-sm font-bold text-blue-800 mb-2">
                    New Experience Entry
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-blue-600/60 ">
                        Firm Name
                      </label>
                      <Input
                        size="sm"
                        className="bg-white"
                        value={workHistoryForm.lawFirm}
                        onChange={(e) =>
                          setWorkHistoryForm({
                            ...workHistoryForm,
                            lawFirm: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-blue-600/60">
                        Position
                      </label>
                      <Input
                        size="sm"
                        className="bg-white"
                        value={workHistoryForm.position}
                        onChange={(e) =>
                          setWorkHistoryForm({
                            ...workHistoryForm,
                            position: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-blue-600/60">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        size="sm"
                        className="bg-white h-8"
                        value={workHistoryForm.startDate}
                        onChange={(e) =>
                          setWorkHistoryForm({
                            ...workHistoryForm,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-blue-600/60">
                        End Date
                      </label>
                      <Input
                        type="date"
                        size="sm"
                        className="bg-white h-8"
                        value={workHistoryForm.endDate}
                        onChange={(e) =>
                          setWorkHistoryForm({
                            ...workHistoryForm,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-blue-600/60">
                      Responsibilities
                    </label>
                    <textarea
                      className="w-full text-sm rounded-md border border-input p-3 bg-white outline-none focus:ring-1 focus:ring-blue-400"
                      rows={3}
                      placeholder="Describe your key roles and achievements..."
                      value={workHistoryForm.responsibilities}
                      onChange={(e) =>
                        setWorkHistoryForm({
                          ...workHistoryForm,
                          responsibilities: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-blue-600/60">
                      Major Cases Summary
                    </label>
                    <textarea
                      className="w-full text-sm rounded-md border border-input p-3 bg-white outline-none focus:ring-1 focus:ring-blue-400"
                      rows={2}
                      placeholder="Highlight significant cases or project wins..."
                      value={workHistoryForm.majorCasesSummary}
                      onChange={(e) =>
                        setWorkHistoryForm({
                          ...workHistoryForm,
                          majorCasesSummary: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingWorkHistory(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 px-8 text-white"
                      onClick={handleAddWorkHistory}
                    >
                      Add Record
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Finish Editing
            </Button>
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isSaving}
              onClick={() => onSave("skills")}
            >
              {isSaving ? "Saving Changes..." : "Save All to Profile"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
