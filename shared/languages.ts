import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

type Language = {
    language: string;
    country: string;
    maleVoice: string;
    femaleVoice: string;
};

export const languagesObject = {
    'en-US': {
        language: 'English',
        country: 'United States',
        maleVoice: 'DavisNeural',
        femaleVoice: 'AriaNeural',
    },
    'en-GB': {
        language: 'English',
        country: 'United Kingdom',
        maleVoice: 'AlfieNeural',
        femaleVoice: 'AbbiNeural',
    },
    'es-ES': {
        language: 'Spanish',
        country: 'Spain',
        maleVoice: 'AlvaroNeural',
        femaleVoice: 'AbrilNeural',
    },
    'es-MX': {
        language: 'Spanish',
        // country: 'Mexico', // Original `country`
        country: 'Latin America',
        maleVoice: 'JorgeNeural',
        femaleVoice: 'DaliaNeural',
    },
    'ru-RU': {
        language: 'Russian',
        country: 'Russia',
        maleVoice: 'DmitryNeural',
        femaleVoice: 'DariyaNeural',
    },
    'fr-FR': {
        language: 'French',
        country: 'France',
        maleVoice: 'AlainNeural',
        femaleVoice: 'BrigitteNeural',
    },
    'de-DE': {
        language: 'German',
        country: 'Germany',
        maleVoice: 'BerndNeural',
        femaleVoice: 'AmalaNeural',
    },
    'ja-JP': {
        language: 'Japanese',
        country: 'Japan',
        maleVoice: 'DaichiNeural',
        femaleVoice: 'AoiNeural',
    },
    'tr-TR': {
        language: 'Turkish',
        country: 'Turkey',
        maleVoice: 'AhmetNeural',
        femaleVoice: 'EmelNeural',
    },
    'pt-BR': {
        language: 'Portuguese',
        country: 'Brazil',
        maleVoice: 'AntonioNeural',
        femaleVoice: 'BrendaNeural',
    },
    'pt-PT': {
        language: 'Portuguese',
        country: 'Portugal',
        maleVoice: 'DuarteNeural',
        femaleVoice: 'FernandaNeural',
    },
    'fa-IR': {
        language: 'Persian',
        country: 'Iran',
        maleVoice: 'FaridNeural',
        femaleVoice: 'DilaraNeural',
    },
    'it-IT': {
        language: 'Italian',
        country: 'Italy',
        maleVoice: 'BenignoNeural',
        femaleVoice: 'ElsaNeural',
    },
    'zh-CN': {
        language: 'Chinese',
        country: 'China',
        maleVoice: 'YunfengNeural',
        femaleVoice: 'XiaochenNeural',
    },
    'nl-NL': {
        language: 'Dutch',
        country: 'Netherlands',
        maleVoice: 'MaartenNeural',
        femaleVoice: 'ColetteNeural',
    },
    'pl-PL': {
        language: 'Polish',
        country: 'Poland',
        maleVoice: 'MarekNeural',
        femaleVoice: 'AgnieszkaNeural',
    },
    'vi-VN': {
        language: 'Vietnamese',
        country: 'Vietnam',
        maleVoice: 'NamMinhNeural',
        femaleVoice: 'HoaiMyNeural',
    },
    'ar-AE': {
        language: 'Arabic',
        country: 'United Arab Emirates',
        maleVoice: 'HamdanNeural',
        femaleVoice: 'FatimaNeural',
    },
    'ko-KR': {
        language: 'Korean',
        country: 'Korea',
        maleVoice: 'BongJinNeural',
        femaleVoice: 'JiMinNeural',
    },
    'cs-CZ': {
        language: 'Czech',
        country: 'Czechia',
        maleVoice: 'AntoninNeural',
        femaleVoice: 'VlastaNeural',
    },
    'id-ID': {
        language: 'Indonesian',
        country: 'Indonesia',
        maleVoice: 'ArdiNeural',
        femaleVoice: 'GadisNeural',
    },
    'uk-UA': {
        language: 'Ukrainian',
        country: 'Ukraine',
        maleVoice: 'OstapNeural',
        femaleVoice: 'PolinaNeural',
    },
    'el-GR': {
        language: 'Greek',
        country: 'Greece',
        maleVoice: 'NestorasNeural',
        femaleVoice: 'AthinaNeural',
    },
    'he-IL': {
        language: 'Hebrew',
        country: 'Israel',
        maleVoice: 'AvriNeural',
        femaleVoice: 'HilaNeural',
    },
    'sv-SE': {
        language: 'Swedish',
        country: 'Sweden',
        maleVoice: 'MattiasNeural',
        femaleVoice: 'HilleviNeural',
    },
    'th-TH': {
        language: 'Thai',
        country: 'Thailand',
        maleVoice: 'NiwatNeural',
        femaleVoice: 'AcharaNeural',
    },
    'ro-RO': {
        language: 'Romanian',
        country: 'Romania',
        maleVoice: 'EmilNeural',
        femaleVoice: 'AlinaNeural',
    },
    'hu-HU': {
        language: 'Hungarian',
        country: 'Hungary',
        maleVoice: 'TamasNeural',
        femaleVoice: 'NoemiNeural',
    },
    'da-DK': {
        language: 'Danish',
        country: 'Denmark',
        maleVoice: 'JeppeNeural',
        femaleVoice: 'ChristelNeural',
    },
    'fi-FI': {
        language: 'Finnish',
        country: 'Finland',
        maleVoice: 'HarriNeural',
        femaleVoice: 'NooraNeural',
    },
    'sk-SK': {
        language: 'Slovak',
        country: 'Slovakia',
        maleVoice: 'LukasNeural',
        femaleVoice: 'ViktoriaNeural',
    },
    'bg-BG': {
        language: 'Bulgarian',
        country: 'Bulgaria',
        maleVoice: 'BorislavNeural',
        femaleVoice: 'KalinaNeural',
    },
    'sr-RS': {
        language: 'Serbian',
        country: 'Serbia',
        maleVoice: 'NicholasNeural',
        femaleVoice: 'SophieNeural',
    },
    'nb-NO': {
        language: 'Norwegian Bokmål',
        country: 'Norway',
        maleVoice: 'FinnNeural',
        femaleVoice: 'IselinNeural',
    },
    'hr-HR': {
        language: 'Croatian',
        country: 'Croatia',
        maleVoice: 'SreckoNeural',
        femaleVoice: 'GabrijelaNeural',
    },
    'lt-LT': {
        language: 'Lithuanian',
        country: 'Lithuania',
        maleVoice: 'LeonasNeural',
        femaleVoice: 'OnaNeural',
    },
    'sl-SI': {
        language: 'Slovenian',
        country: 'Slovenia',
        maleVoice: 'RokNeural',
        femaleVoice: 'PetraNeural',
    },
    'ca-ES': {
        language: 'Catalan',
        country: 'Spain',
        maleVoice: 'EnricNeural',
        femaleVoice: 'AlbaNeural',
    },
    'bn-IN': {
        language: 'Bengali',
        country: 'India',
        maleVoice: 'BashkarNeural',
        femaleVoice: 'TanishaaNeural',
    },
    'et-EE': {
        language: 'Estonian',
        country: 'Estonia',
        maleVoice: 'KertNeural',
        femaleVoice: 'AnuNeural',
    },
    'lv-LV': {
        language: 'Latvian',
        country: 'Latvia',
        maleVoice: 'NilsNeural',
        femaleVoice: 'EveritaNeural',
    },
    'hi-IN': {
        language: 'Hindi',
        country: 'India',
        maleVoice: 'MadhurNeural',
        femaleVoice: 'SwaraNeural',
    },
    'ga-IE': {
        language: 'Irish',
        country: 'Ireland',
        maleVoice: 'ColmNeural',
        femaleVoice: 'OrlaNeural',
    },
} as const satisfies Record<string, Language>;

export const languagesArray = (
    Object.entries(languagesObject)
).map(([languageCode, language]) => ({
    code: languageCode,
    name: language.language,
    country: language.country,
}))

export async function returnLanguageAndLocaleFromLanguage(languageCode: string) {

    const filteredLanguages = languagesArray.filter(language => {
        return language.code.includes(languageCode)
    })

    const languageAndLocale = filteredLanguages[0].code

    return languageAndLocale
}

export const detectLanguage = async (phrase: string): Promise<string> => {

    try {
        const prompt = 
        `Detect the language of this phrase: "${phrase}".
         answer succinctly, just the name of the detected language, for example: "English", 
         do not add anything before or after the answer, just the name of the language. `

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: "You are a Polyglot Expert Assistant." },
                { role: 'user', content: prompt },
            ],
            temperature: 0,
        });
        const answer = response.choices[0].message.content
        return answer
    } catch (error) {
        return "English"
    }
}