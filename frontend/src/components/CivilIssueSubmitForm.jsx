import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitCivilIssue } from "@/api/services/civilIssueService";
import { AlertCircle, CheckCircle2, Loader2, X, Paperclip } from "lucide-react";

const CATEGORIES = [
  { value: "land", label: "Land Issues" },
  { value: "police", label: "Police Conduct" },
  { value: "harassment", label: "Harassment" },
  { value: "public_services", label: "Public Services" },
  { value: "other", label: "Other" },
];

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const MAX_DESCRIPTION_LENGTH = 3000;
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 5;

export default function CivilIssueSubmitForm({ onCancel }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    district: "",
    description: "",
    attachments: [],
    isPublic: false,
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(20);

  // Countdown logic for redirection
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      handleRedirect();
    }
  }, [success, countdown]);

  const handleRedirect = () => {
    navigate("/citizen/civil-issues/pending");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.attachments.length + files.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files.`);
      return;
    }

    const oversizedFile = files.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversizedFile) {
      setError(`File "${oversizedFile.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    setError("");
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.district || !formData.description) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("district", formData.district);
      data.append("description", formData.description);
      data.append("isPublic", formData.isPublic);
      
      formData.attachments.forEach(file => {
        data.append("attachments", file);
      });

      await submitCivilIssue(data);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Something went wrong while submitting.");
    } finally {
      setBusy(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-50 p-3 ring-8 ring-green-50/50">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">Issue Submitted Successfully</h3>
          <p className="text-slate-500">Your report has been received and assigned to the relevant authority.</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 max-w-sm mx-auto">
          <p className="text-sm font-medium text-slate-600 mb-4">
            Redirecting to your dashboard in <span className="text-primary font-bold text-lg">{countdown}s</span>
          </p>
          <Button onClick={handleRedirect} className="w-full">
            Redirect Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Category Selection */}
      <div className="grid gap-3">
        <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
          What is the nature of your concern? <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={formData.category} 
          onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
        >
          <SelectTrigger id="category" className="h-12">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District Selection */}
      <div className="grid gap-3">
        <Label htmlFor="district" className="text-sm font-semibold text-slate-700">
          Which district is this related to? <span className="text-destructive">*</span>
        </Label>
        <Select 
          value={formData.district} 
          onValueChange={(val) => setFormData(prev => ({ ...prev, district: val }))}
        >
          <SelectTrigger id="district" className="h-12">
            <SelectValue placeholder="Select your district" />
          </SelectTrigger>
          <SelectContent>
            {DISTRICTS.map(district => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="grid gap-3">
        <div className="flex justify-between items-end">
          <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
            Provide a detailed description <span className="text-destructive">*</span>
          </Label>
          <span className={`text-[10px] font-mono font-bold uppercase py-0.5 px-1.5 rounded border ${
            formData.description.length > MAX_DESCRIPTION_LENGTH ? 'text-destructive border-destructive bg-destructive/10' : 'text-slate-400 border-slate-200'
          }`}>
            {formData.description.length} / {MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
        <Textarea 
          id="description" 
          placeholder="Please describe the issue in detail. The more information you provide, the better we can assist."
          className="min-h-[160px] resize-y"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          maxLength={MAX_DESCRIPTION_LENGTH}
          required
        />
      </div>

      {/* File Attachments */}
      <div className="grid gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-slate-700">
            Attachments (Optional)
          </Label>
          <p className="text-xs text-slate-400">
             Max {MAX_FILES} files. Up to {MAX_FILE_SIZE_MB}MB each. Supported: JPG, PNG, PDF.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="file"
              id="attachments"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={formData.attachments.length >= MAX_FILES}
            />
            <Button
              type="button"
              variant="outline"
              disabled={formData.attachments.length >= MAX_FILES}
              onClick={() => document.getElementById('attachments').click()}
              className="h-12 border-dashed border-2 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Paperclip className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* File Preview List */}
        {formData.attachments.length > 0 && (
          <div className="grid gap-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            {formData.attachments.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-primary/10 p-1.5 rounded text-primary shrink-0">
                    <Paperclip className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                    {(file.size / (1024 * 1024)).toFixed(1)}MB
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(idx)}
                  className="text-slate-400 hover:text-destructive transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Visibility Toggle */}
      <div className="flex items-start space-x-3 space-y-0 rounded-xl border border-slate-200 p-4 bg-white/50">
        <Checkbox
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, isPublic: checked }))
          }
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="isPublic"
            className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Display publicly on the service portal
          </Label>
          <p className="text-xs text-slate-500">
            Allow other citizens to see the nature of this issue. Your identity will remain <span className="font-bold text-primary">Anonymous</span>.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
        <Button 
          type="submit" 
          disabled={busy || formData.description.length > MAX_DESCRIPTION_LENGTH} 
          className="h-12 sm:flex-1 text-lg font-semibold shadow-lg hover:shadow-primary/20"
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Complete Submission"
          )}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel} 
          disabled={busy}
          className="h-12 px-8 text-slate-500"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
