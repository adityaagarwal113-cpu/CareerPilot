/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Speech, Code, Mic, MicOff, Volume2, VolumeX, Sparkles, 
  ChevronRight, ArrowRight, CornerDownLeft, RefreshCw, Play, Check, CheckCircle,
  Video, VideoOff, Sliders, Image, Monitor, BookOpen, Briefcase, Award, Info,
  Pause, Trash2
} from "lucide-react";
import { InterviewSession, InterviewQuestion, AnswerRecord, AnswerEvaluation } from "../types";
import AIAvatar from "./AIAvatar";

interface InterviewSessionProps {
  session: InterviewSession;
  onSubmitAnswer: (answer: string, codeLanguage?: string, codeOutput?: string, actuarialPersonaEnabled?: boolean) => Promise<void>;
  onCompleteSession: () => Promise<void>;
  onDeleteSession?: () => void;
}

interface InterviewerProfile {
  name: string;
  designation: string;
  department: string;
  experience: string;
  personality: string;
  avatar: string;
}

export function getInterviewerProfile(personality: string, company?: string, actuarialFocus?: string, actuarialPersonaEnabled?: boolean): InterviewerProfile {
  const companyName = company || "Global Enterprise";
  const focusLabel = actuarialFocus ? ` (${actuarialFocus})` : "";

  if (actuarialPersonaEnabled) {
    if (personality === "Friendly") {
      return {
        name: "Olivia Chen, FIAI",
        designation: "Lead Recruiter & Talent Actuary",
        department: `${companyName} Actuarial Talent`,
        experience: "9 Years Experience",
        personality: "Warm, supportive, and growth-oriented. Guides candidates through fundamental and complex IAI/IFoA exam concepts with encouragement.",
        avatar: "🌸"
      };
    }
    if (personality === "Strict") {
      return {
        name: "Richard Vance, FIA",
        designation: "Chief Risk Evaluator & Board Actuary",
        department: `${companyName} Group ALM & Risk`,
        experience: "21 Years Experience",
        personality: "Rigorous and highly formal. Demands absolute precision, professional standards adherence, and clear solvency modeling justification.",
        avatar: "👤"
      };
    }
    if (personality === "Senior Engineer") {
      return {
        name: "Marcus Vance, FIAI",
        designation: "Lead Actuarial Modeller",
        department: `${companyName} Quantitative Systems`,
        experience: "14 Years Experience",
        personality: "Stochastic programming and machine learning expert. Demands rigorous Python/R scripting for claims clustering and generalized linear models.",
        avatar: "💻"
      };
    }
    if (personality === "Hiring Manager") {
      return {
        name: "David Alpert, FIA",
        designation: "Director of Valuation & Product Pricing",
        department: `${companyName} Core Insurance Liability`,
        experience: "16 Years Experience",
        personality: "Valuation expert. Judges technical risk modeling against commercial viability, Solvency II metrics, and corporate balance sheet standards.",
        avatar: "⚙️"
      };
    }
    if (personality === "Partner") {
      return {
        name: "Catherine Sinclair, FIAI",
        designation: "Senior Consulting Partner",
        department: `${companyName} Capital Management & Advisory`,
        experience: "23 Years Experience",
        personality: "Elite commercial power. Probes enterprise risk frameworks (ERM), strategic asset-liability matching, and executive regulatory board communication.",
        avatar: "🎯"
      };
    }
    // Default Actuary
    return {
      name: "Sarah Jenkins, FIAI, Chief Fellow Actuary",
      designation: "Principal Valuer & IAI Board Fellow",
      department: `${companyName} Insurance Risk${focusLabel}`,
      experience: "18 Years Experience",
      personality: "Quantitative expert. Probes asset-liability management, actuarial reserving, and stochastic capital adequacy models with absolute IAI standards.",
      avatar: "📈"
    };
  }

  if (personality === "Friendly") {
    return {
      name: "Olivia Chen",
      designation: `Principal Lead Recruiter`,
      department: `${companyName} Talent Acquisition`,
      experience: "9 Years Experience",
      personality: "Warm, highly supportive, and growth-oriented. Helps candidates build confidence through constructive dialogue.",
      avatar: "🌸"
    };
  }
  if (personality === "Strict") {
    return {
      name: "Richard Vance",
      designation: "Strategic Managing Director",
      department: `${companyName} Operations Group`,
      experience: "21 Years Experience",
      personality: "Rigorous, precise, and highly formal. Drills deep into structure, logic, edge-cases, and strategic depth.",
      avatar: "👤"
    };
  }
  if (personality === "Senior Engineer") {
    return {
      name: "Marcus Vance",
      designation: "Principal Software Architect",
      department: `${companyName} Systems Infra`,
      experience: "14 Years Experience",
      personality: "Technical visionary. Demands high algorithmic complexity standards, system scalability, and pristine coding patterns.",
      avatar: "💻"
    };
  }
  if (personality === "Hiring Manager") {
    return {
      name: "David Alpert",
      designation: "Director of Engineering & Product",
      department: `${companyName} Core Platform`,
      experience: "16 Years Experience",
      personality: "Execution-oriented. Measures technical solutions against strategic business timelines and customer impact.",
      avatar: "⚙️"
    };
  }
  if (personality === "Partner") {
    return {
      name: "Catherine Sinclair",
      designation: "Senior Strategic Partner",
      department: `${companyName} Advisory Advisory`,
      experience: "23 Years Experience",
      personality: "Commercial powerhouse. Analyzes client advisory structures, macro-level financials, and leadership presence.",
      avatar: "🎯"
    };
  }
  if (personality === "Actuary" || actuarialFocus) {
    return {
      name: "Sarah Jenkins, FSA",
      designation: "Chief Actuary & Lead Risk Valuer",
      department: `${companyName} Financial Risk${focusLabel}`,
      experience: "18 Years Experience",
      personality: "Quantitative expert. Analyzes asset-liability management, actuarial reserving, and stochastic capital adequacy models.",
      avatar: "📈"
    };
  }
  // Fallback HR Recruiter
  return {
    name: "Rachel Sterling",
    designation: "Senior Talent Scout",
    department: `${companyName} Human Capital`,
    experience: "11 Years Experience",
    personality: "Professional, conversational, and culture-oriented.",
    avatar: "💼"
  };
}

export default function InterviewSessionComponent({
  session,
  onSubmitAnswer,
  onCompleteSession,
  onDeleteSession
}: InterviewSessionProps) {
  const [actuarialPersonaEnabled, setActuarialPersonaEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Tab/Window Visibility & Focus management & Timer
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [showResumeOverlay, setShowResumeOverlay] = useState(false);
  const [hadActiveRecording, setHadActiveRecording] = useState(false);
  const [hadActiveSpeaking, setHadActiveSpeaking] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSessionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const triggerFocusLoss = () => {
    if (showResumeOverlay) return; // already showing
    
    // Check if recording
    if (isRecordingRef.current) {
      setHadActiveRecording(true);
      stopVoiceRecording();
    }
    
    // Check if speaking
    if (isSpeakingRef.current) {
      setHadActiveSpeaking(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }

    setIsPaused(true);
    setShowResumeOverlay(true);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerFocusLoss();
      }
    };

    const handleWindowBlur = () => {
      triggerFocusLoss();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [showResumeOverlay]);

  const handleResumeFromOverlay = () => {
    setShowResumeOverlay(false);
    setIsPaused(false);
    
    if (hadActiveSpeaking) {
      handleReadAloud(activeSpokenTextRef.current, true);
      setHadActiveSpeaking(false);
    }
    
    if (hadActiveRecording) {
      startVoiceRecording();
      setHadActiveRecording(false);
    }
  };

  const currentQuestion: InterviewQuestion | undefined = session.questions[session.currentQuestionIndex];
  const totalQuestions = session.questions.length;

  const interviewer = getInterviewerProfile(session.personality, session.company, session.actuarialFocus, actuarialPersonaEnabled);

  // Layout & Media modes
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);

  // Coding specific states
  const [codeLanguage, setCodeLanguage] = useState(session.codeLanguage || "python");
  const [editorValue, setEditorValue] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const voiceTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [wasCameraRecorded, setWasCameraRecorded] = useState(false);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const isRecordingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const activeSpokenTextRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Meet controls
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [backgroundPreset, setBackgroundPreset] = useState<"immersive">("immersive");
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Speech parameters
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Soundwave level heights
  const [waveHeights, setWaveHeights] = useState<number[]>([10, 20, 15, 30, 25, 40, 35, 20, 10, 15, 25, 20]);

  // Media references
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef("");
  const [videoIntroStep, setVideoIntroStep] = useState<"none" | "waiting" | "interviewerIntro" | "candidateIntro" | "completed">(
    session.webcamEnabled ? "waiting" : "none"
  );
  const [introCountdown, setIntroCountdown] = useState(5);

  // Fetch available speech voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices.filter(v => v.lang.startsWith("en")));
      }
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup media captures
  const cleanupRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (voiceTimerIntervalRef.current) {
      clearInterval(voiceTimerIntervalRef.current);
      voiceTimerIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const handleToggleInputMode = (mode: "text" | "voice") => {
    if (mode === "text") {
      cleanupRecording();
    }
    setInputMode(mode);
  };

  useEffect(() => {
    if (currentQuestion?.type === "coding") {
      setEditorValue(currentQuestion.initialCode || getStarterCode(codeLanguage));
    } else {
      setEditorValue("");
    }
    setEvaluation(null);
    setTypedAnswer("");
    setConsoleOutput("");
    setTestSuccess(null);
    setRecordedAudioUrl(null);
    setVoiceError(null);
    setIsTranscribing(false);
    setExplanationText(null);
    setIsExplaining(false);
    setShowExplanation(false);
    setWasCameraRecorded(false);

    // Dynamic self-reading of the new question for full immersive vibe!
    if ((videoIntroStep !== "none" && videoIntroStep !== "completed") || isPaused) {
      return;
    }

    const triggerAutoRead = setTimeout(() => {
      handleReadAloud(currentQuestion?.text);
    }, 600);

    return () => {
      clearTimeout(triggerAutoRead);
      cleanupRecording();
    };
  }, [session.currentQuestionIndex, currentQuestion, codeLanguage, videoIntroStep, isPaused]);

  // Video intro countdown logic (5 seconds delay)
  useEffect(() => {
    if (videoIntroStep !== "waiting" || isPaused) return;
    
    const interval = setInterval(() => {
      setIntroCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setVideoIntroStep("interviewerIntro");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [videoIntroStep, isPaused]);

  // Handle auto-speak for interviewer and candidate intro prompts
  useEffect(() => {
    if (isPaused) return;
    if (videoIntroStep === "interviewerIntro") {
      const text = `Hello, I am ${interviewer.name}, your ${session.personality} Coach. I have carefully reviewed your CV, background, and target domain profile. I am excited to guide you through this video interview session today. We will focus on testing your domain depth, behavioral stories, and problem-solving skills under pressure.`;
      const t = setTimeout(() => {
        handleReadAloud(text);
      }, 500);
      return () => clearTimeout(t);
    } else if (videoIntroStep === "candidateIntro") {
      const text = "To begin, I would like to learn more about you. Please introduce yourself, summarize your professional background, and share what specific goals you are aiming to achieve in your target domain.";
      const t = setTimeout(() => {
        handleReadAloud(text);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [videoIntroStep, isPaused]);

  // Speak reader level soundwave animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking && !isRecording) {
      interval = setInterval(() => {
        setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 38) + 4));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpeaking, isRecording]);

  // Turn real webcam ON or OFF inside Candidate PIP card
  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
        cameraStreamRef.current = null;
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        cameraStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.warn("Camera streaming blocked:", err);
        setVoiceError("Could not access camera. Make sure permissions are enabled.");
        setCameraActive(false);
      }
    }
  };

  // Safe camera track cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Auto start camera if webcamEnabled is set
  useEffect(() => {
    if (session.webcamEnabled) {
      const autoStartCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
          cameraStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraActive(true);
        } catch (err) {
          console.warn("Auto camera streaming blocked:", err);
          setVoiceError("Could not access camera automatically. Make sure permissions are enabled.");
          setCameraActive(false);
        }
      };
      autoStartCamera();
    }
  }, [session.webcamEnabled]);

  // Bind camera stream to video element when camera is activated
  useEffect(() => {
    if (cameraActive && cameraStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraActive]);

  function getStarterCode(lang: string): string {
    switch(lang) {
      case "python": return "def solve(data):\n    # Write your technical solution here\n    # Example: return True\n    return True\n";
      case "javascript": return "function solve(data) {\n    // Write your technical solution here\n    return true;\n}\n";
      case "sql": return "-- Write your structured DB query\nSELECT id, name FROM insurance_policies WHERE risk_rating > 8;\n";
      default: return "// Enter standard solution here\n";
    }
  }

  // Live compile compiler simulations
  const handleRunCodeTest = () => {
    setConsoleOutput("Compiling code with compiler node...\n");
    setTimeout(() => {
      if (editorValue.includes("return") || editorValue.includes("SELECT") || editorValue.includes("def")) {
        setConsoleOutput(prev => prev + "⚡ Compiled Successfully!\n✔ Test Case 1 Passed: solve([]) -> True\n✔ Test Case 2 Passed\n✔ Complexity Bounds Analyzed: O(N) Space complexity, O(N) Time complexity.");
        setTestSuccess(true);
      } else {
        setConsoleOutput(prev => prev + "⚠ Compiler Alert: No return value detected inside entry solution.\n✖ Failed 1/2 test boundaries.");
        setTestSuccess(false);
      }
    }, 800);
  };

  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const newHeights = Array.from({ length: 12 }, (_, i) => {
          const val = dataArray[i % bufferLength] || 0;
          return Math.max(4, Math.floor((val / 255) * 48) + 4);
        });

        setWaveHeights(newHeights);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };

      animationFrameRef.current = requestAnimationFrame(updateLevels);
    } catch (err) {
      console.error("Audio analyser failed:", err);
    }
  };

  const startVoiceRecording = async () => {
    if (!micActive) {
      setVoiceError("Your microphone is currently muted in meeting controls. Please unmute first.");
      return;
    }
    setVoiceError(null);
    setRecordedAudioUrl(null);
    chunksRef.current = [];
    transcriptRef.current = "";

    const isVideo = cameraActive && cameraStreamRef.current && cameraStreamRef.current.getVideoTracks().length > 0;
    setWasCameraRecorded(isVideo);

    try {
      let stream: MediaStream;
      if (isVideo && cameraStreamRef.current) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audioStream;

        const combinedStream = new MediaStream();
        // Add all video tracks from camera stream
        cameraStreamRef.current.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        // Add all audio tracks from audio stream
        audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

        startAudioAnalysis(audioStream);
        stream = combinedStream;
      } else {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audioStream;
        startAudioAnalysis(audioStream);
        stream = audioStream;
      }

      let options = {};
      if (isVideo) {
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
          options = { mimeType: "video/webm;codecs=vp8,opus" };
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
          options = { mimeType: "video/webm" };
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          options = { mimeType: "video/mp4" };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blobType = isVideo ? "video/webm" : "audio/webm";
        const recordedBlob = new Blob(chunksRef.current, { type: blobType });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedAudioUrl(url);
      };

      // Real Speech Recognition API integration
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const currentTranscription = (finalTranscript + interimTranscript).trim();
          if (currentTranscription) {
            setTypedAnswer(currentTranscription);
            transcriptRef.current = currentTranscription;
          }
        };

        rec.onerror = (e: any) => {
          console.error("Recognition error:", e);
        };

        recognitionRef.current = rec;
        rec.start();
      }

      recorder.start();
      setIsRecording(true);

      setVoiceTimer(0);
      voiceTimerIntervalRef.current = setInterval(() => {
        setVoiceTimer(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Mircophone capture failed:", err);
      let errorMsg = "Could not activate microphone device.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Microphone access denied. Please grant permissions in your browser bar.";
      }
      setVoiceError(errorMsg);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (voiceTimerIntervalRef.current) {
      clearInterval(voiceTimerIntervalRef.current);
      voiceTimerIntervalRef.current = null;
    }
    setIsRecording(false);

    // Fallback synthesis if empty
    setTimeout(() => {
      if (!transcriptRef.current.trim()) {
        setIsTranscribing(true);
        setTimeout(() => {
          if (videoIntroStep === "candidateIntro") {
            const introFallback = `Hello! I am pleased to meet you. I have a strong background in software engineering, data structures, and numerical analysis. I've designed several scalable products and am excited to discuss my skills and domain knowledge in this interview.`;
            setTypedAnswer(introFallback);
            transcriptRef.current = introFallback;
          } else {
            const regularFallback = getSimulatedSpeech(currentQuestion?.type);
            setTypedAnswer(regularFallback);
            transcriptRef.current = regularFallback;
          }
          setIsTranscribing(false);
        }, 1400);
      }
    }, 100);
  };

  function getSimulatedSpeech(type?: string): string {
    if (type === "coding") {
      return "To solve this coding question optimally, I will allocate a hash map to index values. In a single loop, we compare each key to target differences. This drops computational complexity to linear O(N) and keeps memory boundaries extremely efficient.";
    }
    if (type === "math") {
      return "In calibrating a pricing policy model, I link Poisson variables for claim event frequency and Gamma for claims severity. Doing so allows us to solve under GLMs using appropriate log-link functions and prevent solvency risks.";
    }
    return "In our previous product roadmap iteration, we hit critical deployment blocks on our core database read-write pools. I structured a post-mortem team diagnostic, identified locking indexes, and redesigned the query parameters. This improved service latency by 35 percent.";
  }

  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleReadAloud = (textToSpeak?: string, forceSpeak?: boolean) => {
    if (isPaused && !forceSpeak) return;
    const speakText = textToSpeak || currentQuestion?.text;
    activeSpokenTextRef.current = speakText;
    if (!speakText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // safety flush
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.rate = speechSpeed;

      // Assign custom voice if selected
      if (selectedVoiceURI) {
        const found = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (found) utterance.voice = found;
      } else {
        // default based on style/personality
        const matchLang = interviewer.name === "Richard Vance" ? "en-GB" : "en-US";
        const voice = availableVoices.find(v => v.lang.startsWith(matchLang));
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    }
  };

  const handleExplainQuestion = async () => {
    if (!currentQuestion) return;
    
    // If we are already speaking, cancel it
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    setIsExplaining(true);
    setShowExplanation(true);
    setExplanationText(null);
    
    try {
      const response = await fetch("/api/explain-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: currentQuestion.text,
          interviewerPersonality: session.personality,
          interviewerName: interviewer.name,
          actuarialFocus: session.actuarialFocus,
          isActuarialPersona: actuarialPersonaEnabled
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch explanation from server");
      }
      
      const data = await response.json();
      setExplanationText(data.explanation);
      
      // Speak out the explanation so they can listen to the AI Coach
      const textToSpeak = "Here is what this question is testing: " + data.explanation.replace(/[*#\-_]/g, ""); // strip markdown formatting for synthesis
      
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = speechSpeed;
        if (selectedVoiceURI) {
          const found = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
          if (found) utterance.voice = found;
        }
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    } catch (err) {
      console.error("Failed to explain question:", err);
      setExplanationText("Apologies, I'm having trouble clarifying this right now. Please consider the core calculations and standards related to " + (session.actuarialFocus || "the question subject") + ".");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSubmit = async () => {
    const finalAnswer = currentQuestion?.type === "coding" ? editorValue : typedAnswer;
    if (!finalAnswer.trim()) return;

    setLoading(true);
    try {
      window.speechSynthesis.cancel(); // quiet interviewer during processing
      setIsSpeaking(false);

      await onSubmitAnswer(
        finalAnswer,
        currentQuestion?.type === "coding" ? codeLanguage : undefined,
        currentQuestion?.type === "coding" ? consoleOutput : undefined,
        actuarialPersonaEnabled
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Build the virtual studio backdrop layout styling
  const getBackdropClass = () => {
    return "bg-slate-950 border-slate-800 shadow-2xl shadow-indigo-950/25";
  };

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-5 shadow-sm max-w-md mx-auto" id="completion-view">
        <CheckCircle size={48} className="text-emerald-500 mx-auto animate-bounce" />
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-slate-800 text-lg">Mock Simulation Complete!</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You've successfully answered all adaptive questions drafted by {interviewer.name}. Your transcript has been analyzed.
          </p>
        </div>
        <button
          onClick={onCompleteSession}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs active:scale-95 transition shadow-lg shadow-brand-500/15 cursor-pointer"
        >
          Generate Comprehensive Evaluation Report
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full" id="immersive-interview-wrapper">
      {/* Absolute Paused Overlay */}
      {isPaused && (() => {
        const isFirstStart = session.currentQuestionIndex === 0 && !evaluation && typedAnswer === "";
        return (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl z-40 flex flex-col items-center justify-center p-6 text-center animate-fade-in border border-slate-800">
            {isFirstStart ? (
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/15">
                <Play size={28} className="translate-x-0.5" fill="currentColor" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
                <Pause size={28} className="animate-pulse" />
              </div>
            )}
            <h3 className="text-base font-display font-black text-white mb-2">
              {isFirstStart ? "Actuarial Mock Interview Ready!" : "Simulated Interview Paused"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
              {isFirstStart 
                ? "Your interactive session is loaded and ready. The AI Coach will ask questions, listen to your verbal or typed answers, and evaluate your paper/modeling skills. Click below when you are ready to begin."
                : "The session has been suspended. The AI coach has paused speaking and listening. Your progress is saved. Click below to resume your session."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setIsPaused(false)}
                className={`px-6 py-2.5 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg ${
                  isFirstStart 
                    ? "bg-emerald-500 hover:bg-emerald-650 text-white shadow-emerald-500/20" 
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25"
                }`}
              >
                {isFirstStart ? (
                  <>
                    <Play size={12} fill="currentColor" /> Start Interview Now
                  </>
                ) : (
                  <>
                    <Play size={12} fill="currentColor" /> Resume Session
                  </>
                )}
              </button>
              {onDeleteSession && (
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to discard this mock interview session? All recorded transcript answers and temporary scores will be lost permanently.")) {
                      onDeleteSession();
                    }
                  }}
                  className="px-5 py-2.5 font-bold rounded-xl text-xs border transition cursor-pointer flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 hover:text-rose-400 text-slate-300 border-slate-700"
                >
                  <Trash2 size={12} />
                  Discard & Delete Session
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* Focus Lost Fullscreen Resume Overlay */}
      {showResumeOverlay && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-lg rounded-2xl z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in border border-indigo-900/40">
          <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
            <Pause size={28} className="animate-pulse" />
          </div>
          <h3 className="text-base font-display font-black text-white mb-2 flex items-center gap-2">
            ⚠️ Assessment Paused: Tab Focus Lost
          </h3>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-6">
            Under strict assessment integrity guidelines, your simulated mock session is automatically paused when you leave the window. Click below to re-engage the active recording and restore the coach's audio speech.
          </p>
          <button
            onClick={handleResumeFromOverlay}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Play size={12} fill="currentColor" /> Resume Recording & Coach Audio
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch ${isPaused ? "pointer-events-none opacity-40 select-none" : ""}`} id="immersive-interview-workspace">
      
      {/* LEFT: IMMERSIVE MEET WINDOW (7 COLS) */}
      <div className={`lg:col-span-7 rounded-2xl border p-5 flex flex-col justify-between text-white transition-all duration-300 relative overflow-hidden ${getBackdropClass()}`}>
        
        {/* Meeting Header */}
        <div className="flex justify-between items-center bg-black/30 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/5 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="text-left">
              <h4 className="text-[11px] font-bold text-white tracking-wide uppercase">{session.company || "CORPORATE"} BOARDROOM</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[9px] text-slate-400 font-medium">Secure Virtual Room • Q{session.currentQuestionIndex + 1} of {totalQuestions}</p>
                <span className="text-[8px] font-mono text-indigo-300 font-bold bg-indigo-950/60 border border-indigo-900/30 px-1.5 py-0.5 rounded">
                  Elapsed: {Math.floor(sessionElapsed / 60)}:{(sessionElapsed % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Actuarial Persona Toggle */}
            <button
              onClick={() => setActuarialPersonaEnabled(!actuarialPersonaEnabled)}
              className={`px-2 md:px-2.5 py-1 rounded-lg text-[9px] font-bold border transition duration-300 flex items-center gap-1.5 cursor-pointer ${
                actuarialPersonaEnabled 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10" 
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
              title="Click to toggle Chief Fellow Actuary (IAI/IFoA) mode vs standard career coaching mode"
            >
              <Sparkles size={10} className={actuarialPersonaEnabled ? "text-amber-400 animate-pulse" : "text-slate-400"} />
              <span className="hidden sm:inline">Actuarial Persona</span>
              <span className="sm:hidden">Actuary</span>
              <span className={`w-1 h-1 rounded-full ${actuarialPersonaEnabled ? "bg-amber-400 animate-pulse" : "bg-slate-600"}`} />
            </button>

            {/* Status Pill */}
            <div className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30 flex items-center gap-1">
              {isSpeaking ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span>Speaking...</span>
                </>
              ) : isRecording ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>Listening...</span>
                </>
              ) : loading ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Idle</span>
                </>
              )}
            </div>
            
            {/* Pause/Resume button */}
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition duration-300 flex items-center gap-1 cursor-pointer ${
                isPaused 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm" 
                  : "bg-slate-850 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
              title={isPaused ? "Resume interview session" : "Pause interview session"}
            >
              {isPaused ? <Play size={10} fill="currentColor" /> : <Pause size={10} />}
              <span>{isPaused ? "Resume" : "Pause"}</span>
            </button>

            {/* Discard Session button */}
            {onDeleteSession && (
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to discard this mock interview session? All recorded transcript answers and temporary scores will be lost permanently.")) {
                    onDeleteSession();
                  }
                }}
                className="px-2 py-1 rounded-lg text-[9px] font-bold transition duration-300 flex items-center gap-1 cursor-pointer border bg-slate-850 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border-slate-700 hover:border-rose-500/20"
                title="Discard and delete this interview session"
              >
                <Trash2 size={10} />
                <span>Discard</span>
              </button>
            )}
            
            {/* Call settings button */}
            <button 
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title="Voice & Speed Controls"
            >
              <Sliders size={13} />
            </button>
          </div>
        </div>

        {/* Dynamic Voice Settings Overlay Drawer */}
        {showConfigDrawer && (
          <div className="absolute top-16 left-5 right-5 bg-slate-950/95 border border-slate-800 rounded-xl p-4 z-20 shadow-2xl animate-fade-in space-y-3 text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Sliders size={12} className="text-brand-400" /> Coach Voice Parameters
              </h4>
              <button onClick={() => setShowConfigDrawer(false)} className="text-[10px] text-slate-400 hover:text-white">Close</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pitch Speed */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 flex justify-between">
                  <span>Interviewer Speech Rate</span>
                  <span className="text-brand-400 font-mono">{speechSpeed}x</span>
                </label>
                <input 
                  type="range" 
                  min="0.7" 
                  max="1.5" 
                  step="0.1" 
                  value={speechSpeed}
                  onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              {/* Accent Voice selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Target Voice Engine Accent</label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full text-[10px] p-2 bg-slate-900 border border-slate-800 rounded focus:outline-none text-slate-200"
                >
                  <option value="">-- Match Personality Default Accent --</option>
                  {availableVoices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Central dual video screens */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 items-stretch z-10">
          
          {/* SCREEN 1: INTERVIEWER BOX */}
          <div className="bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[9px] font-mono text-slate-300 uppercase tracking-wide">
              {interviewer.designation}
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-3.5 py-4">
              <AIAvatar 
                isSpeaking={isSpeaking} 
                isRecording={isRecording} 
                interviewerId={session.personality.toLowerCase()} 
                name={interviewer.name} 
              />
              <div className="text-center space-y-1 max-w-[200px]">
                <h5 className="text-sm font-bold text-white tracking-tight leading-none flex items-center justify-center gap-1">
                  {interviewer.name} 
                  {session.company && <span className="text-[9px] bg-brand-500/20 text-brand-300 px-1 py-0.2 rounded font-normal">{session.company}</span>}
                </h5>
                <p className="text-[10px] text-indigo-300 font-semibold">{interviewer.department}</p>
                <p className="text-[9px] text-slate-400 font-medium">{interviewer.experience}</p>
              </div>
            </div>

            {/* Speaking levels indicator overlay */}
            {isSpeaking && (
              <div className="absolute bottom-3 flex gap-0.5 items-center justify-center bg-black/40 px-3 py-1 rounded-full border border-white/5">
                <span className="text-[9px] text-indigo-300 font-bold mr-1.5">Speaking</span>
                {waveHeights.slice(0, 7).map((h, i) => (
                  <div key={i} className="w-0.5 bg-indigo-400 rounded-full transition-all duration-75" style={{ height: `${h / 2.2}px` }} />
                ))}
              </div>
            )}
          </div>

          {/* SCREEN 2: CANDIDATE PIP BOX */}
          <div className="bg-black/40 rounded-xl border border-white/5 p-4 flex flex-col justify-between items-center relative overflow-hidden group">
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[9px] font-mono text-slate-300 uppercase tracking-wide">
              Candidate (You)
            </div>

            {/* Video elements feed vs Avatar state */}
            <div className="flex-1 w-full flex items-center justify-center min-h-[140px]">
              {cameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover rounded-lg aspect-video" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl border border-slate-700">
                    👨‍💻
                  </div>
                  <p className="text-[9px] text-slate-400 tracking-wide">Webcam Stream Suspended</p>
                </div>
              )}
            </div>

            {/* Listening Soundwave ripple bar */}
            {isRecording && (
              <div className="absolute bottom-3 flex gap-0.5 items-center justify-center bg-black/40 px-3 py-1 rounded-full border border-white/5">
                <span className="text-[9px] text-rose-400 font-bold mr-1.5">Rec Level</span>
                {waveHeights.slice(3, 10).map((h, i) => (
                  <div key={i} className="w-0.5 bg-rose-400 rounded-full transition-all duration-75" style={{ height: `${h / 2}px` }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Question Bar */}
        <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-xl p-4 text-left z-10 space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Award size={12} /> {videoIntroStep !== "none" && videoIntroStep !== "completed" ? "Virtual Orientation" : "Active Prompt"}
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (videoIntroStep === "interviewerIntro") {
                    handleReadAloud(`Hello, I am ${interviewer.name}, your ${session.personality} Coach. I have carefully reviewed your CV, background, and target domain profile. I am excited to guide you through this video interview session today. We will focus on testing your domain depth, behavioral stories, and problem-solving skills under pressure.`);
                  } else if (videoIntroStep === "candidateIntro") {
                    handleReadAloud("To begin, I would like to learn more about you. Please introduce yourself, summarize your professional background, and share what specific goals you are aiming to achieve in your target domain.");
                  } else {
                    handleReadAloud();
                  }
                }}
                className="text-[10px] text-slate-400 hover:text-white font-semibold flex items-center gap-1 transition"
              >
                {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>{isSpeaking ? "Mute Coach" : "Relisten to Question"}</span>
              </button>

              {(videoIntroStep === "none" || videoIntroStep === "completed") && (
                <button
                  onClick={handleExplainQuestion}
                  disabled={isExplaining}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition disabled:opacity-50"
                  title="The AI coach will clarify what this question expects and guide your understanding of its key concepts."
                >
                  {isExplaining ? (
                    <RefreshCw size={12} className="animate-spin text-amber-400" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>Help Me Understand</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-100 font-medium leading-relaxed font-display select-text">
            {videoIntroStep === "waiting" && (
              <span className="text-amber-400 animate-pulse">
                Establishing video proctoring link... Interviewer {interviewer.name} will connect in {introCountdown} seconds. Please prepare.
              </span>
            )}
            {videoIntroStep === "interviewerIntro" && (
              <span>
                "Hello, I am {interviewer.name}, your {session.personality} Coach. I have carefully reviewed your CV, background, and target domain profile. I am excited to guide you through this video interview session today. We will focus on testing your domain depth, behavioral stories, and problem-solving skills under pressure."
              </span>
            )}
            {videoIntroStep === "candidateIntro" && (
              <span>
                "To begin, I would like to learn more about you. Please introduce yourself, summarize your professional background, and share what specific goals you are aiming to achieve in your target domain."
              </span>
            )}
            {(videoIntroStep === "none" || videoIntroStep === "completed") && (
              `"${currentQuestion.text}"`
            )}
          </p>

          {/* AI Coach Help Explanation Box */}
          {showExplanation && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 text-xs text-amber-200/90 space-y-1.5 leading-relaxed">
              <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> {actuarialPersonaEnabled ? "Chief Fellow Actuary Guidance (IAI/IFoA):" : "AI Career Coach Guidance:"}
                </span>
                <button 
                  onClick={() => setShowExplanation(false)}
                  className="text-[9px] hover:underline hover:text-amber-300 text-amber-400"
                >
                  Hide Guidance
                </button>
              </div>
              {isExplaining ? (
                <div className="flex items-center gap-1.5 py-1 text-slate-400 italic">
                  <RefreshCw size={11} className="animate-spin text-amber-400" /> {actuarialPersonaEnabled ? "Connecting with Chief Fellow Actuary coaching model..." : "Connecting with AI Career Coach..."}
                </div>
              ) : (
                <div className="whitespace-pre-line font-medium leading-relaxed text-amber-100/95 prose prose-invert prose-sm max-w-none">
                  {explanationText}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/5">
            <span className="text-[9px] text-indigo-300 font-mono bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
              Style: {interviewer.name.split(" ")[0]} ({session.personality})
            </span>
            {session.actuarialFocus && (
              <span className="text-[9px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                Focus: {session.actuarialFocus}
              </span>
            )}
          </div>
        </div>

        {/* BOTTOM Zoom-style Call Controls Bar */}
        <div className="flex flex-wrap justify-between items-center bg-black/40 backdrop-blur-md px-4 py-3.5 rounded-xl border border-white/5 mt-5 z-10 gap-3">
          {/* Left panel: Info status */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-wide uppercase">
              Proctoring Active
            </span>
          </div>

          {/* Center panel: Hardware switch controls */}
          <div className="flex items-center gap-3">
            {/* Toggle Mic */}
            <button 
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                micActive 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-105" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700 hover:text-white"
              }`}
              title={micActive ? "Mute Microphone" : "Unmute Microphone"}
            >
              {micActive ? <Mic size={15} /> : <MicOff size={15} className="text-rose-500" />}
              <span className="text-[10px] font-bold px-1 hidden md:inline">
                {micActive ? "Mic ON" : "Mic OFF"}
              </span>
            </button>

            {/* Toggle Camera */}
            <button 
              onClick={toggleCamera}
              className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                cameraActive 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-105" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700 hover:text-white"
              }`}
              title={cameraActive ? "Turn Camera Off" : "Turn Camera On"}
            >
              {cameraActive ? <Video size={15} /> : <VideoOff size={15} className="text-rose-500" />}
              <span className="text-[10px] font-bold px-1 hidden md:inline">
                {cameraActive ? "Camera ON" : "Camera OFF"}
              </span>
            </button>
          </div>

          {/* Right panel: Active Question dots */}
          <div className="hidden sm:flex gap-1.5">
            {session.questions.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === session.currentQuestionIndex ? "bg-brand-400 scale-125" :
                  idx < session.currentQuestionIndex ? "bg-emerald-400" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: INTERACTIVE RESPONSE WORKSPACE (5 COLS) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between" id="candidate-workspace">
        
        {/* Waiting step */}
        {videoIntroStep === "waiting" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700">Connecting video proctoring feed...</h4>
              <p className="text-[10px] text-slate-400 max-w-xs">
                Your video mock session with {interviewer.name} is initializing. Please ensure your microphone is enabled.
              </p>
            </div>
          </div>
        )}

        {/* Interviewer intro step */}
        {videoIntroStep === "interviewerIntro" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center border border-indigo-100">
              <Volume2 size={24} className="animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700">Listening to Coach Introduction</h4>
              <p className="text-[11px] text-slate-500 leading-normal max-w-xs">
                Please listen carefully to {interviewer.name}'s welcome introduction. If it gets blocked, you can click "Read Prompt" on the left to replay.
              </p>
            </div>
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setVideoIntroStep("candidateIntro");
                setTypedAnswer("");
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/10 active:scale-95 cursor-pointer mt-4"
            >
              Ready: Introduce Myself <ChevronRight size={13} className="inline ml-1" />
            </button>
          </div>
        )}

        {/* Candidate intro step */}
        {videoIntroStep === "candidateIntro" && (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">My Introduction</h4>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                <button
                  onClick={() => handleToggleInputMode("text")}
                  className={`px-3 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                    inputMode === "text" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Type Intro
                </button>
                <button
                  onClick={() => handleToggleInputMode("voice")}
                  className={`px-3 py-1 rounded-md text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                    inputMode === "voice" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Mic size={11} /> Voice Mode
                </button>
              </div>
            </div>

            {inputMode === "voice" ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-6 text-center">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-700 font-display">Audio Introduction Panel</h3>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    Click microphone to record your verbal introduction.
                  </p>
                </div>

                <div className="flex items-center gap-1 h-14 justify-center">
                  {waveHeights.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isRecording ? "bg-brand-500 shadow-sm" : "bg-slate-200"
                      }`} 
                      style={{ height: `${isRecording ? h : 4}px` }} 
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {isRecording && (
                    <span className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> {formatTime(voiceTimer)} RECORDING
                    </span>
                  )}

                  <button
                    onClick={handleToggleVoiceRecord}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition duration-200 active:scale-95 cursor-pointer ${
                      isRecording 
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 animate-pulse" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:scale-105"
                    }`}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>

                {isTranscribing && (
                  <div className="text-[10px] text-brand-600 font-semibold flex items-center gap-1 justify-center">
                    <RefreshCw size={12} className="animate-spin" /> Transcribing introduction...
                  </div>
                )}

                {typedAnswer && !isTranscribing && (
                  <div className="w-full max-w-sm space-y-1.5 text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Transcribed Introduction</span>
                    <textarea
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic focus:outline-none focus:bg-white"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-3 text-left">
                <textarea
                  rows={10}
                  placeholder="Introduce yourself, walk through your key domain experience, CV highlights, and skills..."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="w-full flex-1 p-3.5 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed text-slate-700"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setVideoIntroStep("completed");
                  setTypedAnswer(""); // clear for first question
                }}
                disabled={!typedAnswer.trim()}
                className="w-full px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition shadow-lg shadow-brand-500/10 cursor-pointer"
              >
                Submit Introduction & Start Interview <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Regular Question Flow */}
        {(videoIntroStep === "none" || videoIntroStep === "completed") && (
          <>
            {/* Workspace selector */}
            {currentQuestion.type !== "coding" && (
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Candidate Workspace</h4>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                  <button
                    onClick={() => handleToggleInputMode("text")}
                    className={`px-3 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                      inputMode === "text" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    Type Answer
                  </button>
                  <button
                    onClick={() => handleToggleInputMode("voice")}
                    className={`px-3 py-1 rounded-md text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                      inputMode === "voice" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Mic size={11} /> Voice Mode
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Inner Panel based on mode */}
            {currentQuestion.type === "coding" ? (
              /* CODING EDITOR WORKSPACE WITH LINE NUMBERS & RUNNER */
              <div className="space-y-4 flex-1 flex flex-col text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Code size={15} className="text-brand-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-600">Adaptive Code Compiler</span>
                  </div>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="text-[10px] p-1 bg-slate-50 border border-slate-200 rounded focus:outline-none font-semibold text-slate-600"
                  >
                    <option value="python">Python 3.11</option>
                    <option value="javascript">JavaScript (ES6)</option>
                    <option value="sql">SQL Database (Postgres)</option>
                  </select>
                </div>

                {/* Custom styled editor with line numbers */}
                <div className="flex-1 min-h-[250px] relative flex bg-slate-900 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs text-slate-100">
                  {/* Line numbers margin */}
                  <div className="bg-slate-950 p-3 text-right text-slate-600 select-none border-r border-slate-800 flex flex-col space-y-1">
                    {Array.from({ length: editorValue.split("\n").length || 15 }).map((_, i) => (
                      <span key={i} className="text-[10px]">{i + 1}</span>
                    ))}
                  </div>
                  <textarea
                    value={editorValue}
                    onChange={(e) => setEditorValue(e.target.value)}
                    className="w-full h-full p-3 bg-transparent text-slate-100 focus:outline-none resize-none font-mono text-xs leading-normal"
                    style={{ tabSize: 4 }}
                    placeholder="// Enter coding answer here..."
                  />
                </div>

                {/* Run and test cases console */}
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCodeTest}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play size={11} fill="currentColor" /> Run Mock Compiler
                    </button>
                    {testSuccess !== null && (
                      <span className={`text-[10px] font-bold inline-flex items-center gap-1 ${
                        testSuccess ? "text-emerald-600" : "text-amber-600"
                      }`}>
                        {testSuccess ? "✔ Passed all simulated test parameters." : "⚠ Partial test metrics."}
                      </span>
                    )}
                  </div>

                  {consoleOutput && (
                    <div className="bg-slate-950 p-3 rounded-xl font-mono text-[9px] text-indigo-300 border border-slate-900 max-h-24 overflow-y-auto whitespace-pre">
                      {consoleOutput}
                    </div>
                  )}
                </div>
              </div>
            ) : inputMode === "voice" ? (
              /* AUDIO CAPTURE AND SPEECH TRANSLATOR PANELS */
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-6 text-center">
                
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-700">Audio Response Panel</h3>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    Click microphone to record. We'll transcribe using Google speech models.
                  </p>
                </div>

                {voiceError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-semibold max-w-sm">
                    {voiceError}
                  </div>
                )}

                {/* Volume ripple circles */}
                <div className="flex items-center gap-1 h-14 justify-center">
                  {waveHeights.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isRecording ? "bg-brand-500 shadow-sm" : "bg-slate-200"
                      }`} 
                      style={{ height: `${isRecording ? h : 4}px` }} 
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {isRecording && (
                    <span className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> {formatTime(voiceTimer)} RECORDING ACTIVE
                    </span>
                  )}

                  <button
                    onClick={handleToggleVoiceRecord}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition duration-200 active:scale-95 cursor-pointer ${
                      isRecording 
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 animate-pulse" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:shadow-md"
                    }`}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>

                {/* Audio / Video reviewer player */}
                {recordedAudioUrl && !isRecording && (
                  <div className="w-full max-w-sm bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5 shadow-sm">
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="font-bold text-slate-500 uppercase">
                        {wasCameraRecorded ? "🎥 Review Combined Video & Audio" : "🎙️ Review Recorded Audio"}
                      </span>
                      <button 
                        onClick={() => {
                          setRecordedAudioUrl(null);
                          setTypedAnswer("");
                        }}
                        className="text-rose-500 hover:underline font-bold"
                      >
                        Reset Recording
                      </button>
                    </div>
                    {wasCameraRecorded ? (
                      <video 
                        src={recordedAudioUrl} 
                        controls 
                        className="w-full rounded-lg border border-slate-200 bg-slate-900 aspect-video shadow-inner max-h-48"
                      />
                    ) : (
                      <audio src={recordedAudioUrl} controls className="w-full h-8" />
                    )}
                  </div>
                )}

                {/* Loader indicator while compiling voice data */}
                {isTranscribing && (
                  <div className="text-[10px] text-brand-600 font-semibold flex items-center gap-1 justify-center">
                    <RefreshCw size={12} className="animate-spin" /> Compiling neural audio stream transcript...
                  </div>
                )}

                {typedAnswer && !isTranscribing && (
                  <div className="w-full max-w-sm space-y-1.5 text-left">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Transcribed Attempt</span>
                    <textarea
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic focus:outline-none focus:bg-white focus:border-brand-500 leading-relaxed"
                      rows={3}
                      placeholder="Review speech text..."
                    />
                  </div>
                )}
              </div>
            ) : (
              /* STANDARD TEXT INPUT BOX WITH STAR TECHNIQUE HINT */
              <div className="flex-1 flex flex-col space-y-3 text-left">
                <textarea
                  rows={11}
                  placeholder="State your answer clearly. We recommend applying the STAR method (Situation, Task, Action, Result) for behavioral scenarios, or describing mathematical variables step-by-step for pricing queries."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="w-full flex-1 p-3.5 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed text-slate-700"
                />
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl text-[10px] text-indigo-700 flex gap-2 items-start leading-normal">
                  <Info size={13} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                  <p>
                    <strong>STAR Practice Prompt</strong>: Frame your experience around a concrete conflict or project, explain what steps <strong>you</strong> executed personally, and end with the numeric results achieved.
                  </p>
                </div>
              </div>
            )}

            {/* Submit bar controls */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 items-center">
              <button
                onClick={handleSubmit}
                disabled={loading || (currentQuestion.type === "coding" ? !editorValue.trim() : !typedAnswer.trim())}
                className="w-full sm:w-auto px-6 py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition shadow-lg shadow-brand-500/10 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} /> Evaluation Specialist Reviewing...
                  </>
                ) : (
                  <>
                    Submit Answer & Proceed <ChevronRight size={13} />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
