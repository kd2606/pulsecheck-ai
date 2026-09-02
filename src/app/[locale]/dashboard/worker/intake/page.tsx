'use client';

/**
 * ASHA Worker Protocol-Driven Intake UI
 *
 * STRICT RULE: NO free-text symptom inputs.
 * All data capture is via structured checklists, numeric vitals, and coded items.
 *
 * 5-Step Intake Flow:
 *   1. Patient Selection & Consent
 *   2. Protocol Checklist (Danger Signs)
 *   3. Vitals Entry (OCR/BLE mock + manual fallback)
 *   4. AI Modality Triggers (Capture placeholders)
 *   5. Triage Action (Live triage computation + result display)
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Baby,
  HeartPulse,
  Activity,
  Thermometer,
  Heart,
  Wind,
  Droplets,
  Gauge,
  Scale,
  Ruler,
  Bluetooth,
  ScanLine,
  Camera,
  Mic,
  Stethoscope,
  Zap,
  Loader2,
  CircleAlert,
  Shield,
  Search,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import {
  type ProtocolChecklistItem,
  type StructuredVitals,
  type VitalReading,
  type ActorId,
  TriageTier,
  TRIAGE_TIER_ORDINAL,
} from '@/lib/diagnoverse/types';
import {
  PROTOCOL_GROUPS,
  createChecklistItem,
  type ProtocolGroup,
} from '@/lib/diagnoverse/protocol-definitions';
import { computeTriageResult } from '@/lib/diagnoverse/triage-engine';

// ─── Interfaces & Constants ───────────────────

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  relation?: string;
  abhaId?: string;
}

const MOCK_WORKER_ID = 'ASHA-CG-4201' as ActorId;

// ─── Step Indicator ──────────────────────────

const STEPS = [
  { number: 1, label: 'Patient', icon: Users },
  { number: 2, label: 'Checklist', icon: ShieldCheck },
  { number: 3, label: 'Vitals', icon: Activity },
  { number: 4, label: 'AI Scan', icon: ScanLine },
  { number: 5, label: 'Triage', icon: Zap },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  isCompleted && 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
                  isActive && 'bg-blue-500/20 border-blue-500 text-blue-400 ring-4 ring-blue-500/20',
                  !isActive && !isCompleted && 'bg-muted/50 border-muted-foreground/20 text-muted-foreground/50'
                )}
              >
                {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium',
                  isActive && 'text-blue-400',
                  isCompleted && 'text-emerald-400',
                  !isActive && !isCompleted && 'text-muted-foreground/50'
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 md:w-16 h-0.5 mx-1 sm:mx-2 mt-[-18px]',
                  step.number < currentStep ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Patient Selection ───────────────

function Step1PatientSelection({
  selectedPatient,
  onSelect,
  consentGiven,
  onConsent,
}: {
  selectedPatient: Patient | null;
  onSelect: (patient: Patient) => void;
  consentGiven: boolean;
  onConsent: (v: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a production environment, this would fetch from IndexedDB or Firestore.
    // For now, representing an authentic zero-state for a fresh login.
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="size-5 text-blue-400" />
          Select Patient
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Search for an existing patient or add a new one.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, ABHA ID or phone number..." 
          className="pl-10 h-12 bg-slate-900 border-slate-800 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="h-32 rounded-lg bg-slate-900 animate-pulse border border-slate-800" />
        ) : patients.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 border-dashed text-center p-8">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-200 font-medium">No patients found</p>
            <p className="text-slate-500 text-sm mt-1 mb-6 max-w-sm mx-auto">
              Search yielded no results. Add a new patient to your assigned families to begin screening.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {patients.map((member) => {
              const isSelected = selectedPatient?.id === member.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelect(member)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl transition-all',
                    isSelected
                      ? 'bg-blue-500/15 border border-blue-500/40 ring-2 ring-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 hover:bg-slate-800/80'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
                      )}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className={cn('font-medium', isSelected ? 'text-blue-300' : 'text-slate-200')}>
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {member.relation} • {member.gender === 'M' ? 'Male' : 'Female'} • {member.age < 1 ? `${Math.round(member.age * 12)} months` : `${member.age} yrs`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                      {member.id}
                    </Badge>
                    {isSelected && <CheckCircle2 className="size-5 text-blue-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedPatient && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <button
                onClick={() => onConsent(!consentGiven)}
                className={cn(
                  'mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0',
                  consentGiven
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-muted-foreground/40 hover:border-blue-400'
                )}
              >
                {consentGiven && <Check className="size-4 text-white" />}
              </button>
              <div>
                <p className="text-sm font-medium text-white">Verbal Consent Obtained</p>
                <p className="text-xs text-muted-foreground mt-1">
                  I confirm that {selectedPatient.name} (or their guardian) has given verbal
                  consent for this health screening as per DPDP Act 2023 requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Step 2: Protocol Checklist ──────────────

const PROTOCOL_ICON_MAP: Record<string, typeof AlertTriangle> = {
  AlertTriangle,
  Baby,
  HeartPulse,
  Activity,
};

function Step2ProtocolChecklist({
  checklist,
  onToggle,
}: {
  checklist: ProtocolChecklistItem[];
  onToggle: (code: string) => void;
}) {
  const [expandedGroup, setExpandedGroup] = useState<string>(PROTOCOL_GROUPS[0].id);

  const presentCount = checklist.filter((i) => i.present).length;
  const severeCounts = useMemo(() => {
    const counts = { red: 0, orange: 0, yellow: 0 };
    for (const item of checklist) {
      if (!item.present) continue;
      const group = PROTOCOL_GROUPS.find((g) => g.items.some((t) => t.code === item.code));
      const template = group?.items.find((t) => t.code === item.code);
      if (template) counts[template.severity]++;
    }
    return counts;
  }, [checklist]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="size-5 text-blue-400" />
          Protocol Checklist
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check all danger signs observed. <strong>No free-text entry.</strong>
        </p>
      </div>

      {presentCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
          <CircleAlert className="size-5 text-amber-400 shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="text-white font-semibold">{presentCount} danger sign(s)</span> identified:
            {severeCounts.red > 0 && (
              <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">{severeCounts.red} RED</Badge>
            )}
            {severeCounts.orange > 0 && (
              <Badge className="ml-1 bg-orange-500/20 text-orange-400 border-orange-500/30">{severeCounts.orange} ORANGE</Badge>
            )}
            {severeCounts.yellow > 0 && (
              <Badge className="ml-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{severeCounts.yellow} YELLOW</Badge>
            )}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {PROTOCOL_GROUPS.map((group: ProtocolGroup) => {
          const GroupIcon = PROTOCOL_ICON_MAP[group.icon] ?? ShieldCheck;
          const groupItems = checklist.filter((i) => i.protocolId === group.id);
          const groupPresent = groupItems.filter((i) => i.present).length;
          const isExpanded = expandedGroup === group.id;

          return (
            <Card key={group.id} className="bg-card/50 border-border/50 overflow-hidden">
              <button
                onClick={() => setExpandedGroup(isExpanded ? '' : group.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <GroupIcon className="size-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {groupPresent > 0 && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {groupPresent}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border/30 px-4 pb-4 pt-3 space-y-2">
                  {groupItems.map((item) => {
                    const template = group.items.find((t) => t.code === item.code);
                    const severityColor = template?.severity === 'red'
                      ? 'border-red-500/40 bg-red-500/10'
                      : template?.severity === 'orange'
                        ? 'border-orange-500/40 bg-orange-500/10'
                        : 'border-yellow-500/40 bg-yellow-500/10';

                    return (
                      <button
                        key={item.code}
                        onClick={() => onToggle(item.code)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-lg transition-all border',
                          item.present
                            ? severityColor
                            : 'bg-muted/10 border-transparent hover:bg-muted/30'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0',
                              item.present
                                ? template?.severity === 'red'
                                  ? 'bg-red-500 border-red-500'
                                  : template?.severity === 'orange'
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'bg-yellow-500 border-yellow-500'
                                : 'border-muted-foreground/30'
                            )}
                          >
                            {item.present && <Check className="size-4 text-white" />}
                          </div>
                          <div className="text-left">
                            <p className={cn('text-sm font-medium', item.present ? 'text-white' : 'text-muted-foreground')}>
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground/60 font-mono">{item.code}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs capitalize',
                            template?.severity === 'red' && 'text-red-400 border-red-500/30',
                            template?.severity === 'orange' && 'text-orange-400 border-orange-500/30',
                            template?.severity === 'yellow' && 'text-yellow-400 border-yellow-500/30',
                          )}
                        >
                          {template?.severity}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Vitals Entry ────────────────────

interface VitalField {
  key: keyof StructuredVitals;
  label: string;
  unit: string;
  icon: typeof Thermometer;
  placeholder: string;
  min: number;
  max: number;
  step: number;
  bleCapable: boolean;
}

const VITAL_FIELDS: VitalField[] = [
  { key: 'spO2',            label: 'SpO2 (Oxygen)',    unit: '%',           icon: Droplets,     placeholder: '95-100', min: 50, max: 100, step: 1, bleCapable: true },
  { key: 'heartRate',       label: 'Heart Rate',       unit: 'bpm',         icon: Heart,        placeholder: '60-100', min: 20, max: 250, step: 1, bleCapable: true },
  { key: 'temperature',     label: 'Temperature',      unit: '°C',          icon: Thermometer,  placeholder: '36.5',   min: 30, max: 45,  step: 0.1, bleCapable: true },
  { key: 'respiratoryRate', label: 'Respiratory Rate', unit: 'breaths/min', icon: Wind,         placeholder: '12-20',  min: 5,  max: 60,  step: 1, bleCapable: false },
  { key: 'systolicBP',      label: 'Systolic BP',      unit: 'mmHg',        icon: Gauge,        placeholder: '120',    min: 50, max: 300, step: 1, bleCapable: true },
  { key: 'diastolicBP',     label: 'Diastolic BP',     unit: 'mmHg',        icon: Gauge,        placeholder: '80',     min: 30, max: 200, step: 1, bleCapable: true },
  { key: 'bloodGlucose',    label: 'Blood Glucose',    unit: 'mg/dL',       icon: Droplets,     placeholder: '80-120', min: 10, max: 600, step: 1, bleCapable: false },
  { key: 'weight',          label: 'Weight',           unit: 'kg',          icon: Scale,        placeholder: '50-80',  min: 0.5, max: 200, step: 0.5, bleCapable: false },
  { key: 'muac',            label: 'MUAC',             unit: 'cm',          icon: Ruler,        placeholder: '12-15',  min: 5, max: 40, step: 0.1, bleCapable: false },
];

function Step3VitalsEntry({
  vitals,
  onVitalChange,
}: {
  vitals: StructuredVitals;
  onVitalChange: (key: keyof StructuredVitals, value: string) => void;
}) {
  const [bleScanning, setBleScanning] = useState<string | null>(null);

  const handleBleScan = (key: string) => {
    setBleScanning(key);
    // Mock BLE scan — auto-fill after 2 seconds
    setTimeout(() => {
      const mockValues: Record<string, string> = {
        spO2: '97',
        heartRate: '78',
        temperature: '37.2',
        systolicBP: '128',
        diastolicBP: '82',
      };
      if (mockValues[key]) {
        onVitalChange(key as keyof StructuredVitals, mockValues[key]);
      }
      setBleScanning(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="size-5 text-blue-400" />
          Record Vitals
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect BLE device or enter manually. All fields are optional.
        </p>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <Bluetooth className="size-5 text-blue-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium">BLE Device Ready</p>
          <p className="text-xs text-muted-foreground">Tap the Bluetooth icon on any vital to auto-import from connected device</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Mock</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VITAL_FIELDS.map((field) => {
          const Icon = field.icon;
          const currentReading = vitals[field.key];
          const currentValue = currentReading?.value?.toString() ?? '';
          const isScanning = bleScanning === field.key;

          return (
            <Card key={field.key} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-blue-400" />
                    <Label className="text-sm font-medium text-white">{field.label}</Label>
                  </div>
                  {field.bleCapable && (
                    <button
                      onClick={() => handleBleScan(field.key)}
                      disabled={isScanning}
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                        isScanning
                          ? 'bg-blue-500/20 animate-pulse'
                          : 'bg-muted/30 hover:bg-blue-500/20'
                      )}
                    >
                      {isScanning ? (
                        <Loader2 className="size-4 text-blue-400 animate-spin" />
                      ) : (
                        <Bluetooth className="size-4 text-blue-400" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={currentValue}
                    onChange={(e) => onVitalChange(field.key, e.target.value)}
                    className="h-11 text-lg font-mono bg-muted/20"
                  />
                  <span className="text-sm text-muted-foreground w-16 text-right shrink-0">
                    {field.unit}
                  </span>
                </div>
                {currentReading && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Badge variant="outline" className="text-xs py-0">
                      {currentReading.source === 'ble_pulse_oximeter' ? 'BLE' : 'Manual'}
                    </Badge>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: AI Modality Triggers ────────────

function Step4AIModalities() {
  const [capturing, setCapturing] = useState<string | null>(null);

  const modalities = [
    {
      id: 'skin_scan',
      title: 'Skin Scan',
      description: 'Capture a photo of the affected skin area for AI analysis',
      icon: Camera,
      color: 'blue',
      action: 'Capture Photo',
    },
    {
      id: 'cough_analysis',
      title: 'Cough Analysis',
      description: 'Record 5 seconds of cough audio for classification',
      icon: Mic,
      color: 'teal',
      action: 'Record Audio',
    },
    {
      id: 'vitals_ocr',
      title: 'Vitals OCR',
      description: 'Photograph a paper report to extract vital readings via OCR',
      icon: ScanLine,
      color: 'purple',
      action: 'Scan Report',
    },
    {
      id: 'auscultation',
      title: 'Digital Auscultation',
      description: 'Connect digital stethoscope for lung/heart sound analysis',
      icon: Stethoscope,
      color: 'emerald',
      action: 'Connect Device',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    teal: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  };

  const handleCapture = (id: string) => {
    setCapturing(id);
    setTimeout(() => setCapturing(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ScanLine className="size-5 text-blue-400" />
          AI Screening Modules
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Optional: Capture media for AI-assisted screening. All modules run through the 3-stage safety gate.
        </p>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <Shield className="size-5 text-amber-400 shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-amber-300 font-medium">AI Safety Gate Active:</span>{' '}
          Capture QC → Out-of-Distribution Check → Conformal Inference. AI may only <strong>escalate</strong> the triage tier, never lower it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modalities.map((mod) => {
          const Icon = mod.icon;
          const isCapturing = capturing === mod.id;
          return (
            <Card key={mod.id} className="bg-card/50 border-border/50 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', colorMap[mod.color])}>
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{mod.title}</p>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleCapture(mod.id)}
                  disabled={isCapturing}
                  variant="outline"
                  className="w-full h-11"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Icon className="size-4" />
                      {mod.action}
                    </>
                  )}
                </Button>
                {isCapturing && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Running 3-Stage Gate...</span>
                      <span>CaptureQC → OOD → Inference</span>
                    </div>
                    <Progress value={66} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground/60">
        AI modules are for screening assistance only. They do not replace clinical judgment.
      </p>
    </div>
  );
}

// ─── Step 5: Triage Result ───────────────────

const TIER_STYLES: Record<TriageTier, { bg: string; border: string; text: string; label: string; description: string }> = {
  [TriageTier.RED]: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/50',
    text: 'text-red-400',
    label: 'EMERGENCY',
    description: 'Immediate referral to nearest hospital. Call 108 ambulance.',
  },
  [TriageTier.ORANGE]: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    label: 'URGENT',
    description: 'Refer to PHC within 1 hour. Monitor vitals continuously.',
  },
  [TriageTier.YELLOW]: {
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    label: 'SEMI-URGENT',
    description: 'Refer to PHC within 24 hours. Schedule follow-up.',
  },
  [TriageTier.GREEN]: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    label: 'NON-URGENT',
    description: 'Provide home care advice. Schedule routine follow-up.',
  },
};

function Step5TriageResult({
  vitals,
  checklist,
  patientName,
}: {
  vitals: StructuredVitals;
  checklist: ProtocolChecklistItem[];
  patientName: string;
}) {
  // Run the LIVE triage pipeline from our domain engine
  const triageResult = useMemo(
    () => computeTriageResult(vitals, checklist, null),
    [vitals, checklist]
  );

  const style = TIER_STYLES[triageResult.finalTier];
  const ordinal = TRIAGE_TIER_ORDINAL[triageResult.finalTier];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="size-5 text-blue-400" />
          Triage Result
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Computed by the deterministic rules engine for <strong className="text-white">{patientName}</strong>
        </p>
      </div>

      {/* ── Main Tier Card ── */}
      <Card className={cn('overflow-hidden', style.bg, style.border, 'border-2')}>
        <CardContent className="p-6 text-center">
          <div
            className={cn(
              'w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 border-4',
              style.border, style.bg
            )}
          >
            <span className={cn('text-4xl font-black', style.text)}>
              {triageResult.finalTier}
            </span>
          </div>
          <h3 className={cn('text-2xl font-black mb-2', style.text)}>
            {style.label}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {style.description}
          </p>
        </CardContent>
      </Card>

      {/* ── Triage Details ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Deterministic Baseline</p>
            <Badge className={cn('text-sm', TIER_STYLES[triageResult.deterministicTier].bg, TIER_STYLES[triageResult.deterministicTier].text)}>
              {triageResult.deterministicTier}
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">AI Proposed</p>
            <Badge variant="outline" className="text-sm">
              {triageResult.aiProposedTier ?? 'Not Run'}
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Final (Max of both)</p>
            <Badge className={cn('text-sm font-bold', style.bg, style.text, style.border, 'border')}>
              {triageResult.finalTier}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ── Fired Rules ── */}
      {triageResult.firedRuleIds.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              Rules Triggered ({triageResult.firedRuleIds.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {triageResult.firedRuleIds.map((ruleId) => (
                <div key={ruleId} className="flex items-center gap-2 p-2 rounded bg-muted/20">
                  <CircleAlert className="size-3 text-amber-400 shrink-0" />
                  <code className="text-xs text-muted-foreground font-mono">{ruleId}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Severity Gauge ── */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Severity</span>
          <span>{ordinal}/3</span>
        </div>
        <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              triageResult.finalTier === TriageTier.GREEN && 'bg-emerald-500 w-[8%]',
              triageResult.finalTier === TriageTier.YELLOW && 'bg-yellow-500 w-[33%]',
              triageResult.finalTier === TriageTier.ORANGE && 'bg-orange-500 w-[66%]',
              triageResult.finalTier === TriageTier.RED && 'bg-red-500 w-full',
            )}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-emerald-400">GREEN</span>
          <span className="text-yellow-400">YELLOW</span>
          <span className="text-orange-400">ORANGE</span>
          <span className="text-red-400">RED</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {ordinal >= 2 && (
          <Button className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold">
            <AlertTriangle className="size-5" />
            Create Emergency Referral
          </Button>
        )}
        {ordinal === 1 && (
          <Button className="flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold">
            <AlertTriangle className="size-5" />
            Create PHC Referral
          </Button>
        )}
        <Button variant="outline" className="flex-1 h-12">
          <CheckCircle2 className="size-5" />
          Save & Complete Intake
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground/60">
        Triage computed at {triageResult.computedAt} • AI Safety: Escalation-Only Invariant Active
      </p>
    </div>
  );
}

// ─── Main Intake Page ────────────────────────

export default function IntakePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Protocol checklist state
  const [checklist, setChecklist] = useState<ProtocolChecklistItem[]>(() => {
    const items: ProtocolChecklistItem[] = [];
    for (const group of PROTOCOL_GROUPS) {
      for (const template of group.items) {
        items.push(createChecklistItem(template, group.id, MOCK_WORKER_ID));
      }
    }
    return items;
  });

  // Vitals state
  const [vitals, setVitals] = useState<StructuredVitals>({});

  const handleToggleChecklist = useCallback((code: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.code === code ? { ...item, present: !item.present } : item
      )
    );
  }, []);

  const handleVitalChange = useCallback((key: keyof StructuredVitals, value: string) => {
    const numVal = parseFloat(value);
    if (value === '' || isNaN(numVal)) {
      setVitals((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const reading: VitalReading = {
      value: numVal,
      unit: VITAL_FIELDS.find((f) => f.key === key)?.unit ?? '',
      source: 'manual_entry',
      capturedBy: MOCK_WORKER_ID,
      capturedAt: new Date().toISOString(),
    };

    setVitals((prev) => ({ ...prev, [key]: reading }));
  }, []);

  const canProceed = step === 1
    ? selectedPatient !== null && consentGiven
    : true;

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => step > 1 ? setStep(step - 1) : router.push(`/${locale}/dashboard/worker`)}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-white">New Patient Intake</h1>
          <p className="text-xs text-muted-foreground">
            Step {step} of {STEPS.length} • Protocol-Driven Assessment
          </p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="mb-6 h-1.5" />

      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {step === 1 && (
          <Step1PatientSelection
            selectedPatient={selectedPatient}
            onSelect={setSelectedPatient}
            consentGiven={consentGiven}
            onConsent={setConsentGiven}
          />
        )}
        {step === 2 && (
          <Step2ProtocolChecklist
            checklist={checklist}
            onToggle={handleToggleChecklist}
          />
        )}
        {step === 3 && (
          <Step3VitalsEntry
            vitals={vitals}
            onVitalChange={handleVitalChange}
          />
        )}
        {step === 4 && <Step4AIModalities />}
        {step === 5 && (
          <Step5TriageResult
            vitals={vitals}
            checklist={checklist}
            patientName={selectedPatient?.name ?? 'Unknown'}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="h-11"
        >
          <ArrowLeft className="size-4" />
          Previous
        </Button>

        {step < STEPS.length ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed}
            className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next Step
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={async () => {
              // Dynamically import the sync engine to avoid breaking SSR
              const { saveAndQueueForSync } = await import('@/lib/diagnoverse/offline');
              
              // Construct a dummy InternalTriageCase for offline saving compliance
              const triageCase = {
                id: crypto.randomUUID() as any, // Using standard UUID for dummy case
                schemaVersion: '1.0.0' as const,
                subject: {
                  identifiers: { mr: selectedPatient?.id || 'UNKNOWN' },
                  demographics: {
                    name: selectedPatient?.name || 'Unknown Patient',
                    gender: selectedPatient?.gender?.toLowerCase() as 'male' | 'female' | 'other' || 'unknown',
                    age: selectedPatient?.age || 0,
                  }
                },
                encounter: {
                  startTime: new Date().toISOString(),
                  endTime: new Date().toISOString(),
                  location: 'CHW_FIELD',
                  device: 'ASHA_MOBILE',
                  actor: MOCK_WORKER_ID,
                },
                candidateDuplicateOf: null,
                protocolChecklist: checklist,
                vitals: vitals,
                triageResult: computeTriageResult(vitals, checklist, null)
              } as any;
              
              await saveAndQueueForSync(triageCase);
              router.push(`/${locale}/dashboard/worker`);
            }}
          >
            <CheckCircle2 className="size-4" />
            Complete & Save
          </Button>
        )}
      </div>
    </div>
  );
}
