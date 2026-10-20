import React, { useState } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Globe,
  Layers,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { STORES } from '../data/mockData';

export const StoreResearchLab: React.FC = () => {
  const [testBarcode, setTestBarcode] = useState('7290004131074');
  const [testQty, setTestQty] = useState('2');
  const [testStoreDomain, setTestStoreDomain] = useState('www.carrefour.co.il');
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'tester' | 'legal' | 'platform'>('matrix');

  const generatedTestUrl = `https://${testStoreDomain}/?externalCart=${testBarcode},${testQty}&externalName=SalKal`;

  const chainResearchDetails = [
    {
      name: 'קרפור / יינות ביתן (מגה)',
      platform: 'Self-Point (Stor.ai)',
      handoff: 'externalCart פרמטר עובד ישירות (נבדק ב-19.10.2026)',
      login: 'לא נדרש (סל אורח)',
      confidence: 'גבוה (High)',
      notes: 'לחיצה על הקישור פותחת דיאלוג ייבוא, מוסיפה מוצרים לסל אורח ולאחר מכן מקפיצה בחירת כתובת.',
    },
    {
      name: 'ויקטורי (Victory)',
      platform: 'Self-Point (Stor.ai)',
      handoff: 'externalCart פרמטר עובד ישירות',
      login: 'לא נדרש (סל אורח)',
      confidence: 'גבוה (High)',
      notes: 'נפתח דיאלוג "המוצרים שלכם מאתר SalKal" עם כפתור "הוסיפו מוצרים לסל". כ-₪7.5M/חודש מכירות בוולט.',
    },
    {
      name: 'מחסני השוק (MCK)',
      platform: 'Self-Point (Stor.ai)',
      handoff: 'externalCart פרמטר עובד ישירות',
      login: 'לא נדרש (סל אורח)',
      confidence: 'גבוה (High)',
      notes: 'זהה לקרפור. פותח דיאלוג הזנה מהיר ללא צורך בהרשמה.',
    },
    {
      name: 'קשת טעמים',
      platform: 'Self-Point (Stor.ai)',
      handoff: 'externalCart פרמטר עובד ישירות',
      login: 'לא נדרש (סל אורח)',
      confidence: 'גבוה (High)',
      notes: 'מבוסס על תבנית Self-Point, פועל ללא צורך בחשבון רשום מראש.',
    },
    {
      name: 'טיב טעם (Tiv Taam)',
      platform: 'Self-Point (Stor.ai)',
      handoff: 'externalCart פרמטר עובד (דורש אישור עוגיות)',
      login: 'לא נדרש',
      confidence: 'בינוני (Medium)',
      notes: 'בבדיקה הופיע דיאלוג לאחר אישור עוגיות; נדרש לוודא התאמת קטלוג ברקודים ספציפי לרשת.',
    },
    {
      name: 'רמי לוי שיווק השקמה',
      platform: 'Custom Nuxt/Vue',
      handoff: 'קנייה מהירה (Quick Buy) - הדבקת טקסט חופשי',
      login: 'נדרש (קשור לחשבון)',
      confidence: 'בינוני (Medium)',
      notes: 'מנגנון "קנייה מהירה" באתר מאפשר הדבקת רשימת טקסט חופשי ומתאים מוצרים ישירות לסל.',
    },
    {
      name: 'שופרסל (Shufersal)',
      platform: 'SAP Hybris/Commerce',
      handoff: 'שותפים לקנייה / קישורי חיפוש ישירים',
      login: 'נדרש (חשבון)',
      confidence: 'בינוני (Medium)',
      notes: 'אין דיפלינק פומבי פתוח. פרויקטי קהילה (shufersal-mcp) מריצים אוטומציה אך כרוכים בסיכון תנאי שימוש.',
    },
    {
      name: 'אושר עד (Osher Ad)',
      platform: 'אין אתר אונליין',
      handoff: 'מסלול הליכה בסניף ממוין לפי מעברים',
      login: 'לא רלוונטי',
      confidence: 'גבוה (High)',
      notes: 'סניפים פיזיים בלבד (מחסני ענק). הפתרון המוביל: רשימת מעברים חכמה להדפסה או לנייד.',
    },
    {
      name: 'AM:PM',
      platform: 'Wolt בלבד',
      handoff: 'דף סניף Wolt ייעודי',
      login: 'חשבון Wolt',
      confidence: 'גבוה (High)',
      notes: 'אתר האונליין העצמאי נסגר לחלוטין. כל המשלוחים מתבצעים דרך Wolt.',
    },
    {
      name: 'יוחננוף (Yochananof)',
      platform: 'Custom Next.js / TWA',
      handoff: 'רשימה להדבקה / שיתוף',
      login: 'נדרש',
      confidence: 'נמוך-בינוני',
      notes: 'אתר מותאם ו-TWA בחנות Play. לא נמצאה חשיפת עגלה פומבית.',
    },
    {
      name: 'חצי חינם (Hatzi Hinam)',
      platform: 'Custom Angular SPA (Azure)',
      handoff: 'רשימה להדבקה',
      login: 'נדרש',
      confidence: 'נמוך-בינוני',
      notes: 'עגלה סגורה מאחורי robots.txt והתחברות.',
    },
    {
      name: 'סופר-פארם (Super-Pharm)',
      platform: 'SAP Hybris',
      handoff: 'רשימת מוצרים / חיפוש',
      login: 'נדרש',
      confidence: 'נמוך-בינוני',
      notes: 'תשתית SAP Commerce, דורש הזנה מבוססת חיפוש.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-xs font-semibold text-emerald-400">
          <FileText className="w-3.5 h-3.5" />
          <span>מעבדת מחקר ואימות טכנולוגי (מעודכן אוקטובר 2026)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          מיפוי טכנולוגי של רשתות הסופרמרקט בישראל
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          ניתוח מעמיק של מנגנוני העברת סל, תשתיות eCommerce (Self-Point, Hybris, Nuxt), בדיקות דפדפן חיות, והשוואת אסטרטגיית Web/PWA מול אפליקציית Android ייעודית.
        </p>

        {/* Sub-tab Navigation */}
        <div className="pt-4 flex flex-wrap gap-2 border-t border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            טבלת 12 הרשתות והפלטפורמות
          </button>
          <button
            onClick={() => setActiveSubTab('tester')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'tester'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            בודק קישורים חי (externalCart Tester)
          </button>
          <button
            onClick={() => setActiveSubTab('platform')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'platform'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            הכרעה: PWA / Web מול אנדרואיד
          </button>
          <button
            onClick={() => setActiveSubTab('legal')}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'legal'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            היבטים משפטיים ורגולטוריים בישראל
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Chain Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                סטטוס העברת סל מלא בכל רשתות השיווק
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                בדיקות שבוצעו בפועל על גבי פלטפורמות ה-eCommerce של הרשתות
              </p>
            </div>
            <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg font-semibold">
              5 רשתות תומכות בהעברה אוטומטית מלאה ללא צורך בהתחברות!
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">רשת שיווק</th>
                  <th className="p-3">תשתית תוכנה</th>
                  <th className="p-3">שיטת העברת סל (Handoff)</th>
                  <th className="p-3">התחברות?</th>
                  <th className="p-3">רמת בטחון</th>
                  <th className="p-3">ממצאים ובדיקות שטח</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chainResearchDetails.map((chain, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      {chain.name}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {chain.platform}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {chain.handoff}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          chain.login.includes('לא')
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {chain.login}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-semibold">
                      {chain.confidence}
                    </td>
                    <td className="p-3 text-slate-600 leading-normal max-w-xs">
                      {chain.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Live externalCart Parameter Tester */}
      {activeSubTab === 'tester' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              מעבדת בדיקת פרמטר externalCart של Stor.ai / Self-Point
            </h3>
            <p className="text-xs text-slate-500">
              באפשרותכם לבדוק בזמן אמת כיצד הרשתות מגיבות לפרמטרים מותאמים אישית
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">בחר רשת יעד לבדיקה:</label>
              <select
                value={testStoreDomain}
                onChange={(e) => setTestStoreDomain(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl"
              >
                <option value="www.carrefour.co.il">קרפור (carrefour.co.il)</option>
                <option value="www.victoryonline.co.il">ויקטורי (victoryonline.co.il)</option>
                <option value="www.mck.co.il">מחסני השוק (mck.co.il)</option>
                <option value="www.keshet-teamim.co.il">קשת טעמים (keshet-teamim.co.il)</option>
                <option value="www.tivtaam.co.il">טיב טעם (tivtaam.co.il)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ברקוד מוצר לבדיקה:</label>
              <input
                type="text"
                value={testBarcode}
                onChange={(e) => setTestBarcode(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                למשל: 7290000042404 (חלב תנובה 3%) או 7290000048406 (קוטג׳)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">כמות יחידות:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={testQty}
                onChange={(e) => setTestQty(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Generated URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">ה-URL שנוצר:</label>
            <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs break-all select-all">
              {generatedTestUrl}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.open(generatedTestUrl, '_blank', 'noopener,noreferrer')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>פתח בחלון חדש ובדוק תגובת האתר</span>
            </button>
          </div>

          {/* Caveat Callout from live research */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>הערות חשובות מתוך בדיקות המעבדה ב-19.10.2026:</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pt-1">
              <li>בדיקת הברקוד 7290000042442 החזירה חלב תנובה ולא קוטג' — יש לוודא מיפוי נכון של קטלוג השקיפות הממשלתי.</li>
              <li>מוצר שאינו במלאי בסניף הרשת יידלג אוטומטית (Skip) והעגלה תמשיך עם שאר המוצרים.</li>
              <li>לאחר לחיצה על "הוסיפו מוצרים לסל", האתר מבקש בחירת סניף / כתובת למשלוח, ורק לאחר מכן מחשב את מחירי הסניף הספציפי.</li>
            </ul>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Web/PWA vs Android App Analysis */}
      {activeSubTab === 'platform' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              הכרעה אסטרטגית: Progressive Web App (PWA) מול אפליקציית Android מקורית
            </h3>
            <p className="text-xs text-slate-500">
              תשובה לשאלתכם: מדוע תחילת הדרך ב-PWA / Web View היא הבחירה הטובה והבטוחה ביותר ל-MVP
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PWA / Responsive Web Column (Winner for MVP) */}
            <div className="p-5 bg-emerald-50/40 rounded-2xl border-2 border-emerald-500 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>גישת PWA / Web View (המומלצת ל-MVP)</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold">
                  המסלול הזוכה
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>שמירת עוגיות והתחברות קיימת:</strong> משתמשים כבר מחוברים לאתרי שופרסל, רמי לוי וקרפור בדפדפן הנייד שלהם (Chrome / Safari). מעבר מה-Web פותח את הסל בתוך הסשן המחובר שלהם ללא צורך בהתחברות חוזרת!</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>עקיפת חסימות WebView:</strong> רכיב Android WebView סובל מחסימות עוגיות צד שלישי (3rd-party cookie blocking) ומנגנוני הגנה של Cloudflare/Imperva שיכולים לחסום אתרי סופר בתוך אפליקציה.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ללא תלות באישור Google Play:</strong> עדכונים לשיטות ההעברה, תיקוני ברקודים ורשתות חדשות זמינים מיידית לכל המשתמשים באותו הרגע ללא המתנה לבדיקת גוגל.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>התקנה בלחיצה אחת לאייקון מסך הבית:</strong> תקן PWA מלא מאפשר הוספה למסך הבית ונראה בדיוק כמו אפליקציית נייד לכל דבר.</span>
                </li>
              </ul>
            </div>

            {/* Native Android App Column */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm">
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <span>אפליקציית Android ייעודית (שלב ב׳)</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-bold">
                  מתאים להמשך
                </span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>גישה לסורק ברקוד מצלמה מהיר:</strong> שימושי בעיקר לסריקת מוצרים ישירות מהמקרר בבית (אך ניתן למימוש גם דרך מצלמת Web ב-PWA).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>התראות Push מקומיות:</strong> שליחת תזכורת בימי חמישי להזמנת ארוחת שבת (שבת שלום!).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>עטיפת TWA (Trusted Web Activity):</strong> בהמשך ניתן לקחת את ה-PWA שבנינו כאן ולעטוף אותו ב-TWA לחנות Play בתוך שעות בודדות!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Legal & Regulatory Framework */}
      {activeSubTab === 'legal' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs text-slate-700 leading-relaxed">
          <h3 className="text-base font-bold text-slate-900">
            המסגרת המשפטית והציות בישראל
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>חוק קידום התחרות בענף המזון (תשע״ד-2014)</span>
              </div>
              <p>
                החוק מחייב את כל רשתות השיווק הגדולות בישראל לפרסם קבצי מחירים ומבצעים מלאים ופומביים בכל שעה. השימוש בנתוני שקיפות אלו להשוואת מחירים הינו חוקי, מעודד תחרות ומוגן על פי דין.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>חוק המחשבים, תשנ״ה-1995 ותנאי שימוש</span>
              </div>
              <p>
                שימוש בפרמטרי URL פומביים שהאתר מעבד בעצמו (כמו externalCart של Self-Point או קנייה מהירה של רמי לוי) אינו מהווה חדירה לחומר מחשב. יש להימנע מגירוד מאחורי סיסמת משתמש או עקיפת הנחיות robots.txt כדי להישאר בטוחים ב-100%.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>חוק הגנת הפרטיות (תיקון 13, נכנס לתוקף אוגוסט 2025)</span>
              </div>
              <p>
                האפליקציה מאפשרת חוויית אורח מלאה ללא חובת הרשמה (No-Login First). רשימות קניות נשמרות מקומית בדפדפן (LocalStorage / IndexedDB), ללא איסוף נתונים רגישים על הרגלי צריכה.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>פנייה עסקית ל-Stor.ai (Self-Point)</span>
              </div>
              <p>
                Stor.ai משרתת 8 מתוך 10 הקמעונאים הגדולים בישראל. שיתוף פעולה ישיר עמם (development@stor.ai) מאפשר חיבור רשמי ב-API אחד לכל הרשתות: קרפור, ויקטורי, מחסני השוק, קשת טעמים וטיב טעם.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
