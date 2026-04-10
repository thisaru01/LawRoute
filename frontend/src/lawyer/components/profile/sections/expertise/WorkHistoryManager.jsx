import React, { useState } from "react";
import { Briefcase, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WorkHistoryManager({
  form,
  isEditing,
  onChange,
}) {
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

  // Date Validation Logic
  const todayStr = new Date().toISOString().split("T")[0];
  const isValidStartDate = 
    !workHistoryForm.startDate || workHistoryForm.startDate < todayStr;
  
  const isValidEndDate = 
    !workHistoryForm.endDate || 
    !workHistoryForm.startDate || 
    workHistoryForm.endDate >= workHistoryForm.startDate;

  const startDateError = workHistoryForm.startDate && !isValidStartDate 
    ? "Start date must be in the past." 
    : null;
    
  const endDateError = workHistoryForm.endDate && workHistoryForm.startDate && !isValidEndDate
    ? "End date cannot be before the start date."
    : null;

  const hasHistoryDateError = !!startDateError || !!endDateError;

  const handleAddWorkHistory = () => {
    if (!workHistoryForm.lawFirm || !workHistoryForm.position || hasHistoryDateError) return;
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
    if (hasHistoryDateError) return;
    const newList = [...(form.workHistory || [])];
    newList[index] = workHistoryForm;
    onChange("workHistory")({ target: { value: newList } });
    setEditingWorkHistoryIndex(-1);
  };

  const handleDeleteWorkHistory = (index) => {
    const newList = (form.workHistory || []).filter((_, i) => i !== index);
    onChange("workHistory")({ target: { value: newList } });
  };

  return (
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
            onClick={() => {
              setIsAddingWorkHistory(true);
              setWorkHistoryForm({
                lawFirm: "",
                position: "",
                startDate: "",
                endDate: "",
                responsibilities: "",
                majorCasesSummary: "",
              });
            }}
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
                      max={todayStr}
                      className={startDateError ? "border-red-400 focus-visible:ring-red-200" : ""}
                      onChange={(e) =>
                        setWorkHistoryForm({
                          ...workHistoryForm,
                          startDate: e.target.value,
                        })
                      }
                    />
                    {startDateError && (
                      <p className="text-[10px] text-red-500 font-medium">{startDateError}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      End Date
                    </label>
                    <Input
                      type="date"
                      size="sm"
                      value={workHistoryForm.endDate?.split("T")[0]}
                      min={workHistoryForm.startDate}
                      className={endDateError ? "border-red-400 focus-visible:ring-red-200" : ""}
                      onChange={(e) =>
                        setWorkHistoryForm({
                          ...workHistoryForm,
                          endDate: e.target.value,
                        })
                      }
                    />
                    {endDateError && (
                      <p className="text-[10px] text-red-500 font-medium">{endDateError}</p>
                    )}
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
                    disabled={hasHistoryDateError}
                  >
                    {hasHistoryDateError ? "Fix Dates" : "Update Experience"}
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
                    className={`bg-white h-8 ${startDateError ? "border-red-400 focus-visible:ring-red-200" : ""}`}
                    max={todayStr}
                    value={workHistoryForm.startDate}
                    onChange={(e) =>
                      setWorkHistoryForm({
                        ...workHistoryForm,
                        startDate: e.target.value,
                      })
                    }
                  />
                  {startDateError && (
                    <p className="text-[10px] text-red-500 font-medium">{startDateError}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-blue-600/60">
                    End Date
                  </label>
                  <Input
                    type="date"
                    size="sm"
                    className={`bg-white h-8 ${endDateError ? "border-red-400 focus-visible:ring-red-200" : ""}`}
                    min={workHistoryForm.startDate}
                    value={workHistoryForm.endDate}
                    onChange={(e) =>
                      setWorkHistoryForm({
                        ...workHistoryForm,
                        endDate: e.target.value,
                      })
                    }
                  />
                  {endDateError && (
                    <p className="text-[10px] text-red-500 font-medium">{endDateError}</p>
                  )}
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
                  disabled={hasHistoryDateError}
                >
                  {hasHistoryDateError ? "Fix Dates" : "Add Record"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
