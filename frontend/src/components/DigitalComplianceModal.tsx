import React, { useState, useEffect } from 'react';
import { useSaathiStore } from '../store/useSaathiStore';
import * as api from '../api';
import { DeliveryEPOD, EWayBill, LTLDemand } from '../types';
import { 
  FileText, ShieldCheck, KeyRound, CheckCircle2, 
  Truck, ArrowRight, Download, RefreshCw, PenTool, Check 
} from 'lucide-react';

export const DigitalComplianceModal: React.FC = () => {
  const { pendingDemands, showToast, selectedTrip } = useSaathiStore();

  const [selectedDemandId, setSelectedDemandId] = useState<number>(1);
  const [epod, setEpod] = useState<DeliveryEPOD | null>(null);
  const [ewayBill, setEwayBill] = useState<EWayBill | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [receiverName, setReceiverName] = useState('Consignee Warehouse Manager');
  const [vehicleNoInput, setVehicleNoInput] = useState(selectedTrip?.vehicle_number || 'BR-01-GB-4592');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false);
  const [isAssigningVehicle, setIsAssigningVehicle] = useState(false);

  const selectedDemand = pendingDemands.find(d => d.id === selectedDemandId) || pendingDemands[0];

  useEffect(() => {
    if (selectedDemand) {
      loadData(selectedDemand.id);
    }
  }, [selectedDemandId, pendingDemands]);

  const loadData = async (demandId: number) => {
    try {
      const [ep, ewb] = await Promise.all([
        api.fetchEPOD(demandId),
        api.fetchEWayBill(demandId)
      ]);
      setEpod(ep);
      setEwayBill(ewb);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateOTP = async () => {
    if (!selectedDemand) return;
    setIsGeneratingOTP(true);
    try {
      const newEpod = await api.generateEPOD_OTP(selectedDemand.id, receiverName);
      setEpod(newEpod);
      setOtpInput(newEpod.otp_code); // auto-fill for frictionless testing
      showToast(`SMS OTP sent to ${receiverName}: ${newEpod.otp_code}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsGeneratingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!selectedDemand || !otpInput) return;
    setIsVerifying(true);
    try {
      const verified = await api.verifyEPOD({
        demand_id: selectedDemand.id,
        otp_code: otpInput,
        signature_svg: '<svg width="150" height="40"><path d="M 10 30 Q 30 5 60 20 T 120 15" stroke="#10b981" stroke-width="2.5" fill="none"/></svg>',
        receiver_name: receiverName,
      });
      setEpod(verified);
      showToast('Delivery EPOD Verified! Payout released to driver.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedDemand) return;
    setIsAssigningVehicle(true);
    try {
      const updated = await api.generateEWayBillPartB({
        demand_id: selectedDemand.id,
        vehicle_number: vehicleNoInput,
      });
      setEwayBill(updated);
      showToast(`E-Way Bill Part-B updated with Vehicle ${vehicleNoInput}!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsAssigningVehicle(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            DIGITAL COMPLIANCE & POD HUB
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Digital ePOD (OTP + Signature) & GST E-Way Bill Part-B
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% paperless compliance: Instant OTP delivery verification and dynamic GST vehicle assignment.
          </p>
        </div>

        {/* Load Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Select Shipment:</span>
          <select
            value={selectedDemandId}
            onChange={(e) => setSelectedDemandId(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {pendingDemands.map((d) => (
              <option key={`dem-opt-${d.id}`} value={d.id}>
                Demand #{d.id}: {d.pickup_city} ➔ {d.drop_city} ({d.weight_tonnes}t)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Digital ePOD System */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              Digital ePOD & OTP Verification
            </h3>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              epod?.verified 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {epod?.verified ? 'DELIVERED & VERIFIED' : 'PENDING DELIVERY'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Consignee Receiver:</span>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs w-48 text-right"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cargo Type:</span>
              <span className="text-white font-medium">{selectedDemand?.cargo_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shipment Weight:</span>
              <span className="text-cyan-300 font-mono font-semibold">{selectedDemand?.weight_tonnes} Tonnes</span>
            </div>
          </div>

          {/* OTP Generation / Display Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="text-xs text-slate-400">6-Digit Consignee Secure OTP</div>
            <div className="text-3xl font-mono font-extrabold tracking-widest text-emerald-400">
              {epod?.otp_code || '------'}
            </div>
            <p className="text-[11px] text-slate-500">
              (In production, dispatched via SMS to consignee's phone upon arrival at warehouse)
            </p>

            <button
              onClick={handleGenerateOTP}
              disabled={isGeneratingOTP}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 font-medium transition"
            >
              {isGeneratingOTP ? 'Generating OTP...' : 'Regenerate OTP Code'}
            </button>
          </div>

          {/* OTP Verification & Sign Input */}
          {!epod?.verified ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter Received 6-Digit OTP:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="e.g. 784920"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-center text-lg font-mono font-bold text-white tracking-widest focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleVerifyOTP}
                    disabled={isVerifying || !otpInput}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify OTP & Release Payout'}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/20 border border-dashed border-slate-700 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                  <PenTool className="w-3.5 h-3.5 text-emerald-400" /> Digital Sign-on-Glass Mock
                </div>
                <div className="font-mono text-emerald-400 text-xs italic">
                  ✍️ Signed: {receiverName} ({new Date().toLocaleDateString()})
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center text-emerald-400 text-sm font-bold gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Proof of Delivery Successfully Confirmed!
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Receiver: <strong className="text-white">{epod.receiver_name}</strong></div>
                <div>Verified At: <strong className="text-white">{epod.verified_at || new Date().toISOString()}</strong></div>
                <div>Status: <span className="text-emerald-400 font-semibold">Payment Released to Driver Wallet</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Right: GST E-Way Bill Part-B Hub */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              GST E-Way Bill Part-B Slip
            </h3>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              ewayBill?.status === 'ASSIGNED' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {ewayBill?.status || 'GENERATED'}
            </span>
          </div>

          {/* Official E-Way Bill Visual Template */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono space-y-2 text-slate-200 shadow-inner">
            <div className="border-b border-slate-700 pb-2 flex justify-between items-center text-emerald-400">
              <span className="font-bold tracking-wider">GOVERNMENT OF INDIA • GST PORTAL</span>
              <span className="text-[10px] text-slate-400">Form GST EWB-01</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-slate-500">E-Way Bill No:</span>
                <div className="text-white font-bold">{ewayBill?.eway_bill_no || 'EWB-249821039841'}</div>
              </div>
              <div>
                <span className="text-slate-500">Valid Until:</span>
                <div className="text-slate-300">
                  {ewayBill?.valid_until ? new Date(ewayBill.valid_until).toLocaleDateString() : '3 Days'}
                </div>
              </div>
            </div>

            {/* Part A Data */}
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <div className="text-[11px] font-bold text-slate-400">PART - A (Consignment Info)</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consignor GSTIN:</span>
                <span className="text-slate-300">{ewayBill?.part_a_data.consignor_gstin || '10AAACM4928P1Z3'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consignee:</span>
                <span className="text-slate-300">{ewayBill?.part_a_data.consignee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commodity & HSN:</span>
                <span className="text-slate-300">{ewayBill?.part_a_data.item_desc} (HSN {ewayBill?.part_a_data.hsn_code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Approx Value:</span>
                <span className="text-emerald-400 font-bold">₹{ewayBill?.part_a_data.invoice_val_inr}</span>
              </div>
            </div>

            {/* Part B Data */}
            <div className="border-t border-slate-800 pt-2 space-y-1">
              <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between">
                <span>PART - B (Vehicle & Transporter)</span>
                <span>{ewayBill?.part_b_vehicle_no ? '✅ Populated' : '⚠️ Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle No:</span>
                <span className="text-cyan-300 font-bold">{ewayBill?.part_b_vehicle_no || 'NOT ASSIGNED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transport Doc / LR No:</span>
                <span className="text-slate-300">{ewayBill?.transport_doc_no || 'Pending LR'}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Part-B Form */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-white">Dynamic Vehicle Allocation (Part-B)</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={vehicleNoInput}
                onChange={(e) => setVehicleNoInput(e.target.value)}
                placeholder="BR-01-GB-4592"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAssignVehicle}
                disabled={isAssigningVehicle}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition disabled:opacity-50"
              >
                {isAssigningVehicle ? 'Assigning...' : 'Update Part-B'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
