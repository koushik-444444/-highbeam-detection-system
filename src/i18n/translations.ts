export type Language = 'en' | 'hi' | 'mr' | 'te';

export type TranslationKey =
  | 'appName'
  | 'detectionSystem'
  | 'dashboard'
  | 'admin'
  | 'login'
  | 'logout'
  | 'vehicleNumber'
  | 'dateOfBirth'
  | 'authenticate'
  | 'authenticating'
  | 'violation'
  | 'violations'
  | 'violationDetected'
  | 'totalViolations'
  | 'pendingFines'
  | 'paidFines'
  | 'totalAmount'
  | 'violationHistory'
  | 'records'
  | 'allClear'
  | 'noViolationsFound'
  | 'fine'
  | 'pay'
  | 'payNow'
  | 'paid'
  | 'unpaid'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'dismissed'
  | 'evidence'
  | 'evidenceNotAvailable'
  | 'time'
  | 'location'
  | 'intensity'
  | 'camera'
  | 'aiConfidence'
  | 'highBeamViolation'
  | 'backToHome'
  | 'aiDetection'
  | 'loading'
  | 'loadingDashboard'
  | 'loadingExperience'
  | 'ready'
  | 'adminPortal'
  | 'managementPortal'
  | 'email'
  | 'password'
  | 'invalidCredentials'
  | 'totalDetections'
  | 'pendingApproval'
  | 'revenue'
  | 'searchPlaceholder'
  | 'all'
  | 'violationManagement'
  | 'vehicle'
  | 'status'
  | 'actions'
  | 'approve'
  | 'reject'
  | 'details'
  | 'noViolationsFoundAdmin'
  | 'downloadChallan'
  | 'exportCSV'
  | 'selectAll'
  | 'bulkApprove'
  | 'bulkReject'
  | 'selected'
  | 'analytics'
  | 'violationsPerDay'
  | 'peakHours'
  | 'fineCollection'
  | 'vehicleTypes'
  | 'timeline'
  | 'listView'
  | 'timelineView'
  | 'shortcuts'
  | 'pressEscToClose'
  | 'soundOn'
  | 'soundOff';

type Translations = Record<Language, Record<TranslationKey, string>>;

export const translations: Translations = {
  en: {
    appName: 'High Beam',
    detectionSystem: 'Detection System',
    dashboard: 'Dashboard',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    vehicleNumber: 'Vehicle No.',
    dateOfBirth: 'Date of Birth',
    authenticate: 'Authenticate',
    authenticating: 'Authenticating...',
    violation: 'Violation',
    violations: 'Violations',
    violationDetected: 'Violation Detected',
    totalViolations: 'Total Violations',
    pendingFines: 'Pending Fines',
    paidFines: 'Paid Fines',
    totalAmount: 'Total Amount',
    violationHistory: 'Violation History',
    records: 'Records',
    allClear: 'All Clear',
    noViolationsFound: 'No violations found for your vehicle.',
    fine: 'Fine',
    pay: 'Pay',
    payNow: 'Pay Now',
    paid: 'Paid',
    unpaid: 'Unpaid',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    dismissed: 'Dismissed',
    evidence: 'Evidence',
    evidenceNotAvailable: 'Evidence not available',
    time: 'Time',
    location: 'Location',
    intensity: 'Intensity',
    camera: 'Camera',
    aiConfidence: 'AI Confidence',
    highBeamViolation: 'High Beam Violation Detected',
    backToHome: 'Back to Home',
    aiDetection: 'AI Detection',
    loading: 'Loading...',
    loadingDashboard: 'Loading Dashboard...',
    loadingExperience: 'Loading Experience',
    ready: 'Ready',
    adminPortal: 'Admin Portal',
    managementPortal: 'Management Portal',
    email: 'Email',
    password: 'Password',
    invalidCredentials: 'Invalid credentials',
    totalDetections: 'Total Detections',
    pendingApproval: 'Pending Approval',
    revenue: 'Revenue',
    searchPlaceholder: 'Search vehicle or location...',
    all: 'All',
    violationManagement: 'Violation Management',
    vehicle: 'Vehicle',
    status: 'Status',
    actions: 'Actions',
    approve: 'Approve',
    reject: 'Reject',
    details: 'Details',
    noViolationsFoundAdmin: 'No violations found',
    downloadChallan: 'Download Challan',
    exportCSV: 'Export CSV',
    selectAll: 'Select All',
    bulkApprove: 'Approve Selected',
    bulkReject: 'Reject Selected',
    selected: 'selected',
    analytics: 'Analytics',
    violationsPerDay: 'Violations per Day',
    peakHours: 'Peak Hours',
    fineCollection: 'Fine Collection',
    vehicleTypes: 'Vehicle Types',
    timeline: 'Timeline',
    listView: 'List View',
    timelineView: 'Timeline View',
    shortcuts: 'Keyboard Shortcuts',
    pressEscToClose: 'Press Esc to close',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
  },
  hi: {
    appName: 'हाई बीम',
    detectionSystem: 'डिटेक्शन सिस्टम',
    dashboard: 'डैशबोर्ड',
    admin: 'एडमिन',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    vehicleNumber: 'वाहन नंबर',
    dateOfBirth: 'जन्म तिथि',
    authenticate: 'प्रमाणित करें',
    authenticating: 'प्रमाणित हो रहा है...',
    violation: 'उल्लंघन',
    violations: 'उल्लंघन',
    violationDetected: 'उल्लंघन पाया गया',
    totalViolations: 'कुल उल्लंघन',
    pendingFines: 'लंबित जुर्माना',
    paidFines: 'भुगतान किया गया',
    totalAmount: 'कुल राशि',
    violationHistory: 'उल्लंघन इतिहास',
    records: 'रिकॉर्ड',
    allClear: 'सब ठीक है',
    noViolationsFound: 'आपके वाहन के लिए कोई उल्लंघन नहीं मिला।',
    fine: 'जुर्माना',
    pay: 'भुगतान',
    payNow: 'अभी भुगतान करें',
    paid: 'भुगतान किया',
    unpaid: 'अवैतनिक',
    pending: 'लंबित',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    dismissed: 'खारिज',
    evidence: 'साक्ष्य',
    evidenceNotAvailable: 'साक्ष्य उपलब्ध नहीं',
    time: 'समय',
    location: 'स्थान',
    intensity: 'तीव्रता',
    camera: 'कैमरा',
    aiConfidence: 'AI विश्वास',
    highBeamViolation: 'हाई बीम उल्लंघन पाया गया',
    backToHome: 'होम पर वापस',
    aiDetection: 'AI डिटेक्शन',
    loading: 'लोड हो रहा है...',
    loadingDashboard: 'डैशबोर्ड लोड हो रहा है...',
    loadingExperience: 'अनुभव लोड हो रहा है',
    ready: 'तैयार',
    adminPortal: 'एडमिन पोर्टल',
    managementPortal: 'प्रबंधन पोर्टल',
    email: 'ईमेल',
    password: 'पासवर्ड',
    invalidCredentials: 'अमान्य क्रेडेंशियल',
    totalDetections: 'कुल डिटेक्शन',
    pendingApproval: 'स्वीकृति लंबित',
    revenue: 'राजस्व',
    searchPlaceholder: 'वाहन या स्थान खोजें...',
    all: 'सभी',
    violationManagement: 'उल्लंघन प्रबंधन',
    vehicle: 'वाहन',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',
    details: 'विवरण',
    noViolationsFoundAdmin: 'कोई उल्लंघन नहीं मिला',
    downloadChallan: 'चालान डाउनलोड करें',
    exportCSV: 'CSV निर्यात करें',
    selectAll: 'सभी चुनें',
    bulkApprove: 'चयनित स्वीकृत करें',
    bulkReject: 'चयनित अस्वीकार करें',
    selected: 'चयनित',
    analytics: 'विश्लेषण',
    violationsPerDay: 'प्रति दिन उल्लंघन',
    peakHours: 'पीक घंटे',
    fineCollection: 'जुर्माना संग्रह',
    vehicleTypes: 'वाहन प्रकार',
    timeline: 'समयरेखा',
    listView: 'सूची दृश्य',
    timelineView: 'समयरेखा दृश्य',
    shortcuts: 'कीबोर्ड शॉर्टकट',
    pressEscToClose: 'बंद करने के लिए Esc दबाएं',
    soundOn: 'ध्वनि चालू',
    soundOff: 'ध्वनि बंद',
  },
  mr: {
    appName: 'हाय बीम',
    detectionSystem: 'डिटेक्शन सिस्टम',
    dashboard: 'डॅशबोर्ड',
    admin: 'अॅडमिन',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    vehicleNumber: 'वाहन क्रमांक',
    dateOfBirth: 'जन्मतारीख',
    authenticate: 'प्रमाणित करा',
    authenticating: 'प्रमाणित होत आहे...',
    violation: 'उल्लंघन',
    violations: 'उल्लंघने',
    violationDetected: 'उल्लंघन आढळले',
    totalViolations: 'एकूण उल्लंघने',
    pendingFines: 'प्रलंबित दंड',
    paidFines: 'भरलेला दंड',
    totalAmount: 'एकूण रक्कम',
    violationHistory: 'उल्लंघन इतिहास',
    records: 'नोंदी',
    allClear: 'सर्व ठीक',
    noViolationsFound: 'तुमच्या वाहनासाठी उल्लंघन आढळले नाही.',
    fine: 'दंड',
    pay: 'भरा',
    payNow: 'आता भरा',
    paid: 'भरले',
    unpaid: 'न भरलेले',
    pending: 'प्रलंबित',
    approved: 'मंजूर',
    rejected: 'नाकारले',
    dismissed: 'रद्द',
    evidence: 'पुरावा',
    evidenceNotAvailable: 'पुरावा उपलब्ध नाही',
    time: 'वेळ',
    location: 'स्थान',
    intensity: 'तीव्रता',
    camera: 'कॅमेरा',
    aiConfidence: 'AI विश्वास',
    highBeamViolation: 'हाय बीम उल्लंघन आढळले',
    backToHome: 'मुख्यपृष्ठावर परत',
    aiDetection: 'AI डिटेक्शन',
    loading: 'लोड होत आहे...',
    loadingDashboard: 'डॅशबोर्ड लोड होत आहे...',
    loadingExperience: 'अनुभव लोड होत आहे',
    ready: 'तयार',
    adminPortal: 'अॅडमिन पोर्टल',
    managementPortal: 'व्यवस्थापन पोर्टल',
    email: 'ईमेल',
    password: 'पासवर्ड',
    invalidCredentials: 'अवैध क्रेडेंशियल',
    totalDetections: 'एकूण डिटेक्शन',
    pendingApproval: 'मंजुरी प्रलंबित',
    revenue: 'महसूल',
    searchPlaceholder: 'वाहन किंवा स्थान शोधा...',
    all: 'सर्व',
    violationManagement: 'उल्लंघन व्यवस्थापन',
    vehicle: 'वाहन',
    status: 'स्थिती',
    actions: 'कृती',
    approve: 'मंजूर करा',
    reject: 'नाकारा',
    details: 'तपशील',
    noViolationsFoundAdmin: 'उल्लंघन आढळले नाही',
    downloadChallan: 'चलन डाउनलोड करा',
    exportCSV: 'CSV निर्यात करा',
    selectAll: 'सर्व निवडा',
    bulkApprove: 'निवडलेले मंजूर करा',
    bulkReject: 'निवडलेले नाकारा',
    selected: 'निवडले',
    analytics: 'विश्लेषण',
    violationsPerDay: 'दररोज उल्लंघने',
    peakHours: 'पीक तास',
    fineCollection: 'दंड संकलन',
    vehicleTypes: 'वाहन प्रकार',
    timeline: 'टाइमलाइन',
    listView: 'यादी दृश्य',
    timelineView: 'टाइमलाइन दृश्य',
    shortcuts: 'कीबोर्ड शॉर्टकट',
    pressEscToClose: 'बंद करण्यासाठी Esc दाबा',
    soundOn: 'ध्वनी चालू',
    soundOff: 'ध्वनी बंद',
  },
  te: {
    appName: 'హై బీమ్',
    detectionSystem: 'డిటెక్షన్ సిస్టమ్',
    dashboard: 'డాష్‌బోర్డ్',
    admin: 'అడ్మిన్',
    login: 'లాగిన్',
    logout: 'లాగౌట్',
    vehicleNumber: 'వాహన నంబర్',
    dateOfBirth: 'పుట్టిన తేదీ',
    authenticate: 'ధృవీకరించండి',
    authenticating: 'ధృవీకరిస్తోంది...',
    violation: 'ఉల్లంఘన',
    violations: 'ఉల్లంఘనలు',
    violationDetected: 'ఉల్లంఘన కనుగొనబడింది',
    totalViolations: 'మొత్తం ఉల్లంఘనలు',
    pendingFines: 'పెండింగ్ జరిమానాలు',
    paidFines: 'చెల్లించిన జరిమానాలు',
    totalAmount: 'మొత్తం మొత్తం',
    violationHistory: 'ఉల్లంఘన చరిత్ర',
    records: 'రికార్డులు',
    allClear: 'అంతా సరిగ్గా ఉంది',
    noViolationsFound: 'మీ వాహనానికి ఉల్లంఘనలు కనుగొనబడలేదు.',
    fine: 'జరిమానా',
    pay: 'చెల్లించు',
    payNow: 'ఇప్పుడే చెల్లించండి',
    paid: 'చెల్లించారు',
    unpaid: 'చెల్లించలేదు',
    pending: 'పెండింగ్',
    approved: 'ఆమోదించబడింది',
    rejected: 'తిరస్కరించబడింది',
    dismissed: 'కొట్టివేయబడింది',
    evidence: 'సాక్ష్యం',
    evidenceNotAvailable: 'సాక్ష్యం అందుబాటులో లేదు',
    time: 'సమయం',
    location: 'స్థానం',
    intensity: 'తీవ్రత',
    camera: 'కెమెరా',
    aiConfidence: 'AI నమ్మకం',
    highBeamViolation: 'హై బీమ్ ఉల్లంఘన కనుగొనబడింది',
    backToHome: 'హోమ్‌కి తిరిగి వెళ్ళు',
    aiDetection: 'AI డిటెక్షన్',
    loading: 'లోడ్ అవుతోంది...',
    loadingDashboard: 'డాష్‌బోర్డ్ లోడ్ అవుతోంది...',
    loadingExperience: 'అనుభవం లోడ్ అవుతోంది',
    ready: 'సిద్ధం',
    adminPortal: 'అడ్మిన్ పోర్టల్',
    managementPortal: 'మేనేజ్‌మెంట్ పోర్టల్',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    invalidCredentials: 'చెల్లని క్రెడెన్షియల్స్',
    totalDetections: 'మొత్తం డిటెక్షన్లు',
    pendingApproval: 'ఆమోదం పెండింగ్',
    revenue: 'ఆదాయం',
    searchPlaceholder: 'వాహనం లేదా స్థానం శోధించండి...',
    all: 'అన్నీ',
    violationManagement: 'ఉల్లంఘన నిర్వహణ',
    vehicle: 'వాహనం',
    status: 'స్థితి',
    actions: 'చర్యలు',
    approve: 'ఆమోదించు',
    reject: 'తిరస్కరించు',
    details: 'వివరాలు',
    noViolationsFoundAdmin: 'ఉల్లంఘనలు కనుగొనబడలేదు',
    downloadChallan: 'చలాన్ డౌన్‌లోడ్ చేయండి',
    exportCSV: 'CSV ఎగుమతి చేయండి',
    selectAll: 'అన్నీ ఎంచుకోండి',
    bulkApprove: 'ఎంపిక చేసినవి ఆమోదించండి',
    bulkReject: 'ఎంపిక చేసినవి తిరస్కరించండి',
    selected: 'ఎంపిక చేయబడింది',
    analytics: 'విశ్లేషణలు',
    violationsPerDay: 'రోజుకు ఉల్లంఘనలు',
    peakHours: 'పీక్ గంటలు',
    fineCollection: 'జరిమానా సేకరణ',
    vehicleTypes: 'వాహన రకాలు',
    timeline: 'టైమ్‌లైన్',
    listView: 'జాబితా వీక్షణ',
    timelineView: 'టైమ్‌లైన్ వీక్షణ',
    shortcuts: 'కీబోర్డ్ షార్ట్‌కట్స్',
    pressEscToClose: 'మూసివేయడానికి Esc నొక్కండి',
    soundOn: 'సౌండ్ ఆన్',
    soundOff: 'సౌండ్ ఆఫ్',
  },
};
