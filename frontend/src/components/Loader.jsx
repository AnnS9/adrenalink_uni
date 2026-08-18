export default function Loader() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column", // Stacks the spinner and text vertically
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
      color: "#ffffff", // Makes the text white so it contrasts with the dark background
      fontFamily: "sans-serif",
      textAlign: "center"
    }}>
      <div className="loader-spinner"></div>
      
      <p style={{ 
        marginTop: "20px", 
        fontSize: "16px", 
        fontWeight: "500",
        padding: "0 20px" 
      }}>
        Waking up the server... this usually takes about 30 seconds.
      </p>
    </div>
  );
}
