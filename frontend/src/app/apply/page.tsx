'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { apiFetch } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { rwandaLocation } from '@devrw/rwanda-location';

const STEPS = [
  'Student Info',
  'Parent Info',
  'Academic History',
  'Documents',
  'Review'
];

export default function ApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [school, setSchool] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    nationality: 'Rwandan',
    programId: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    previousSchool: '',
    lastGradeCompleted: '',
    languageProficiency: [],
    // Rwandan Specific Details
    nationalId: '',
    nationalExamIndexNumber: '',
    combination: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    ubudeheCategory: '',
  });

  const UBUDEHE_CATEGORIES = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  const RWANDAN_COMBINATIONS = [
    'PCM (Physics, Chemistry, Math)',
    'MCB (Math, Chemistry, Biology)',
    'PCB (Physics, Chemistry, Biology)',
    'MPG (Math, Physics, Geography)',
    'MPC (Math, Physics, Computer Science)',
    'MEG (Math, Economics, Geography)',
    'MCE (Math, Computer Science, Economics)',
    'HEG (History, Economics, Geography)',
    'HEL (History, Economics, Literature)',
    'HGL (History, Geography, Literature)',
    'LKK (Literature, Kinyarwanda, Kiswahili)',
    'LKL (Literature, Kinyarwanda, Latin)',
  ];
  const OFFICIAL_LANGUAGES = ['Kinyarwanda', 'English', 'French', 'Swahili'];

  const selectedProgramName = school?.programs?.find((p: any) => p.id === formData.programId)?.name || '';
  const isSeniorStudent = selectedProgramName.includes('Senior 4') || selectedProgramName.includes('Senior 5') || selectedProgramName.includes('Senior 6');
  const isP6orS3 = selectedProgramName.includes('Primary 6') || selectedProgramName.includes('Senior 3') || isSeniorStudent;

  // Rwanda Location Lookups
  const provinces = rwandaLocation.getProvinces();
  const selectedProvince = provinces.find(p => p.name === formData.province);
  
  const districts = selectedProvince ? rwandaLocation.getDistricts(selectedProvince.code) : [];
  const selectedDistrict = districts.find(d => d.name === formData.district);
  
  const sectors = selectedDistrict ? rwandaLocation.getSectors(selectedDistrict.code) : [];
  const selectedSector = sectors.find(s => s.name === formData.sector);
  
  const cells = selectedSector ? rwandaLocation.getCells(selectedSector.code) : [];
  const selectedCell = cells.find(c => c.name === formData.cell);
  
  const villages = selectedCell ? rwandaLocation.getVillages(selectedCell.code) : [];

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch('/public/school/excella');
        setSchool(data);
      } catch (err) {
        console.error('Failed to load school info:', err);
        setError('Failed to load school information');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchool();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStepErrors([]);
    if (name === 'province') {
      setFormData({ ...formData, province: value, district: '', sector: '', cell: '', village: '' });
    } else if (name === 'district') {
      setFormData({ ...formData, district: value, sector: '', cell: '', village: '' });
    } else if (name === 'sector') {
      setFormData({ ...formData, sector: value, cell: '', village: '' });
    } else if (name === 'cell') {
      setFormData({ ...formData, cell: value, village: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateStep = (step: number): string[] => {
    const errs: string[] = [];
    switch (step) {
      case 0:
        if (!formData.firstName.trim())  errs.push('First name is required');
        if (!formData.lastName.trim())   errs.push('Last name is required');
        if (!formData.dob)               errs.push('Date of birth is required');
        if (!formData.gender)            errs.push('Gender is required');
        if (!formData.programId)         errs.push('Please select a grade to apply for');
        if (isSeniorStudent && !formData.combination) errs.push('Academic combination is required for Senior 4–6');
        break;
      case 1:
        if (!formData.parentName.trim())  errs.push('Parent/Guardian full name is required');
        if (!formData.parentEmail.trim()) errs.push('Parent/Guardian email is required');
        if (!formData.parentPhone.trim()) errs.push('Phone number is required');
        if (!formData.nationalId.trim())  errs.push('National ID number is required');
        if (!formData.province)  errs.push('Province is required');
        if (!formData.district)  errs.push('District is required');
        if (!formData.sector)    errs.push('Sector is required');
        if (!formData.cell)      errs.push('Cell is required');
        if (!formData.village)   errs.push('Village is required');
        break;
      case 2:
        if (!formData.previousSchool.trim())      errs.push('Previous school name is required');
        if (!formData.lastGradeCompleted.trim())  errs.push('Last grade completed is required');
        if (isP6orS3 && !formData.nationalExamIndexNumber.trim()) errs.push('National exam index number is required');
        break;
      case 3:
        if (!files.birthCertificate) errs.push('Birth certificate is required');
        if (!files.reportCard)       errs.push('Previous report card is required');
        break;
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep(currentStep);
    if (errs.length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors([]);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setStepErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    birthCertificate: null,
    reportCard: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setStepErrors([]);
      setFiles({ ...files, [type]: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // 1. Submit Application Data
      const submissionData = {
        ...formData,
        languageProficiency: formData.languageProficiency.join(', '),
      };
      
      const appData = await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });

      const applicationId = appData.id;

      // 2. Upload Files
      const uploadPromises = Object.entries(files).map(([type, file]) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('applicationId', applicationId);
        formData.append('documentType', type.toUpperCase());
        
        return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081/api/v1'}/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
      });

      await Promise.all(uploadPromises.filter(p => p !== null));

      alert('Application and Documents Submitted Successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading school details...</div>;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              <div className="mb-4">
                <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange}
                  className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Nationality</label>
                <select 
                  name="nationality" 
                  value={formData.nationality} 
                  onChange={handleChange}
                  className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="Rwandan">Rwandan</option>
                  <option value="Refugee">Refugee</option>
                  <option value="Foreigner">Foreigner</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Ubudehe Category</label>
                <select 
                  name="ubudeheCategory" 
                  value={formData.ubudeheCategory} 
                  onChange={handleChange}
                  className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Category</option>
                  {UBUDEHE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Grade Applying For</label>
              <select 
                name="programId" 
                value={formData.programId} 
                onChange={handleChange}
                className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select a Grade</option>
                {school?.programs?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {isSeniorStudent && (
              <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Academic Combination (S4-S6)</label>
                <select 
                  name="combination" 
                  value={formData.combination} 
                  onChange={handleChange}
                  className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">Select a Combination</option>
                  {RWANDAN_COMBINATIONS.map(comb => (
                    <option key={comb} value={comb}>{comb}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" name="parentName" value={formData.parentName} onChange={handleChange} required />
              <Input label="Email Address" name="parentEmail" type="email" value={formData.parentEmail} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone Number" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required />
              <Input label="National ID Number" name="nationalId" value={formData.nationalId} onChange={handleChange} required />
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Home Address (Rwandan Administrative Levels)</h4>
              
              {/* Province & District */}
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Province</label>
                  <select 
                    name="province" 
                    value={formData.province} 
                    onChange={handleChange}
                    required
                    className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">District</label>
                  <select 
                    name="district" 
                    value={formData.district} 
                    onChange={handleChange}
                    disabled={!formData.province}
                    required
                    className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sector, Cell, Village */}
              <div className="grid grid-cols-3 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Sector</label>
                  <select 
                    name="sector" 
                    value={formData.sector} 
                    onChange={handleChange}
                    disabled={!formData.district}
                    required
                    className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Select Sector</option>
                    {sectors.map(s => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Cell</label>
                  <select 
                    name="cell" 
                    value={formData.cell} 
                    onChange={handleChange}
                    disabled={!formData.sector}
                    required
                    className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Select Cell</option>
                    {cells.map(c => (
                      <option key={c.code} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Village</label>
                  <select 
                    name="village" 
                    value={formData.village} 
                    onChange={handleChange}
                    disabled={!formData.cell}
                    required
                    className="shadow-sm border border-gray-300 dark:border-gray-600 rounded-lg w-full py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Select Village</option>
                    {villages.map(v => (
                      <option key={v.code} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Input label="Detailed Address / House No. (Optional)" name="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Academic History</h3>
            <Input label="Previous School Name" name="previousSchool" value={formData.previousSchool} onChange={handleChange} required />
            <Input label="Last Grade Completed" name="lastGradeCompleted" value={formData.lastGradeCompleted} onChange={handleChange} required />
            
            {isP6orS3 && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <Input 
                  label="National Exam Index Number" 
                  name="nationalExamIndexNumber" 
                  value={formData.nationalExamIndexNumber} 
                  onChange={handleChange} 
                  placeholder="e.g., 102030402026"
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">Required for students coming from P6, S3, or S6.</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Language Proficiency</h4>
              <div className="flex flex-wrap gap-4">
                {OFFICIAL_LANGUAGES.map(lang => (
                  <label key={lang} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.languageProficiency.includes(lang as never)}
                      onChange={(e) => {
                        const newLangs = e.target.checked 
                          ? [...formData.languageProficiency, lang]
                          : formData.languageProficiency.filter(l => l !== lang);
                        setFormData({ ...formData, languageProficiency: newLangs as any });
                      }}
                    />
                    <span>{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Document Upload</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please upload the required documents (PDF, JPG, PNG).</p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800/30">
              <p className="font-medium text-gray-900 dark:text-white">Upload Birth Certificate</p>
              <input 
                type="file" 
                className="mt-2 text-sm text-gray-700 dark:text-gray-300" 
                onChange={(e) => handleFileChange(e, 'birthCertificate')}
                accept=".pdf,.jpg,.png"
              />
              {files.birthCertificate && <p className="mt-1 text-xs text-green-600 dark:text-green-400">Selected: {files.birthCertificate.name}</p>}
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800/30">
              <p className="font-medium text-gray-900 dark:text-white">Upload Previous Report Card</p>
              <input 
                type="file" 
                className="mt-2 text-sm text-gray-700 dark:text-gray-300" 
                onChange={(e) => handleFileChange(e, 'reportCard')}
                accept=".pdf,.jpg,.png"
              />
              {files.reportCard && <p className="mt-1 text-xs text-green-600 dark:text-green-400">Selected: {files.reportCard.name}</p>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Review & Submit</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl space-y-6 text-sm border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px] tracking-wider mb-2">Student Details</p>
                  <p className="text-gray-900 dark:text-white"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p className="text-gray-900 dark:text-white"><strong>DOB:</strong> {formData.dob}</p>
                  <p className="text-gray-900 dark:text-white"><strong>Gender:</strong> {formData.gender}</p>
                  <p className="text-gray-900 dark:text-white"><strong>Grade:</strong> {school?.programs?.find((p: any) => p.id === formData.programId)?.name}</p>
                  {formData.combination && <p className="text-gray-900 dark:text-white"><strong>Combination:</strong> {formData.combination}</p>}
                  <p className="text-gray-900 dark:text-white"><strong>Ubudehe:</strong> {formData.ubudeheCategory}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px] tracking-wider mb-2">Parent & ID Details</p>
                  <p className="text-gray-900 dark:text-white"><strong>Parent:</strong> {formData.parentName}</p>
                  <p className="text-gray-900 dark:text-white"><strong>Email:</strong> {formData.parentEmail}</p>
                  <p className="text-gray-900 dark:text-white"><strong>Phone:</strong> {formData.parentPhone}</p>
                  <p className="text-gray-900 dark:text-white"><strong>National ID:</strong> {formData.nationalId}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px] tracking-wider mb-2">Home Address</p>
                <p className="text-gray-900 dark:text-white">
                  {formData.village}, {formData.cell}, {formData.sector}, {formData.district}, {formData.province}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{formData.address}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px] tracking-wider mb-2">Academic History</p>
                <p className="text-gray-900 dark:text-white"><strong>Previous School:</strong> {formData.previousSchool}</p>
                <p className="text-gray-900 dark:text-white"><strong>Last Grade:</strong> {formData.lastGradeCompleted}</p>
                {formData.nationalExamIndexNumber && <p className="text-gray-900 dark:text-white"><strong>Index Number:</strong> {formData.nationalExamIndexNumber}</p>}
                <p className="text-gray-900 dark:text-white"><strong>Languages:</strong> {formData.languageProficiency.join(', ')}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px] tracking-wider mb-2">Uploaded Documents</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <div className={`flex items-center px-3 py-1.5 rounded-full border text-[11px] font-medium ${files.birthCertificate ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
                    {files.birthCertificate ? `✓ Birth Certificate: ${files.birthCertificate.name}` : '✗ Birth Certificate Missing'}
                  </div>
                  <div className={`flex items-center px-3 py-1.5 rounded-full border text-[11px] font-medium ${files.reportCard ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
                    {files.reportCard ? `✓ Report Card: ${files.reportCard.name}` : '✗ Report Card Missing'}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 italic">
              By submitting this application, you confirm that all provided Rwandan national documentation (ID/Index Number) is authentic.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" style={{ '--primary': school?.primaryColor } as any}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: school?.primaryColor }}>{school?.name || 'School Admissions'}</h1>
            <p className="text-gray-500 dark:text-gray-400">Admissions Portal</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((step, idx) => (
              <div 
                key={step} 
                className={`text-xs font-semibold uppercase tracking-wider ${idx <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}
                style={idx <= currentStep ? { color: school?.primaryColor } : {}}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%`, backgroundColor: school?.primaryColor }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 sm:p-12 transition-colors">
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">{error}</div>}
          {renderStep()}

          {stepErrors.length > 0 && (
            <div className="mt-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1.5">Please complete the following before continuing:</p>
                  <ul className="space-y-1">
                    {stepErrors.map((err) => (
                      <li key={err} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className={currentStep === 0 ? 'invisible' : ''}
            >
              Previous
            </Button>
            {currentStep === STEPS.length - 1 ? (
              <Button onClick={handleSubmit} isLoading={isSubmitting} style={{ backgroundColor: school?.primaryColor }}>
                Submit Application
              </Button>
            ) : (
              <Button onClick={nextStep} style={{ backgroundColor: school?.primaryColor }}>
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
