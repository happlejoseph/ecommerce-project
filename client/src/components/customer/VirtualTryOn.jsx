

import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker, } from "@mediapipe/tasks-vision";

const VirtualTryOn = () => {

  const videoRef = useRef(null);

  const handLandmarkerRef = useRef(null);

  const animationFrameRef = useRef(null);

  const wristMarkerRef = useRef(null);

  const landmarkRefs = useRef([]);

  const watchAnchorRef = useRef(null);

  const watchRef = useRef(null);

  useEffect(() => {
    let stream;


    const createHandLandmarker = async () => {
      try {

        const vision = await FilesetResolver.forVisionTasks(
          "/mediapipe/wasm"
        );


        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",

              delegate: "GPU",
            },


            runningMode: "VIDEO",


            numHands: 1,
          });

        handLandmarkerRef.current = handLandmarker;

        console.log("Hand detector loaded successfully");
      } catch (error) {
        console.error("Failed to load hand detector:", error);
      }
    };


    const startCamera = async () => {

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
      
      catch (error) {
        console.error("Camera access failed:", error);
      }
    };

    const detectHand = ()=> {

        if(!videoRef.current || !handLandmarkerRef.current) {

            animationFrameRef.current = requestAnimationFrame(detectHand);
            return;
        }

        const video = videoRef.current;

        if(video.readyState >= 2) {
            const results = handLandmarkerRef.current.detectForVideo(
                video, performance.now()
            );

            if(results.landmarks && results.landmarks.length > 0) {
                const hand = results.landmarks[0];

                const wrist = hand[0];

                const point1 = hand[5];
                const point2 = hand[17];

                const dx = point2.x - point1.x;
                const dy = point2.y - point1.y;

                const distance = Math.sqrt(
                  dx * dx + dy * dy
                );

                console.log('Hnad width:', distance);
                

                hand.forEach((landmark, index)=> {
                  const dot = landmarkRefs.current[index];

                  if(dot && videoRef.current) {
                    const video = videoRef.current;

                    const x = landmark.x * video.clientWidth;
                    const y = landmark.y * video.clientHeight;

                    dot.style.display = 'block';
                    dot.style.left = `${x}px`;
                    dot.style.top = `${y}px`;
                  }
                });

                if(wristMarkerRef.current && videoRef.current) {
                    const video = videoRef.current;

                    const x = wrist.x * video.clientWidth;
                    const y = wrist.y * video.clientHeight;

                    wristMarkerRef.current.style.display = "block";
                    wristMarkerRef.current.style.left = `${x}px`;
                    wristMarkerRef.current.style.top = `${y}px`;

                  if(watchAnchorRef.current) {
                  watchAnchorRef.current.style.display = "block";
                  watchAnchorRef.current.style.left = `${x}px`;
                  watchAnchorRef.current.style.top = `${y}px`;
                }

                if(watchRef.current) {
                  watchRef.current.style.display = "block";
                  watchRef.current.style.left = `${x}px`;
                  watchRef.current.style.top = `${y}px`;
                }
                }
            }
        }

        animationFrameRef.current= requestAnimationFrame(detectHand);
    }

    createHandLandmarker();

    startCamera();

animationFrameRef.current = requestAnimationFrame(detectHand);

return () => {
  if (stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  if (animationFrameRef.current) {
    cancelAnimationFrame(animationFrameRef.current);
  }

  if (handLandmarkerRef.current) {
    handLandmarkerRef.current.close();
    handLandmarkerRef.current = null;
  }
};
  }, []);

  return (
  <div className="relative overflow-hidden rounded-xl bg-black">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full"
    />

    {Array.from({ length: 21 }).map((_, index) => (
      <div
        key={index}
        ref={(element) => {
          landmarkRefs.current[index] = element;
        }}
        className="absolute h-2 w-2 rounded-full bg-blue-500"
        style={{
          display: "none",
          transform: "translate(-50%, -50%)",
        }}
      />
  ))}

    <div
      ref={wristMarkerRef}
      className="pointer-events-none absolute h-5 w-5 rounded-full bg-red-500"
      style={{
        display: "none",
        transform: "translate(-50%, -50%)",
      }}
    />

    <div
      ref={watchAnchorRef}
      className="pointer-events-none absolute h-3 w-3 rounded-full bg-yellow-400"
      style={{
        display: "none",
        transform: "translate(-50%, -50%)",
      }}
      />

      <img
      ref={watchRef}
      src="/ora-logo.png"
      alt="watch"
      className="pointer-events-none absolute h-20 w-20 object-contain"
      style={{
        display: "none",
        transform: "translate(-50%, -50%)",
      }}
      />
  </div>

  
);
};

export default VirtualTryOn;