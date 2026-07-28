import React, { useState } from 'react';
import { MapPin, X, Check, Building2, ChevronRight, Sparkles, Navigation, Search } from 'lucide-react';
import { VIETNAM_PROVINCES, POPULAR_STREETS, QUICK_PRESET_ADDRESSES } from '../data/addressData';

interface AddressPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (fullAddress: string) => void;
  currentAddress?: string;
}

export const AddressPickerModal: React.FC<AddressPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  currentAddress = ''
}) => {
  const [selectedProvince, setSelectedProvince] = useState(VIETNAM_PROVINCES[0].name);
  const [selectedDistrict, setSelectedDistrict] = useState(VIETNAM_PROVINCES[0].districts[0]?.name || '');
  const [selectedWard, setSelectedWard] = useState(VIETNAM_PROVINCES[0].districts[0]?.wards[0] || '');
  const [houseNumber, setHouseNumber] = useState('123');
  const [streetName, setStreetName] = useState(POPULAR_STREETS[0]);

  if (!isOpen) return null;

  const currentProvinceObj = VIETNAM_PROVINCES.find(p => p.name === selectedProvince) || VIETNAM_PROVINCES[0];
  const currentDistrictObj = currentProvinceObj.districts.find(d => d.name === selectedDistrict) || currentProvinceObj.districts[0];

  const handleProvinceChange = (provName: string) => {
    setSelectedProvince(provName);
    const prov = VIETNAM_PROVINCES.find(p => p.name === provName) || VIETNAM_PROVINCES[0];
    const dist = prov.districts[0]?.name || '';
    setSelectedDistrict(dist);
    setSelectedWard(prov.districts[0]?.wards[0] || '');
  };

  const handleDistrictChange = (distName: string) => {
    setSelectedDistrict(distName);
    const dist = currentProvinceObj.districts.find(d => d.name === distName);
    setSelectedWard(dist?.wards[0] || '');
  };

  const handleConfirmCustom = () => {
    const cleanNum = houseNumber.trim();
    const cleanStreet = streetName.trim();
    const streetPart = cleanNum ? `${cleanNum} ${cleanStreet}` : cleanStreet;
    
    const parts = [
      streetPart,
      selectedWard,
      selectedDistrict,
      selectedProvince
    ].filter(Boolean);

    const full = parts.join(', ');
    onSelectAddress(full);
    onClose();
  };

  const handlePresetSelect = (preset: string) => {
    onSelectAddress(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Chọn Địa Chỉ Nhanh</h3>
              <p className="text-xs text-slate-400">Chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã & Đường</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Quick Preset Badges */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gợi Ý Mẫu Địa Chỉ Phổ Biến (Nhấn để chọn ngay):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESET_ADDRESSES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 rounded-xl text-[11px] text-slate-300 hover:text-amber-300 transition-all text-left flex items-center space-x-1"
                >
                  <Navigation className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[280px]">{preset}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-4">
            <h4 className="font-extrabold text-white text-sm flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>Chọn Theo Cấp Hành Chính Việt Nam</span>
            </h4>

            {/* Step 1: Province / City */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                1. Tỉnh / Thành Phố:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {VIETNAM_PROVINCES.map((p) => {
                  const isSel = selectedProvince === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleProvinceChange(p.name)}
                      className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-all truncate ${
                        isSel
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: District */}
            {currentProvinceObj && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  2. Quận / Huyện ({selectedProvince}):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {currentProvinceObj.districts.map((d) => {
                    const isSel = selectedDistrict === d.name;
                    return (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => handleDistrictChange(d.name)}
                        className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-all truncate ${
                          isSel
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Ward */}
            {currentDistrictObj && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  3. Phường / Xã ({selectedDistrict}):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {currentDistrictObj.wards.map((w) => {
                    const isSel = selectedWard === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWard(w)}
                        className={`py-2 px-2.5 rounded-xl border font-semibold text-center transition-all truncate ${
                          isSel
                            ? 'bg-blue-500 text-slate-950 border-blue-400 font-extrabold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Street & House Number */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="block text-[11px] font-bold text-slate-400">
                4. Số Nhà & Tên Đường:
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                  placeholder="Số nhà (VD: 123)"
                  className="bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
                />
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder="Tên đường"
                  className="col-span-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-white font-semibold text-xs focus:outline-none"
                />
              </div>

              {/* Quick Street suggestion pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-slate-500 self-center mr-1">Gợi ý đường:</span>
                {POPULAR_STREETS.slice(0, 6).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStreetName(st)}
                    className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-amber-400 transition-all"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Formatted Preview */}
            <div className="p-3 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Xem Trước Địa Chỉ Hoàn Chỉnh:</span>
              <p className="text-white font-bold text-xs leading-relaxed">
                {[
                  houseNumber.trim() ? `${houseNumber.trim()} ${streetName.trim()}` : streetName.trim(),
                  selectedWard,
                  selectedDistrict,
                  selectedProvince
                ].filter(Boolean).join(', ')}
              </p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-semibold text-xs transition-all"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmCustom}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all text-xs"
          >
            <Check className="h-4 w-4" />
            <span>XÁC NHẬN SỬ DỤNG ĐỊA CHỈ NÀY</span>
          </button>
        </div>

      </div>
    </div>
  );
};
