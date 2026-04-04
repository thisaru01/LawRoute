import React, { useState } from "react";
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.825-3l.665-6.479L12 14z" />
              </svg>
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
        {/* 1. Education Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Education
            </h3>
            {isEditing && !isAddingEducation && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setIsAddingEducation(true)}
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
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border flex items-center justify-center text-gray-400 flex-shrink-0">
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
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
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
                      onClick={() => handleDeleteEducation(idx)}
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
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border flex items-center justify-center text-gray-400 flex-shrink-0">
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
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                        />
                      </svg>
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
                      onClick={() => handleDeleteCertification(idx)}
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
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Finish Editing
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
