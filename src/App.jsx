import React, { useState, useEffect, useMemo } from 'react';
import PhotoGuideScreen from './PhotoGuideScreen';
import { fetchBluehandsData } from './services/api';
import {
  Camera,
  MapPin,
  Wrench,
  History,
  Home,
  Settings,
  ChevronLeft,
  Search,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Navigation,
  ExternalLink,
  ChevronRight,
  Info,
  Lightbulb,
  ChevronDown,
  LocateFixed,
  Droplet,
  Type,
  CheckCircle2,
  Clock,
  Mail,
  MessageCircle,
  User,
  LogIn
} from 'lucide-react';

const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL;
const CUSTOM_VISION_URL = import.meta.env.VITE_CUSTOM_VISION_URL;
const CUSTOM_VISION_PREDICTION_KEY = import.meta.env.VITE_CUSTOM_VISION_PREDICTION_KEY;
const BACKEND_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const STATUS_LABELS = {
  CRITICAL: "긴급 점검",
  WARNING: "확인 요망",
  NORMAL: "상태 양호"
};

const TAG_DICTIONARY = {
  "key_bat": "스마트키 배터리 부족 경고등",
  "light": "라이트 결함 경고등",
  "oil": "연료 부족 경고등",
  "sb": "안전벨트 미착용 경고등",
  "tire": "타이어 압력 경고등",
  "washer": "워셔액 부족 경고등"
};

const TAG_DETAILS = {
  "key_bat": {
    meaning: "스마트키 내부의 배터리 잔량이 부족하다는 뜻입니다.",
    reason: "보통 스마트키 배터리(CR2032 등) 수명이 다 되어 발생합니다.",
    action: "가까운 편의점이나 마트에서 동전형 배터리를 구매해 직접 교체하시거나, 서비스 센터를 방문해 주세요."
  },
  "light": {
    meaning: "차량 외부 램프(전조등, 후미등, 브레이크등 등) 중 하나 이상에 문제가 생겼다는 뜻입니다.",
    reason: "전구가 수명을 다해 끊어졌거나, 퓨즈 혹은 배선에 문제가 생겼을 수 있습니다.",
    action: "차에서 내려 어느 쪽 불빛이 안 들어오는지 확인하고, 전구를 교체하거나 정비소를 방문해 점검받으세요."
  },
  "oil": {
    meaning: "연료 탱크에 남아있는 연료가 얼마 없다는 뜻입니다.",
    reason: "주행으로 인해 연료가 소모되어 보충이 필요한 시기가 되었습니다.",
    action: "차량이 멈추기 전에 가까운 주유소에 들러 연료를 충분히 주유해 주세요."
  },
  "sb": {
    meaning: "운전자 또는 동승자가 안전벨트를 매지 않았다는 뜻입니다.",
    reason: "안전벨트 체결 센서가 감지되지 않았거나, 시트 위에 무거운 물건이 올려져 있을 때 뜹니다.",
    action: "모든 탑승자가 안전벨트를 착용해 주세요. 물건이 놓여있다면 치워주세요."
  },
  "tire": {
    meaning: "타이어의 공기압이 권장 수치보다 낮아졌다는 뜻입니다.",
    reason: "자연적인 공기 누출, 온도 하강으로 인한 수축, 혹은 타이어에 못이 박혀 펑크가 났을 수 있습니다.",
    action: "주행 속도를 줄이고 가까운 정비소나 주유소에서 공기압을 보충하세요. 펑크가 의심되면 보험사를 부르세요."
  },
  "washer": {
    meaning: "앞유리를 닦을 때 쓰는 워셔액이 부족하다는 뜻입니다.",
    reason: "워셔액을 많이 사용하여 워셔액 탱크가 비워졌습니다.",
    action: "대형마트나 편의점에서 워셔액을 구매한 뒤, 보닛을 열고 파란색 뚜껑을 찾아 직접 보충해 주세요."
  }
};


function getSeverityFromRisk(riskLevel) {
  if (!riskLevel) return 'normal';
  if (riskLevel.includes('매우') || riskLevel.includes('높음')) return 'critical';
  if (riskLevel.includes('중간')) return 'warning';
  return 'normal';
}

function makeLocalFastApiResult(apiResult) {
  const firstWarning = apiResult?.detected_warnings?.[0];

  if (!firstWarning) {
    return {
      status: 'normal',
      title: '감지된 경고등 없음',
      msg: '현재 이미지에서 인식된 경고등이 없습니다. 더 선명한 계기판 사진으로 다시 시도해 주세요.',
      detectedWarnings: [],
      explanation: apiResult?.explanation || '',
      raw: apiResult,
    };
  }

  return {
    status: getSeverityFromRisk(firstWarning.risk_level),
    title: firstWarning.display_name || '경고등 감지',
    msg: firstWarning.summary || '계기판 경고등이 감지되었습니다.',
    detectedWarnings: apiResult?.detected_warnings || [],
    explanation: apiResult?.explanation || '',
    raw: apiResult,
  };
}

const MANUFACTURERS = [
  {
    name: '현대',
    logo: 'https://yt3.googleusercontent.com/AULzs1m3DYUrmRsBwSzfOw_NdkCKrw4LKyZG4bBnUlkL79Xz_nZtn3laOg7b3xbJDjgCbJJE2A=s900-c-k-c0x00ffffff-no-rj',
    models: ['아반떼', '쏘나타', '그랜저', '싼타페', '팰리세이드', '아이오닉 5'],
  },
  {
    name: '기아',
    logo: 'https://image-cdn.hypb.st/https%3A%2F%2Fkr.hypebeast.com%2Ffiles%2F2021%2F01%2Fkia-motors-new-logo-brand-slogan-officially-revealed-01.jpg?q=75&w=800&cbr=1&fit=max',
    models: ['K3', 'K5', 'K8', '쏘렌토', '카니발', 'EV6'],
  },
  {
    name: 'BMW',
    logo: 'https://static.vecteezy.com/system/resources/previews/020/502/870/non_2x/bmw-brand-logo-car-symbol-blue-and-white-design-germany-automobile-illustration-with-black-background-free-vector.jpg',
    models: ['3시리즈', '5시리즈', '7시리즈', 'X5', 'i4'],
  },
  {
    name: '벤츠',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9Dm7XF8xuRw2s3NKh5VOLvb4I553Ujy0j_w&s',
    models: ['C-클래스', 'E-클래스', 'S-클래스', 'GLC', 'EQE'],
  },
  {
    name: '테슬라',
    logo: 'https://img.icons8.com/ios_filled/1200/tesla-logo.jpg',
    models: ['모델 3', '모델 Y', '모델 S', '모델 X'],
  },
  {
    name: '아우디',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXgKUN4_0i99p88wIDnUzQWuH1hEFp64tW1g&s',
    models: ['A4', 'A6', 'Q5', 'e-tron'],
  },
  {
    name: '포드',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
    models: ['익스플로러', '머스탱', '브롱코'],
  },
  {
    name: '포르쉐',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj7uLiozKvofF33sSn4llNG5qYoSJ3Sr6uFQ&s',
    models: ['911', '타이칸', '카이엔', '파나메라'],
  },
  {
    name: '페라리',
    logo: 'https://i.namu.wiki/i/tzZ_j5Uy54Muem7VjRMguOw8G1-t69fdqOPuLKgshYyiG6FUqkC9DgS6N2U1GvQ7IsVVR1GizpiOcOmZ8-d0lQ.svg',
    models: ['296 GTB', '로마', '푸로산게'],
  },
  {
    name: '닛산',
    logo: 'https://i.namu.wiki/i/8t0fwkYNWK37g3p_rHI625_XHi_9IoqYqYBAFM0b449dx3VrNgWMVci1NJpjpO57O6qve2lYq63MQFH7mQZEBg.svg',
    models: ['알티마', '아리야', 'Z'],
  },
  {
    name: '혼다',
    logo: 'https://i.namu.wiki/i/NAObOBkqZA3buq-Z6i6jjgtDnjqHlPGZQIwX6P0-vlI_brAHh02yMuk0JZLY1Sbzyo7fcUrXdFGHnO5znSli3A.webp',
    models: ['어코드', 'CR-V', '시빅'],
  },
  {
    name: '미쓰비시',
    logo: 'https://i.namu.wiki/i/y3vBVyGWjjSt6vo02F_ObBYxmJF6bb03K7wgTaqilhOdk1F_IviYwdclHPkk4RTuzizLDXziNAcJdQ94qaO9ig.svg',
    models: ['아웃랜더', '파제로'],
  },
  {
    name: '애스턴 마틴',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-j392AO1YIrvmHRK9i_f7_INqzg1rqQ5zqw&s',
    models: ['DB12', '뱅퀴시', '벤티지', 'DBX', '발할라', '발키리'],
  },
  {
    name: '벤틀리',
    logo: 'https://i.namu.wiki/i/HHeWZKoLbs0wFpESBF2y0rn7WGbFdQISenKhVeBNzG2TATyQ2yuX2-q7y19h7SzqUIObrpvyGfg7cRq8FKIn4g.webp',
    models: ['컨티네탈 GT', '플라잉 스퍼', '벤테이가'],
  },
  {
    name: '로터스',
    logo: 'https://cdn.imweb.me/upload/S2023032790b38549a0a48/680cc91135110.png',
    models: ['에미라', '엑시지', '에보라', '엘란', '에스프리'],
  },
  {
    name: '람보르기니',
    logo: 'https://mblogthumb-phinf.pstatic.net/20160615_257/myredsuns_1465980110067miHuv_JPEG/22222.jpg?type=w800',
    models: ['레부엘토', '테메라리오'],
  },
  {
    name: '폭스바겐',
    logo: 'https://i.namu.wiki/i/oin2760z3zfw4jJ7TasQDIk2tN4f5qC3PvY45UD7M3F4rGW9EwJNOvAGUxH6VoSyUovNgA2w-nMasLodElp6Jg.svg',
    models: ['골프', '파사트', '티구안'],
  },
  // 여기에 { name: '브랜드명', logo: '주소', models: ['차1', '차2'] } 형태로 추가하세요!
];

const SHOPS = [
  {
    id: 1,
    name: '블루핸즈 가정점',
    type: 'general',
    lat: 35,
    lng: 40,
    addr: '인천 서구 염곡로 123',
    distance: '1.2km',
    wasteOil: true,
  },
  {
    id: 2,
    name: '블루핸즈 주안점',
    type: 'general',
    lat: 58,
    lng: 32,
    addr: '인천 미추홀구 경인로 402',
    distance: '2.6km',
    wasteOil: false,
  },
  {
    id: 3,
    name: '블루핸즈 서인천점',
    type: 'general',
    lat: 44,
    lng: 68,
    addr: '인천 서구 서로 301',
    distance: '3.8km',
    wasteOil: true,
  },
];

const DIY_ITEMS = [
  { id: 'washer', name: '워셔액 보충', level: '초급', pos: { top: '30%', left: '25%' }, desc: '보닛을 열고 파란색 뚜껑을 찾아 워셔액을 가득 채우세요.' },
  { id: 'filter', name: '에어컨 필터 교체', level: '초급', pos: { top: '50%', left: '70%' }, desc: '조수석 글로브 박스를 열고 안쪽 덮개를 제거해 필터를 교체하세요.' },
  { id: 'coolant', name: '냉각수 보충', level: '초급', pos: { top: '25%', left: '65%' }, desc: '엔진이 식은 후 냉각수 보조 탱크의 MAX 선까지 보충하세요.' },
  { id: 'headlight', name: '전조등 교체', level: '중급', pos: { top: '20%', left: '15%' }, desc: '엔진룸 안쪽 전조등 소켓을 돌려 빼고 새 전구로 교체하세요.' },
  { id: 'taillight', name: '후미등 교체', level: '중급', pos: { top: '85%', left: '15%' }, desc: '트렁크 안쪽 커버를 열고 소켓을 분리해 전구를 교체하세요.' },
  { id: 'brake_light', name: '브레이크등 교체', level: '고급', pos: { top: '82%', left: '30%' }, desc: '후미등 뭉치를 분리하여 브레이크 전용 전구를 교체하세요.' },
  { id: 'plate_light', name: '번호판등 교체', level: '고급', pos: { top: '88%', left: '50%' }, desc: '드라이버로 번호판 상단 커버를 열고 작은 전구를 교체하세요.' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isBigFont, setIsBigFont] = useState(false);
  const [collapsedLevels, setCollapsedLevels] = useState({ '중급': false, '고급': false });
  const toggleLevel = (level) => {
    setCollapsedLevels(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // 계기판 촬영 가이드 화면 표시 상태
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);

  // "일주일 동안 보지 않기" 설정 상태
  // localStorage에 저장된 만료 시간이 현재 시간보다 크면 가이드를 생략합니다.
  const [hideGuideForWeek, setHideGuideForWeek] = useState(() => {
    const hideUntil = Number(localStorage.getItem('hidePhotoGuideUntil') || 0);
    return hideUntil > Date.now();
  });

  // DIY 가이드 상태
  const [diyStep, setDiyStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDiy, setSelectedDiy] = useState(null);

  // 정비소 지도 상태
  const [hoveredShop, setHoveredShop] = useState(null);
  const [showMapModal, setShowMapModal] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showNearbyMapModal, setShowNearbyMapModal] = useState(false);
  const [isOilGuideOpen, setIsOilGuideOpen] = useState(false);

  // 기록 상태
  const [history, setHistory] = useState([
    { id: 1, date: '2023-10-25', text: '엔진 오일 경고등 점등', status: 'critical' },
    { id: 2, date: '2023-11-05', text: '워셔액 보충 완료', status: 'normal' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const f = (small, big) => isBigFont ? big : small;

  const resetDiy = () => {
    setDiyStep(1); setSelectedBrand('');
    setSelectedModel(''); setSelectedYear('');
    setSelectedDiy(null);
  };
  const handleTabClick = (tabId) => {
    if (tabId === 'find') {
      setImage(null); setResult(null);
      setShowPhotoGuide(false);
    }
    if (tabId === 'diy') resetDiy();
    setActiveTab(tabId);
  };
  const goHome = () => handleTabClick('find');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        startAnalysis(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (file) => {
    setAnalyzing(true);
    setResult(null);

    try {
      let resultData;
      const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const cloudApiUrl = AI_PROXY_URL || (!isLocalHost ? '/api/analyze' : null);

      if (cloudApiUrl) {
        const response = await fetch(cloudApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: file
        });

        if (!response.ok) {
          throw new Error(`AI 프록시 API 오류: ${response.status}`);
        }

        const apiResult = await response.json();

        if (apiResult.predictions && apiResult.predictions.length > 0) {
          const bestPrediction = apiResult.predictions.reduce((prev, current) =>
            prev.probability > current.probability ? prev : current
          );

          if (bestPrediction.probability > 0.3) {
            const translatedName = TAG_DICTIONARY[bestPrediction.tagName] || bestPrediction.tagName;
            const details = TAG_DETAILS[bestPrediction.tagName] || null;

            resultData = {
              status: 'critical',
              title: `${translatedName} (${(bestPrediction.probability * 100).toFixed(1)}%)`,
              msg: details || 'AI가 경고등을 감지했습니다. 관련 정비를 진행하거나 전문가 방문을 추천합니다.',
              raw: apiResult,
            };
          } else {
            resultData = {
              status: 'normal',
              title: '인식된 경고등 없음',
              msg: '명확한 경고등이 인식되지 않았습니다. 다른 사진으로 다시 시도해보세요.',
              raw: apiResult,
            };
          }
        } else {
          resultData = {
            status: 'warning',
            title: '인식 실패',
            msg: '이미지 분석에 실패했습니다.',
            raw: apiResult,
          };
        }
      } else if (CUSTOM_VISION_URL && CUSTOM_VISION_PREDICTION_KEY) {
        const response = await fetch(CUSTOM_VISION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Prediction-Key': CUSTOM_VISION_PREDICTION_KEY,
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Custom Vision 오류: ${response.status}`);
        }

        const apiResult = await response.json();

        if (apiResult.predictions && apiResult.predictions.length > 0) {
          const bestPrediction = apiResult.predictions.reduce((prev, current) =>
            prev.probability > current.probability ? prev : current
          );

          if (bestPrediction.probability > 0.3) {
            const translatedName = TAG_DICTIONARY[bestPrediction.tagName] || bestPrediction.tagName;
            const details = TAG_DETAILS[bestPrediction.tagName] || null;

            resultData = {
              status: 'critical',
              title: `${translatedName} (${(bestPrediction.probability * 100).toFixed(1)}%)`,
              msg: details || 'AI가 경고등을 감지했습니다. 관련 정비를 진행하거나 전문가 방문을 추천합니다.',
              raw: apiResult,
            };
          } else {
            resultData = {
              status: 'normal',
              title: '인식된 경고등 없음',
              msg: '명확한 경고등이 인식되지 않았습니다. 다른 사진으로 다시 시도해보세요.',
              raw: apiResult,
            };
          }
        } else {
          resultData = {
            status: 'warning',
            title: '인식 실패',
            msg: '이미지 분석에 실패했습니다.',
            raw: apiResult,
          };
        }
      } else {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BACKEND_API_URL}/analyze`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`로컬 FastAPI 오류: ${response.status}`);
        }

        const apiResult = await response.json();
        resultData = makeLocalFastApiResult(apiResult);
      }

      setResult(resultData);{

       
        const newRecord = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          text: `${resultData.title}: ${typeof resultData.msg === 'string' ? resultData.msg : '상세 안내 확인 필요'}`,
          status: resultData.status,
        };

        setHistory(prev => [newRecord, ...prev]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setResult({
        status: 'warning',
        title: '분석 연결 실패',
        msg: `AI 분석 서버 연결에 실패했습니다. 로컬 테스트라면 FastAPI 서버가 켜져 있는지 확인해 주세요. (${error.message})`,
        detectedWarnings: [],
        explanation: '',
        raw: null,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRecordStatus = (text) => {
    if (text.includes('엔진') || text.includes('브레이크') || text.includes('긴급')) return 'critical';
    if (text.includes('타이어') || text.includes('전압') || text.includes('주의')) return 'warning';
    return 'normal';
  };

  const addManualRecord = () => {
    if (!newNote.trim()) return;
    const status = getRecordStatus(newNote);
    const newRecord = { id: Date.now(), date: newDate, text: newNote, status };
    setHistory(prev => [newRecord, ...prev]);
    setNewNote('');
  };

  const deleteRecord = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const getUserLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('이 브라우저에서는 위치 기능을 지원하지 않습니다.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setSelectedAddress('');
        setIsLocating(false);
      },
      () => {
        setLocationError('위치 권한을 허용해야 현재 위치를 가져올 수 있습니다.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const applyAddressToMap = () => {
    const trimmedAddress = addressInput.trim();

    if (!trimmedAddress) {
      setLocationError('주소나 동네 이름을 입력해 주세요.');
      return;
    }

    setSelectedAddress(trimmedAddress);
    setLocationError('');
  };

  const getMapEmbedUrl = () => {
    if (selectedAddress) {
      const query = encodeURIComponent(selectedAddress);
      return `https://maps.google.com/maps?q=${query}&z=14&output=embed&hl=ko`;
    }

    if (userLocation) {
      return `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&output=embed&hl=ko`;
    }

    return `https://maps.google.com/maps?q=37.5665,126.9780&z=13&output=embed&hl=ko`;
  };

  const getNearbySearchText = () => {
    if (selectedAddress) {
      return `${selectedAddress} 블루핸즈 정비소`;
    }

    if (userLocation) {
      return `${userLocation.lat},${userLocation.lng} 블루핸즈 정비소`;
    }

    return '내 주변 블루핸즈 정비소';
  };

  const openNearbyMap = (service) => {
    const query = encodeURIComponent(getNearbySearchText());

    const urlMap = {
      naver: `https://map.naver.com/v5/search/${query}`,
      kakao: `https://map.kakao.com/link/search/${query}`,
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
      apple: `https://maps.apple.com/?q=${query}`,
    };

    window.open(urlMap[service], '_blank');
  };

  const openExternalMap = (service) => {
    if (!showMapModal) return;

    const query = encodeURIComponent(`${showMapModal.name} ${showMapModal.addr}`);

    const urlMap = {
      naver: `https://map.naver.com/v5/search/${query}`,
      kakao: `https://map.kakao.com/link/search/${query}`,
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
      apple: `https://maps.apple.com/?q=${query}`,
    };

    window.open(urlMap[service], '_blank');
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-[1000] overflow-hidden">
        <div className="flex space-x-2">
          {"Hands Car".split("").map((char, i) => (
            <span
              key={i}
              className="text-white text-5xl font-black animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl relative border-x border-slate-200 ${isBigFont ? 'text-xl' : 'text-base'}`}>
      {/*
        계기판 촬영 가이드 오버레이
        - 메인 화면의 "사진 촬영 및 선택" 버튼을 눌렀을 때 showPhotoGuide가 true가 됩니다.
        - 사용자가 가이드에서 "사진 촬영 시작"을 누르면 기존 hidden input을 클릭해 파일 선택/촬영을 시작합니다.
      */}
      {showPhotoGuide && (
        <PhotoGuideScreen
          hideGuideForWeek={hideGuideForWeek}
          setHideGuideForWeek={setHideGuideForWeek}
          onClose={() => setShowPhotoGuide(false)}
          onStart={() => {
            setShowPhotoGuide(false);
            setTimeout(() => {
              document.getElementById('dashboard-photo-input')?.click();
            }, 100);
          }}
        />
      )}

      {/* 상단바 */}
      <header className="bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button onClick={() => handleTabClick('find')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Home className={`text-blue-600 ${isBigFont ? 'w-8 h-8' : 'w-6 h-6'}`} />
        </button>
        <h1 className={`font-black text-blue-600 tracking-tighter ${isBigFont ? 'text-2xl' : 'text-xl'}`}>HANDS CAR</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsBigFont(!isBigFont)}
            className={`p-2 rounded-lg transition-colors ${isBigFont ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
            title="글자 크기 조절"
          >
            <Type className={isBigFont ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
          <button onClick={() => setShowLogin(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Settings className={`text-slate-400 ${isBigFont ? 'w-8 h-8' : 'w-6 h-6'}`} />
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'find' && (
          <div className="p-6 space-y-6">
            {!image ? (
              <div className="space-y-8 py-10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (hideGuideForWeek) {
                      document.getElementById('dashboard-photo-input')?.click();
                    } else {
                      setShowPhotoGuide(true);
                    }
                  }}
                  className="relative inline-block cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="absolute -inset-4 bg-blue-100 rounded-full animate-pulse"></div>
                  <div className="relative bg-white p-8 rounded-full shadow-lg hover:bg-blue-50">
                    <Camera className="w-16 h-16 text-blue-600" />
                  </div>
                </button>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">경고등을 찍어주세요</h2>
                  <p className="text-slate-500 font-medium">AI가 실시간으로 분석해드립니다</p>
                </div>
                <>
                  {/*
                    기존에는 이 영역이 label + input 구조라서 버튼을 누르면 바로 파일 선택창이 열렸습니다.
                    지금은 먼저 촬영 가이드 화면을 보여준 뒤, 가이드의 "사진 촬영 시작" 버튼에서
                    아래 hidden input을 클릭하도록 변경했습니다.
                  */}
                  <button
                    type="button"
                    onClick={() => {
                      if (hideGuideForWeek) {
                        document.getElementById('dashboard-photo-input')?.click();
                      } else {
                        setShowPhotoGuide(true);
                      }
                    }}
                    className="block w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-200 cursor-pointer active:scale-95 transition-transform text-lg"
                  >
                    사진 촬영 및 선택
                  </button>

                  <input
                    id="dashboard-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </>
              </div>
            ) : analyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-xl font-bold text-blue-600 animate-pulse">AI가 정밀 분석 중입니다...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video">
                  <img src={image} className="w-full h-full object-cover opacity-80" alt="uploaded" />
                  <div className="absolute inset-0 border-4 border-dashed border-blue-400 animate-pulse m-4 rounded-xl"></div>
                </div>

                <div className={`p-6 rounded-3xl border-2 ${result.status === 'critical' ? 'bg-red-50 border-red-200' : result.status === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {result.status === 'critical' || result.status === 'warning' ? <AlertTriangle className="text-red-600" /> : <CheckCircle className="text-green-600" />}
                    <h3 className={`text-xl font-black ${result.status === 'critical' ? 'text-red-700' : result.status === 'warning' ? 'text-amber-700' : 'text-green-700'}`}>{result.title}</h3>
                  </div>
                  {typeof result.msg === 'string' ? (
                    <p className="font-medium text-slate-700 leading-relaxed">{result.msg}</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="bg-white/60 p-4 rounded-2xl border border-blue-50/50 shadow-sm">
                        <h4 className="text-sm font-black text-blue-600 mb-1 flex items-center gap-1.5"><Info className="w-4 h-4" /> 이 경고등은 무슨 뜻인가요?</h4>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.msg.meaning}</p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-2xl border border-amber-50/50 shadow-sm">
                        <h4 className="text-sm font-black text-amber-600 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> 왜 뜬 건가요?</h4>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.msg.reason}</p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-2xl border border-emerald-50/50 shadow-sm">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
                            <Wrench className="w-4 h-4" /> 어떻게 하면 될까요?
                          </h4>
                          <button
                            onClick={() => setActiveTab('diy')}
                            className="text-[11px] font-black bg-[#0EA5E9] text-white px-2.5 py-1 rounded-md shadow-sm hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-1"
                          >
                            자가수리
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.msg.action}</p>
                      </div>
                    </div>
                  )}
                </div>


                {result?.detectedWarnings?.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 space-y-4">
                    <h3 className="text-lg font-black">감지된 경고등</h3>
                    {result.detectedWarnings.map((warning, index) => (
                      <div key={`${warning.label}-${index}`} className="p-4 bg-slate-50 rounded-2xl">
                        <p className="font-black">{warning.display_name}</p>
                        <p className="text-sm text-slate-500">신뢰도: {(warning.confidence * 100).toFixed(1)}%</p>
                        <p className="text-sm text-slate-500">위험도: {warning.risk_level}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result?.explanation && (
                  <div className="p-6 rounded-3xl bg-white border-2 border-blue-100">
                    <h3 className="text-lg font-black text-blue-600 mb-3">AI 안내</h3>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{result.explanation}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('map')} className="p-5 bg-white border-2 border-slate-200 rounded-3xl font-bold hover:border-blue-400 transition-all flex flex-col items-center gap-2">
                    <MapPin className="text-blue-600" />
                    주변 정비소 안내
                  </button>
                  <button className="p-5 bg-white border-2 border-slate-200 rounded-3xl font-bold hover:border-blue-400 transition-all flex flex-col items-center gap-2">
                    <Search className="text-blue-600" />
                    부품 가격 찾기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DIY 탭 */}
        {activeTab === 'diy' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              {diyStep > 1 && (
                <button onClick={() => setDiyStep(prev => prev - 1)} className="p-2 bg-white rounded-xl shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-2xl font-black">자가정비 가이드</h2>
            </div>

            {diyStep === 1 && (
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">1. 제조사를 선택하세요</label>
                <div className="grid grid-cols-3 gap-3">
                  {MANUFACTURERS.map(brand => (
                    <button
                      key={brand.name}
                      onClick={() => { setSelectedBrand(brand.name); setDiyStep(2); }}
                      className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex flex-col items-center hover:border-blue-500 transition-all"
                    >
                      <img src={brand.logo} className="w-12 h-12 object-contain mb-2" alt={brand.name} />
                      <span className="text-xs font-bold">{brand.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {diyStep === 2 && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <img src={MANUFACTURERS.find(b => b.name === selectedBrand)?.logo} className="w-10 h-10 object-contain" alt="" />
                  <span className="font-bold text-blue-700">{selectedBrand}가 선택됨</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">차종 선택</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="">차종을 선택하세요</option>
                      {MANUFACTURERS.find(b => b.name === selectedBrand)?.models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">생산 연도</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="">생산 연도를 선택하세요</option>
                      {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => (
                        <option key={y} value={y}>{y}년식</option>
                      ))}
                    </select>
                  </div>
                  <button
                    disabled={!selectedModel || !selectedYear}
                    onClick={() => setDiyStep(3)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 disabled:bg-slate-300 transition-all"
                  >
                    다음 단계로
                  </button>
                </div>
              </div>
            )}

            {diyStep === 3 && (
              <div className="space-y-5">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  정비 항목을 선택하세요
                </label>
                {['초급', '중급', '고급'].map(level => {
                  const items = DIY_ITEMS.filter(item => item.level === level);
                  const isCollapsible = level !== '초급';
                  const isCollapsed = collapsedLevels[level];
                  const levelColor = {
                    '초급': 'text-blue-600',
                    '중급': 'text-amber-500',
                    '고급': 'text-red-500',
                  }[level];

                  return (
                    <div key={level}>
                      <button
                        className={`flex items-center gap-2 mb-2 w-full text-left ${isCollapsible ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => isCollapsible && toggleLevel(level)}
                      >
                        <span className={`text-base font-black ${levelColor}`}>{level}</span>
                        {isCollapsible && (
                          <ChevronRight
                            className={`w-4 h-4 ${levelColor} transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                          />
                        )}
                      </button>

                      {(!isCollapsible || !isCollapsed) && (
                        <div className="border-2 border-slate-100 rounded-2xl overflow-hidden bg-white">
                          {items.map((item, idx) => (
                            <button
                              key={item.id}
                              onClick={() => { setSelectedDiy(item); setDiyStep(4); }}
                              className={`w-full p-4 flex justify-between items-center hover:bg-blue-50 transition-all font-bold text-slate-700 ${idx !== items.length - 1 ? 'border-b border-slate-100' : ''}`}
                            >
                              {item.name}
                              <ChevronRight className="w-5 h-5 text-slate-300" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {diyStep === 4 && selectedDiy && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="relative aspect-video bg-slate-200 rounded-3xl overflow-hidden shadow-inner">
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                    [차량 정비 위치 이미지 - {selectedDiy.name}]
                  </div>
                  <div
                    className="absolute z-10 animate-bounce"
                    style={{ top: selectedDiy.pos.top, left: selectedDiy.pos.left }}
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-white mt-1"></div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-3xl border-2 border-blue-100 space-y-3">
                  <h3 className="text-xl font-black text-blue-600 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    {selectedDiy.name} 방법
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl font-medium text-slate-700 leading-relaxed min-h-[100px]">
                    {selectedDiy.desc}
                    <br /><br />
                    <span className="text-xs text-slate-400">* 본 가이드는 {selectedBrand} {selectedModel} ({selectedYear}년식) 기준입니다.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ?? ? */}
        {activeTab === 'map' && <MapTab />}

        {activeTab === 'history' && (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-black">나의 정비 기록</h2>

            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">기록 날짜 선택</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">내용 (예: 엔진 오일 교체)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="정비 내용을 입력하세요..."
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addManualRecord()}
                  />
                  <button onClick={addManualRecord} className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-xl">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-3xl border-2 border-slate-50 flex items-start gap-4 animate-in slide-in-from-bottom-2">
                  <div className={`w-2 h-12 rounded-full ${item.status === 'critical' ? 'bg-red-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400">{item.date}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.status === 'critical' ? 'bg-red-50 text-red-600' : item.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {item.status === 'critical' ? STATUS_LABELS.CRITICAL : item.status === 'warning' ? STATUS_LABELS.WARNING : STATUS_LABELS.NORMAL}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">{item.text}</p>
                  </div>
                  <button onClick={() => deleteRecord(item.id)} className="p-2 text-slate-300 hover:text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="bg-white/80 backdrop-blur-lg border-t flex justify-around items-center py-4 px-2 fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
        {[
          { id: 'find', icon: Search, label: '탐색' },
          { id: 'diy', icon: Wrench, label: '자가정비' },
          { id: 'map', icon: MapPin, label: '정비소' },
          { id: 'history', icon: History, label: '기록' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-black tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 로그인 모달 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden animate-in zoom-in-95">
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">반가워요!</h3>
                <button onClick={() => setShowLogin(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>
              <p className="text-slate-500 font-medium">소셜 계정으로 간편하게 시작하세요</p>
              <div className="space-y-3">
                <button className="w-full p-4 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-3">카카오 로그인</button>
                <button className="w-full p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl flex items-center justify-center gap-3">구글 로그인</button>
                <button className="w-full p-4 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3">애플 로그인</button>
                <button className="w-full p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-3">이메일 회원가입</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showNearbyMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black">지도 앱에서 찾기</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {getNearbySearchText()} 기준으로 검색합니다.
                </p>
              </div>
              <button onClick={() => setShowNearbyMapModal(false)} className="p-2 bg-slate-100 rounded-full">
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openNearbyMap('naver')} className="p-4 bg-emerald-500 text-white font-bold rounded-2xl">
                네이버 지도
              </button>
              <button onClick={() => openNearbyMap('kakao')} className="p-4 bg-[#FEE500] text-black font-bold rounded-2xl">
                카카오 맵
              </button>
              <button onClick={() => openNearbyMap('google')} className="p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl">
                구글 지도
              </button>
              <button onClick={() => openNearbyMap('apple')} className="p-4 bg-slate-800 text-white font-bold rounded-2xl">
                애플 지도
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정비소 연결 모달 */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 space-y-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black">{showMapModal.name}</h3>
                <p className="text-slate-500">{showMapModal.addr}</p>
              </div>
              <button onClick={() => setShowMapModal(null)} className="p-2 bg-slate-100 rounded-full"><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openExternalMap('naver')} className="p-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2">네이버 지도</button>
              <button onClick={() => openExternalMap('kakao')} className="p-4 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-2">카카오 맵</button>
              <button onClick={() => openExternalMap('google')} className="p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl flex items-center justify-center gap-2">구글 지도</button>
              <button onClick={() => openExternalMap('apple')} className="p-4 bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2">애플 지도</button>
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-100">정비 예약하기</button>
          </div>
        </div>
      )}
    </div>
  );
}


// =============================================================================
// 계기판 촬영 가이드 화면 컴포넌트
// =============================================================================
// 이 컴포넌트는 기존 업로드/AI 분석 로직을 건드리지 않고,
// 파일 선택창이 열리기 전에 사용자에게 촬영 가이드를 먼저 보여주기 위한 화면입니다.


// =============================================================================
// ???? ?? ? ???? - ?? ???





function MapTab() {
  const [bluehandsShops, setBluehandsShops] = useState([]);
  const [bluehandsLoading, setBluehandsLoading] = useState(true);
  const [bluehandsError, setBluehandsError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedShopType, setSelectedShopType] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);
  const [isOilGuideOpen, setIsOilGuideOpen] = useState(false);
  const [expandedAddressIds, setExpandedAddressIds] = useState({});
  const [sortMode, setSortMode] = useState('distance');
  const [showBluehandsHelp, setShowBluehandsHelp] = useState(false);

  const TEXT = {
    searchPlaceholder: "\uc8fc\uc18c \ub610\ub294 \uc9c0\uc5ed\uc744 \uc785\ub825\ud558\uc138\uc694",
    title: "\ube14\ub8e8\ud578\uc988 \uc815\ube44\uc18c",
    all: "\uc804\uccb4",
    specialist: "\uc804\ubb38",
    general: "\uc885\ud569",
    hitech: "\ud558\uc774\ud14c\ud06c",
    distanceSort: "\uac70\ub9ac\uc21c",
    resultPrefix: "\uac80\uc0c9 \uacb0\uacfc",
    resultSuffix: "\uac1c \uc911 \ucd5c\ub300 50\uac1c\ub97c \ud45c\uc2dc\ud569\ub2c8\ub2e4.",
    oilGuide: "\ud3d0\uc720\ucc98\ub9ac \uc548\ub0b4",
    loading: "\ube14\ub8e8\ud578\uc988 \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4...",
    loadError: "\ube14\ub8e8\ud578\uc988 \ub370\uc774\ud130\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
    noResult: "\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    official: "\uacf5\uc2dd\uc11c\ube44\uc2a4",
    naver: "\ub124\uc774\ubc84 \uc9c0\ub3c4",
    kakao: "\uce74\uce74\uc624\ub9f5",
    google: "\uad6c\uae00 \uc9c0\ub3c4",
    reservation: "\ud604\ub300\ucc28 \uacf5\uc2dd \uc608\uc57d \ud398\uc774\uc9c0 \uc5f4\uae30",
    oilText1: "\ud3d0\uc720, \uc5d4\uc9c4\uc624\uc77c, \uc724\ud65c\uc720 \ub4f1\uc740 \ud568\ubd80\ub85c \ubc84\ub9ac\uba74 \uc548 \ub429\ub2c8\ub2e4.",
    oilText2: "\uc790\uac00 \uc815\ube44 \ud6c4 \ubc1c\uc0dd\ud55c \ud3d0\uc624\uc77c\uc740 \uc778\uadfc \uce74\uc13c\ud130\ub098 \uc815\ube44\uc18c\uc5d0 \ucc98\ub9ac \ubc29\ubc95\uc744 \ubb38\uc758\ud558\uc138\uc694.",
    oilText3: "\ud558\uc218\uad6c\uc5d0 \ubc84\ub9ac\uba74 \ubc30\uad00 \ub9c9\ud798\uacfc \ud658\uacbd \uc624\uc5fc\uc758 \uc6d0\uc778\uc774 \ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    helpTitle: "\ube14\ub8e8\ud578\uc988 \uc548\ub0b4",
    helpIntro: "\ube14\ub8e8\ud578\uc988\ub294 \ud604\ub300\uc790\ub3d9\ucc28 \uacf5\uc2dd \uc815\ube44 \uc11c\ube44\uc2a4 \ub124\ud2b8\uc6cc\ud06c\uc785\ub2c8\ub2e4.",
    helpSpecialist: "\uc804\ubb38: \uc77c\ubc18 \uc810\uac80\uacfc \uacbd\uc815\ube44 \uc704\uc8fc\uc758 \uc9c0\uc5ed \uc815\ube44\uc18c",
    helpGeneral: "\uc885\ud569: \ubcf4\ub2e4 \ub113\uc740 \uc815\ube44 \ud56d\ubaa9\uc744 \ub2e4\ub8e8\ub294 \uc885\ud569 \uc815\ube44\uc18c",
    helpHitech: "\ud558\uc774\ud14c\ud06c: \uace0\ub09c\ub3c4 \uc9c4\ub2e8, \uc804\uc7a5, \ucca8\ub2e8 \uc2dc\uc2a4\ud15c \uc810\uac80\uc744 \uc9c0\uc6d0\ud558\ub294 \uc13c\ud130",
  };

  const cityShortMap = {
    "\uc11c\uc6b8\ud2b9\ubcc4\uc2dc": "\uc11c\uc6b8",
    "\uc778\ucc9c\uad11\uc5ed\uc2dc": "\uc778\ucc9c",
    "\ubd80\uc0b0\uad11\uc5ed\uc2dc": "\ubd80\uc0b0",
    "\ub300\uad6c\uad11\uc5ed\uc2dc": "\ub300\uad6c",
    "\uad11\uc8fc\uad11\uc5ed\uc2dc": "\uad11\uc8fc",
    "\ub300\uc804\uad11\uc5ed\uc2dc": "\ub300\uc804",
    "\uc6b8\uc0b0\uad11\uc5ed\uc2dc": "\uc6b8\uc0b0",
    "\uc138\uc885\ud2b9\ubcc4\uc790\uce58\uc2dc": "\uc138\uc885",
    "\uacbd\uae30\ub3c4": "\uacbd\uae30",
    "\uac15\uc6d0\ud2b9\ubcc4\uc790\uce58\ub3c4": "\uac15\uc6d0",
    "\ucda9\uccad\ubd81\ub3c4": "\ucda9\ubd81",
    "\ucda9\uccad\ub0a8\ub3c4": "\ucda9\ub0a8",
    "\uc804\ubd81\ud2b9\ubcc4\uc790\uce58\ub3c4": "\uc804\ubd81",
    "\uc804\ub77c\ub0a8\ub3c4": "\uc804\ub0a8",
    "\uacbd\uc0c1\ubd81\ub3c4": "\uacbd\ubd81",
    "\uacbd\uc0c1\ub0a8\ub3c4": "\uacbd\ub0a8",
    "\uc81c\uc8fc\ud2b9\ubcc4\uc790\uce58\ub3c4": "\uc81c\uc8fc",
  };
  
  const f = (small, big) => isBigFont ? big : small;

  const resetDiy = () => {
    setDiyStep(1); setSelectedBrand('');
    setSelectedModel(''); setSelectedYear('');
    setSelectedDiy(null);
  };
  const handleTabClick = (tabId) => {
    if (tabId === 'find') {
      setImage(null); setResult(null);
      setShowPhotoGuide(false);
    }
    if (tabId === 'diy') resetDiy();
    setActiveTab(tabId);
  };
  const goHome = () => handleTabClick('find');

  useEffect(() => {
    const loadBluehands = async () => {
      try {
        const data = await fetchBluehandsData();
        setBluehandsShops(data);
      } catch (error) {
        console.error(error);
        setBluehandsError(error.message);
      } finally {
        setBluehandsLoading(false);
      }
    };

    loadBluehands();
  }, []);

  const getTypeMeta = (type) => {
    if (type === 'specialist') {
      return {
        label: TEXT.specialist,
        fullLabel: "\uc804\ubb38 \ube14\ub8e8\ud578\uc988",
        badgeClass: 'bg-emerald-50 text-emerald-600',
      };
    }

    if (type === 'general') {
      return {
        label: TEXT.general,
        fullLabel: "\uc885\ud569 \ube14\ub8e8\ud578\uc988",
        badgeClass: 'bg-blue-50 text-blue-600',
      };
    }

    if (type === 'hitech') {
      return {
        label: TEXT.hitech,
        fullLabel: "\ud558\uc774\ud14c\ud06c\uc13c\ud130",
        badgeClass: 'bg-orange-50 text-orange-600',
      };
    }

    return {
      label: "\uae30\ud0c0",
      fullLabel: "\ube14\ub8e8\ud578\uc988",
      badgeClass: 'bg-slate-100 text-slate-500',
    };
  };

  const getShopKey = (shop) => {
    return shop.id || `${shop.name}-${shop.addr}`;
  };

  const getShortAddress = (shop) => {
    const rawAddress = shop.addr || '';
    const parts = rawAddress.split(/\s+/).filter(Boolean);

    const rawCity = shop.city || parts[0] || '';
    const shortCity = cityShortMap[rawCity] || rawCity.replace("\ud2b9\ubcc4\uc2dc", "").replace("\uad11\uc5ed\uc2dc", "").replace("\ud2b9\ubcc4\uc790\uce58\uc2dc", "").replace("\ub3c4", "");

    const district = parts.find((part) => part.endsWith("\uad6c") || part.endsWith("\uad70") || part.endsWith("\uc2dc")) || '';

    const dongMatch = rawAddress.match(/\(([^)]+)\)/);
    const dong = dongMatch?.[1] || parts.find((part) => part.endsWith("\ub3d9") || part.endsWith("\uc74d") || part.endsWith("\uba74")) || '';

    return [shortCity, district, dong].filter(Boolean).join(' ');
  };

  const filteredShops = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    const result = bluehandsShops.filter((shop) => {
      const typeMatched =
        selectedShopType === 'all' || shop.type === selectedShopType;

      const keywordMatched =
        !keyword ||
        `${shop.name} ${shop.addr} ${shop.city} ${shop.phone} ${shop.typeLabel}`
          .toLowerCase()
          .includes(keyword);

      return typeMatched && keywordMatched;
    });

    if (sortMode === 'distance') {
      return [...result].sort((a, b) => {
        const cityA = a.city || '';
        const cityB = b.city || '';
        const nameA = a.name || '';
        const nameB = b.name || '';
        return cityA.localeCompare(cityB, 'ko') || nameA.localeCompare(nameB, 'ko');
      });
    }

    return result;
  }, [bluehandsShops, searchKeyword, selectedShopType, sortMode]);

  const visibleShops = filteredShops.slice(0, 50);

  const makeExternalMapQuery = (shop, service) => {
    const shopName = shop?.name || '';
    const shopAddress = shop?.addr || '';

    // ???/???? ???+??? ???? ?? ?? ??? ? ??????.
    // ??? ???+?? ??? ??? ? ?????.
    if (service === 'kakao' || service === 'naver') {
      return shopAddress || shopName;
    }

    return `${shopName} ${shopAddress}`.trim();
  };

  const openMapSearch = (shop, service) => {
    const query = encodeURIComponent(makeExternalMapQuery(shop, service));

    const urlMap = {
      naver: `https://map.naver.com/p/search/${query}`,
      kakao: `https://map.kakao.com/link/search/${query}`,
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    };

    window.open(urlMap[service], '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="relative flex-1 min-h-[320px] bg-blue-50">
        <iframe
          title="map"
          src="https://maps.google.com/maps?q=37.5665,126.9780&z=12&output=embed&hl=ko"
          className="w-full h-full border-none"
          loading="lazy"
        />

        <button
          type="button"
          className="absolute right-5 top-5 z-20 w-14 h-14 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center"
          aria-label="current location"
        >
          <LocateFixed className="w-7 h-7 text-blue-600" />
        </button>

        <div className="absolute left-5 right-5 top-5 z-20">
          <div className="flex items-center bg-white/90 backdrop-blur-md border border-white/70 rounded-full px-4 py-3 shadow-xl">
            <Search className="w-6 h-6 text-slate-400 mr-2 shrink-0" />

            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder={TEXT.searchPlaceholder}
              className="flex-1 outline-none bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-400"
            />

            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="ml-2 w-8 h-8 rounded-full bg-slate-100/90 flex items-center justify-center"
                aria-label="clear search"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-t-[40px] -mt-10 shadow-2xl z-20 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black text-slate-900">{TEXT.title}</h2>

            <span className="px-2 py-1 rounded-lg text-[11px] font-black bg-amber-50 text-amber-700">
              {TEXT.official}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowBluehandsHelp(true)}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 font-black text-sm flex items-center justify-center shrink-0"
            aria-label="bluehands help"
          >
            ?
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: TEXT.all },
            { id: 'specialist', label: TEXT.specialist },
            { id: 'general', label: TEXT.general },
            { id: 'hitech', label: TEXT.hitech },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedShopType(item.id)}
              className={`px-4 py-2 rounded-2xl text-sm font-black whitespace-nowrap border-2 transition-all ${selectedShopType === item.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-100'
                }`}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSortMode('distance')}
            className={`px-4 py-2 rounded-2xl text-sm font-black whitespace-nowrap border-2 transition-all ${sortMode === 'distance'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-500 border-slate-100'
              }`}
          >
            {TEXT.distanceSort}
          </button>
        </div>

        <p className="text-xs font-bold text-slate-400">
          {TEXT.resultPrefix} {filteredShops.length.toLocaleString()}{TEXT.resultSuffix}
        </p>

        <div className="border-2 border-slate-100 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsOilGuideOpen((prev) => !prev)}
            className="w-full px-4 py-3 flex items-center justify-between bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Droplet className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-black text-slate-800">{TEXT.oilGuide}</span>
            </div>

            <ChevronDown
              className={`w-5 h-5 text-slate-500 transition-transform ${isOilGuideOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOilGuideOpen && (
            <div className="px-5 pb-4 pt-1 text-sm text-slate-600 leading-relaxed bg-slate-50">
              <p className="font-bold mb-2">{TEXT.oilText1}</p>
              <ul className="space-y-2 list-disc pl-5">
                <li>{TEXT.oilText2}</li>
                <li>{TEXT.oilText3}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {bluehandsLoading && (
            <div className="p-5 text-center bg-white rounded-2xl border-2 border-slate-100">
              <p className="font-black text-blue-600">{TEXT.loading}</p>
            </div>
          )}

          {bluehandsError && (
            <div className="p-5 text-center bg-red-50 rounded-2xl border-2 border-red-100">
              <p className="font-black text-red-600">{TEXT.loadError}</p>
              <p className="text-xs text-red-400 mt-1">{bluehandsError}</p>
            </div>
          )}

          {!bluehandsLoading && !bluehandsError && visibleShops.length === 0 && (
            <div className="p-5 text-center bg-white rounded-2xl border-2 border-slate-100">
              <p className="font-black text-slate-700">{TEXT.noResult}</p>
            </div>
          )}

          {!bluehandsLoading && !bluehandsError && visibleShops.map((shop) => {
            const meta = getTypeMeta(shop.type);
            const shopKey = getShopKey(shop);
            const isAddressOpen = Boolean(expandedAddressIds[shopKey]);

            return (
              <div
                key={shopKey}
                onClick={() => setSelectedShop(shop)}
                className="p-5 rounded-3xl border-2 border-slate-100 bg-white cursor-pointer active:scale-[0.99] transition-transform shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h4 className="font-black text-slate-900 text-lg leading-tight">
                          {shop.name}
                        </h4>

                        <span className={`px-2 py-1 rounded-lg text-[11px] font-black ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-300 shrink-0 mt-1" />
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedAddressIds((prev) => ({
                          ...prev,
                          [shopKey]: !prev[shopKey],
                        }));
                      }}
                      className="mt-2 flex items-center gap-1 text-sm text-slate-500 font-bold text-left"
                    >
                      <span>{isAddressOpen ? shop.addr : getShortAddress(shop)}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAddressOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAddressOpen && (
                      <p className="mt-1 text-xs text-slate-400 font-medium leading-relaxed">
                        {shop.addr}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {shop.phone && (
                        <p className="text-slate-400 text-xs font-bold">
                          {shop.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBluehandsHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[36px] p-7 space-y-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{TEXT.helpTitle}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {TEXT.helpIntro}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBluehandsHelp(false)}
                className="p-2 bg-slate-100 rounded-full shrink-0"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                {TEXT.helpSpecialist}
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-700 text-sm font-bold">
                {TEXT.helpGeneral}
              </div>
              <div className="p-4 rounded-2xl bg-orange-50 text-orange-700 text-sm font-bold">
                {TEXT.helpHitech}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedShop && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-2xl font-black">{selectedShop.name}</h3>

                  <span className={`px-2 py-1 rounded-lg text-[11px] font-black ${getTypeMeta(selectedShop.type).badgeClass}`}>
                    {getTypeMeta(selectedShop.type).fullLabel}
                  </span>
                </div>

                <p className="text-slate-500 mt-2">{selectedShop.addr}</p>

                {selectedShop.phone && (
                  <p className="text-blue-600 font-black mt-1">{selectedShop.phone}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedShop(null)}
                className="p-2 bg-slate-100 rounded-full shrink-0"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => openMapSearch(selectedShop, 'naver')}
                className="p-4 bg-emerald-500 text-white font-bold rounded-2xl"
              >
                {TEXT.naver}
              </button>

              <button
                type="button"
                onClick={() => openMapSearch(selectedShop, 'kakao')}
                className="p-4 bg-[#FEE500] text-black font-bold rounded-2xl"
              >
                {TEXT.kakao}
              </button>

              <button
                type="button"
                onClick={() => openMapSearch(selectedShop, 'google')}
                className="p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl"
              >
                {TEXT.google}
              </button>
            </div>

            {selectedShop.officialPage && (
              <button
                type="button"
                onClick={() => window.open(selectedShop.officialPage, '_blank')}
                className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-100"
              >
                {TEXT.reservation}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


const styleTag = document.createElement('style');
styleTag.innerHTML = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
`;
document.head.appendChild(styleTag);
