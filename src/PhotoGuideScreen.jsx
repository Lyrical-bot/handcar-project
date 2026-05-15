import React from 'react';
import {
  Camera,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';

export default function PhotoGuideScreen({
  onClose = () => {},
  onStart = () => {},
  hideGuideForWeek = false,
  setHideGuideForWeek = () => {},
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
    <div className="absolute inset-0 z-[999] bg-white flex flex-col font-['Pretendard']">
      {/* 헤더 */}
      <header className="bg-white px-5 pt-4 pb-4 border-b flex items-center justify-center relative shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-2 rounded-full hover:bg-slate-100"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="w-8 h-8 text-slate-950 stroke-[2.6]" />
        </button>

        <div className="text-center">
          <h1 className="text-[24px] leading-none font-extrabold tracking-[-0.04em] text-slate-950">
            계기판 촬영 가이드
          </h1>
          <p className="mt-3 text-[14px] leading-none font-medium text-slate-500 tracking-[-0.02em]">
            정확한 분석을 위해 아래 예시를 확인해 주세요
          </p>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-36 space-y-7">
        {/* 올바른 촬영 */}
        <section className="space-y-4">
          <GuideSectionTitle
            title="올바른 촬영"
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
          />

          <div className="rounded-[24px] border-2 border-emerald-500 bg-white p-3 shadow-[0_10px_24px_rgba(16,185,129,0.08)]">
            <div className="overflow-hidden rounded-[18px] bg-slate-950">
              <DashboardSvg mode="correct" />
            </div>

            <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-4 text-center">
              <p className="text-[16px] font-extrabold text-emerald-700 tracking-[-0.03em]">
                계기판 전체가 선명하게, 정면에서 촬영
              </p>
            </div>
          </div>
        </section>

        {/* 피해야 할 촬영 */}
        <section className="space-y-4">
          <GuideSectionTitle
            title="피해야 할 촬영"
            icon={<XCircle className="w-8 h-8 text-red-500" />}
          />

          <div className="grid grid-cols-3 gap-3">
            <WrongPhotoCard mode="dark" label="너무 어두움" />
            <WrongPhotoCard mode="blur" label="초점 흐림" />
            <WrongPhotoCard mode="glare" label="빛 반사" />
          </div>
        </section>

        {/* 촬영 팁 */}
        <section className="rounded-[22px] border border-blue-100 bg-blue-50/80 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600 stroke-[2.2]" />
            <h2 className="text-[18px] font-extrabold text-blue-600 tracking-[-0.03em]">
              촬영 팁
            </h2>
          </div>

          <div className="space-y-3">
            <GuideTip
              number="1"
              text="계기판 전체가 화면에 들어오도록 정면에서 촬영해 주세요."
            />
            <GuideTip
              number="2"
              text="햇빛·실내등 반사가 없는 각도를 찾아 촬영해 주세요."
            />
            <GuideTip
              number="3"
              text="손을 고정하고 흔들리지 않게 촬영하세요."
            />
            <GuideTip
              number="4"
              text="엔진을 켠 상태에서 경고등이 켜진 채로 찍어주세요."
            />
          </div>
        </section>
      </main>

      {/* 하단 고정 */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur px-5 pt-4 pb-4 space-y-3">
        <button
          type="button"
          onClick={onStart}
          className="w-full h-[66px] rounded-[24px] bg-blue-600 text-white text-[19px] font-extrabold shadow-xl shadow-blue-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-3 tracking-[-0.03em]"
        >
          <Camera className="w-6 h-6 stroke-[2.2]" />
          사진 촬영 시작
        </button>

        <label className="flex items-center justify-center gap-2 text-slate-500 text-[13px] font-medium tracking-[-0.02em]">
          <input
            type="checkbox"
            checked={hideGuideForWeek}
            onChange={(e) => handleCheckWeek(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          일주일 동안 보지 않기
        </label>
      </div>
    </div>
  );
}

function GuideSectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <h2 className="text-[21px] font-extrabold text-slate-950 tracking-[-0.04em]">
        {title}
      </h2>
    </div>
  );
}

function WrongPhotoCard({ mode, label }) {
  return (
    <div className="bg-white">
      <div className="overflow-hidden rounded-[14px] border-2 border-red-400 bg-slate-950">
        <DashboardSvg mode={mode} compact />
      </div>

      <div className="pt-3 text-center">
        <p className="text-[14px] font-bold text-slate-700 tracking-[-0.03em] break-keep">
          {label}
        </p>
      </div>
    </div>
  );
}

function GuideTip({ number, text }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-blue-200 pb-3 last:border-b-0 last:pb-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-[13px] font-extrabold">
        {number}
      </div>
      <p className="pt-[1px] pr-1 text-[14px] leading-[1.55] font-medium text-slate-700 tracking-[-0.02em] break-keep">
        {text}
      </p>
    </div>
  );
}

function DashboardSvg({ mode = 'correct', compact = false }) {
  const isDark = mode === 'dark';
  const isBlur = mode === 'blur';
  const isGlare = mode === 'glare';

  return (
    <svg
      viewBox="0 0 760 320"
      className={`block w-full h-auto ${isDark ? 'brightness-[0.28]' : ''} ${
        isBlur ? 'blur-[2.8px]' : ''
      }`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`bg-${mode}`} cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#162133" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        <linearGradient id={`glare-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="48%" stopColor="rgba(255,255,255,0.84)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="760" height="320" rx="28" fill={`url(#bg-${mode})`} />

      <path
        d="M35 250 C78 66, 176 28, 380 28 C584 28, 682 66, 725 250 Z"
        fill="#0f172a"
        opacity="0.97"
      />

      <Gauge cx="210" cy="165" radius="105" type="rpm" compact={compact} />
      <Gauge cx="550" cy="165" radius="105" type="speed" compact={compact} />

      <rect
        x="336"
        y="86"
        width="90"
        height="146"
        rx="5"
        fill="#091220"
        stroke="#4b5563"
        strokeWidth="2"
      />

      <text x="348" y="114" fill="#f8fafc" fontSize="28" fontWeight="800">
        D
      </text>

      {/* 간단한 차량 아이콘 */}
      <rect x="370" y="130" width="24" height="58" rx="12" fill="#cbd5e1" opacity="0.96" />
      <rect x="362" y="146" width="40" height="24" rx="6" fill="none" stroke="#e2e8f0" strokeWidth="2" />
      <line x1="370" y1="138" x2="394" y2="138" stroke="#94a3b8" strokeWidth="2" />
      <line x1="370" y1="180" x2="394" y2="180" stroke="#94a3b8" strokeWidth="2" />

      <text x="344" y="223" fill="#f8fafc" fontSize="14" fontWeight="700">
        25℃
      </text>
      <text x="386" y="223" fill="#f8fafc" fontSize="14" fontWeight="700">
        123456 km
      </text>

      {/* 상단 화살표 */}
      <path d="M302 54 h20 l-8 -8 m8 8 l-8 8" stroke="#334155" strokeWidth="6" fill="none" opacity="0.72" />
      <path d="M438 54 h20 l-8 -8 m8 8 l-8 8" stroke="#334155" strokeWidth="6" fill="none" opacity="0.72" />

      {/* 우측 초록 표시등 */}
      <path d="M688 214 q10 -10 20 0" stroke="#22c55e" strokeWidth="3" fill="none" />
      <path d="M688 224 q10 -10 20 0" stroke="#22c55e" strokeWidth="3" fill="none" />
      <line x1="683" y1="209" x2="683" y2="229" stroke="#22c55e" strokeWidth="3" />
      <line x1="713" y1="209" x2="713" y2="229" stroke="#22c55e" strokeWidth="3" />

      {isGlare && (
        <>
          <rect
            x="-35"
            y="-80"
            width="185"
            height="520"
            fill={`url(#glare-${mode})`}
            transform="rotate(18 180 150)"
            opacity="0.92"
          />
          <rect
            x="102"
            y="-80"
            width="92"
            height="520"
            fill="white"
            transform="rotate(18 180 150)"
            opacity="0.18"
          />
        </>
      )}
    </svg>
  );
}

function Gauge({ cx, cy, radius, type = 'rpm', compact = false }) {
  const isSpeed = type === 'speed';

  const numbers = isSpeed
    ? ['0', '20', '40', '60', '80', '100', '120', '140', '160', '180', '200', '220', '240']
    : ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

  const startAngle = 135;
  const endAngle = 405;

  const label = isSpeed ? 'km/h' : 'x1000 rpm';
  const needleAngle = isSpeed ? -38 : -87;

  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill="#0b1220" stroke="#d1d5db" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={radius - 28} fill="none" stroke="#475569" strokeWidth="2" />

      <text
        x={cx}
        y={cy - radius + 32}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize={compact ? '11' : '14'}
        fontWeight="700"
      >
        {label}
      </text>

      {numbers.map((num, index) => {
        const angle = startAngle + ((endAngle - startAngle) / (numbers.length - 1)) * index;
        const rad = (angle * Math.PI) / 180;
        const tx = cx + Math.cos(rad) * (radius - 31);
        const ty = cy + Math.sin(rad) * (radius - 31) + 5;

        return (
          <text
            key={num}
            x={tx}
            y={ty}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize={compact ? (isSpeed ? '10' : '14') : isSpeed ? '16' : '20'}
            fontWeight="700"
          >
            {num}
          </text>
        );
      })}

      {[...Array(37)].map((_, index) => {
        const angle = startAngle + ((endAngle - startAngle) / 36) * index;
        const rad = (angle * Math.PI) / 180;
        const outer = radius - 10;
        const inner = index % 3 === 0 ? radius - 20 : radius - 15;

        const x1 = cx + Math.cos(rad) * outer;
        const y1 = cy + Math.sin(rad) * outer;
        const x2 = cx + Math.cos(rad) * inner;
        const y2 = cy + Math.sin(rad) * inner;

        const redZone = !isSpeed && index > 28;

        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={redZone ? '#ef4444' : '#e5e7eb'}
            strokeWidth={index % 3 === 0 ? '3' : '1.4'}
            strokeLinecap="round"
          />
        );
      })}

      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - radius + 28}
        stroke="#ef4444"
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${needleAngle} ${cx} ${cy})`}
      />

      <circle cx={cx} cy={cy} r="16" fill="#111827" />
      <circle cx={cx} cy={cy} r="7" fill="#1f2937" />
    </g>
  );
}