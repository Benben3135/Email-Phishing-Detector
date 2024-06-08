var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
const similarCharacters = {
    'o': ['0'],
    '0': ['o'],
    'l': ['1', 'i'],
    '1': ['l', 'i'],
    'i': ['l', '1'],
    'm': ['rn'],
    'rn': ['m']
};
app.use(bodyParser.json());
app.use(cors());
function normalizeEmail(email) {
    let normalizedEmail = email.toLowerCase();
    for (const [char, subs] of Object.entries(similarCharacters)) {
        for (const sub of subs) {
            const regex = new RegExp(sub, 'g');
            normalizedEmail = normalizedEmail.replace(regex, char);
        }
    }
    return normalizedEmail;
}
function getPhishingIndicators(emailContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const { default: leven } = yield import('leven');
        const suspiciousPatterns = [
            /http[s]?:\/\/(?!(?:www\.)?(?:google|yahoo|hotmail|outlook)\.com)(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^?#]+)*\??(?:[^#]*#?[^#]*)?|http[s]?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g
        ];
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const urgentKeywords = ["urgent", "immediately", "action required", "asap", "important", "attention"];
        let suspiciousLinks = [];
        for (const pattern of suspiciousPatterns) {
            const matches = emailContent.match(pattern);
            if (matches) {
                suspiciousLinks = suspiciousLinks.concat(matches);
            }
        }
        const emailAddresses = emailContent.match(emailPattern) || [];
        const spoofedSenders = emailAddresses.filter(email => {
            const [username, domain] = email.split('@');
            const normalizedDomain = normalizeEmail(domain);
            return !commonDomains.includes(domain) || commonDomains.some(commonDomain => leven(normalizedDomain, commonDomain) <= 2);
        });
        const urgentLanguage = urgentKeywords.filter(word => emailContent.toLowerCase().includes(word));
        return {
            suspiciousLinks,
            spoofedSenders,
            urgentLanguage
        };
    });
}
app.post('/scan-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: 'Invalid request body' });
        return;
    }
    const emailContent = req.body.content;
    if (!emailContent || typeof emailContent !== 'string') {
        res.status(400).json({ error: 'Invalid email content' });
        return;
    }
    const indicators = yield getPhishingIndicators(emailContent);
    console.log(indicators);
    res.json(indicators);
}));
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
