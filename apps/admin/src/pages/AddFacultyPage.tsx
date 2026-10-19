import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, ArrowLeft, Save, Upload, Camera, Check, AlertCircle, User, GraduationCap, Briefcase, Globe } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeCode: string;
  institutionCode: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
  experience: string;
  subjects: string[];
  bio: string;
  isHead: boolean;
  achievements: string[];
  publications: string[];
  officeHours: string;
  officeLocation: string;
  linkedin: string;
  twitter: string;
  googleScholar: string;
  researchGate: string;
  vidwan: string;
  orcid: string;
  website: string;
  github: string;
  photoUrl?: string;
}

export const AddFacultyPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeCode: "",
    institutionCode: "NIRAKAR_HS",
    designation: "",
    department: "Science & Laboratories",
    qualification: "",
    experienceYears: 5,
    experience: "",
    subjects: [],
    bio: "",
    isHead: false,
    achievements: [],
    publications: [],
    officeHours: "",
    officeLocation: "",
    linkedin: "",
    twitter: "",
    googleScholar: "",
    researchGate: "",
    vidwan: "",
    orcid: "",
    website: "",
    github: "",
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["admin_faculty_departments"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/v1/faculty/departments");
        if (!res.ok) throw new Error("Failed to fetch departments");
        const json = await res.json();
        return json.data || [];
      } catch {
        return ["Science & Laboratories", "Mathematics & Computer Science", "Languages & Literature", "Commerce & Economics"];
      }
    },
  });

  const createFacultyMutation = useMutation({
    mutationFn: async (data: any) => {
      const createRes = await fetch("/api/v1/faculty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!createRes.ok) {
        const error = await createRes.json();
        throw new Error(error.message || "Failed to create faculty");
      }

      const result = await createRes.json();
      if (result.data?.id) {
        await fetch(`/api/v1/faculty/admin/approve/${result.data.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: result.data.id }),
        });
      }
      return result;
    },
    onSuccess: () => {
      setSuccessMessage("Faculty member created successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        employeeCode: "",
        institutionCode: "NIRAKAR_HS",
        designation: "",
        department: "Science & Laboratories",
        qualification: "",
        experienceYears: 5,
        experience: "",
        subjects: [],
        bio: "",
        isHead: false,
        achievements: [],
        publications: [],
        officeHours: "",
        officeLocation: "",
        linkedin: "",
        twitter: "",
        googleScholar: "",
        researchGate: "",
        vidwan: "",
        orcid: "",
        website: "",
        github: "",
      });
      setPhotoPreview(null);
      setActiveStep(1);
      queryClient.invalidateQueries({ queryKey: ["admin_faculty_published"] });
      queryClient.invalidateQueries({ queryKey: ["admin_faculty_pending"] });
    },
    onError: (error: any) => {
      setErrorMessage(error.message || "Failed to create faculty member");
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const res = await fetch("/api/v1/faculty/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image }),
      });
      if (!res.ok) throw new Error("Failed to upload photo");
      return res.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, photoUrl: data.photoUrl }));
      setIsUploadingPhoto(false);
    },
    onError: () => {
      setIsUploadingPhoto(false);
    },
  });

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > 1200 || height > 1200) {
            const ratio = Math.min(1200 / width, 1200 / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas error"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            const quality = blob.size > 1024 * 1024 ? 0.6 : blob.size > 512 * 1024 ? 0.7 : 0.8;
            canvas.toBlob((finalBlob) => {
              if (!finalBlob) {
                reject(new Error("Final compression failed"));
                return;
              }

              const fr = new FileReader();
              fr.onload = () => resolve(fr.result as string);
              fr.onerror = () => reject(new Error("Read error"));
              fr.readAsDataURL(finalBlob);
            }, "image/webp", quality);
          }, "image/webp", 0.8);
        };
        img.onerror = () => reject(new Error("Image load failed"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const compressedBase64 = await compressImage(file);
      setPhotoPreview(compressedBase64);
      uploadPhotoMutation.mutate(compressedBase64);
    } catch (error: any) {
      setErrorMessage("Image compression failed: " + error.message);
      setIsUploadingPhoto(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMessage("");
  };

  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const subjectsArray = value.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, subjects: subjectsArray }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) {
          setErrorMessage("Please enter first name");
          return false;
        }
        if (!formData.lastName.trim()) {
          setErrorMessage("Please enter last name");
          return false;
        }
        if (!formData.email.trim()) {
          setErrorMessage("Please enter email address");
          return false;
        }
        if (!formData.designation.trim()) {
          setErrorMessage("Please enter designation");
          return false;
        }
        if (!formData.department.trim()) {
          setErrorMessage("Please select department");
          return false;
        }
        return true;
      case 2:
        if (!formData.qualification.trim()) {
          setErrorMessage("Please enter qualification");
          return false;
        }
        if (!formData.subjects || formData.subjects.length === 0) {
          setErrorMessage("Please enter at least one subject");
          return false;
        }
        if (!formData.bio.trim()) {
          setErrorMessage("Please enter biography");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < activeStep) {
      setActiveStep(step);
    } else if (step === activeStep + 1 && validateStep(activeStep)) {
      setActiveStep(step);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const submissionData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      employeeCode: formData.employeeCode || `NES-FAC-${Date.now().toString().slice(-4)}`,
      institutionCode: formData.institutionCode,
      designation: formData.designation,
      department: formData.department,
      qualification: formData.qualification,
      experienceYears: formData.experienceYears,
      experience: formData.experience || `${formData.experienceYears} Years`,
      subjects: formData.subjects,
      bio: formData.bio,
      isHead: formData.isHead,
      achievements: formData.achievements,
      publications: formData.publications,
      officeHours: formData.officeHours,
      officeLocation: formData.officeLocation,
      socialLinks: {
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        googleScholar: formData.googleScholar,
        researchGate: formData.researchGate,
        vidwan: formData.vidwan,
        orcid: formData.orcid,
        website: formData.website,
        github: formData.github,
      },
      status: "PUBLISHED",
    };

    createFacultyMutation.mutate(submissionData);
  };

  const steps = [
    { id: 1, title: "Basic Info", icon: User },
    { id: 2, title: "Academic", icon: GraduationCap },
    { id: 3, title: "Professional", icon: Briefcase },
    { id: 4, title: "Social Links", icon: Globe },
  ];

  const institutionOptions = [
    { code: "NIRAKAR_HS", name: "Shri Nirakar Vidyalaya" },
    { code: "TUDAL_HS", name: "Tudal High School" },
    { code: "ANGLE_HSS", name: "S. S. Angle Higher Secondary School" },
  ];

  return (
    <div className="font-sans w-full">
      <div className="mb-6">
        <button onClick={() => navigate("/faculty")} className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-3">
          <ArrowLeft size={16} />
          Back to Faculty
        </button>

        <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-2.5 mb-1">
          <UserPlus className="text-brand-700" size={28} />
          Add New Faculty Member
        </h1>
        <p className="text-sm text-stone-500">Create and publish new faculty profiles to the institution website.</p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-sm">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-sm">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2" />
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={isUploadingPhoto}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  activeStep >= step.id
                    ? "bg-brand-700 border-brand-700 text-white"
                    : "bg-white border-stone-300 text-stone-400"
                } ${isUploadingPhoto ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <step.icon size={16} />
              </button>
              <span className={`text-xs font-medium mt-2 text-center ${activeStep >= step.id ? "text-stone-900" : "text-stone-500"}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-7">
        <h2 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
          {activeStep === 1 && <User size={20} />}
          {activeStep === 2 && <GraduationCap size={20} />}
          {activeStep === 3 && <Briefcase size={20} />}
          {activeStep === 4 && <Globe size={20} />}
          {steps[activeStep - 1]?.title}
        </h2>

        {activeStep === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="john@school.edu" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Institution *</label>
                <select name="institutionCode" value={formData.institutionCode} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required>
                  {institutionOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Employee Code</label>
                <input type="text" name="employeeCode" value={formData.employeeCode} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="NES-FAC-2024" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Designation *</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Senior Lecturer" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Department *</label>
              <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required>
                {departments.map((dept: string) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-700">Profile Photo</label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={20} className="text-stone-400" />
                  )}
                </div>
                <div>
                  <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploadingPhoto} />
                  <label htmlFor="photo-upload" className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50">
                    <Upload size={12} />
                    {isUploadingPhoto ? "Processing..." : "Compress & Upload"}
                  </label>
                  <p className="text-xs text-stone-500 mt-2">Auto-compressed to WebP, max 1200x1200px</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Qualification *</label>
              <textarea name="qualification" value={formData.qualification} onChange={handleInputChange} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="M.Sc. (Mathematics), B.Ed., Ph.D." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Years of Experience *</label>
                <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} min="0" max="50" className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-700">Experience Summary</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="15 Years in Mathematics" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Subjects Taught *</label>
              <input type="text" value={formData.subjects.join(", ")} onChange={handleSubjectsChange} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Algebra, Geometry, Calculus" required />
              <p className="text-xs text-stone-500">Separate subjects with commas</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700">Biography *</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Professional biography..." required />
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isHead" name="isHead" checked={formData.isHead} onChange={handleInputChange} className="w-4 h-4 rounded border-stone-300 text-brand-600" />
              <label htmlFor="isHead" className="text-sm text-stone-700">Head of Department/Institution</label>
            </div>
            <p className="text-xs text-stone-500">Other professional details are optional in this section.</p>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-5">
            <p className="text-xs text-stone-500">Add social and professional links (all optional)</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-8">
          <div>
            {activeStep > 1 && (
              <button type="button" onClick={() => setActiveStep(activeStep - 1)} className="px-5 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-sm font-medium">
                Previous
              </button>
            )}
          </div>

          <div>
            {activeStep < 4 ? (
              <button type="button" disabled={isUploadingPhoto} onClick={handleNextStep} className="px-5 py-2 rounded-lg bg-brand-700 text-white hover:bg-brand-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            ) : (
              <button type="submit" disabled={createFacultyMutation.isPending || isUploadingPhoto} className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                {createFacultyMutation.isPending ? <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </> : <>
                  <Save size={16} />
                  Create Faculty
                </>}
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-7 bg-white rounded-2xl border border-stone-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-stone-900 mb-4">Profile Preview</h3>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <User size={20} className="text-stone-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-stone-900">
              {formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : "Faculty Member"}
            </h4>
            <p className="text-sm text-stone-600">{formData.designation || "Faculty Member"}</p>
            <p className="text-xs text-stone-500">{formData.department}</p>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mt-2">
              <Check size={10} />
              Will publish
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
