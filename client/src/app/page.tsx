"use client";

import { useEffect, useState } from "react";

interface Data {
  spoofedSenders: string[];
  suspiciousLinks: string[];
  urgentLanguage: string[];
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [spoofedSenders, setSpoofedSenders] = useState<string[]>([]);
  const [suspiciousLinks, setSuspiciousLinks] = useState<string[]>([]);
  const [urgentLanguage, setUrgentLanguage] = useState<string[]>([]);

  const checkData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/scan-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });
      const data = await response.json();
      setLoading(false);
      checkDataResults(data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const checkDataResults = (data: Data) => {
    console.log(data.spoofedSenders, data.suspiciousLinks, data.urgentLanguage);
    setSpoofedSenders(data.spoofedSenders);
    setSuspiciousLinks(data.suspiciousLinks);
    setUrgentLanguage(data.urgentLanguage);
  };

  useEffect(() => {
    setSpoofedSenders([]);
    setSuspiciousLinks([]);
    setUrgentLanguage([]);
  }, [text]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-400 to-purple-400 flex flex-col justify-start pt-20 items-center">
      <h1 className="text-3xl font-bold text-slate-800">
        Email Phishing Detector
      </h1>
      <div className="w-fit h-fit flex justify-center items-center mt-6 ring ring-purple-500 rounded-md">
        <textarea
          onInput={(ev) => setText((ev.target as HTMLTextAreaElement).value)}
          name="text"
          id="1"
          placeholder="Your text content"
          className="w-[30rem] h-[10rem] focus-within:h-[18rem] transition-all ease-in-out rounded-md text-purple-600 font-bold bg-slate-300 p-4"
        ></textarea>
      </div>
      <button
        onClick={() => {
          checkData();
        }}
        className={
          loading
            ? "bg-gray-300 mt-4 rounded-md py-2 px-3 font-bold text-slate-200 hover:px-4 hover:text-indigo-700 hover:bg-slate-200 transition-all ease-in-out"
            : "bg-purple-700 mt-4 rounded-md py-2 px-3 font-bold text-slate-200 hover:px-4 hover:text-indigo-700 hover:bg-slate-200 transition-all ease-in-out"
        }
      >
        Check Content
      </button>
      {(spoofedSenders.length > 0 ||
        suspiciousLinks.length > 0 ||
        urgentLanguage.length > 0) ? (
        <div
          className={
            "h-[10rem] flex flex-col justify-start items-center p-2 mt-4 bg-slate-300 ring-red-400 ring rounded-md w-[40rem]"
          }
        >
          <h1 className=" text-lg font-bold text-black">
            We found suspicious email content!
          </h1>
          <div className=" w-full h-fit flex flex-row justify-around items-start p-3">
            <div className=" flex flex-col justify-center items-center">
              <h2 className=" font-bold">Spoofed Senders:</h2>
              <div className={spoofedSenders.length > 0 ? "bg-red-600 text-white font-bold rounded-full p-1":"bg-green-500 text-white font-bold rounded-full p-1"}>{spoofedSenders.length}</div>
              <h3 className="text-sm text-red-800 font-bold">
                {spoofedSenders}
              </h3>
            </div>
            <div className=" flex flex-col justify-center items-center">
              <h2 className=" font-bold">Suspicious Links:</h2>
              <div className={suspiciousLinks.length > 0 ? "bg-red-600 text-white font-bold rounded-full p-1":"bg-green-500 text-white font-bold rounded-full p-1"}>{suspiciousLinks.length}</div>
              <h3 className="text-sm text-red-800 font-bold">
                {suspiciousLinks}
              </h3>
            </div>
            <div className=" flex flex-col justify-center items-center">
              <h2 className=" font-bold">Urgent Language:</h2>
              <div className={urgentLanguage.length > 0 ? "bg-red-600 text-white font-bold rounded-full p-1":"bg-green-500 text-white font-bold rounded-full p-1"}>{urgentLanguage.length}</div>
              <h3 className="text-sm text-red-800 font-bold">
                {urgentLanguage}
              </h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-fit h-[4rem] px-4 flex flex-col justify-center items-center bg-green-200 ring ring-green-500 mt-4 rounded-md">
          <h1 className="font-bold">You'r email content safe! ✅🏄‍♂️</h1>
        </div>
      )}
    </div>
  );
}
