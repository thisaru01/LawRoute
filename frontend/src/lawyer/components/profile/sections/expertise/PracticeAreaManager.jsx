import React, { useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PracticeAreaManager({
  form,
  isEditing,
  onChange,
}) {
  const [isAddingPracticeArea, setIsAddingPracticeArea] = useState(false);
  const [editingPracticeAreaIndex, setEditingPracticeAreaIndex] = useState(-1);
  const [practiceAreaForm, setPracticeAreaForm] = useState({
    name: "",
    level: "intermediate",
  });

  const handleAddPracticeArea = () => {
    if (!practiceAreaForm.name) return;
    const newList = [...(form.practiceAreas || []), practiceAreaForm];
    onChange("practiceAreas")({ target: { value: newList } });
    setPracticeAreaForm({ name: "", level: "intermediate" });
    setIsAddingPracticeArea(false);
  };

  const handleUpdatePracticeArea = (index) => {
    const newList = [...(form.practiceAreas || [])];
    newList[index] = practiceAreaForm;
    onChange("practiceAreas")({ target: { value: newList } });
    setEditingPracticeAreaIndex(-1);
  };

  const handleDeletePracticeArea = (index) => {
    const newList = (form.practiceAreas || []).filter((_, i) => i !== index);
    onChange("practiceAreas")({ target: { value: newList } });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Practice Areas <span className="text-red-600 font-bold text-lg">*</span>
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
  );
}
