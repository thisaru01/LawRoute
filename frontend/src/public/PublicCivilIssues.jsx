import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar.jsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth/useAuth";
import CivilIssueSubmitForm from "@/components/CivilIssueSubmitForm";
import { getPublicCivilIssues } from "@/api/services/civilIssueService";
import { Landmark, MapPin, Paperclip, Zap, ChevronDown, Filter, Calendar, User, Info } from "lucide-react";

const CATEGORY_LABELS = {
  land: "Land Issues",
  police: "Police Conduct",
  harassment: "Harassment",
  public_services: "Public Services",
  other: "Other",
};

const DISTRICTS = [
  "All Districts", "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha",
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala",
  "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

export default function PublicCivilIssues() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Feed state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDistrict, setFilterDistrict] = useState("All Districts");

  // Check if we were redirected back with action=submit
  useEffect(() => {
    if (searchParams.get("action") === "submit") {
      if (token) {
        setShowForm(true);
      } else {
        setShowForm(false);
      }
    }
  }, [searchParams, token]);

  // Fetch public issues
  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await getPublicCivilIssues();
        setIssues(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch public issues", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchCategory = filterCategory === "all" || issue.category === filterCategory;
      const matchDistrict = filterDistrict === "All Districts" || issue.district === filterDistrict;
      return matchCategory && matchDistrict;
    });
  }, [issues, filterCategory, filterDistrict]);

  const handleStartSubmission = () => {
    if (!token) {
      navigate("/auth?redirect=/civil-issues?action=submit");
    } else {
      setShowForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main>
        {showForm ? (
          <div className="max-w-4xl mx-auto px-4 py-12">
             <Button 
                variant="ghost" 
                onClick={() => setShowForm(false)} 
                className="mb-8"
              >
                ← Back to overview
              </Button>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <h2 className="text-3xl font-bold tracking-tight mb-6">Report a Civil Issue</h2>
                <CivilIssueSubmitForm onCancel={() => setShowForm(false)} />
              </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="bg-white border-b border-slate-200 py-20 lg:py-32">
              <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-slate-900">
                      Empowering <span className="text-primary">Citizens</span>.
                    </h1>
                    <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                      Lodge your civil concerns and track progress effortlessly. We bridge the gap between you and the authorities to ensure a better community.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Button size="lg" onClick={handleStartSubmission} className="h-14 px-8 text-lg font-medium rounded-full shadow-lg hover:shadow-primary/20 transition-all">
                      Submit a Civil Issue
                    </Button>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-primary to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                    <div className="space-y-4 text-center">
                       <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <Landmark className="h-8 w-8 text-primary" />
                       </div>
                       <p className="text-sm font-semibold text-primary uppercase tracking-widest">Public Service Portal</p>
                       <h3 className="text-2xl font-bold">Your voice, amplified.</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Info Section */}
            <section className="max-w-6xl mx-auto px-4 py-20">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-slate-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Location Aware</h4>
                  <p className="text-slate-500 text-sm">Target issues specifically to your district for direct attention center.</p>
                </div>
                <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Paperclip className="h-6 w-6 text-slate-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Evidence-Based</h4>
                  <p className="text-slate-500 text-sm">Upload photos and documents to support your claim effectively.</p>
                </div>
                <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-slate-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">2x Faster Processing</h4>
                  <p className="text-slate-500 text-sm">Automated routing ensures your issue reaches the right authority immediately.</p>
                </div>
              </div>
            </section>

            {/* Public Feed Section */}
            <section className="bg-slate-50 py-20 border-t border-slate-200">
              <div className="max-w-5xl mx-auto px-4 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Community Issues Feed</h2>
                    <p className="text-slate-500">Explore concerns shared by fellow citizens across Sri Lanka.</p>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="grid gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Category</span>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-[180px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">District</span>
                      <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                        <SelectTrigger className="w-[180px] bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICTS.map(dist => (
                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Feed List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-20">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="mt-4 text-slate-500">Loading community issues...</p>
                    </div>
                  ) : filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                      <Collapsible key={issue._id} className="group">
                        <Card className="overflow-hidden border-slate-200 hover:border-primary/30 transition-all shadow-sm hover:shadow-md cursor-pointer">
                          <CollapsibleTrigger asChild>
                            <div className="p-5 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                <div className="bg-primary/5 p-2.5 rounded-xl text-primary hidden sm:block">
                                  <Info className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                  <h3 className="font-bold text-slate-900 truncate">
                                    {CATEGORY_LABELS[issue.category]} — {issue.district}
                                  </h3>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" /> Anonymous Citizen
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" /> {new Date(issue.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="capitalize bg-white whitespace-nowrap">
                                  {issue.status}
                                </Badge>
                                <ChevronDown className="h-5 w-5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform" />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-50 mt-1 pt-6 px-8 animate-in slide-in-from-top-2 duration-300">
                              {issue.description}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                      <div className="text-4xl mb-4 opacity-20">📂</div>
                      <p className="text-slate-500 font-medium tracking-tight">No issues found matching your selection.</p>
                      <Button variant="link" onClick={() => { setFilterCategory("all"); setFilterDistrict("All Districts"); }} className="mt-2">
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} LawRoute
        </div>
      </footer>
    </div>
  );
}
