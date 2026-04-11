import React, { useState } from "react";
import { Award, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CertificationManager({
  form,
  isEditing,
  onChange,
}) {
  const [isAddingCertification, setIsAddingCertification] = useState(false);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState(-1);
  const [certificationForm, setCertificationForm] = useState({
    title: "",
    issuer: "",
    year: "",
  });

  const currentYear = new Date().getFullYear();
  const minYear = 1950;

  const certYear = Number(certificationForm.year);
  const isCertYearValid = !certificationForm.year || (certYear >= minYear && certYear <= currentYear);
  const certYearError = certificationForm.year && !isCertYearValid
    ? `Year must be between ${minYear} and ${currentYear}`
    : null;

  const handleAddCertification = () => {
    if (!certificationForm.title || !certificationForm.issuer || !!certYearError) return;
    const newList = [
      ...(form.certifications || []),
      { ...certificationForm, year: Number(certificationForm.year) },
    ];
    onChange("certifications")({ target: { value: newList } });
    setCertificationForm({ title: "", issuer: "", year: "" });
    setIsAddingCertification(false);
  };

  const handleUpdateCertification = (index) => {
    if (!!certYearError) return;
    const newList = [...(form.certifications || [])];
    newList[index] = { ...certificationForm, year: Number(certificationForm.year) };
    onChange("certifications")({ target: { value: newList } });
    setEditingCertificationIndex(-1);
  };

  const handleDeleteCertification = (index) => {
    const newList = (form.certifications || []).filter((_, i) => i !== index);
    onChange("certifications")({ target: { value: newList } });
  };

  return (
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
                <div className="space-y-1">
                  <Input
                    type="number"
                    placeholder="Issued Year"
                    value={certificationForm.year}
                    min={minYear}
                    max={currentYear}
                    className={certYearError ? "border-red-400 focus-visible:ring-red-200" : ""}
                    onChange={(e) =>
                      setCertificationForm({
                        ...certificationForm,
                        year: e.target.value,
                      })
                    }
                  />
                  {certYearError && (
                    <p className="text-[10px] text-red-500 font-medium pl-1">{certYearError}</p>
                  )}
                </div>
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
                    className="bg-black text-white px-4 disabled:opacity-50"
                    onClick={() => handleUpdateCertification(idx)}
                    disabled={!!certYearError || !certificationForm.year}
                  >
                    {certYearError ? "Fix Year" : "Save Entry"}
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
            <div className="space-y-1">
              <Input
                type="number"
                placeholder="Issued Year"
                value={certificationForm.year}
                min={minYear}
                max={currentYear}
                className={certYearError ? "border-red-400 focus-visible:ring-red-200" : ""}
                onChange={(e) =>
                  setCertificationForm({
                    ...certificationForm,
                    year: e.target.value,
                  })
                }
              />
              {certYearError && (
                <p className="text-[10px] text-red-500 font-medium pl-1">{certYearError}</p>
              )}
            </div>
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
                className="bg-black text-white px-4 disabled:opacity-50"
                onClick={handleAddCertification}
                disabled={!!certYearError || !certificationForm.year}
              >
                {certYearError ? "Fix Year" : "Add Entry"}
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
  );
}
