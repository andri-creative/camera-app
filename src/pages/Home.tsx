import React, { useState, useRef, useEffect } from "react";
import {
  useIonViewWillEnter,
  useIonToast,
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { StatusBar, Style } from "@capacitor/status-bar";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";
import {
  alertOutline,
  folder,
  checkmarkCircleOutline,
  locationOutline,
  timeOutline,
  pinOutline,
  imagesOutline,
  downloadOutline,
  cameraOutline,
  cameraReverseOutline,
} from "ionicons/icons";

const Home: React.FC = () => {
  const history = useHistory();
  const [presentToast] = useIonToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastFetchTime = useRef<number>(0);
  const lastFetchCoords = useRef<{ lat: number; lon: number } | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [locationAddress, setLocationAddress] = useState<string>("Locating...");
  const [coordinates, setCoordinates] = useState<string>("-");
  const [rawCoords, setRawCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [timeData, setTimeData] = useState({
    hourMinute: "",
    day: "",
    monthYear: "",
  });

  // Clock Logic
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeData({
        hourMinute: now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        day: now.toLocaleDateString("id-ID", { day: "numeric" }),
        monthYear: now.toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        }),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Geolocation & Reverse Geocoding
  useEffect(() => {
    const fetchAddress = async (lat: number, lon: number) => {
      const now = Date.now();

      // Calculate distance from last fetched location
      let distanceMoved = 999;
      if (lastFetchCoords.current) {
        distanceMoved = getDistance(
          lastFetchCoords.current.lat,
          lastFetchCoords.current.lon,
          lat,
          lon,
        );
      }

      // THROTTLE: Only fetch if 5 seconds passed AND moved > 5 meters
      // UNLESS we are still in "Locating..." state
      if (
        locationAddress !== "Locating..." &&
        (now - lastFetchTime.current < 5000 || distanceMoved < 5)
      ) {
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        );
        const data = await response.json();

        if (data && data.display_name) {
          setLocationAddress(data.display_name);
          lastFetchTime.current = now;
          lastFetchCoords.current = { lat, lon };
        }
      } catch (err) {
        console.error("Error fetching address:", err);
      }
    };

    // Helper to calculate distance in meters
    const getDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371e3; // metres
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setRawCoords({ lat: latitude, lon: longitude });
        setCoordinates(`${latitude.toFixed(6)} / ${longitude.toFixed(6)}`);
        fetchAddress(latitude, longitude);
      },
      (err) => {
        console.error("Geo error:", err);
        setLocationAddress("Permission denied");
      },
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const startCamera = async () => {
    try {
      // Check if current stream is already matching the facingMode
      if (videoRef.current && videoRef.current.srcObject) {
        const currentStream = videoRef.current.srcObject as MediaStream;
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack && videoTrack.readyState === "live") {
          // Stream is already active, no need to restart and cause flicker
          return;
        }
      }

      // Stop current tracks before starting new ones if they are dead or wrong
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const clearPhoto = () => {
    setCapturedImage(null);
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper to draw watermark on canvas
  const drawWatermarkToCanvas = async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Relative units
    const margin = Math.floor(w * 0.04);
    const lineSpacing = Math.floor(h * 0.04);

    // 1. Draw Mini Map (Top Left)
    if (rawCoords) {
      try {
        const mapImg = new Image();
        mapImg.crossOrigin = "anonymous";
        mapImg.src = `https://static-maps.yandex.ru/1.x/?ll=${rawCoords.lon},${rawCoords.lat}&z=14&l=map&size=300,300&pt=${rawCoords.lon},${rawCoords.lat},pm2rdm`;

        await new Promise((resolve) => {
          mapImg.onload = resolve;
          mapImg.onerror = resolve; // Continue even if map fails
        });

        if (mapImg.complete && mapImg.naturalWidth > 0) {
          const mapSize = Math.floor(w * 0.22); // 22% of width
          ctx.strokeStyle = "white";
          ctx.lineWidth = Math.max(1, Math.floor(w * 0.003));
          ctx.strokeRect(margin, margin, mapSize, mapSize);
          // Crop center of 300x300 Yandex image
          ctx.drawImage(
            mapImg,
            110,
            110,
            80,
            80,
            margin,
            margin,
            mapSize,
            mapSize,
          );
        }
      } catch (e) {
        console.error("Map watermark error", e);
      }
    }

    // 2. Draw Info Stamp (Bottom Right)
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.shadowColor = "black";
    ctx.shadowBlur = Math.floor(w * 0.015);

    // Font Sizes
    const timeSize = Math.floor(w * 0.1);
    const dateSize = Math.floor(w * 0.035);
    const addrSize = Math.floor(w * 0.028);
    const coordSize = Math.floor(w * 0.028);

    // Current Y starting from bottom
    let currentY = h - margin;

    // A. Coordinates (Paling Bawah)
    ctx.font = `bold ${coordSize}px Arial`;
    ctx.fillText(coordinates, w - margin, currentY);
    currentY -= coordSize * 1.5;

    // B. Address (Wrappable, di atas Coords)
    ctx.font = `${addrSize}px Arial`;
    const addrWords = locationAddress.split(" ");
    const lines = [];
    let currentLine = "";
    for (let n = 0; n < addrWords.length; n++) {
      const testLine = currentLine + addrWords[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > w * 0.65 && n > 0) {
        lines.push(currentLine);
        currentLine = addrWords[n] + " ";
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw address lines bottom-up
    for (let i = lines.length - 1; i >= 0; i--) {
      ctx.fillText(lines[i], w - margin, currentY);
      currentY -= addrSize * 1.3;
    }

    // C. Date (di atas Alamat)
    currentY -= dateSize * 0.2; // Extra gap
    ctx.font = `bold ${dateSize}px Arial`;
    ctx.fillText(`${timeData.day} ${timeData.monthYear}`, w - margin, currentY);
    currentY -= dateSize * 1.5;

    // D. Time (Large, Paling Atas)
    currentY -= timeSize * 0.1; // Extra gap
    ctx.font = `bold ${timeSize}px Arial`;
    ctx.fillText(timeData.hourMinute, w - margin, currentY);

    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const takePhoto = async () => {
    if (videoRef.current) {
      // Trigger Shutter Effect
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 150);

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add Watermark
        await drawWatermarkToCanvas(canvas);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);

        // Feedback Toast
        presentToast({
          message: "Photo captured successfully!",
          duration: 1500,
          position: "bottom",
          color: "success",
        });
      }
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      // Convert DataURL to Blob for better mobile support
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `gps-photo-${new Date().getTime()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        });
    }
  };

  useEffect(() => {
    startCamera();
  }, [facingMode]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;

        // Apply watermark to uploaded image too
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            await drawWatermarkToCanvas(canvas);
            setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));

            presentToast({
              message: "Album photo processed with GPS!",
              duration: 1500,
              position: "bottom",
              color: "success",
            });
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useIonViewWillEnter(() => {
    // Reset photo states quietly
    clearPhoto();

    // Ensure camera is running but don't force restart if already active
    if (videoRef.current && !videoRef.current.srcObject) {
      startCamera();
    }

    // StatusBar settings
    StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#25671E" }).catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  });

  return (
    <IonPage
      className="custom-bg"
      style={{ "--ion-background-color": "#F8F3E1" }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-bottom-radius">
          <IonGrid className="ion-no-padding">
            <IonRow
              className="ion-justify-content-between ion-align-items-center"
              style={{ padding: "3px 10px" }}
            >
              <IonCol size="auto">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img src="./favicon.svg" style={{ width: 22 }} alt="" />
                </div>
              </IonCol>
               <IonCol size="auto">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => history.push("/about")}
                >
                  <IonButton
                    shape="round"
                    fill="clear"
                    style={{ width: "100%", height: "100%", margin: 0 }}
                    routerLink="/about"
                    routerDirection="forward"
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={alertOutline}
                      style={{ fontSize: "22px", color: "#25671E" }}
                    ></IonIcon>
                  </IonButton>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding bg-primary">
        {/* Welcome Section */}
        <IonGrid
          className="ion-no-padding"
          style={{ marginBottom: "20px", marginTop: "10px" }}
        >
          <IonRow className="ion-justify-content-center">
            <IonCol className="ion-text-center">
              <h1
                style={{
                  margin: 0,
                  fontSize: "26px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  lineHeight: "1.1",
                }}
              >
                Welcome
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#ffffff",
                  marginTop: "-3px",
                }}
              >
                Capture moments with precise location
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Camera Frame Section */}
        <IonGrid className="ion-no-padding" style={{ marginBottom: "20px" }}>
          <IonRow>
            <IonCol>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#1a1a1a",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: "2px solid #25671E",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "10px",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <IonIcon
                  icon={cameraOutline}
                  style={{
                    fontSize: "60px",
                    color: "#25671E",
                    opacity: 0.2,
                    zIndex: 1,
                  }}
                />

                {/* Flip Camera Button */}
                <div
                  onClick={toggleCamera}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    background: "rgba(37, 103, 30, 0.2)",
                    padding: "8px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    border: "1px solid rgba(37, 103, 30, 0.5)",
                    cursor: "pointer",
                  }}
                >
                  <IonIcon
                    icon={cameraReverseOutline}
                    style={{ fontSize: "24px", color: "#ffffff" }}
                  />
                </div>

                {/* Shutter Flash Effect */}
                {isFlashing && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "#ffffff",
                      zIndex: 100,
                      borderRadius: "10px",
                    }}
                  ></div>
                )}

                {/* Camera Corner Accents */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    width: "20px",
                    height: "20px",
                    borderTop: "2px solid #25671E",
                    borderLeft: "2px solid #25671E",
                    zIndex: 2,
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "20px",
                    height: "20px",
                    borderTop: "2px solid #25671E",
                    borderRight: "2px solid #25671E",
                    zIndex: 2,
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    width: "20px",
                    height: "20px",
                    borderBottom: "2px solid #25671E",
                    borderLeft: "2px solid #25671E",
                    zIndex: 2,
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    width: "20px",
                    height: "20px",
                    borderBottom: "2px solid #25671E",
                    borderRight: "2px solid #25671E",
                    zIndex: 2,
                  }}
                ></div>

                {/* Top Left Watermark: Mini Map */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    zIndex: 5,
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "8px",
                      border: "1.5px solid #ffffff",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                      background: "#222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                  >
                    {rawCoords ? (
                      <img
                        src={`https://static-maps.yandex.ru/1.x/?ll=${rawCoords.lon},${rawCoords.lat}&z=14&l=map&size=300,300&pt=${rawCoords.lon},${rawCoords.lat},pm2rdm`}
                        alt="mini map"
                        style={{
                          width: "300px",
                          height: "300px",
                          objectFit: "none",
                          objectPosition: "center",
                          transform: "scale(1)", // Menampilkan ukuran asli di tengah kotak 80x80
                        }}
                      />
                    ) : (
                      "Searching..."
                    )}
                  </div>
                </div>

                {/* Bottom Right Watermark: Detailed Info */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    zIndex: 5,
                    color: "#ffffff",
                    textAlign: "right",
                    maxWidth: "70%",
                    textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      marginBottom: "2px",
                    }}
                  >
                    {timeData.hourMinute}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {timeData.day} <br /> {timeData.monthYear}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      lineHeight: "1.3",
                      marginBottom: "4px",
                      fontWeight: "400",
                    }}
                  >
                    {locationAddress}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                    {coordinates}
                  </div>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Buttons Section */}
        <IonGrid
          className="ion-no-padding"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          <IonRow style={{ margin: "0 -5px" }}>
            <IonCol style={{ padding: "0 5px" }}>
              <IonButton
                onClick={takePhoto}
                style={{
                  width: "100%",
                  "--background": "green",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                shape="round"
              >
                <IonIcon slot="start" icon={cameraOutline} />
                Take Photo
              </IonButton>
            </IonCol>
            <IonCol style={{ padding: "0 5px" }}>
              <IonButton
                onClick={clearPhoto}
                style={{
                  width: "100%",
                  "--background": "#172B16",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                shape="round"
              >
                <IonIcon slot="start" icon={alertOutline} />
                Clear
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Separator Section */}
        <IonGrid className="ion-no-padding">
          <IonRow className="ion-align-items-center">
            <IonCol>
              <div
                style={{
                  borderBottom: "1px solid #ccc",
                }}
              ></div>
            </IonCol>
            <IonCol size="auto" style={{ color: "#ffffffff" }}>
              Or
            </IonCol>
            <IonCol>
              <div
                style={{
                  borderBottom: "1px solid #ccc",
                }}
              ></div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleFileChange}
        />
        <IonGrid
          className="ion-no-padding"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          <IonRow>
            <IonCol
              className="ion-text-center"
              style={{
                border: "1px dashed #fafafa",
                borderRadius: "10px",
              }}
              onClick={triggerFileInput}
            >
              <IonButton
                fill="clear"
                style={{
                  "--color": "#ffffffff",
                  textTransform: "none",
                  fontWeight: "bold",
                  width: "100%",
                }}
              >
                <IonIcon
                  slot="start"
                  icon={selectedFileName ? checkmarkCircleOutline : folder}
                  style={{
                    fontSize: "22px",
                    color: selectedFileName ? "#4db6ac" : "inherit",
                  }}
                />
                {selectedFileName || "Take photos from album"}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        {/* Info List Section */}
        <IonGrid
          className="ion-no-padding"
          style={{
            marginTop: "20px",
            background: "#ffffff",
            borderRadius: "15px",
            padding: "10px 15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {/* Location Item */}
          <IonRow
            className="ion-align-items-center"
            style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}
          >
            <IonCol size="auto" style={{ paddingRight: "15px" }}>
              <IonIcon
                icon={locationOutline}
                style={{ fontSize: "24px", color: "#25671E" }}
              />
            </IonCol>
            <IonCol>
              <div style={{ color: "#666", fontSize: "12px" }}>Location</div>
              <div
                style={{
                  color: "#25671E",
                  fontWeight: "600",
                  fontSize: locationAddress.length > 30 ? "12px" : "14px",
                  lineHeight: "1.2",
                  wordBreak: "break-word",
                }}
              >
                {locationAddress}
              </div>
            </IonCol>
          </IonRow>

          {/* Time Item */}
          <IonRow
            className="ion-align-items-center"
            style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}
          >
            <IonCol size="auto" style={{ paddingRight: "15px" }}>
              <IonIcon
                icon={timeOutline}
                style={{ fontSize: "24px", color: "#25671E" }}
              />
            </IonCol>
            <IonCol>
              <div style={{ color: "#666", fontSize: "12px" }}>Date & Time</div>
              <div
                style={{
                  color: "#25671E",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {timeData.day} {timeData.monthYear}, {timeData.hourMinute}
              </div>
            </IonCol>
          </IonRow>

          {/* Coordinates Item */}
          <IonRow
            className="ion-align-items-center"
            style={{ padding: "12px 0" }}
          >
            <IonCol size="auto" style={{ paddingRight: "15px" }}>
              <IonIcon
                icon={pinOutline}
                style={{ fontSize: "24px", color: "#25671E" }}
              />
            </IonCol>
            <IonCol>
              <div style={{ color: "#666", fontSize: "12px" }}>Coordinates</div>
              <div
                style={{
                  color: "#25671E",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {coordinates}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Buttons Hasils */}
        <IonGrid
          className="ion-no-padding"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          <IonRow style={{ margin: "0 -5px" }}>
            <IonCol style={{ padding: "0 5px" }}>
              <IonButton
                onClick={() =>
                  capturedImage &&
                  history.push("/preview", {
                    image: capturedImage,
                    address: locationAddress,
                    coords: coordinates,
                    time: `${timeData.day} ${timeData.monthYear}, ${timeData.hourMinute}`,
                  })
                }
                disabled={!capturedImage}
                style={{
                  width: "100%",
                  "--background": "green",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: "bold",
                  opacity: capturedImage ? 1 : 0.5,
                }}
                shape="round"
              >
                {capturedImage ? (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      marginRight: "8px",
                      overflow: "hidden",
                      border: "1px solid white",
                    }}
                  >
                    <img
                      src={capturedImage}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ) : (
                  <IonIcon slot="start" icon={imagesOutline} />
                )}
                Preview
              </IonButton>
            </IonCol>
            <IonCol style={{ padding: "0 5px" }}>
              <IonButton
                onClick={downloadPhoto}
                disabled={!capturedImage}
                style={{
                  width: "100%",
                  "--background": "#172B16",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: "bold",
                  opacity: capturedImage ? 1 : 0.5,
                }}
                shape="round"
              >
                <IonIcon slot="start" icon={downloadOutline} />
                Download
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            marginBottom: "20px",
            textAlign: "center",
            color: "#888",
            fontSize: "12px",
            opacity: 0.8
          }}
        >
          <p style={{ margin: "2px 0" }}>© 2026 Team Andri Creative</p>
          <p style={{ margin: "2px 0" }}>Built with Ionic & React</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
