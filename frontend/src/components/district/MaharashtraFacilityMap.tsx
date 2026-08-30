import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Hospital, Activity, Clock, Phone, AlertTriangle, ShieldCheck } from 'lucide-react';

// Custom Map Pins for Leaflet
const createCustomIcon = (type: string, hasAlert: boolean) => {
  const bgColor = hasAlert ? '#dc2626' : type === 'DISTRICT_HOSPITAL' ? '#134074' : '#059669';
  const iconEmoji = type === 'DISTRICT_HOSPITAL' ? '🏥' : type === 'RURAL_HOSPITAL' ? '🩺' : '🏨';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      ">
        ${iconEmoji}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20]
  });
};

interface MaharashtraFacilityMapProps {
  facilityScorecards: any[];
}

export const MaharashtraFacilityMap: React.FC<MaharashtraFacilityMapProps> = ({ facilityScorecards }) => {
  const [selectedFacility, setSelectedFacility] = useState<any>(facilityScorecards[0] || null);

  // Thane / Kalyan center coordinates
  const defaultCenter: [number, number] = [19.2437, 73.1355];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 text-slate-900">
      
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gov-navy" />
            <span>Thane District Public Healthcare GIS Map</span>
          </h3>
          <p className="text-xs text-slate-500">Live facility utilization, average waiting time, and supply status</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gov-blue" />
            <span className="text-slate-600 font-medium">District Hospital</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gov-emerald" />
            <span className="text-slate-600 font-medium">PHC / Rural Hospital</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-slate-600 font-medium">Stockout Warning</span>
          </div>
        </div>
      </div>

      {/* Map + Detail Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 8 Cols: Interactive Map Container */}
        <div className="lg:col-span-8 h-[400px] sm:h-[480px] rounded-xl overflow-hidden border border-slate-300 relative z-10 shadow-inner">
          <MapContainer
            center={defaultCenter}
            zoom={11}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {facilityScorecards.map(facility => {
              const hasAlert = facility.medicineAlerts > 0;
              return (
                <Marker
                  key={facility.id}
                  position={[facility.latitude, facility.longitude]}
                  icon={createCustomIcon(facility.type, hasAlert)}
                  eventHandlers={{
                    click: () => setSelectedFacility(facility)
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1 p-1">
                      <div className="font-bold text-gov-navy">{facility.name}</div>
                      <div className="text-slate-600">{facility.type} • {facility.district}</div>
                      <div className="text-slate-800 font-semibold">Patients Today: {facility.patientsToday}</div>
                      <div className="text-slate-800 font-semibold">Avg Wait: {facility.avgWaitMin} mins</div>
                      {hasAlert && (
                        <div className="text-red-600 font-bold">⚠️ {facility.medicineAlerts} Medicine Stockout Alert(s)</div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right 4 Cols: Selected Facility Card */}
        <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-4">
          {selectedFacility ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gov-blue bg-blue-100 px-2 py-0.5 rounded">
                  {selectedFacility.type}
                </span>
                <h4 className="font-bold text-base text-slate-900 mt-1">{selectedFacility.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{selectedFacility.address}</p>
                <div className="flex items-center gap-1 text-xs text-slate-700 font-medium mt-1">
                  <Phone className="w-3.5 h-3.5 text-gov-teal" />
                  <span>{selectedFacility.contactPhone}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Avg Waiting Time</div>
                  <div className="text-base font-black text-gov-navy flex items-center gap-1 mt-0.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{selectedFacility.avgWaitMin} min</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Referral Success</div>
                  <div className="text-base font-black text-emerald-700 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{selectedFacility.referralCompletionRate}%</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Active Doctors</div>
                  <div className="text-base font-black text-slate-800 mt-0.5">
                    {selectedFacility.activeDoctors} On Duty
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-semibold">Quality Rating</div>
                  <div className="text-xs font-bold text-gov-teal mt-1">
                    {selectedFacility.overallQualityScore}
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-700">Active Healthcare Services:</div>
                <div className="flex flex-wrap gap-1">
                  {(selectedFacility.activeServices || []).map((srv: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-medium">
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              {selectedFacility.medicineAlerts > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    <strong>Stockout Alert:</strong> {selectedFacility.medicineAlerts} essential medications need immediate restock.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-12">
              Click any pin on the map to inspect facility parameters.
            </div>
          )}

          <div className="text-[11px] text-slate-400 text-center italic border-t border-slate-200 pt-2">
            *Simulated geospatial healthcare infrastructure feed for Smart India Hackathon.
          </div>
        </div>

      </div>

    </div>
  );
};
