import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonToolbar as IonHeaderToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  locationOutline,
  timeOutline,
  pinOutline,
  downloadOutline,
} from "ionicons/icons";
import { useLocation } from "react-router-dom";
import "./Home.css";

const Preview: React.FC = () => {
  const location = useLocation<{
    image: string;
    address: string;
    coords: string;
    time: string;
  }>();

  const data = location.state;

  const downloadPhoto = () => {
    if (data?.image) {
      // Convert DataURL to Blob for better mobile support
      fetch(data.image)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `gps-photo-result-${new Date().getTime()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        });
    }
  };

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
            Photo Preview
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="ion-padding bg-primary"
        style={{ "--background": "#F8F3E1" }}
      >
        {/* Result Image Section (Matches Home Camera Frame) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "3/4",
            background: "#1a1a1a",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid #444",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {data?.image ? (
            <img
              src={data.image}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "#666",
              }}
            >
              No image captured yet.
            </div>
          )}
        </div>

        {/* Info Detail Section */}
        <IonGrid
          className="ion-no-padding"
          style={{
            marginTop: "20px",
            background: "#ffffff",
            borderRadius: "10px",
            padding: "5px 15px",
          }}
        >
          {/* Location Item */}
          <IonRow
            className="ion-align-items-center"
            style={{ padding: "15px 0", borderBottom: "1px solid #f0f0f0" }}
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
                  fontSize: "14px",
                  lineHeight: "1.4",
                }}
              >
                {data?.address || "-"}
              </div>
            </IonCol>
          </IonRow>

          {/* Time Item */}
          <IonRow
            className="ion-align-items-center"
            style={{ padding: "15px 0", borderBottom: "1px solid #f0f0f0" }}
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
                {data?.time || "-"}
              </div>
            </IonCol>
          </IonRow>

          {/* Coordinates Item */}
          <IonRow
            className="ion-align-items-center"
            style={{ padding: "15px 0" }}
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
                {data?.coords || "-"}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Action Button */}
        <div style={{ marginTop: "30px" }}>
          <IonButton
            expand="block"
            onClick={downloadPhoto}
            disabled={!data?.image}
            style={{
              "--background": "green",
              height: "55px",
              fontWeight: "bold",
              fontSize: "16px",
            }}
            shape="round"
          >
            <IonIcon slot="start" icon={downloadOutline} />
            Download Result
          </IonButton>
        </div>

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

export default Preview;
