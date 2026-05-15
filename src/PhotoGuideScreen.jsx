import React from 'react';
import {
  Camera,
  ChevronLeft,
  CheckCircle,
  X,
  Lightbulb,
} from 'lucide-react';

export default function PhotoGuideScreen({
  onClose = () => { },
  onStart = () => { },
  hideGuideForWeek = false,
  setHideGuideForWeek = () => { },
}) {
  const handleCheckWeek = (checked) => {
    setHideGuideForWeek(checked);

    if (checked) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('hidePhotoGuideUntil', String(Date.now() + sevenDays));
    } else {
      localStorage.removeItem('hidePhotoGuideUntil');
    }
  };

  return (
    <div className="absolute inset-0 z-[999] bg-white flex flex-col">
      <header className="bg-white px-5 pt-7 pb-5 border-b flex items-center justify-center relative shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-7 p-2 rounded-full hover:bg-slate-100"
        >
          <ChevronLeft className="w-8 h-8 text-slate-950 stroke-[3]" />
        </button>

        <div className="text-center">
          <h1 className="text-[28px] leading-tight font-black tracking-[-0.04em] text-slate-950">
            계기판 촬영 가이드
          </h1>
          <p className="mt-2 text-[15px] font-semibold text-slate-500">
            정확한 분석을 위해 아래 예시를 확인해 주세요
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-7 pb-40 space-y-7">
        <section className="space-y-4">
          <GuideSectionTitle type="success" title="올바른 촬영" />

          <div className="relative bg-white rounded-[26px] border-2 border-emerald-500 p-3 shadow-[0_14px_35px_rgba(16,185,129,0.12)]">
            <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center z-10 shadow-md">
              <CheckCircle className="w-7 h-7 text-white stroke-[3]" />
            </div>

            <div className="rounded-[20px] overflow-hidden bg-slate-950">
              <DashboardSvg mode="correct" />
            </div>

            <div className="mt-3 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center gap-2 px-3">
              <CheckCircle className="w-6 h-6 text-emerald-500 stroke-[3]" />
              <p className="text-[15px] font-black text-slate-800 tracking-[-0.03em]">
                계기판 전체가 선명하게, 정면에서 촬영
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <GuideSectionTitle type="danger" title="피해야 할 촬영" />

          <div className="grid grid-cols-3 gap-3">
            <WrongPhotoCard mode="dark" label="너무 어두움" />
            <WrongPhotoCard mode="blur" label="초점 흐림" />
            <WrongPhotoCard mode="glare" label="빛 반사" />
          </div>
        </section>

        <section className="rounded-[24px] bg-blue-50/80 border border-blue-100 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-6 h-6 text-blue-600 stroke-[2.5]" />
            <h2 className="text-lg font-black text-blue-600">촬영 팁</h2>
          </div>

          <GuideTip number="1" text="계기판 전체가 화면에 들어오도록 정면에서 촬영해 주세요." />
          <GuideTip number="2" text="햇빛·실내등 반사가 없는 각도를 찾아 촬영해 주세요." />
          <GuideTip number="3" text="손을 고정하고 흔들리지 않게 촬영하세요." />
          <GuideTip number="4" text="엔진을 켠 상태에서 경고등이 켜진 채로 찍어주세요." />
        </section>
      </main>

      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t px-6 pt-5 pb-6 space-y-4">
        <button
          type="button"
          onClick={onStart}
          className="w-full h-[72px] bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-200 active:scale-95 transition-transform text-xl flex items-center justify-center gap-3"
        >
          <Camera className="w-7 h-7 stroke-[2.5]" />
          사진 촬영 시작
        </button>

        <label className="flex items-center justify-center gap-3 text-slate-500 font-bold text-base">
          <input
            type="checkbox"
            checked={hideGuideForWeek}
            onChange={(e) => handleCheckWeek(e.target.checked)}
            className="w-7 h-7 accent-blue-600"
          />
          일주일 동안 보지 않기
        </label>
      </div>
    </div>
  );
}

function GuideSectionTitle({ type, title }) {
  const isSuccess = type === 'success';

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'
          }`}
      >
        {isSuccess ? (
          <CheckCircle className="w-7 h-7 text-white stroke-[3]" />
        ) : (
          <X className="w-7 h-7 text-white stroke-[3]" />
        )}
      </div>

      <h2 className="text-[22px] font-black text-slate-950 tracking-[-0.04em]">
        {title}
      </h2>
    </div>
  );
}

function DashboardSvg({ mode = 'correct' }) {
  const isDark = mode === 'dark';
  const isBlur = mode === 'blur';
  const isGlare = mode === 'glare';

  return (
    <svg
      viewBox="0 0 760 300"
      className={`w-full h-auto block ${isDark ? 'brightness-[0.28]' : ''
        } ${isBlur ? 'blur-[3px]' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`dashBg-${mode}`} cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        <linearGradient id={`glare-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <rect width="760" height="300" rx="28" fill={`url(#dashBg-${mode})`} />

      <path
        d="M30 250 C80 60, 180 30, 380 30 C580 30, 690 60, 730 250 Z"
        fill="#111827"
        opacity="0.9"
      />

      <Gauge cx="210" cy="155" radius="93" label="x1000 rpm" needleAngle={-90} />
      <Gauge cx="550" cy="155" radius="93" label="km/h" needleAngle={-42} speed />

      <rect
        x="335"
        y="80"
        width="90"
        height="145"
        rx="6"
        fill="#0f172a"
        stroke="#475569"
        strokeWidth="2"
      />

      <text x="350" y="108" fill="#e2e8f0" fontSize="26" fontWeight="800">
        D
      </text>

      <rect x="366" y="128" width="28" height="55" rx="14" fill="#cbd5e1" opacity="0.9" />
      <rect
        x="360"
        y="145"
        width="40"
        height="24"
        rx="6"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="2"
      />

      <text x="350" y="210" fill="#e2e8f0" fontSize="15" fontWeight="700">
        25℃
      </text>
      <text x="388" y="210" fill="#e2e8f0" fontSize="15" fontWeight="700">
        123456 km
      </text>

      <path
        d="M310 48 l-18 16 h13 v18 h10 v-18 h13z"
        fill="#334155"
        opacity="0.45"
        transform="rotate(-90 310 65)"
      />
      <path
        d="M450 48 l18 16 h-13 v18 h-10 v-18 h-13z"
        fill="#334155"
        opacity="0.45"
        transform="rotate(90 450 65)"
      />

      <path d="M685 203 q10 -10 20 0" stroke="#22c55e" strokeWidth="3" fill="none" />
      <path d="M685 213 q10 -10 20 0" stroke="#22c55e" strokeWidth="3" fill="none" />
      <line x1="680" y1="198" x2="680" y2="218" stroke="#22c55e" strokeWidth="3" />
      <line x1="710" y1="198" x2="710" y2="218" stroke="#22c55e" strokeWidth="3" />

      {isGlare && (
        <>
          <rect
            x="-60"
            y="-80"
            width="200"
            height="520"
            fill={`url(#glare-${mode})`}
            transform="rotate(18 240 150)"
            opacity="0.9"
          />
          <rect
            x="120"
            y="-80"
            width="110"
            height="520"
            fill="white"
            transform="rotate(18 240 150)"
            opacity="0.18"
          />
        </>
      )}
    </svg>
  );
}

function Gauge({ cx, cy, radius, label, needleAngle, speed = false }) {
  const numbers = speed
    ? ['0', '20', '40', '60', '80', '100', '120', '140', '160', '180', '200', '220', '240']
    : ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

  const startAngle = 135;
  const endAngle = 405;

  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill="#111827" stroke="#9ca3af" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={radius - 25} fill="none" stroke="#475569" strokeWidth="2" />

      <text
        x={cx}
        y={cy - radius + 28}
        textAnchor="middle"
        fill="#cbd5e1"
        fontSize="14"
        fontWeight="700"
      >
        {label}
      </text>

      {numbers.map((num, index) => {
        const angle = startAngle + ((endAngle - startAngle) / (numbers.length - 1)) * index;
        const rad = (angle * Math.PI) / 180;
        const tx = cx + Math.cos(rad) * (radius - 28);
        const ty = cy + Math.sin(rad) * (radius - 28) + 5;

        return (
          <text
            key={num}
            x={tx}
            y={ty}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize={speed ? '15' : '22'}
            fontWeight="700"
          >
            {num}
          </text>
        );
      })}

      {[...Array(37)].map((_, index) => {
        const angle = startAngle + ((endAngle - startAngle) / 36) * index;
        const rad = (angle * Math.PI) / 180;
        const outer = radius - 9;
        const inner = index % 3 === 0 ? radius - 18 : radius - 14;
        const x1 = cx + Math.cos(rad) * outer;
        const y1 = cy + Math.sin(rad) * outer;
        const x2 = cx + Math.cos(rad) * inner;
        const y2 = cy + Math.sin(rad) * inner;

        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={index > 28 && !speed ? '#ef4444' : '#e5e7eb'}
            strokeWidth={index % 3 === 0 ? '3' : '1.5'}
            strokeLinecap="round"
          />
        );
      })}

      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - radius + 25}
        stroke="#ef4444"
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${needleAngle} ${cx} ${cy})`}
      />

      <circle cx={cx} cy={cy} r="13" fill="#1e293b" />
      <circle cx={cx} cy={cy} r="7" fill="#ffffff" />
    </g>
  );
}

function WrongPhotoCard({ mode, label }) {
  return (
    <div className="relative bg-white rounded-[18px] border-2 border-red-500 p-2 shadow-sm overflow-visible">
      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-red-500 border-4 border-white flex items-center justify-center z-10">
        <X className="w-5 h-5 text-white stroke-[3]" />
      </div>

      <div className="rounded-[13px] overflow-hidden bg-slate-950 h-[86px]">
        <DashboardSvg mode={mode} />
      </div>

      <div className="h-10 flex items-center justify-center gap-1.5">
        <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center shrink-0">
          <X className="w-3 h-3 text-red-500 stroke-[3]" />
        </div>
        <p className="text-[12px] font-black text-slate-700 tracking-[-0.04em]">
          {label}
        </p>
      </div>
    </div>
  );
}

function GuideTip({ number, text }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-blue-200 last:border-b-0 pb-3 last:pb-0">
      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black shrink-0">
        {number}
      </div>
      <p className="text-[14px] font-bold text-slate-700 leading-relaxed tracking-[-0.03em]">
        {text}
      </p>
    </div>
  );
}
