import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from "@ionic/react";
import {
  informationCircleOutline,
  cameraOutline,
  mapOutline,
  timeOutline,
  downloadOutline,
} from "ionicons/icons";
import "./Home.css";

const About: React.FC = () => {
  return (
    <IonPage
      className="custom-bg"
      style={{ "--ion-background-color": "#F8F3E1" }}
    >
      <IonHeader className="ion-no-border">
        <IonToolbar
          className="border-bottom-radius"
          style={{ "--background": "#25671E" }}
        >
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" style={{ color: "white" }} />
          </IonButtons>
          <IonTitle
            style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}
          >
            About Application
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding bg-primary"
        style={{ "--background": "#25671E" }}
      >
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            <img 
              src="/icons/web-app-manifest-192x192.png" 
              alt="App Logo"
              style={{ width: "60px", height: "60px", borderRadius: "12px" }} 
            />
          </div>
          <h2
            style={{ color: "#ffffff", fontWeight: "bold", marginTop: "15px" }}
          >
            Camera GPS PWA
          </h2>
        </div>

        <IonCard
          style={{
            borderRadius: "15px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            margin: 0,
            boxShadow: "none"
          }}
        >
          <IonCardHeader>
            <IonCardTitle
              style={{
                fontSize: "18px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IonIcon
                icon={informationCircleOutline}
                style={{ marginRight: "10px", color: "#ffffff" }}
              />
              Main Features
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent
            style={{ color: "#ffffff", fontSize: "14px", lineHeight: "1.6" }}
          >
            This application is designed to capture photos with automatic
            watermarks including:
            <ul style={{ paddingLeft: "20px", marginTop: "10px", listStyle: "none" }}>
              <li style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                <IonIcon icon={mapOutline} style={{ marginRight: "10px" }} /> Real-time Location Mini-map
              </li>
              <li style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                <IonIcon icon={timeOutline} style={{ marginRight: "10px" }} /> Accurate Date & Timestamp
              </li>
              <li style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                <IonIcon icon={informationCircleOutline} style={{ marginRight: "10px" }} /> Complete Address & GPS Coordinates
              </li>
            </ul>
          </IonCardContent>
        </IonCard>

        <IonCard
          style={{
            borderRadius: "15px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            margin: "20px 0 0 0",
            boxShadow: "none"
          }}
        >
          <IonCardHeader>
            <IonCardTitle
              style={{
                fontSize: "18px",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
              }}
            >
              <IonIcon
                icon={downloadOutline}
                style={{ marginRight: "10px", color: "#ffffff" }}
              />
              How to Install PWA
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent
            style={{ color: "#ffffff", fontSize: "13px", lineHeight: "1.5" }}
          >
            {/* Android Section */}
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontWeight: "bold", color: "#F2B50B", marginBottom: "8px", fontSize: "14px" }}>
                1. Android (Chrome)
              </div>
              <ul style={{ paddingLeft: "18px", margin: 0 }}>
                <li style={{ marginBottom: "5px" }}>Look for automatic <b>"Add to Home screen"</b> banner at the bottom</li>
                <li style={{ marginBottom: "5px" }}>If not visible, tap <b>three dots (⋮)</b> in the top right corner</li>
                <li style={{ marginBottom: "5px" }}>Select <b>"Install app"</b> or <b>"Add to Home screen"</b> (Tambahkan ke layar utama)</li>
                <li>Tap <b>"Install"</b> (Instal) or <b>"Add"</b> (Tambah) to confirm</li>
              </ul>
            </div>

            {/* Safari iOS Section */}
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontWeight: "bold", color: "#F2B50B", marginBottom: "8px", fontSize: "14px" }}>
                2. iPhone (Safari) - Recommended
              </div>
              <ul style={{ paddingLeft: "18px", margin: 0 }}>
                <li style={{ marginBottom: "5px" }}>Tap <b>Share button</b> (square with up arrow) at the bottom</li>
                <li style={{ marginBottom: "5px" }}>Scroll down and select <b>"Add to Home Screen"</b> (Tambahkan ke Layar Utama)</li>
                <li>Tap <b>"Add"</b> (Tambah) in the top right</li>
              </ul>
            </div>

            {/* Chrome iOS Section */}
            <div>
              <div style={{ fontWeight: "bold", color: "#F2B50B", marginBottom: "8px", fontSize: "14px" }}>
                3. iPhone (Chrome)
              </div>
              <ul style={{ paddingLeft: "18px", margin: 0 }}>
                <li style={{ marginBottom: "5px" }}>Tap <b>Share icon</b> in the address bar or bottom menu</li>
                <li style={{ marginBottom: "5px" }}>Scroll down and select <b>"Add to Home Screen"</b> (Tambahkan ke Layar Utama)</li>
                <li>Confirm by tapping <b>"Add"</b> (Tambah)</li>
              </ul>
            </div>
          </IonCardContent>
        </IonCard>

        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            color: "#ffffff",
            fontSize: "12px",
            opacity: 0.7
          }}
        >
          <p style={{ margin: "2px 0" }}>© 2026 Team Andri Creative</p>
          <p style={{ margin: "2px 0", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>Official Secure Application</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;
