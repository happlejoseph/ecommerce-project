

import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker, } from "@mediapipe/tasks-vision";

const VirtualTryOn = () => {

  const videoRef = useRef(null);

  const handLandmarkerRef = useRef(null);

  const animationFrameRef = useRef(null);

  const wristMarkerRef = useRef(null);

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

                console.log('wrist:', wrist);

                if(wristMarkerRef.current && videoRef.current) {
                    const video = videoRef.current;deoRef.curre

                    const x = wrist.x * video.clientWidth;
                    const y = wrist.y * video.clientHeight;

                    wristMarkerRef.current.style.display = "block";
                    wristMarkerRef.current.style.left = `${x}px`;
                    wristMarkerRef.current.style.top = `${y}px`;
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

    <div
      ref={wristMarkerRef}
      className="pointer-events-none absolute h-5 w-5 rounded-full bg-red-500"
      style={{
        display: "none",
        transform: "translate(-50%, -50%)",
      }}
    />
  </div>
);
};

export default VirtualTryOn;