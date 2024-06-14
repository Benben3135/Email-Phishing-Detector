<h1>Email Phishing Detector Project Documentation</h1>
<h2>Overview</h2>
<p>The Email Phishing Detector project is designed to analyze email content and identify potential phishing indicators. This project leverages several technologies and libraries to achieve its goal. The backend is built with Node.js and Express, while the frontend utilizes React for the user interface.</p>

<h2>Technologies Used</h2>
<h2>Backend</h2>
-Node.js: A JavaScript runtime built on Chrome's V8 engine, used to create the server-side application.
-Express: A web application framework for Node.js, used to set up the server and handle HTTP requests.
-Body-Parser: Middleware for parsing incoming request bodies in a middleware before your handlers, available under the req.body property.
-Cors: Middleware to enable Cross-Origin Resource Sharing, allowing the frontend to communicate with the backend.
-Path: A Node.js module used for working with file and directory paths.
-Leven: A library used to calculate the Levenshtein distance between two strings, which helps in identifying spoofed email domains.
<h2>Frontend</h2>
-React: A JavaScript library for building user interfaces.
-Tailwind CSS: A utility-first CSS framework to style the frontend components.
