'use client';

import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from 'react';

import { useTranslations } from 'next-intl';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { saveIntakeOffline } from '@/lib/services/intake.service';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type Gender = 'MALE' | 'FEMALE' | 'OTHER';
type RiskLevel = 'RED' | 'YELLOW' | 'GREEN';

interface PatientPayload {
  name: string;
  abha_id?: string;
  gender: Gender;
  dob: string; 
  phone?: string;
}

interface TriagePayload {
  symptoms: string[];
  vitals: {
    temperature_c: number;
    systolic_bp: number;
    diastolic_bp: number;
  };
  risk_level: RiskLevel;
  recommended_action: string;
}

interface IntakeFormState {
  name: string;
  abha_id: string;
  gender: Gender | '';
  dob: string;
  phone: string;
  symptoms: string;
  temperature_c: string;
  systolic_bp: string;
  diastolic_bp: string;
  risk_level: RiskLevel | '';
  recommended_action: string;
  consent_granted: boolean;
}

type FieldErrors = Partial<Record<keyof IntakeFormState, string>>;
type SubmitStatus = 'idle' | 'saving' | 'saved' | 'error';

/* -------------------------------------------------------------------------- */
/*                            Constants & helpers                             */
/* -------------------------------------------------------------------------- */

const GENDER_OPTIONS: ReadonlyArray<{ value: Gender; label: string }> = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const RISK_OPTIONS: ReadonlyArray<{ value: RiskLevel; label: string; dot: string }> = [
  { value: 'RED', label: 'RED — Emergency referral', dot: 'bg-red-500' },
  { value: 'YELLOW', label: 'YELLOW — Needs review', dot: 'bg-amber-400' },
  { value: 'GREEN', label: 'GREEN — Routine / home care', dot: 'bg-emerald-500' },
];

const DEFAULT_ACTION: Record<RiskLevel, string> = {
  RED: 'Immediate referral to nearest PHC/CHC. Arrange transport and inform the medical officer now.',
  YELLOW: 'Teleconsultation within 24 hours. Re-check vitals twice daily and escalate if worsening.',
  GREEN: 'Home care advice provided. Routine follow-up visit in 7 days.',
};

const INPUT_CLASS =
  'w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60';

const LABEL_CLASS = 'block text-sm font-medium text-white';
const CARD_CLASS = 'rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6';

function createInitialState(): IntakeFormState {
  return {
    name: '',
    abha_id: '',
    gender: '',
    dob: '',
    phone: '',
    symptoms: '',
    temperature_c: '',
    systolic_bp: '',
    diastolic_bp: '',
    risk_level: '',
    recommended_action: '',
    consent_granted: false,
  };
}

function parseSymptoms(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => {
      if (entry.length === 0) return false;
      const key = entry.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeAbha(raw: string): string {
  return raw.replace(/[\s-]/g, '');
}

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, '').slice(-10);
}

function toNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function validate(form: IntakeFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = 'Enter the full name (minimum 2 characters).';
  }

  if (form.abha_id.trim() !== '' && !/^\d{14}$/.test(normalizeAbha(form.abha_id))) {
    errors.abha_id = 'ABHA number must be 14 digits, or leave it blank.';
  }

  if (form.gender === '') {
    errors.gender = 'Select a gender.';
  }

  if (form.dob === '') {
    errors.dob = 'Date of birth is required.';
  } else {
    const dob = new Date(`${form.dob}T00:00:00`);
    if (Number.isNaN(dob.getTime())) {
      errors.dob = 'Enter a valid date.';
    } else if (dob.getTime() > Date.now()) {
      errors.dob = 'Date of birth cannot be in the future.';
    } else if (dob.getUTCFullYear() < 1900) {
      errors.dob = 'Enter a date of birth after 1900.';
    }
  }

  if (form.phone.trim() !== '' && !/^[6-9]\d{9}$/.test(normalizePhone(form.phone))) {
    errors.phone = 'Enter a valid 10-digit mobile number, or leave it blank.';
  }

  if (parseSymptoms(form.symptoms).length === 0) {
    errors.symptoms = 'Record at least one symptom.';
  }

  const temperature = toNumber(form.temperature_c);
  if (temperature === null) {
    errors.temperature_c = 'Temperature is required.';
  } else if (temperature < 30 || temperature > 45) {
    errors.temperature_c = 'Temperature must be between 30 °C and 45 °C.';
  }

  const systolic = toNumber(form.systolic_bp);
  if (systolic === null) {
    errors.systolic_bp = 'Systolic BP is required.';
  } else if (!Number.isInteger(systolic) || systolic < 60 || systolic > 260) {
    errors.systolic_bp = 'Systolic BP must be a whole number between 60 and 260.';
  }

  const diastolic = toNumber(form.diastolic_bp);
  if (diastolic === null) {
    errors.diastolic_bp = 'Diastolic BP is required.';
  } else if (!Number.isInteger(diastolic) || diastolic < 30 || diastolic > 200) {
    errors.diastolic_bp = 'Diastolic BP must be a whole number between 30 and 200.';
  }

  if (systolic !== null && diastolic !== null && !errors.systolic_bp && !errors.diastolic_bp && systolic <= diastolic) {
    errors.diastolic_bp = 'Diastolic must be lower than systolic.';
  }

  if (form.risk_level === '') {
    errors.risk_level = 'Select a triage risk level.';
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/*                              Field primitives                              */
/* -------------------------------------------------------------------------- */

interface FieldProps {
  id: string;
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}

function Field({ id, label, children, required = false, hint, error, className }: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
          {required ? <span className="ml-1 text-emerald-500">*</span> : null}
        </label>
        {!required ? <span className="text-xs text-slate-400">Optional</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function NewIntakePage() {
  const t = useTranslations('worker.intake');
  const { syncPendingData } = useOfflineSync();

  const [form, setForm] = useState<IntakeFormState>(createInitialState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [actionTouched, setActionTouched] = useState<boolean>(false);

  const isSaving = status === 'saving';

  const setField = useCallback(<K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleRiskChange = useCallback(
    (value: RiskLevel | ''): void => {
      setField('risk_level', value);
      if (!actionTouched) {
        setField('recommended_action', value === '' ? '' : DEFAULT_ACTION[value]);
      }
    },
    [actionTouched, setField],
  );

  const resetForm = useCallback((): void => {
    setForm(createInitialState());
    setErrors({});
    setActionTouched(false);
    setStatus('idle');
    setMessage(null);
  }, []);

  const age = useMemo<number | null>(() => {
    if (form.dob === '') return null;
    const dob = new Date(`${form.dob}T00:00:00`);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const monthDelta = today.getMonth() - dob.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
      years -= 1;
    }
    return years >= 0 && years < 130 ? years : null;
  }, [form.dob]);

  const symptomCount = useMemo<number>(() => parseSymptoms(form.symptoms).length, [form.symptoms]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSaving) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus('error');
      setMessage(t('validation.fixErrors'));
      return;
    }

    setErrors({});
    setStatus('saving');
    setMessage(null);

    const abha = normalizeAbha(form.abha_id);
    const phone = normalizePhone(form.phone);

    const patientData: PatientPayload = {
      name: form.name.trim().replace(/\s+/g, ' '),
      gender: form.gender as Gender,
      dob: form.dob,
      ...(abha !== '' ? { abha_id: abha } : {}),
      ...(phone !== '' ? { phone } : {}),
    };

    const riskLevel = form.risk_level as RiskLevel;

    const triageData: TriagePayload = {
      symptoms: parseSymptoms(form.symptoms),
      vitals: {
        temperature_c: Number(form.temperature_c),
        systolic_bp: Number(form.systolic_bp),
        diastolic_bp: Number(form.diastolic_bp),
      },
      risk_level: riskLevel,
      recommended_action: form.recommended_action.trim() || DEFAULT_ACTION[riskLevel],
    };

    try {
      await saveIntakeOffline(patientData, triageData, {
        triggerSync: true,
        consent: {
          purpose: 'CARE_DELIVERY',
          scope: 'DISTRICT_LEVEL',
          grantee: 'diagnoverse-network',
          notice_version: 'v1.0'
        }
      });

      setForm(createInitialState());
      setActionTouched(false);
      setStatus('saved');
      setMessage(
        t('success', { name: patientData.name }),
      );

      try {
        await syncPendingData('post-intake');
      } catch {
        /* queued for the next sync window */
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not save this intake to local storage. Please retry, and do not close the app.',
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1120] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Field Operations</p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">New Patient Intake</h1>
          <p className="mt-2 text-sm text-slate-400">
            Every record is written to this device first, then synced. You can complete intakes with no network.
          </p>
        </header>

        {message !== null ? (
          <div
            role={status === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={
              status === 'error'
                ? 'mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300'
                : 'mb-6 rounded-lg border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300'
            }
          >
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* ------------------------- Card 1: Patient ------------------------- */}
          <section className={CARD_CLASS} aria-labelledby="patient-details-heading">
            <div className="mb-5 border-b border-slate-800 pb-4">
              <h2 id="patient-details-heading" className="text-base font-semibold text-white">
                {t('patientDetails')}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{t('patientDetailsHint')}</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field className="sm:col-span-2" error={errors.name} id="name" label={t('fullName')} required>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Sunita Devi"
                  className={INPUT_CLASS}
                  value={form.name}
                  disabled={isSaving}
                  aria-invalid={errors.name !== undefined}
                  aria-describedby={errors.name !== undefined ? 'name-error' : undefined}
                  onChange={(event) => setField('name', event.target.value)}
                />
              </Field>

              <Field error={errors.abha_id} hint={t('abhaIdHint')} id="abha_id" label={t('abhaId')}>
                <input
                  id="abha_id"
                  name="abha_id"
                  type="text"
                  inputMode="numeric"
                  placeholder="12 3456 7890 1234"
                  className={INPUT_CLASS}
                  value={form.abha_id}
                  disabled={isSaving}
                  aria-invalid={errors.abha_id !== undefined}
                  aria-describedby={errors.abha_id !== undefined ? 'abha_id-error' : 'abha_id-hint'}
                  onChange={(event) => setField('abha_id', event.target.value)}
                />
              </Field>

              <Field error={errors.gender} id="gender" label={t('gender')} required>
                <select
                  id="gender"
                  name="gender"
                  className={INPUT_CLASS}
                  value={form.gender}
                  disabled={isSaving}
                  aria-invalid={errors.gender !== undefined}
                  aria-describedby={errors.gender !== undefined ? 'gender-error' : undefined}
                  onChange={(event) => setField('gender', event.target.value as Gender | '')}
                >
                  <option value="" className="bg-slate-950 text-slate-400">
                    Select gender
                  </option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field error={errors.dob} hint={age !== null ? `Approximate age: ${age} year${age === 1 ? '' : 's'}.` : undefined} id="dob" label={t('dob')} required>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  className={`${INPUT_CLASS} [color-scheme:dark]`}
                  value={form.dob}
                  disabled={isSaving}
                  aria-invalid={errors.dob !== undefined}
                  aria-describedby={errors.dob !== undefined ? 'dob-error' : age !== null ? 'dob-hint' : undefined}
                  onChange={(event) => setField('dob', event.target.value)}
                />
              </Field>

              <Field error={errors.phone} id="phone" label={t('phone')}>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  className={INPUT_CLASS}
                  value={form.phone}
                  disabled={isSaving}
                  aria-invalid={errors.phone !== undefined}
                  aria-describedby={errors.phone !== undefined ? 'phone-error' : undefined}
                  onChange={(event) => setField('phone', event.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* --------------------- Card 2: Vitals & Triage --------------------- */}
          <section className={CARD_CLASS} aria-labelledby="triage-heading">
            <div className="mb-5 border-b border-slate-800 pb-4">
              <h2 id="triage-heading" className="text-base font-semibold text-white">
                2. Vitals &amp; Triage
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Record what you observed in the field, then assign a risk level.
              </p>
            </div>

            <div className="space-y-5">
              <Field hint={symptomCount > 0 ? `${symptomCount} symptom${symptomCount === 1 ? '' : 's'} recorded.` : 'Separate each symptom with a comma.'} error={errors.symptoms} id="symptoms" label={t('symptoms')} required>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  rows={3}
                  placeholder="fever, dry cough, breathlessness"
                  className={`${INPUT_CLASS} resize-y`}
                  value={form.symptoms}
                  disabled={isSaving}
                  aria-invalid={errors.symptoms !== undefined}
                  aria-describedby={errors.symptoms !== undefined ? 'symptoms-error' : 'symptoms-hint'}
                  onChange={(event) => setField('symptoms', event.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field error={errors.temperature_c} id="temperature_c" label={t('temperature')} required>
                  <input
                    id="temperature_c"
                    name="temperature_c"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="30"
                    max="45"
                    placeholder="37.0"
                    className={INPUT_CLASS}
                    value={form.temperature_c}
                    disabled={isSaving}
                    aria-invalid={errors.temperature_c !== undefined}
                    aria-describedby={errors.temperature_c !== undefined ? 'temperature_c-error' : undefined}
                    onChange={(event) => setField('temperature_c', event.target.value)}
                  />
                </Field>

                <Field error={errors.systolic_bp} id="systolic_bp" label="Systolic BP (mmHg)" required>
                  <input
                    id="systolic_bp"
                    name="systolic_bp"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="60"
                    max="260"
                    placeholder="120"
                    className={INPUT_CLASS}
                    value={form.systolic_bp}
                    disabled={isSaving}
                    aria-invalid={errors.systolic_bp !== undefined}
                    aria-describedby={errors.systolic_bp !== undefined ? 'systolic_bp-error' : undefined}
                    onChange={(event) => setField('systolic_bp', event.target.value)}
                  />
                </Field>

                <Field error={errors.diastolic_bp} id="diastolic_bp" label="Diastolic BP (mmHg)" required>
                  <input
                    id="diastolic_bp"
                    name="diastolic_bp"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="30"
                    max="200"
                    placeholder="80"
                    className={INPUT_CLASS}
                    value={form.diastolic_bp}
                    disabled={isSaving}
                    aria-invalid={errors.diastolic_bp !== undefined}
                    aria-describedby={errors.diastolic_bp !== undefined ? 'diastolic_bp-error' : undefined}
                    onChange={(event) => setField('diastolic_bp', event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field error={errors.risk_level} id="risk_level" label={t('riskLevel')} required>
                  <div className="relative">
                    <select
                      id="risk_level"
                      name="risk_level"
                      className={INPUT_CLASS}
                      value={form.risk_level}
                      disabled={isSaving}
                      aria-invalid={errors.risk_level !== undefined}
                      aria-describedby={errors.risk_level !== undefined ? 'risk_level-error' : undefined}
                      onChange={(event) => handleRiskChange(event.target.value as RiskLevel | '')}
                    >
                      <option value="" className="bg-slate-950 text-slate-400">
                        Select risk level
                      </option>
                      {RISK_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.risk_level !== '' ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          RISK_OPTIONS.find((option) => option.value === form.risk_level)?.dot ?? 'bg-slate-400'
                        }`}
                      />
                      Triage flag set to {form.risk_level}.
                    </div>
                  ) : null}
                </Field>

                <Field error={errors.recommended_action} hint="Pre-filled from the risk level. Edit if your assessment differs." id="recommended_action" label="Recommended Action">
                  <textarea
                    id="recommended_action"
                    name="recommended_action"
                    rows={3}
                    placeholder="Select a risk level to load the standard protocol."
                    className={`${INPUT_CLASS} resize-y`}
                    value={form.recommended_action}
                    disabled={isSaving}
                    aria-describedby="recommended_action-hint"
                    onChange={(event) => {
                      setActionTouched(true);
                      setField('recommended_action', event.target.value);
                    }}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* ------------------------------ Actions ---------------------------- */}
          <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="text-sm text-slate-400">
              Saved locally in an encrypted queue. Nothing is lost if you lose signal mid-visit.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="rounded-md border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <Spinner/> : null}
                {isSaving ? 'Saving intake…' : 'Save Intake'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
