

import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker, } from "@mediapipe/tasks-vision";

const VirtualTryOn = ({watchImage}) => {

  const videoRef = useRef(null);

  const handLandmarkerRef = useRef(null);

  const animationFrameRef = useRef(null);

  const wristMarkerRef = useRef(null);

  const landmarkRefs = useRef([]);

  const watchAnchorRef = useRef(null);

  const watchRef = useRef(null);

  const smoothXRef = useRef(null);

  const smoothYRef = useRef(null);

  const smoothSizeRef = useRef(null);

  const smoothAngleRef = useRef(null);

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

                const widthDx = point2.x - point1.x;
                const widthDy = point2.y - point1.y;
                
                const distance = Math.sqrt(
                  widthDx * widthDx + widthDy * widthDy
                );

                const wristPoint = hand[0];
                const middleBase = hand[9];

                const handDirX = middleBase.x - wrist.x;
                const handDirY = middleBase.y - wrist.y;

                const dirLength = Math.sqrt(
                  handDirX * handDirX + handDirY * handDirY
                );

                const dirX = handDirX / dirLength;
                const dirY = handDirY / dirLength;

                const angleDx = middleBase.x - wristPoint.x;
                const angleDy = middleBase.y - wristPoint.y;

                const angle = Math.atan2(angleDy, angleDx) * (180 / Math.PI);

                const smoothAngleFactor = 0.15;

                if(smoothAngleRef.current === null) {
                  smoothAngleRef.current = angle;
                }

                smoothAngleRef.current = smoothAngleRef.current + (angle - smoothAngleRef.current) * smoothAngleFactor;

                const targetWatchSize = distance * 400;

                const smoothSizeFactor = 0.15;

                if(smoothSizeFactor.current === null) {
                  smoothSizeRef.current = targetWatchSize;
                }

                smoothSizeRef.current = smoothSizeRef.current + (targetWatchSize - smoothSizeRef.current) * smoothSizeFactor;
                

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

                  const offsetPixels = smoothSizeRef.current * 0.25;

                  const offsetX = (dirX * offsetPixels) / video.clientWidth;

                  const offsetY = (dirY * offsetPixels) / video.clientHeight;

                  const watchX = (wrist.x - offsetX) * video.clientWidth;

                  const watchY = (wrist.y - offsetY) * video.clientHeight;

                  const smoothFactor = 0.15;

                if (smoothXRef.current === null) {
                  smoothXRef.current = watchX;
                  smoothYRef.current = watchY;
                }

                smoothXRef.current = smoothXRef.current + (watchX - smoothXRef.current) * smoothFactor;

                smoothYRef.current = smoothYRef.current + (watchY - smoothYRef.current) * smoothFactor;

                  watchRef.current.style.display = "block";
                  watchRef.current.style.left = `${smoothXRef.current}px`;
                  watchRef.current.style.top = `${smoothYRef.current}px`;

                  watchRef.current.style.width = `${smoothSizeRef.current}px`;
                  watchRef.current.style.height = `${smoothSizeRef.current}px`;

                  watchRef.current.style.transform = `translate(-50%, -50%) rotate(${smoothAngleRef.current}deg)`;
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
      src={watchImage}
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