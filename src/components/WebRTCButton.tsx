import {
  ChangeEvent,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Role,
  useDisclosureState,
  useDisclosureContent,
  useDisclosure,
} from "reakit";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

let bigrandstring;
let serverConnection;
let localStream;
var peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};
function createBigRandString() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

const API_URL = process?.env.API_URL || "http://127.0.0.1:3001";

function WebRTCButton() {
  const state = useDisclosureState({ visible: true });
  const contentProps = useDisclosureContent(state);
  const disclosureProps = useDisclosure(state);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const shouldThreshold = useRef<boolean | null>(null);
  const thresholdValue = useRef<number>(1);
  const shouldPixelate = useRef<boolean | null>(null);
  const pixelValue = useRef<number>(1);

  const [hasMedia, setHasMedia] = useState(false);

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handlePixelate = (e: React.MouseEvent<HTMLButtonElement>) => {
    shouldPixelate.current = !shouldPixelate.current;
  };

  const handleThreshold = (e: React.MouseEvent<HTMLButtonElement>) => {
    shouldThreshold.current = !shouldThreshold.current;
  };

  const handleSliderChange = (n: number) => {
    thresholdValue.current = n;
  };

  const handlePixelChange = (n: number) => {
    pixelValue.current = n;
  };

  const handleRangeChange = (value: number[]) => {};

  const handleOnMessage = (message: MessageEvent<any>) => {};

  function getUserMediaSuccess(stream: MediaStream) {
    localStream = stream;
    (localVideoRef.current as HTMLVideoElement).srcObject = stream;
    setHasMedia(true);
  }

  function pixelate(pixelSize: number) {
    let wScaled, hScaled, scale;

    scale = 1 / pixelSize;
    wScaled = canvasRef.current!.width * scale;
    hScaled = canvasRef.current!.height * scale;
    ctxRef.current!.drawImage(canvasRef.current!, 0, 0, wScaled, hScaled);

    ctxRef.current!.imageSmoothingEnabled = false;
    ctxRef.current!.drawImage(
      canvasRef.current!,
      0,
      0,
      wScaled,
      hScaled,
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );
  }
  function threshold(threshold: React.MutableRefObject<number>) {
    let image, data, r, g, b, color;
    image = ctxRef.current!.getImageData(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );
    data = image.data;

    for (let i = 0; i < data.length; i = i + 4) {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];

      if ((r + b + g) / 3 < threshold.current) {
        color = 0; // black
      } else {
        color = 255; // white
      }

      data[i] = data[i + 1] = data[i + 2] = color;
    }

    image.data.set(data);
    ctxRef.current!.putImageData(image, 0, 0);
  }

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      ctxRef.current!.drawImage(
        localVideoRef.current!,
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
      if (shouldPixelate.current) {
        pixelate(pixelValue.current);
      }
      if (shouldThreshold.current) {
        threshold(thresholdValue);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // bigrandstring = createBigRandString();
    // serverConnection = new WebSocket(
    //   "wss://" + window.location.hostname + ":3002"
    // );
    // serverConnection.onmessage = handleOnMessage;

    var constraints = {
      video: true,
      audio: true,
    };

    if (navigator.mediaDevices.getUserMedia && !hasMedia) {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream: MediaStream) => getUserMediaSuccess(stream))
        .catch((e) => console.error(e));
    }
    if (canvasRef.current) ctxRef.current = canvasRef.current.getContext("2d");
    if (ctxRef.current) animate(0);
  }, [canvasRef.current, ctxRef.current]);

  return (
    <>
      <Role as="button" {...disclosureProps}>
        Web RTC
      </Role>
      <Role {...contentProps}>
        <video
          hidden
          autoPlay
          id="localVideo"
          muted
          ref={localVideoRef}
        ></video>
        <canvas ref={canvasRef} width="640" height="480"></canvas>
        <video autoPlay id="remoteVideo" ref={remoteVideoRef}></video>
        <button id="start" onClick={handleStart} value="Start Video">
          Go Online
        </button>
        <div>
          <button id="start" onClick={handlePixelate}>
            Should Pixelate
          </button>
          <Slider min={1} max={10} step={0.2} onChange={handlePixelChange} />
        </div>
        <div>
          <button id="start" onClick={handleThreshold}>
            Should Threshold
          </button>
          <Slider min={1} max={255} step={5} onChange={handleSliderChange} />
          <Range min={1} max={5} onChange={handleRangeChange} />
        </div>
      </Role>
    </>
  );
}

export default WebRTCButton;
