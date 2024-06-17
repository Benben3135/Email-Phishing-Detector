import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';

const app = express();
app.use(bodyParser.json());
app.use(cors());


const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'microsoft.com', 'facebook.com', 'apple.com'];
const similarCharacters: { [key: string]: string[] } = {
    'o': ['0'],
    '0': ['o'],
    'l': ['1', 'i'],
    '1': ['l', 'i'],
    'i': ['l', '1'],
    'm': ['rn'],
    'rn': ['m']
};


function normalizeEmail(email: string): string {
    let normalizedEmail = email.toLowerCase();
    for (const [char, subs] of Object.entries(similarCharacters)) {
        for (const sub of subs) {
            const regex = new RegExp(sub, 'g');
            normalizedEmail = normalizedEmail.replace(regex, char);
        }
    }
    return normalizedEmail;
}

async function getPhishingIndicators(emailContent: string) {
    const { default: leven } = await import('leven');

    const suspiciousPatterns = [
        /http[s]?:\/\/(?!(?:www\.)?(?:google|yahoo|hotmail|outlook|microsoft|facebook|apple)\.com)(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^?#]+)*\??(?:[^#]*#?[^#]*)?|http[s]?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g
    ];
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const urgentKeywords = ["urgent", "immediately", "action required", "asap", "important", "attention"];

    let suspiciousLinks: string[] = [];
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
}

app.post('/scan-email', async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: 'Invalid request body' });
        return;
    }

    const emailContent = (req.body as { content?: string }).content;
    if (!emailContent || typeof emailContent !== 'string') {
        res.status(400).json({ error: 'Invalid email content' });
        return;
    }
    const indicators = await getPhishingIndicators(emailContent);
    console.log(indicators);
    res.json(indicators);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});