import React, { useState } from "react";
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
              <svg
                className="w-4 h-4 mr-1.5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
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
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
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
                  <svg
                    className="w-3.5 h-3.5 mr-1.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.839-5.512m4.791 5.512L12 17l1-3.5m0-7.5l2 8.5m-3-3l6 4M10 17h12V3H2v12h12V3H2v12h12v4M4 17h6"
                    />
                  </svg>
                  {lang}
                </Badge>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteLanguage(idx)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-400"
                  onClick={() => setIsAddingLanguage(false)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
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
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
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
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-7.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
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
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => handleDeletePracticeArea(idx)}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
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
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
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
                  <svg
                    className="w-4 h-4 font-bold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"
                    />
                  </svg>
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
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                            onClick={() => handleDeleteWorkHistory(idx)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
                  <svg
                    className="w-4 h-4 font-bold"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
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
