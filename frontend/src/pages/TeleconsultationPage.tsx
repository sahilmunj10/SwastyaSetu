import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Patient, Appointment } from '../types';
import { TeleconsultRoom } from '../components/doctor/TeleconsultRoom';
import { ArrowLeft, Video, User } from 'lucide-react';

export const TeleconsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const pId = searchParams.get('patientId');
        const patientsRes = await api.getPatients();
        
        let targetPatient = null;
        if (pId) {
          targetPatient = patientsRes.patients.find(p => p.id === pId || p.patientId === pId);
        }
        if (!targetPatient) {
          targetPatient = patientsRes.patients.find(p => p.patientId === 'MH-THN-00101') || patientsRes.patients[0];
        }

        if (targetPatient) {
          const detail = await api.getPatientById(targetPatient.id);
          setPatient(detail.patient);

          if (detail.patient.appointments && detail.patient.appointments.length > 0) {
            setAppointment(detail.patient.appointments[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center text-xs text-slate-500 space-y-3">
        <div className="w-8 h-8 border-4 border-gov-navy border-t-transparent rounded-full animate-spin" />
        <div>Initializing secure clinical teleconsultation room...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 text-xs">
        <Video className="w-12 h-12 text-slate-400 mx-auto" />
        <div className="text-base font-bold text-slate-800">No Patient Consultation Selected</div>
        <p className="text-slate-500">
          Please select an active patient from the OPD queue or citizen register to launch a video consultation.
        </p>
        <button
          onClick={() => navigate('/doctor')}
          className="px-5 py-2.5 bg-gov-navy hover:bg-gov-blue text-white font-bold rounded-xl text-xs shadow transition"
        >
          Return to Workstation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 text-slate-900">
      
      {/* Top back action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-gov-navy transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workstation</span>
        </button>

        <div className="text-xs text-slate-500 font-medium">
          Session Token: <span className="font-mono font-bold text-gov-blue">TC-KLY-2026-089</span>
        </div>
      </div>

      {/* Main Teleconsultation Room */}
      <TeleconsultRoom
        patient={patient}
        appointment={appointment}
        onComplete={() => navigate('/doctor')}
      />

    </div>
  );
};
