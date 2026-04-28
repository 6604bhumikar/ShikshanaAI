import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Camera,
  CheckCircle2,
  FileVideo,
  Monitor,
  ScreenShare,
  StopCircle,
  UploadCloud,
  Video,
} from "lucide-react";

const RECORDING_MODES = [
  { id: "camera", label: "Camera", icon: Camera },
  { id: "screen", label: "Screen", icon: Monitor },
  { id: "both", label: "Camera + Screen", icon: ScreenShare },
];

const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

const getSupportedMimeType = () => {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read video file"));
    reader.readAsDataURL(file);
  });

const getVideoDuration = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });

export default function RecorderPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewUrlRef = useRef("");
  const activeStreamsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);

  const [recorder, setRecorder] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState("screen");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [recordingTitle, setRecordingTitle] = useState("Class Recording");
  const [duration, setDuration] = useState(0);

  const API = import.meta.env.VITE_API_MEDIA || "http://localhost:5000/api/media";
  const TEACHER_API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const selectedUnit = units.find((unit) => unit._id === selectedUnitId);
  const lessons = selectedUnit?.lessons || [];

  const setMessage = (message, type = "info") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const clearPreview = () => {
  if (previewUrlRef.current) {
    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
  }

  const video = videoRef.current;
  if (video) {
    video.pause();
    video.srcObject = null;
    video.removeAttribute("src");
    video.controls = false;
    // remove this line: video.load();
  }
};

  

  const stopActiveStreams = () => {
    activeStreamsRef.current.forEach((stream) =>
      stream.getTracks().forEach((track) => track.stop())
    );
    activeStreamsRef.current = [];

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await axios.get(`${TEACHER_API}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load courses for recorder", err);
        setMessage("Could not load your courses. Please refresh and try again.", "error");
      }
    };

    if (token) loadCourses();
  }, [TEACHER_API, token]);

  useEffect(() => {
    const loadUnits = async () => {
      if (!selectedCourseId) {
        setUnits([]);
        setSelectedUnitId("");
        setSelectedLessonId("");
        return;
      }

      try {
        const res = await axios.get(`${TEACHER_API}/courses/${selectedCourseId}/units`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUnits(Array.isArray(res.data?.units) ? res.data.units : []);
      } catch (err) {
        console.error("Failed to load units for recorder", err);
        setUnits([]);
        setMessage("Could not load modules for the selected course.", "error");
      }
    };

    loadUnits();
  }, [TEACHER_API, selectedCourseId, token]);

  useEffect(() => {
    setSelectedLessonId("");
  }, [selectedUnitId]);

  useEffect(() => {
    return () => {
      stopActiveStreams();
      clearPreview();
    };
  }, []);

  const createCombinedStream = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: true,
    });
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 360 },
      audio: true,
    });

    activeStreamsRef.current = [screenStream, cameraStream];

    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    canvasRef.current = canvas;

    const screenVideo = document.createElement("video");
    const cameraVideo = document.createElement("video");
    screenVideo.srcObject = screenStream;
    cameraVideo.srcObject = cameraStream;
    screenVideo.muted = true;
    cameraVideo.muted = true;

    await Promise.all([screenVideo.play(), cameraVideo.play()]);

    const context = canvas.getContext("2d");
    const draw = () => {
      context.fillStyle = "#020617";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

      const cameraWidth = Math.round(canvas.width * 0.23);
      const cameraHeight = Math.round(cameraWidth * 0.5625);
      const x = canvas.width - cameraWidth - 32;
      const y = canvas.height - cameraHeight - 32;
      context.fillStyle = "rgba(15, 23, 42, 0.85)";
      context.fillRect(x - 6, y - 6, cameraWidth + 12, cameraHeight + 12);
      context.drawImage(cameraVideo, x, y, cameraWidth, cameraHeight);

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    const mixedStream = canvas.captureStream(30);
    const audioTracks = [
      ...screenStream.getAudioTracks(),
      ...cameraStream.getAudioTracks(),
    ];
    audioTracks.forEach((track) => mixedStream.addTrack(track));

    return mixedStream;
  };

  const createRecordingStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error("Your browser does not support website recording.");
    }

    if (recordingMode === "camera") {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      activeStreamsRef.current = [stream];
      return stream;
    }

    if (recordingMode === "screen") {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      activeStreamsRef.current = [stream];
      return stream;
    }

    return createCombinedStream();
  };

  const startRecording = async () => {
    try {
      clearPreview();
      setVideoFile(null);
      setDuration(0);
      setUploadProgress(0);
      setMessage("");

      const stream = await createRecordingStream();
      const mimeType = getSupportedMimeType();
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      chunksRef.current = [];
      startedAtRef.current = Date.now();

      rec.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };

      rec.onstop = () => {
        const blobType = rec.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        const fileName = `recording-${Date.now()}.webm`;
        const file = new File([blob], fileName, { type: blobType });

        stopActiveStreams();
        setVideoFile(file);
        setDuration(Math.round((Date.now() - startedAtRef.current) / 1000));
        previewUrlRef.current = URL.createObjectURL(file);

        if (videoRef.current) {
           const video = videoRef.current;
           video.pause();
           video.srcObject = null;
           video.src = previewUrlRef.current;
           video.controls = true;
           video.muted = false;
}

       

        setMessage("Recording ready. Preview it, then upload when you are happy with it.", "success");
      };

      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (rec.state === "recording") {
            rec.stop();
            setRecording(false);
          }
        };
      });

        if (videoRef.current) {
  const video = videoRef.current;

  video.pause();
  video.removeAttribute("src");
  video.srcObject = stream;
  video.controls = false;
  video.muted = true;

  try {
    await video.play();
  } catch (err) {
    console.log("Live preview play skipped:", err.message);
  }
}

     
      rec.start(1000);
      setRecorder(rec);
      setRecording(true);
      setMessage("Recording started. Keep this tab open until you stop.", "info");
    } catch (err) {
      console.error("Recording start failed", err);
      stopActiveStreams();
      const denied = ["NotAllowedError", "PermissionDeniedError"].includes(err?.name);
      setMessage(
        denied
          ? "Camera or screen permission was denied. Allow access in the browser and try again."
          : err?.message || "Could not start recording.",
        "error"
      );
    }
  };

  const stopRecording = () => {
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    setRecording(false);
    setRecorder(null);
  };

  const handleSavedVideo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isSupported =
      ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) ||
      /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isSupported) {
      setMessage("Please choose an MP4, WEBM, or MOV recording.", "error");
      event.target.value = "";
      return;
    }

    clearPreview();
    stopActiveStreams();
    setVideoFile(file);
    setDuration(await getVideoDuration(file));
    setRecordingTitle(file.name.replace(/\.[^.]+$/, "") || "Uploaded Recording");
    previewUrlRef.current = URL.createObjectURL(file);

    if (videoRef.current) {
     const video = videoRef.current;

  video.pause();
  video.srcObject = null;
  video.src = previewUrlRef.current;
  video.controls = true;
  video.muted = false;
}


    setMessage("Saved recording loaded. Preview it before uploading.", "success");
  };

  const uploadVideo = async () => {
    if (!videoFile) {
      setMessage("Record or choose a saved video first.", "error");
      return;
    }
    if (!selectedCourseId) {
      setMessage("Please select a course before uploading.", "error");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage("Preparing upload...", "info");
      const fileData = await readFileAsDataUrl(videoFile);

      const res = await axios.post(
        `${API}/upload`,
        {
          courseId: selectedCourseId,
          moduleId: selectedUnitId || "",
          lessonId: selectedLessonId || "standalone",
          title: recordingTitle.trim() || "Class Recording",
          duration,
          fileName: videoFile.name || `recording-${Date.now()}.webm`,
          fileData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          },
        }
      );

      setMessage(
        selectedLessonId
          ? "Upload complete and attached to the selected lesson."
          : "Upload complete. The recording is saved for this course.",
        "success"
      );
      console.log("Uploaded recording stream:", res.data?.streamUrl);
    } catch (err) {
      console.error("Upload failed", err);
      setMessage(err?.response?.data?.message || "Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/15 text-rose-300 rounded-lg">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Teacher Recording Studio</h1>
              <p className="text-sm text-slate-400">Record camera, screen, or both and upload to course content.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        <section className="space-y-5">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
            <video ref={videoRef} controls className="w-full h-full object-contain" playsInline />
            {!videoFile && !recording && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-500">
                <FileVideo className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold text-slate-300">Ready to record or upload</p>
              </div>
            )}
            {recording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full shadow-lg">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wide">Recording</span>
              </div>
            )}
          </div>

          {statusMessage && (
            <div
              className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                statusType === "error"
                  ? "bg-red-500/10 border-red-500/30 text-red-200"
                  : statusType === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                  : "bg-sky-500/10 border-sky-500/30 text-sky-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECORDING_MODES.map((mode) => {
                const Icon = mode.icon;
                const active = recordingMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    disabled={recording}
                    onClick={() => setRecordingMode(mode.id)}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600"
                    } disabled:opacity-60`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500"
                >
                  <Video className="w-5 h-5" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
                >
                  <StopCircle className="w-5 h-5" />
                  Stop Recording
                </button>
              )}

              <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500 cursor-pointer">
                <UploadCloud className="w-5 h-5" />
                Choose Saved Video
                <input
                  type="file"
                  className="hidden"
                  accept={VIDEO_ACCEPT}
                  onChange={handleSavedVideo}
                  disabled={recording}
                />
              </label>
            </div>
          </div>
        </section>

        <aside className="bg-slate-900 border border-slate-800 rounded-lg p-5 h-fit space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Upload Details</h2>
            <p className="text-sm text-slate-400">Attach to a lesson, or save it against the course/module.</p>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Title</span>
            <input
              value={recordingTitle}
              onChange={(event) => setRecordingTitle(event.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
              placeholder="Recording title"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Course</span>
            <select
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                setSelectedUnitId("");
                setSelectedLessonId("");
              }}
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Module</span>
            <select
              value={selectedUnitId}
              onChange={(event) => setSelectedUnitId(event.target.value)}
              disabled={!selectedCourseId}
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400 disabled:opacity-60"
            >
              <option value="">Course level</option>
              {units.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  {unit.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-400">Lesson</span>
            <select
              value={selectedLessonId}
              onChange={(event) => setSelectedLessonId(event.target.value)}
              disabled={!selectedUnitId}
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400 disabled:opacity-60"
            >
              <option value="">Standalone / module recording</option>
              {lessons.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </label>

          {videoFile && (
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 text-sm text-slate-300">
              <div className="font-semibold text-white truncate">{videoFile.name}</div>
              <div className="mt-1 text-slate-400">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                {duration ? ` - ${Math.floor(duration / 60)}m ${duration % 60}s` : ""}
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{uploadProgress}% uploaded</p>
            </div>
          )}

          <button
            onClick={uploadVideo}
            disabled={!videoFile || uploading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UploadCloud className="w-5 h-5" />
            {uploading ? "Uploading..." : "Upload Recording"}
          </button>
        </aside>
      </main>
    </div>
  );
}
