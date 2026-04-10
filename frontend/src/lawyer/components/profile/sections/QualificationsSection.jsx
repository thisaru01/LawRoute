import React, { useState } from "react";
import { 
  GraduationCap, 
  Pencil, 
  Plus, 
  School, 
  Award, 
  Trash2, 
  Check, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function QualificationsSection({
  form,
  isEditing,
  isSaving,
  onChange,
  onSave,
  setIsEditing,
  onRetry,
}) {
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState(-1);
  const [educationForm, setEducationForm] = useState({
    degree: "",
    institute: "",
    graduationYear: "",
  });

  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState(-1);
  const [certificationForm, setCertificationForm] = useState({
    title: "",
    issuer: "",
    year: "",
  });

  const handleAddEducation = () => {
    if (!educationForm.degree || !educationForm.institute) return;
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
    const newList = [...form.education];
    newList[index] = {
      ...educationForm,
      graduationYear: Number(educationForm.graduationYear),
    };
    onChange("education")({ target: { value: newList } });
    setEditingEducationIndex(-1);
  };

  const handleDeleteEducation = (index) => {
    const newList = form.education.filter((_, i) => i !== index);
    onChange("education")({ target: { value: newList } });
  };

  const handleAddCertification = () => {
    if (!certificationForm.title || !certificationForm.issuer) return;
    const newList = [
      ...(form.certifications || []),
      { ...certificationForm, year: Number(certificationForm.year) },
    ];
    onChange("certifications")({ target: { value: newList } });
    setCertificationForm({ title: "", issuer: "", year: "" });
    setIsAddingCertification(false);
  };

  const handleUpdateCertification = (index) => {
    const newList = [...form.certifications];
    newList[index] = { ...certificationForm, year: Number(certificationForm.year) };
    onChange("certifications")({ target: { value: newList } });
    setEditingCertificationIndex(-1);
  };

  const handleDeleteCertification = (index) => {
    const newList = form.certifications.filter((_, i) => i !== index);
    onChange("certifications")({ target: { value: newList } });
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-gray-200/60">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border shadow-sm text-blue-600">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Education & Credentials</CardTitle>
              <CardDescription>
                Your academic background and professional certifications.
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
        {/* 1. Education Section */}
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
                    <Input
                      type="number"
                      placeholder="Graduation Year"
                      value={educationForm.graduationYear}
                      onChange={(e) =>
                        setEducationForm({
                          ...educationForm,
                          graduationYear: e.target.value,
                        })
                      }
                    />
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
                        className="bg-black text-white px-4"
                        onClick={() => handleUpdateEducation(idx)}
                      >
                        Save Entry
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
                <Input
                  type="number"
                  placeholder="Graduation Year"
                  value={educationForm.graduationYear}
                  onChange={(e) =>
                    setEducationForm({
                      ...educationForm,
                      graduationYear: e.target.value,
                    })
                  }
                />
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
                    className="bg-black text-white px-4"
                    onClick={handleAddEducation}
                  >
                    Add Entry
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

        <Separator />

        {/* 2. Licenses & Certifications Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Licenses & Certifications
            </h3>
            {isEditing && !isAddingCertification && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsAddingCertification(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Credential
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {form.certifications?.map((cert, idx) => (
              <div key={idx} className="group relative pr-10">
                {editingCertificationIndex === idx ? (
                  <div className="grid gap-3 p-4 rounded-xl border bg-gray-50/50">
                    <Input
                      placeholder="Title (e.g., Bar Admission)"
                      value={certificationForm.title}
                      onChange={(e) =>
                        setCertificationForm({
                          ...certificationForm,
                          title: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Issuing Organization"
                      value={certificationForm.issuer}
                      onChange={(e) =>
                        setCertificationForm({
                          ...certificationForm,
                          issuer: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Issued Year"
                      value={certificationForm.year}
                      onChange={(e) =>
                        setCertificationForm({
                          ...certificationForm,
                          year: e.target.value,
                        })
                      }
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCertificationIndex(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-black text-white px-4"
                        onClick={() => handleUpdateCertification(idx)}
                      >
                        Save Entry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 pr-4">
                      <h4 className="text-[14px] font-bold text-foreground truncate">
                        {cert.title}
                      </h4>
                      <p className="text-xs font-medium text-muted-foreground">
                        {cert.issuer}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Issued {cert.year}
                      </p>
                    </div>
                  </div>
                )}
                {isEditing && editingCertificationIndex !== idx && (
                  <div className="absolute right-0 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-blue-600"
                      onClick={() => {
                        setEditingCertificationIndex(idx);
                        setCertificationForm(cert);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => handleDeleteCertification(idx)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {isAddingCertification && (
              <div className="grid gap-3 p-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30">
                <Input
                  placeholder="Title (e.g., Bar Admission)"
                  value={certificationForm.title}
                  onChange={(e) =>
                    setCertificationForm({
                      ...certificationForm,
                      title: e.target.value,
                    })
                  }
                />
                <Input
                  placeholder="Issuing Organization"
                  value={certificationForm.issuer}
                  onChange={(e) =>
                    setCertificationForm({
                      ...certificationForm,
                      issuer: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Issued Year"
                  value={certificationForm.year}
                  onChange={(e) =>
                    setCertificationForm({
                      ...certificationForm,
                      year: e.target.value,
                    })
                  }
                />
                <div className="flex justify-end gap-2 mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingCertification(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-black text-white px-4"
                    onClick={handleAddCertification}
                  >
                    Add Entry
                  </Button>
                </div>
              </div>
            )}

            {!form.certifications?.length && !isAddingCertification && (
              <div className="text-center py-4 text-sm text-muted-foreground border rounded-xl border-dashed md:col-span-2">
                No licenses or certifications listed yet.
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                onRetry && onRetry();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-black text-white hover:bg-gray-800"
              disabled={isSaving}
              onClick={() => onSave("qualifications")}
            >
              {isSaving ? "Saving Changes..." : "Save All to Profile"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
