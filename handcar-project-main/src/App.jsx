import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';

const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL;
const BACKEND_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const STATUS_LABELS = {
  CRITICAL: "Í∏¥Í∏â ?êÍ?",
  WARNING: "?ïÏù∏ ?îÎßù",
  NORMAL: "?ÅÌÉú ?ëÌò∏"
};

const TAG_DICTIONARY = {
  "key_bat": "?§Îßà?∏ÌÇ§ Î∞∞ÌÑ∞Î¶?Î∂ÄÏ°?Í≤ΩÍ≥†??,
  "light": "?ºÏù¥??Í≤∞Ìï® Í≤ΩÍ≥†??,
  "oil": "?∞Î£å Î∂ÄÏ°?Í≤ΩÍ≥†??,
  "sb": "?àÏ†ÑÎ≤®Ìä∏ ÎØ∏Ï∞©??Í≤ΩÍ≥†??,
  "tire": "?Ä?¥Ïñ¥ ?ïÎ†• Í≤ΩÍ≥†??,
  "washer": "?åÏÖî??Î∂ÄÏ°?Í≤ΩÍ≥†??
};

const TAG_DETAILS = {
  "key_bat": {
    meaning: "?§Îßà?∏ÌÇ§ ?¥Î???Î∞∞ÌÑ∞Î¶??îÎüâ??Î∂ÄÏ°±Ìïò?§Îäî ?ªÏûÖ?àÎã§.",
    reason: "Î≥¥ÌÜµ ?§Îßà?∏ÌÇ§ Î∞∞ÌÑ∞Î¶?CR2032 ?? ?òÎ™Ö?????òÏñ¥ Î∞úÏÉù?©Îãà??",
    action: "Í∞ÄÍπåÏö¥ ?∏Ïùò?êÏù¥??ÎßàÌä∏?êÏÑú ?ôÏ†Ñ??Î∞∞ÌÑ∞Î¶¨Î? Íµ¨Îß§??ÏßÅÏ†ë ÍµêÏ≤¥?òÏãúÍ±∞ÎÇò, ?úÎπÑ???ºÌÑ∞Î•?Î∞©Î¨∏??Ï£ºÏÑ∏??"
  },
  "light": {
    meaning: "Ï∞®Îüâ ?∏Î? ?®ÌîÑ(?ÑÏ°∞?? ?ÑÎ??? Î∏åÎ†à?¥ÌÅ¨???? Ï§??òÎÇò ?¥ÏÉÅ??Î¨∏Ï†úÍ∞Ä ?ùÍ≤º?§Îäî ?ªÏûÖ?àÎã§.",
    reason: "?ÑÍµ¨Í∞Ä ?òÎ™Ö???§Ìï¥ ?äÏñ¥Ï°åÍ±∞?? ?®Ï¶à ?πÏ? Î∞∞ÏÑ†??Î¨∏Ï†úÍ∞Ä ?ùÍ≤º?????àÏäµ?àÎã§.",
    action: "Ï∞®Ïóê???¥Î†§ ?¥Îäê Ï™?Î∂àÎπõ?????§Ïñ¥?§ÎäîÏßÄ ?ïÏù∏?òÍ≥†, ?ÑÍµ¨Î•?ÍµêÏ≤¥?òÍ±∞???ïÎπÑ?åÎ? Î∞©Î¨∏???êÍ?Î∞õÏúº?∏Ïöî."
  },
  "oil": {
    meaning: "?∞Î£å ?±ÌÅ¨???®ÏïÑ?àÎäî ?∞Î£åÍ∞Ä ?ºÎßà ?ÜÎã§???ªÏûÖ?àÎã§.",
    reason: "Ï£ºÌñâ?ºÎ°ú ?∏Ìï¥ ?∞Î£åÍ∞Ä ?åÎ™®?òÏñ¥ Î≥¥Ï∂©???ÑÏöî???úÍ∏∞Í∞Ä ?òÏóà?µÎãà??",
    action: "Ï∞®Îüâ??Î©àÏ∂îÍ∏??ÑÏóê Í∞ÄÍπåÏö¥ Ï£ºÏú†?åÏóê ?§Îü¨ ?∞Î£åÎ•?Ï∂©Î∂Ñ??Ï£ºÏú†??Ï£ºÏÑ∏??"
  },
  "sb": {
    meaning: "?¥Ï†Ñ???êÎäî ?ôÏäπ?êÍ? ?àÏ†ÑÎ≤®Ìä∏Î•?Îß§Ï? ?äÏïò?§Îäî ?ªÏûÖ?àÎã§.",
    reason: "?àÏ†ÑÎ≤®Ìä∏ Ï≤¥Í≤∞ ?ºÏÑúÍ∞Ä Í∞êÏ??òÏ? ?äÏïòÍ±∞ÎÇò, ?úÌä∏ ?ÑÏóê Î¨¥Í±∞??Î¨ºÍ±¥???¨Î†§???àÏùÑ ???πÎãà??",
    action: "Î™®Îì† ?ëÏäπ?êÍ? ?àÏ†ÑÎ≤®Ìä∏Î•?Ï∞©Ïö©??Ï£ºÏÑ∏?? Î¨ºÍ±¥???ìÏó¨?àÎã§Î©?ÏπòÏõåÏ£ºÏÑ∏??"
  },
  "tire": {
    meaning: "?Ä?¥Ïñ¥??Í≥µÍ∏∞?ïÏù¥ Í∂åÏû• ?òÏπòÎ≥¥Îã§ ??ïÑÏ°åÎã§???ªÏûÖ?àÎã§.",
    reason: "?êÏó∞?ÅÏù∏ Í≥µÍ∏∞ ?ÑÏ∂ú, ?®ÎèÑ ?òÍ∞ï?ºÎ°ú ?∏Ìïú ?òÏ∂ï, ?πÏ? ?Ä?¥Ïñ¥??Î™ªÏù¥ Î∞ïÌ? ?ëÌÅ¨Í∞Ä ?¨ÏùÑ ???àÏäµ?àÎã§.",
    action: "Ï£ºÌñâ ?çÎèÑÎ•?Ï§ÑÏù¥Í≥?Í∞ÄÍπåÏö¥ ?ïÎπÑ?åÎÇò Ï£ºÏú†?åÏóê??Í≥µÍ∏∞?ïÏùÑ Î≥¥Ï∂©?òÏÑ∏?? ?ëÌÅ¨Í∞Ä ?òÏã¨?òÎ©¥ Î≥¥Ìóò?¨Î? Î∂ÄÎ•¥ÏÑ∏??"
  },
  "washer": {
    meaning: "?ûÏú†Î¶¨Î? ??ùÑ ???∞Îäî ?åÏÖî?°Ïù¥ Î∂ÄÏ°±Ìïò?§Îäî ?ªÏûÖ?àÎã§.",
    reason: "?åÏÖî?°ÏùÑ ÎßéÏù¥ ?¨Ïö©?òÏó¨ ?åÏÖî???±ÌÅ¨Í∞Ä ÎπÑÏõåÏ°åÏäµ?àÎã§.",
    action: "?Ä?ïÎßà?∏ÎÇò ?∏Ïùò?êÏóê???åÏÖî?°ÏùÑ Íµ¨Îß§???? Î≥¥Îãõ???¥Í≥† ?åÎ????úÍªë??Ï∞æÏïÑ ÏßÅÏ†ë Î≥¥Ï∂©??Ï£ºÏÑ∏??"
  }
};


function getSeverityFromRisk(riskLevel) {
  if (!riskLevel) return 'normal';
  if (riskLevel.includes('Îß§Ïö∞') || riskLevel.includes('?íÏùå')) return 'critical';
  if (riskLevel.includes('Ï§ëÍ∞Ñ')) return 'warning';
  return 'normal';
}

function makeLocalFastApiResult(apiResult) {
  const firstWarning = apiResult?.detected_warnings?.[0];

  if (!firstWarning) {
    return {
      status: 'normal',
      title: 'Í∞êÏ???Í≤ΩÍ≥†???ÜÏùå',
      msg: '?ÑÏû¨ ?¥Î?ÏßÄ?êÏÑú ?∏Ïãù??Í≤ΩÍ≥†?±Ïù¥ ?ÜÏäµ?àÎã§. ???†Î™Ö??Í≥ÑÍ∏∞???¨ÏßÑ?ºÎ°ú ?§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??',
      detectedWarnings: [],
      explanation: apiResult?.explanation || '',
      raw: apiResult,
    };
  }

  return {
    status: getSeverityFromRisk(firstWarning.risk_level),
    title: firstWarning.display_name || 'Í≤ΩÍ≥†??Í∞êÏ?',
    msg: firstWarning.summary || 'Í≥ÑÍ∏∞??Í≤ΩÍ≥†?±Ïù¥ Í∞êÏ??òÏóà?µÎãà??',
    detectedWarnings: apiResult?.detected_warnings || [],
    explanation: apiResult?.explanation || '',
    raw: apiResult,
  };
}

const MANUFACTURERS = [
  {
    name: '?ÑÎ?',
    logo: 'https://yt3.googleusercontent.com/AULzs1m3DYUrmRsBwSzfOw_NdkCKrw4LKyZG4bBnUlkL79Xz_nZtn3laOg7b3xbJDjgCbJJE2A=s900-c-k-c0x00ffffff-no-rj',
    models: ['?ÑÎ∞ò??, '?òÎÇò?Ä', 'Í∑∏Îûú?Ä', '?ºÌ???, '?∞Î¶¨?∏Ïù¥??, '?ÑÏù¥?§Îãâ 5'],
  },
  {
    name: 'Í∏∞ÏïÑ',
    logo: 'https://image-cdn.hypb.st/https%3A%2F%2Fkr.hypebeast.com%2Ffiles%2F2021%2F01%2Fkia-motors-new-logo-brand-slogan-officially-revealed-01.jpg?q=75&w=800&cbr=1&fit=max',
    models: ['K3', 'K5', 'K8', '?òÎ†å??, 'Ïπ¥ÎãàÎ∞?, 'EV6'],
  },
  {
    name: 'BMW',
    logo: 'https://static.vecteezy.com/system/resources/previews/020/502/870/non_2x/bmw-brand-logo-car-symbol-blue-and-white-design-germany-automobile-illustration-with-black-background-free-vector.jpg',
    models: ['3?úÎ¶¨Ï¶?, '5?úÎ¶¨Ï¶?, '7?úÎ¶¨Ï¶?, 'X5', 'i4'],
  },
  {
    name: 'Î≤§Ï∏†',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9Dm7XF8xuRw2s3NKh5VOLvb4I553Ujy0j_w&s',
    models: ['C-?¥Îûò??, 'E-?¥Îûò??, 'S-?¥Îûò??, 'GLC', 'EQE'],
  },
  {
    name: '?åÏä¨??,
    logo: 'https://img.icons8.com/ios_filled/1200/tesla-logo.jpg',
    models: ['Î™®Îç∏ 3', 'Î™®Îç∏ Y', 'Î™®Îç∏ S', 'Î™®Îç∏ X'],
  },
  {
    name: '?ÑÏö∞??,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXgKUN4_0i99p88wIDnUzQWuH1hEFp64tW1g&s',
    models: ['A4', 'A6', 'Q5', 'e-tron'],
  },
  {
    name: '?¨Îìú',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
    models: ['?µÏä§?åÎ°ú??, 'Î®∏Ïä§??, 'Î∏åÎ°±ÏΩ?],
  },
  {
    name: '?¨Î•¥??,
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj7uLiozKvofF33sSn4llNG5qYoSJ3Sr6uFQ&s',
    models: ['911', '?Ä?¥Ïπ∏', 'Ïπ¥Ïù¥??, '?åÎÇòÎ©îÎùº'],
  },
  {
    name: '?òÎùºÎ¶?,
    logo: 'https://i.namu.wiki/i/tzZ_j5Uy54Muem7VjRMguOw8G1-t69fdqOPuLKgshYyiG6FUqkC9DgS6N2U1GvQ7IsVVR1GizpiOcOmZ8-d0lQ.svg',
    models: ['296 GTB', 'Î°úÎßà', '?∏Î°ú?∞Í≤å'],
  },
  {
    name: '?õÏÇ∞',
    logo: 'https://i.namu.wiki/i/8t0fwkYNWK37g3p_rHI625_XHi_9IoqYqYBAFM0b449dx3VrNgWMVci1NJpjpO57O6qve2lYq63MQFH7mQZEBg.svg',
    models: ['?åÌã∞Îß?, '?ÑÎ¶¨??, 'Z'],
  },
  {
    name: '?ºÎã§',
    logo: 'https://i.namu.wiki/i/NAObOBkqZA3buq-Z6i6jjgtDnjqHlPGZQIwX6P0-vlI_brAHh02yMuk0JZLY1Sbzyo7fcUrXdFGHnO5znSli3A.webp',
    models: ['?¥ÏΩî??, 'CR-V', '?úÎπÖ'],
  },
  {
    name: 'ÎØ∏Ïì∞ÎπÑÏãú',
    logo: 'https://i.namu.wiki/i/y3vBVyGWjjSt6vo02F_ObBYxmJF6bb03K7wgTaqilhOdk1F_IviYwdclHPkk4RTuzizLDXziNAcJdQ94qaO9ig.svg',
    models: ['?ÑÏõÉ?úÎçî', '?åÏ†úÎ°?],
  },
  {
    name: '?†Ïä§??ÎßàÌã¥',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-j392AO1YIrvmHRK9i_f7_INqzg1rqQ5zqw&s',
    models: ['DB12', 'Î±ÖÌÄ¥Ïãú', 'Î≤§Ìã∞ÏßÄ', 'DBX', 'Î∞úÌï†??, 'Î∞úÌÇ§Î¶?],
  },
  {
    name: 'Î≤§Ì?Î¶?,
    logo: 'https://i.namu.wiki/i/HHeWZKoLbs0wFpESBF2y0rn7WGbFdQISenKhVeBNzG2TATyQ2yuX2-q7y19h7SzqUIObrpvyGfg7cRq8FKIn4g.webp',
    models: ['Ïª®Ìã∞?§ÌÉà GT', '?åÎùº???§Ìçº', 'Î≤§ÌÖå?¥Í?'],
  },
  {
    name: 'Î°úÌÑ∞??,
    logo: 'https://cdn.imweb.me/upload/S2023032790b38549a0a48/680cc91135110.png',
    models: ['?êÎ???, '?ëÏãúÏßÄ', '?êÎ≥¥??, '?òÎ?', '?êÏä§?ÑÎ¶¨'],
  },
  {
    name: '?åÎ≥¥Î•¥Í∏∞??,
    logo: 'https://mblogthumb-phinf.pstatic.net/20160615_257/myredsuns_1465980110067miHuv_JPEG/22222.jpg?type=w800',
    models: ['?àÎ??òÌÜ†', '?åÎ©î?ºÎ¶¨??],
  },
  {
    name: '??ä§Î∞îÍ≤ê',
    logo: 'https://i.namu.wiki/i/oin2760z3zfw4jJ7TasQDIk2tN4f5qC3PvY45UD7M3F4rGW9EwJNOvAGUxH6VoSyUovNgA2w-nMasLodElp6Jg.svg',
    models: ['Í≥®ÌîÑ', '?åÏÇ¨??, '?∞Íµ¨??],
  },
  // ?¨Í∏∞??{ name: 'Î∏åÎûú?úÎ™Ö', logo: 'Ï£ºÏÜå', models: ['Ï∞?', 'Ï∞?'] } ?ïÌÉúÎ°?Ï∂îÍ??òÏÑ∏??
];

const SHOPS = [
  { id: 1, name: '?∏Ï¶àÏ¢ÖÌï©?ïÎπÑ??, type: 'general', lat: 35, lng: 40, addr: '?úÏö∏??Í∞ïÎÇ®Íµ??åÌó§?ÄÎ°?123' },
  { id: 2, name: '?êÏΩîÍ∑∏Î¶∞ ?êÏú†Ï≤òÎ¶¨??, type: 'oil', lat: 60, lng: 30, addr: '?úÏö∏???úÏ¥àÍµ??®Î†πÎ°?456' },
  { id: 3, name: 'ÎßàÏä§???êÎèôÏ∞??ºÌÑ∞', type: 'general', lat: 45, lng: 70, addr: '?úÏö∏???°ÌååÍµ??¨Î¶º?ΩÎ°ú 789' },
  { id: 4, name: '?¥Î¶∞ ?§Ïùº Î±ÖÌÅ¨', type: 'oil', lat: 20, lng: 60, addr: '?úÏö∏??Í∞ïÏÑúÍµ??îÍ≥°Î°?321' },
];

const DIY_ITEMS = [
  { id: 'washer', name: '?åÏÖî??Î≥¥Ï∂©', pos: { top: '30%', left: '25%' }, desc: 'Î≥¥Îãõ???¥Í≥† ?åÎ????úÍªë??Ï∞æÏïÑ ?åÏÖî?°ÏùÑ Í∞Ä??Ï±ÑÏö∞?∏Ïöî.' },
  { id: 'filter', name: '?êÏñ¥Ïª??ÑÌÑ∞ ÍµêÏ≤¥', pos: { top: '50%', left: '70%' }, desc: 'Ï°∞Ïàò??Í∏ÄÎ°úÎ∏å Î∞ïÏä§Î•??¥Í≥† ?àÏ™Ω ??∞úÎ•??úÍ±∞???ÑÌÑ∞Î•?ÍµêÏ≤¥?òÏÑ∏??' },
  { id: 'coolant', name: '?âÍ∞Å??Î≥¥Ï∂©', pos: { top: '25%', left: '65%' }, desc: '?îÏßÑ???ùÏ? ???âÍ∞Å??Î≥¥Ï°∞ ?±ÌÅ¨??MAX ?†ÍπåÏßÄ Î≥¥Ï∂©?òÏÑ∏??' },
  { id: 'headlight', name: '?ÑÏ°∞??ÍµêÏ≤¥', pos: { top: '20%', left: '15%' }, desc: '?îÏßÑÎ£??àÏ™Ω ?ÑÏ°∞???åÏºì???åÎ†§ ÎπºÍ≥† ???ÑÍµ¨Î°?ÍµêÏ≤¥?òÏÑ∏??' },
  { id: 'taillight', name: '?ÑÎ???ÍµêÏ≤¥', pos: { top: '85%', left: '15%' }, desc: '?∏Î†Å???àÏ™Ω Ïª§Î≤ÑÎ•??¥Í≥† ?åÏºì??Î∂ÑÎ¶¨???ÑÍµ¨Î•?ÍµêÏ≤¥?òÏÑ∏??' },
  { id: 'brake_light', name: 'Î∏åÎ†à?¥ÌÅ¨??ÍµêÏ≤¥', pos: { top: '82%', left: '30%' }, desc: '?ÑÎ???Î≠âÏπòÎ•?Î∂ÑÎ¶¨?òÏó¨ Î∏åÎ†à?¥ÌÅ¨ ?ÑÏö© ?ÑÍµ¨Î•?ÍµêÏ≤¥?òÏÑ∏??' },
  { id: 'plate_light', name: 'Î≤àÌò∏?êÎì± ÍµêÏ≤¥', pos: { top: '88%', left: '50%' }, desc: '?úÎùº?¥Î≤ÑÎ°?Î≤àÌò∏???ÅÎã® Ïª§Î≤ÑÎ•??¥Í≥† ?ëÏ? ?ÑÍµ¨Î•?ÍµêÏ≤¥?òÏÑ∏??' },
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  // DIY Í∞Ä?¥Îìú ?ÅÌÉú
  const [diyStep, setDiyStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDiy, setSelectedDiy] = useState(null);

  // ?ïÎπÑ??ÏßÄ???ÅÌÉú
  const [hoveredShop, setHoveredShop] = useState(null);
  const [showMapModal, setShowMapModal] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showNearbyMapModal, setShowNearbyMapModal] = useState(false);

  // Í∏∞Î°ù ?ÅÌÉú
  const [history, setHistory] = useState([
    { id: 1, date: '2023-10-25', text: '?îÏßÑ ?§Ïùº Í≤ΩÍ≥†???êÎì±', status: 'critical' },
    { id: 2, date: '2023-11-05', text: '?åÏÖî??Î≥¥Ï∂© ?ÑÎ£å', status: 'normal' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

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
      const apiUrl = AI_PROXY_URL || (!isLocalHost ? '/api/analyze' : null);

      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: file
        });

        if (!response.ok) {
          throw new Error(`AI ?ÑÎ°ù??API ?§Î•ò: ${response.status}`);
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
              msg: details || 'AIÍ∞Ä Í≤ΩÍ≥†?±ÏùÑ Í∞êÏ??àÏäµ?àÎã§. Í¥Ä???ïÎπÑÎ•?ÏßÑÌñâ?òÍ±∞???ÑÎ¨∏Í∞Ä Î∞©Î¨∏??Ï∂îÏ≤ú?©Îãà??',
              raw: apiResult,
            };
          } else {
            resultData = {
              status: 'normal',
              title: '?∏Ïãù??Í≤ΩÍ≥†???ÜÏùå',
              msg: 'Î™ÖÌôï??Í≤ΩÍ≥†?±Ïù¥ ?∏Ïãù?òÏ? ?äÏïò?µÎãà?? ?§Î•∏ ?¨ÏßÑ?ºÎ°ú ?§Ïãú ?úÎèÑ?¥Î≥¥?∏Ïöî.',
              raw: apiResult,
            };
          }
        } else {
          resultData = {
            status: 'warning',
            title: '?∏Ïãù ?§Ìå®',
            msg: '?¥Î?ÏßÄ Î∂ÑÏÑù???§Ìå®?àÏäµ?àÎã§.',
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
          throw new Error(`Î°úÏª¨ FastAPI ?§Î•ò: ${response.status}`);
        }

        const apiResult = await response.json();
        resultData = makeLocalFastApiResult(apiResult);
      }

      setResult(resultData);

      if (resultData.status !== 'normal') {
        const newRecord = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          text: `${resultData.title}: ${typeof resultData.msg === 'string' ? resultData.msg : '?ÅÏÑ∏ ?àÎÇ¥ ?ïÏù∏ ?ÑÏöî'}`,
          status: resultData.status,
        };

        setHistory(prev => [newRecord, ...prev]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setResult({
        status: 'warning',
        title: 'Î∂ÑÏÑù ?∞Í≤∞ ?§Ìå®',
        msg: `AI Î∂ÑÏÑù ?úÎ≤Ñ ?∞Í≤∞???§Ìå®?àÏäµ?àÎã§. Î°úÏª¨ ?åÏä§?∏ÎùºÎ©?FastAPI ?úÎ≤ÑÍ∞Ä ÏºúÏ†∏ ?àÎäîÏßÄ ?ïÏù∏??Ï£ºÏÑ∏?? (${error.message})`,
        detectedWarnings: [],
        explanation: '',
        raw: null,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRecordStatus = (text) => {
    if (text.includes('?îÏßÑ') || text.includes('Î∏åÎ†à?¥ÌÅ¨') || text.includes('Í∏¥Í∏â')) return 'critical';
    if (text.includes('?Ä?¥Ïñ¥') || text.includes('?ÑÏïï') || text.includes('Ï£ºÏùò')) return 'warning';
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
      setLocationError('??Î∏åÎùº?∞Ï??êÏÑú???ÑÏπò Í∏∞Îä•??ÏßÄ?êÌïòÏßÄ ?äÏäµ?àÎã§.');
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
        setLocationError('?ÑÏπò Í∂åÌïú???àÏö©?¥Ïïº ?ÑÏû¨ ?ÑÏπòÎ•?Í∞Ä?∏Ïò¨ ???àÏäµ?àÎã§.');
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
      setLocationError('Ï£ºÏÜå???ôÎÑ§ ?¥Î¶Ñ???ÖÎ†•??Ï£ºÏÑ∏??');
      return;
    }

    setSelectedAddress(trimmedAddress);
    setLocationError('');
  };

  const getMapEmbedUrl = () => {
    if (selectedAddress) {
      const query = encodeURIComponent(`${selectedAddress} ?êÎèôÏ∞??ïÎπÑ??);
      return `https://maps.google.com/maps?q=${query}&z=14&output=embed&hl=ko`;
    }

    if (userLocation) {
      return `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&output=embed&hl=ko`;
    }

    return `https://maps.google.com/maps?q=37.5665,126.9780&z=13&output=embed&hl=ko`;
  };

  const getNearbySearchText = () => {
    if (selectedAddress) {
      return `${selectedAddress} ?êÎèôÏ∞??ïÎπÑ??;
    }

    if (userLocation) {
      return `${userLocation.lat},${userLocation.lng} ?êÎèôÏ∞??ïÎπÑ??;
    }

    return '??Ï£ºÎ? ?êÎèôÏ∞??ïÎπÑ??;
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
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
      {/* ?ÅÎã®Î∞?*/}
      <header className="bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-40">
        <button onClick={() => { setImage(null); setResult(null); setActiveTab('find'); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Home className="w-6 h-6 text-blue-600" />
        </button>
        <h1 className="text-xl font-black text-blue-600 tracking-tighter">HANDS CAR</h1>
        <button onClick={() => setShowLogin(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-slate-400" />
        </button>
      </header>

      {/* Î©îÏù∏ Ïª®ÌÖêÏ∏??ÅÏó≠ */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'find' && (
          <div className="p-6 space-y-6">
            {!image ? (
              <div className="space-y-8 py-10 text-center">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-blue-100 rounded-full animate-pulse"></div>
                  <div className="relative bg-white p-8 rounded-full shadow-lg">
                    <Camera className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Í≤ΩÍ≥†?±ÏùÑ Ï∞çÏñ¥Ï£ºÏÑ∏??/h2>
                  <p className="text-slate-500 font-medium">AIÍ∞Ä ?§ÏãúÍ∞ÑÏúºÎ°?Î∂ÑÏÑù?¥ÎìúÎ¶ΩÎãà??/p>
                </div>
                <label className="block w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-200 cursor-pointer active:scale-95 transition-transform text-lg">
                  ?¨ÏßÑ Ï¥¨ÏòÅ Î∞??†ÌÉù
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            ) : analyzing ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="w-20 h-20 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-xl font-bold text-blue-600 animate-pulse">AIÍ∞Ä ?ïÎ? Î∂ÑÏÑù Ï§ëÏûÖ?àÎã§...</p>
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
                        <h4 className="text-sm font-black text-blue-600 mb-1 flex items-center gap-1.5"><Info className="w-4 h-4" /> ??Í≤ΩÍ≥†?±Ï? Î¨¥Ïä® ?ªÏù∏Í∞Ä??</h4>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.msg.meaning}</p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-2xl border border-amber-50/50 shadow-sm">
                        <h4 className="text-sm font-black text-amber-600 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> ????Í±¥Í???</h4>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.msg.reason}</p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-2xl border border-emerald-50/50 shadow-sm">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
                            <Wrench className="w-4 h-4" /> ?¥ÎñªÍ≤??òÎ©¥ ?†Íπå??
                          </h4>
                          <button
                            onClick={() => setActiveTab('diy')}
                            className="text-[11px] font-black bg-[#0EA5E9] text-white px-2.5 py-1 rounded-md shadow-sm hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-1"
                          >
                            ?êÍ??òÎ¶¨
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{result.msg.action}</p>
                      </div>
                    </div>
                  )}
                </div>


                {result?.detectedWarnings?.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white border-2 border-slate-100 space-y-4">
                    <h3 className="text-lg font-black">Í∞êÏ???Í≤ΩÍ≥†??/h3>
                    {result.detectedWarnings.map((warning, index) => (
                      <div key={`${warning.label}-${index}`} className="p-4 bg-slate-50 rounded-2xl">
                        <p className="font-black">{warning.display_name}</p>
                        <p className="text-sm text-slate-500">?†Î¢∞?? {(warning.confidence * 100).toFixed(1)}%</p>
                        <p className="text-sm text-slate-500">?ÑÌóò?? {warning.risk_level}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result?.explanation && (
                  <div className="p-6 rounded-3xl bg-white border-2 border-blue-100">
                    <h3 className="text-lg font-black text-blue-600 mb-3">AI ?àÎÇ¥</h3>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{result.explanation}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('map')} className="p-5 bg-white border-2 border-slate-200 rounded-3xl font-bold hover:border-blue-400 transition-all flex flex-col items-center gap-2">
                    <MapPin className="text-blue-600" />
                    Ï£ºÎ? ?ïÎπÑ???àÎÇ¥
                  </button>
                  <button className="p-5 bg-white border-2 border-slate-200 rounded-3xl font-bold hover:border-blue-400 transition-all flex flex-col items-center gap-2">
                    <Search className="text-blue-600" />
                    Î∂Ä??Í∞ÄÍ≤?Ï∞æÍ∏∞
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DIY ??*/}
        {activeTab === 'diy' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              {diyStep > 1 && (
                <button onClick={() => setDiyStep(prev => prev - 1)} className="p-2 bg-white rounded-xl shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-2xl font-black">?êÍ??ïÎπÑ Í∞Ä?¥Îìú</h2>
            </div>

            {diyStep === 1 && (
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">1. ?úÏ°∞?¨Î? ?†ÌÉù?òÏÑ∏??/label>
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
                  <span className="font-bold text-blue-700">{selectedBrand}Í∞Ä ?†ÌÉù??/span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">Ï∞®Ï¢Ö ?†ÌÉù</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="">Ï∞®Ï¢Ö???†ÌÉù?òÏÑ∏??/option>
                      {MANUFACTURERS.find(b => b.name === selectedBrand)?.models.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">?ùÏÇ∞ ?∞ÎèÑ</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 appearance-none"
                    >
                      <option value="">?ùÏÇ∞ ?∞ÎèÑÎ•??†ÌÉù?òÏÑ∏??/option>
                      {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => (
                        <option key={y} value={y}>{y}?ÑÏãù</option>
                      ))}
                    </select>
                  </div>
                  <button
                    disabled={!selectedModel || !selectedYear}
                    onClick={() => setDiyStep(3)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 disabled:bg-slate-300 transition-all"
                  >
                    ?§Ïùå ?®Í≥ÑÎ°?
                  </button>
                </div>
              </div>
            )}

            {diyStep === 3 && (
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">?ïÎπÑ ??™©???†ÌÉù?òÏÑ∏??/label>
                <div className="space-y-2">
                  {DIY_ITEMS.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedDiy(item); setDiyStep(4); }}
                      className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold flex justify-between items-center hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                      {item.name}
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {diyStep === 4 && selectedDiy && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="relative aspect-video bg-slate-200 rounded-3xl overflow-hidden shadow-inner">
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                    [Ï∞®Îüâ ?ïÎπÑ ?ÑÏπò ?¥Î?ÏßÄ - {selectedDiy.name}]
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
                    {selectedDiy.name} Î∞©Î≤ï
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl font-medium text-slate-700 leading-relaxed min-h-[100px]">
                    {selectedDiy.desc}
                    <br /><br />
                    <span className="text-xs text-slate-400">* Î≥?Í∞Ä?¥Îìú??{selectedBrand} {selectedModel} ({selectedYear}?ÑÏãù) Í∏∞Ï??ÖÎãà??</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ÏßÄ????*/}
        {activeTab === 'map' && (
          <div className="h-full flex flex-col">
            <div className="relative flex-1 bg-blue-50">
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  key={getMapEmbedUrl()}
                  title="map"
                  src={getMapEmbedUrl()}
                  className="w-full h-full border-none"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

            </div>

            <div className="bg-white p-6 rounded-t-[40px] -mt-10 shadow-2xl z-20 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black">Ï£ºÎ? ?ïÎπÑ??/h2>
                  <p className="text-slate-400 text-sm font-bold">???ÑÏπò Í∏∞Ï? Î∞òÍ≤Ω 5km</p>

                  <div className="mt-3 space-y-2">
                    <input
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applyAddressToMap()}
                      placeholder="?? ?∏Ï≤ú ?úÍµ¨ Í∞Ä?ïÎèô, Ï£ºÏïà?? Í≤Ä?®ÏÇ¨Í±∞Î¶¨??
                      className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={applyAddressToMap}
                        className="py-3 px-3 bg-blue-600 text-white rounded-2xl font-bold text-sm"
                      >
                        ?ÖÎ†• Ï£ºÏÜåÎ°?Î≥¥Í∏∞
                      </button>
                      <button
                        onClick={getUserLocation}
                        className="py-3 px-3 bg-slate-900 text-white rounded-2xl font-bold text-sm"
                      >
                        {isLocating ? '?ïÏù∏ Ï§?..' : '?ÑÏû¨ ?ÑÏπò ?¨Ïö©'}
                      </button>
                    </div>

                    <button
                      onClick={() => setShowNearbyMapModal(true)}
                      className="w-full py-3 px-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm"
                    >
                      ???ÑÏπòÎ°?ÏßÄ???±Ïóê???ïÎπÑ??Ï∞æÍ∏∞
                    </button>
                  </div>

                  {selectedAddress && (
                    <p className="mt-2 text-xs text-blue-600 font-bold">
                      Í∏∞Ï? Ï£ºÏÜå: {selectedAddress}
                    </p>
                  )}

                  {userLocation && !selectedAddress && (
                    <p className="mt-2 text-xs text-blue-600 font-bold">
                      ?ÑÏû¨ ?ÑÏπò: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                      <br />
                      ?ïÌôï?? ??{Math.round(userLocation.accuracy)}m
                    </p>
                  )}

                  {locationError && (
                    <p className="mt-2 text-xs text-red-500 font-bold">
                      {locationError}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">???ºÎ∞ò</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">???êÏú†Ï≤òÎ¶¨</span>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {SHOPS.map(shop => (
                  <div
                    key={shop.id}
                    onMouseEnter={() => setHoveredShop(shop.id)}
                    onMouseLeave={() => setHoveredShop(null)}
                    onClick={() => setShowMapModal(shop)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group flex justify-between items-center ${shop.type === 'oil' ? 'border-green-50 hover:border-green-400 bg-green-50/30' : 'border-slate-50 hover:border-blue-400'}`}
                  >
                    <div>
                      <h4 className="font-black text-slate-800">{shop.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{shop.addr}</p>
                    </div>
                    <Navigation className={`w-5 h-5 ${shop.type === 'oil' ? 'text-green-500' : 'text-blue-500'} group-hover:translate-x-1 transition-transform`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Í∏∞Î°ù ??*/}
        {activeTab === 'history' && (
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-black">?òÏùò ?ïÎπÑ Í∏∞Î°ù</h2>

            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Í∏∞Î°ù ?†Ïßú ?†ÌÉù</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none border-2 border-transparent focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">?¥Ïö© (?? ?îÏßÑ ?§Ïùº ÍµêÏ≤¥)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="?ïÎπÑ ?¥Ïö©???ÖÎ†•?òÏÑ∏??.."
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
          { id: 'find', icon: Search, label: '?êÏÉâ' },
          { id: 'diy', icon: Wrench, label: '?êÍ??ïÎπÑ' },
          { id: 'map', icon: MapPin, label: '?ïÎπÑ?? },
          { id: 'history', icon: History, label: 'Í∏∞Î°ù' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-black tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Î°úÍ∑∏??Î™®Îã¨ */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden animate-in zoom-in-95">
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">Î∞òÍ??åÏöî!</h3>
                <button onClick={() => setShowLogin(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>
              <p className="text-slate-500 font-medium">?åÏÖú Í≥ÑÏ†ï?ºÎ°ú Í∞ÑÌé∏?òÍ≤å ?úÏûë?òÏÑ∏??/p>
              <div className="space-y-3">
                <button className="w-full p-4 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-3">Ïπ¥Ïπ¥??Î°úÍ∑∏??/button>
                <button className="w-full p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl flex items-center justify-center gap-3">Íµ¨Í? Î°úÍ∑∏??/button>
                <button className="w-full p-4 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-3">?†Ìîå Î°úÍ∑∏??/button>
                <button className="w-full p-4 bg-slate-100 text-slate-600 font-bold rounded-2xl flex items-center justify-center gap-3">?¥Î©î???åÏõêÍ∞Ä??/button>
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
                <h3 className="text-2xl font-black">ÏßÄ???±Ïóê??Ï∞æÍ∏∞</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {getNearbySearchText()} Í∏∞Ï??ºÎ°ú Í≤Ä?âÌï©?àÎã§.
                </p>
              </div>
              <button onClick={() => setShowNearbyMapModal(false)} className="p-2 bg-slate-100 rounded-full">
                <X />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openNearbyMap('naver')} className="p-4 bg-emerald-500 text-white font-bold rounded-2xl">
                ?§Ïù¥Î≤?ÏßÄ??
              </button>
              <button onClick={() => openNearbyMap('kakao')} className="p-4 bg-[#FEE500] text-black font-bold rounded-2xl">
                Ïπ¥Ïπ¥??Îß?
              </button>
              <button onClick={() => openNearbyMap('google')} className="p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl">
                Íµ¨Í? ÏßÄ??
              </button>
              <button onClick={() => openNearbyMap('apple')} className="p-4 bg-slate-800 text-white font-bold rounded-2xl">
                ?†Ìîå ÏßÄ??
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ?ïÎπÑ???∞Í≤∞ Î™®Îã¨ */}
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
              <button onClick={() => openExternalMap('naver')} className="p-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2">?§Ïù¥Î≤?ÏßÄ??/button>
              <button onClick={() => openExternalMap('kakao')} className="p-4 bg-[#FEE500] text-black font-bold rounded-2xl flex items-center justify-center gap-2">Ïπ¥Ïπ¥??Îß?/button>
              <button onClick={() => openExternalMap('google')} className="p-4 bg-white border-2 border-slate-100 font-bold rounded-2xl flex items-center justify-center gap-2">Íµ¨Í? ÏßÄ??/button>
              <button onClick={() => openExternalMap('apple')} className="p-4 bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2">?†Ìîå ÏßÄ??/button>
            </div>
            <button className="w-full py-5 bg-blue-600 text-white rounded-3xl font-bold shadow-xl shadow-blue-100">?ïÎπÑ ?àÏïΩ?òÍ∏∞</button>
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

