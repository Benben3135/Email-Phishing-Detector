Email Phishing Detector Project Documentation
Overview
The Email Phishing Detector project is designed to analyze email content and identify potential phishing indicators. This project leverages several technologies and libraries to achieve its goal. The backend is built with Node.js and Express, while the frontend utilizes React for the user interface.

Technologies Used
Backend
Node.js: A JavaScript runtime built on Chrome's V8 engine, used to create the server-side application.
Express: A web application framework for Node.js, used to set up the server and handle HTTP requests.
Body-Parser: Middleware for parsing incoming request bodies in a middleware before your handlers, available under the req.body property.
Cors: Middleware to enable Cross-Origin Resource Sharing, allowing the frontend to communicate with the backend.
Path: A Node.js module used for working with file and directory paths.
Leven: A library used to calculate the Levenshtein distance between two strings, which helps in identifying spoofed email domains.
Frontend
React: A JavaScript library for building user interfaces.
Tailwind CSS: A utility-first CSS framework to style the frontend components.
Code Explanation
Backend
Server Setup
typescript
Copy code
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());
Express Initialization: Initializes an Express application.
Middleware:
bodyParser.json() parses JSON request bodies.
cors() enables Cross-Origin Resource Sharing.
Email Normalization and Spoof Detection
typescript
Copy code
const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
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
Common Domains: A list of known legitimate email domains.
Similar Characters: A mapping of characters often used interchangeably in phishing attempts.
normalizeEmail Function: Converts email to lowercase and replaces similar characters to help detect spoofed domains.
Phishing Indicator Detection
typescript
Copy code
async function getPhishingIndicators(emailContent: string) {
    const { default: leven } = await import('leven');

    const suspiciousPatterns = [
        /http[s]?:\/\/(?!(?:www\.)?(?:google|yahoo|hotmail|outlook)\.com)(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^?#]+)*\??(?:[^#]*#?[^#]*)?|http[s]?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g
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
Suspicious Patterns: Regular expressions to identify suspicious URLs.
Email Pattern: Regular expression to extract email addresses.
Urgent Keywords: List of keywords indicating urgency, often used in phishing attempts.
getPhishingIndicators Function: Identifies suspicious links, spoofed senders, and urgent language in email content.
Email Scanning Endpoint
typescript
Copy code
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
/scan-email Endpoint: Accepts POST requests with email content, processes the content using getPhishingIndicators, and returns the results.