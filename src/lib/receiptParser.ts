import Tesseract from 'tesseract.js';
import { Category } from '@/types/expense';

export type ScanLanguage = 'eng' | 'chi_sim' | 'deu';

export interface LanguageOption {
  code: ScanLanguage;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'chi_sim', label: '中文 (简体)', flag: '🇨🇳' },
  { code: 'eng', label: 'English', flag: '🇺🇸' },
  { code: 'deu', label: 'Deutsch', flag: '🇩🇪' },
];

export interface ParsedReceipt {
  amount: number | null;
  date: string | null;
  description: string | null;
  category: Category;
  rawText: string;
  confidence: number;
  currency: string;
  currencySymbol: string;
  scannedImage?: string; // Base64 image data
}

// Currency mapping based on language
export const LANGUAGE_CURRENCY: Record<ScanLanguage, { currency: string; symbol: string }> = {
  chi_sim: { currency: 'CNY', symbol: '¥' },
  eng: { currency: 'USD', symbol: '$' },
  deu: { currency: 'EUR', symbol: '€' },
};

// Category keywords for auto-categorization (multilingual)
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Housing: [
    // English
    'rent', 'mortgage', 'property tax', 'hoa', 'home insurance', 'landlord',
    'apartment', 'lease', 'housing', 'real estate', 'property',
    // German
    'miete', 'hypothek', 'grundsteuer', 'hausverwaltung', 'wohnung',
    'immobilie', 'vermieter', 'mietvertrag',
    // Chinese
    '房租', '房贷', '物业费', '房产税', '房屋保险', '公寓', '租房',
    '按揭', '住房', '房东',
  ],
  Utilities: [
    // English
    'electric', 'electricity', 'power', 'water', 'gas bill', 'internet',
    'wifi', 'phone', 'mobile', 'verizon', 'at&t', 'tmobile', 't-mobile',
    'comcast', 'spectrum', 'utility', 'utilities',
    // German
    'strom', 'wasser', 'heizung', 'nebenkosten', 'telefon', 'handy',
    'internet', 'rundfunk', 'gez', 'stadtwerke', 'telekom', 'vodafone', 'o2',
    // Chinese
    '电费', '水费', '燃气费', '网费', '话费', '手机费', '宽带',
    '暖气费', '水电', '移动', '联通', '电信',
  ],
  Groceries: [
    // English
    'grocery', 'supermarket', 'whole foods', 'trader joe', 'kroger',
    'safeway', 'walmart', 'target', 'costco', 'aldi', 'publix',
    'food market', 'produce', 'meat', 'dairy',
    // German
    'supermarkt', 'lebensmittel', 'edeka', 'rewe', 'lidl', 'penny',
    'netto', 'kaufland', 'dm', 'rossmann', 'aldi',
    // Chinese
    '超市', '食品', '生鲜', '水果', '蔬菜', '肉', '盒马', '永辉',
    '华润万家', '沃尔玛', '家乐福', '大润发', '便利店', '菜市场',
  ],
  Transportation: [
    // English
    'uber', 'lyft', 'taxi', 'gas', 'fuel', 'shell', 'chevron', 'exxon',
    'bp', 'mobil', 'parking', 'transit', 'metro', 'bus', 'train',
    'car payment', 'auto insurance', 'car insurance', 'maintenance',
    'mechanic', 'oil change', 'tire', 'toll',
    // German
    'tankstelle', 'benzin', 'diesel', 'parkhaus', 'parkplatz', 'bahn',
    'deutsche bahn', 'db', 'taxi', 'öpnv', 'fahrkarte', 'ticket',
    'kfz versicherung', 'autowerkstatt', 'aral', 'jet', 'esso', 'total',
    // Chinese
    '滴滴', '出租车', '打车', '加油', '加油站', '停车', '停车场',
    '地铁', '公交', '火车', '高铁', '车险', '保养', '维修',
    '中石油', '中石化', '壳牌', '车贷',
  ],
  'Dining Out': [
    // English
    'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'bar', 'pub',
    'starbucks', 'mcdonald', 'subway', 'chipotle', 'wendy', 'taco bell',
    'kfc', 'dunkin', 'panera', 'chick-fil-a', 'dine', 'bistro', 'grill',
    // German
    'restaurant', 'bäckerei', 'konditorei', 'café', 'kneipe', 'biergarten',
    'imbiss', 'pizzeria', 'döner',
    // Chinese
    '餐厅', '饭店', '咖啡', '外卖', '美食', '小吃', '火锅', '烧烤',
    '星巴克', '麦当劳', '肯德基', '必胜客', '海底捞', '喜茶', '奈雪',
    '奶茶', '酒吧',
  ],
  Entertainment: [
    // English
    'movie', 'cinema', 'theater', 'theatre', 'netflix', 'spotify', 'hulu',
    'disney', 'hbo', 'amazon prime', 'concert', 'game', 'arcade',
    'bowling', 'museum', 'zoo', 'park', 'amusement', 'hobby', 'sports',
    // German
    'kino', 'theater', 'konzert', 'museum', 'freizeitpark', 'zoo',
    'streaming', 'spiel', 'unterhaltung', 'veranstaltung', 'eintritt',
    // Chinese
    '电影', '电影院', '演唱会', '音乐会', '游戏', '娱乐', '门票',
    '博物馆', '动物园', '游乐园', 'ktv', '网吧', '剧院', '话剧',
    '爱奇艺', '腾讯视频', '优酷', '网易云', 'qq音乐', '健身',
  ],
  Travel: [
    // English
    'airline', 'flight', 'hotel', 'airbnb', 'booking', 'expedia',
    'vacation', 'trip', 'travel', 'resort', 'cruise', 'car rental',
    'hertz', 'enterprise', 'avis', 'hostel', 'motel',
    // German
    'flughafen', 'flug', 'hotel', 'urlaub', 'reise', 'mietwagen',
    'unterkunft', 'pension', 'ferienhaus',
    // Chinese
    '飞机', '机票', '酒店', '民宿', '旅游', '旅行', '度假', '租车',
    '携程', '去哪儿', '飞猪', '订房', '航班',
  ],
  'Clothing & Personal Care': [
    // English
    'clothing', 'apparel', 'nike', 'adidas', 'zara', 'h&m', 'gap',
    'old navy', 'nordstrom', 'macy', 'shoes', 'haircut', 'salon',
    'barber', 'spa', 'grooming', 'toiletries', 'cosmetics', 'makeup',
    'sephora', 'ulta',
    // German
    'kleidung', 'mode', 'schuhe', 'friseur', 'kosmetik', 'drogerie',
    'c&a', 'primark', 'deichmann', 'dm', 'rossmann',
    // Chinese
    '服装', '鞋', '包', '理发', '美容', '化妆品', '护肤', '洗护',
    '优衣库', '无印良品', 'zara', '美发', '美甲',
  ],
  Miscellaneous: [],
};

export async function scanReceipt(
  imageSource: File | string,
  language: ScanLanguage = 'eng',
  onProgress?: (progress: number) => void
): Promise<ParsedReceipt> {
  try {
    const result = await Tesseract.recognize(imageSource, language, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const text = result.data.text;
    const confidence = result.data.confidence;

    return parseReceiptText(text, confidence, language);
  } catch (error) {
    console.error('OCR Error:', error);
    const currencyInfo = LANGUAGE_CURRENCY[language];
    return {
      amount: null,
      date: null,
      description: null,
      category: 'Miscellaneous',
      rawText: '',
      confidence: 0,
      currency: currencyInfo.currency,
      currencySymbol: currencyInfo.symbol,
    };
  }
}

export function parseReceiptText(
  text: string,
  confidence: number,
  language: ScanLanguage = 'eng'
): ParsedReceipt {
  const normalizedText = text.toLowerCase();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Extract amount - look for total patterns
  const amount = extractAmount(text, language);

  // Extract date
  const date = extractDate(text, language);

  // Extract description (usually store name at top)
  const description = extractDescription(lines);

  // Determine category
  const category = determineCategory(normalizedText);

  const currencyInfo = LANGUAGE_CURRENCY[language];
  return {
    amount,
    date,
    description,
    category,
    rawText: text,
    confidence,
    currency: currencyInfo.currency,
    currencySymbol: currencyInfo.symbol,
  };
}

function extractAmount(text: string, language: ScanLanguage): number | null {
  // Amount pattern: supports integers and decimals with 1-2 decimal places
  const amtPattern = '(\\d+(?:[.,]\\d{1,2})?)';

  // Chinese patterns
  if (language === 'chi_sim') {
    // FIRST: Check for 价税合计 (total with tax) - this is the final amount on invoices
    // Chinese invoices format: 价税合计（大写）（小写）
    //                         肆佰零壹圆整   ¥ 401.00
    // The Chinese written amount (大写) like 肆佰零壹圆整 appears right before ¥ 401.00
    // Match Chinese number characters + 圆整/圆 followed by ¥ amount
    const chineseAmountMatch = text.match(/[零壹贰叁肆伍陆柒捌玖拾佰仟万亿]+[圆元][整]?\s*[¥￥]\s*(\d{1,8}(?:[.,]\d{1,2})?)/);
    if (chineseAmountMatch) {
      const amount = parseFloat(chineseAmountMatch[1].replace(',', '.'));
      if (!isNaN(amount) && amount > 0 && amount < 10000000) {
        return amount;
      }
    }

    // Also try matching 价税合计 directly with amount
    const taxTotalPatterns = [
      /价税合计[^0-9]*[¥￥]\s*(\d{1,8}(?:[.,]\d{1,2})?)/,
    ];
    for (const pattern of taxTotalPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(amount) && amount > 0 && amount < 10000000) {
          return amount;
        }
      }
    }

    // SECOND: Check other high-priority patterns
    const highPriorityPatterns = [
      /实付[款金额：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /实际支付[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /支付金额[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /含税合计[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /应付总额[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /总\s*计[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /总\s*额[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
    ];

    for (const pattern of highPriorityPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    // THIRD: Lower priority patterns
    const lowPriorityPatterns = [
      /合\s*计[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /应付[金额：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /总价[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /金额[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /小计[：:\s]*[¥￥元]?\s*(\d+(?:[.,]\d{1,2})?)/,
      /[¥￥]\s*(\d+(?:[.,]\d{1,2})?)/,
    ];

    for (const pattern of lowPriorityPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
  }

  // English patterns
  const englishPatterns = [
    new RegExp(`total[:\\s]*\\$?\\s*${amtPattern}`, 'i'),
    new RegExp(`grand\\s*total[:\\s]*\\$?\\s*${amtPattern}`, 'i'),
    new RegExp(`amount\\s*due[:\\s]*\\$?\\s*${amtPattern}`, 'i'),
    new RegExp(`balance\\s*due[:\\s]*\\$?\\s*${amtPattern}`, 'i'),
    new RegExp(`total\\s*amount[:\\s]*\\$?\\s*${amtPattern}`, 'i'),
  ];

  for (const pattern of englishPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(',', '.');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // German patterns
  if (language === 'deu') {
    const germanPatterns = [
      new RegExp(`summe[:\\s]*€?\\s*${amtPattern}`, 'i'),
      new RegExp(`gesamt[:\\s]*€?\\s*${amtPattern}`, 'i'),
      new RegExp(`gesamtbetrag[:\\s]*€?\\s*${amtPattern}`, 'i'),
      new RegExp(`zu\\s*zahlen[:\\s]*€?\\s*${amtPattern}`, 'i'),
      new RegExp(`betrag[:\\s]*€?\\s*${amtPattern}`, 'i'),
      new RegExp(`€\\s*${amtPattern}`),
    ];

    for (const pattern of germanPatterns) {
      const match = text.match(pattern);
      if (match) {
        // German uses comma for decimals
        const amountStr = match[1].replace(',', '.');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
  }

  // Currency symbol patterns (fallback)
  const currencyPatterns = [
    /\$\s*(\d+(?:[.,]\d{1,2})?)/,
    /€\s*(\d+(?:[.,]\d{1,2})?)/,
    /¥\s*(\d+(?:[.,]\d{1,2})?)/,
  ];

  for (const pattern of currencyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amountStr = match[1].replace(',', '.');
      const amount = parseFloat(amountStr);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // Fall back to finding the largest amount (last resort)
  const allAmounts: number[] = [];
  const numberPattern = /(\d+[.,]\d{1,2})/g;
  let match;
  while ((match = numberPattern.exec(text)) !== null) {
    const amountStr = match[1].replace(',', '.');
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0 && amount < 100000) {
      allAmounts.push(amount);
    }
  }

  if (allAmounts.length > 0) {
    return Math.max(...allAmounts);
  }

  return null;
}

function extractDate(text: string, language: ScanLanguage): string | null {
  const today = new Date();
  const currentYear = today.getFullYear();

  const patterns: RegExp[] = [];

  // Universal patterns
  patterns.push(
    // YYYY-MM-DD (ISO format)
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // YYYY/MM/DD
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
  );

  // English patterns
  patterns.push(
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // MM/DD/YY or MM-DD-YY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,
    // Month DD, YYYY
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s*(\d{4})/i,
  );

  // German patterns (DD.MM.YYYY)
  if (language === 'deu') {
    patterns.push(
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
      /(\d{1,2})\.(\d{1,2})\.(\d{2})/,
    );
  }

  // Chinese patterns (YYYY年MM月DD日)
  if (language === 'chi_sim') {
    patterns.push(
      /(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{1,2})月(\d{1,2})日/,
    );
  }

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let year: number, month: number, day: number;

        if (pattern.source.includes('年')) {
          // Chinese date format
          if (match.length === 4) {
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
          } else {
            // MM月DD日 - assume current year
            month = parseInt(match[1]);
            day = parseInt(match[2]);
            year = currentYear;
          }
        } else if (pattern.source.includes('jan|feb')) {
          // English month name
          const monthNames: Record<string, number> = {
            jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
            jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
          };
          month = monthNames[match[1].toLowerCase().substring(0, 3)];
          day = parseInt(match[2]);
          year = parseInt(match[3]);
        } else if (pattern.source.startsWith('(\\d{4})')) {
          // YYYY-MM-DD or YYYY/MM/DD
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else if (pattern.source.includes('\\.')) {
          // German DD.MM.YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
          if (year < 100) {
            year += year > 50 ? 1900 : 2000;
          }
        } else {
          // MM/DD/YYYY or MM-DD-YYYY (US format)
          month = parseInt(match[1]);
          day = parseInt(match[2]);
          year = parseInt(match[3]);
          if (year < 100) {
            year += year > 50 ? 1900 : 2000;
          }
        }

        // Validate date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= currentYear + 1) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const testDate = new Date(dateStr);
          if (!isNaN(testDate.getTime())) {
            return dateStr;
          }
        }
      } catch {
        continue;
      }
    }
  }

  return today.toISOString().split('T')[0];
}

function extractDescription(lines: string[]): string | null {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length >= 2 && !/^\d+$/.test(line) && !/^[#\-*=]+$/.test(line)) {
      const cleaned = line
        .replace(/[*#=\-]+/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.length >= 2) {
        // For Chinese, don't lowercase
        if (/[\u4e00-\u9fa5]/.test(cleaned)) {
          return cleaned;
        }
        // For other languages, capitalize
        return cleaned
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
  }

  return null;
}

function determineCategory(text: string): Category {
  let maxScore = 0;
  let bestCategory: Category = 'Miscellaneous';

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Miscellaneous') continue;

    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as Category;
    }
  }

  return bestCategory;
}
