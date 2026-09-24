
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   
  // PROFILE EDIT
  

  const [editProfile, setEditProfile] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  
  // PROFILE PHOTO
  

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  
  // TRANSACTION PIN
   

  const [showPinForm, setShowPinForm] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [pinLoading, setPinLoading] = useState(false);
  const [pinMessage, setPinMessage] = useState("");

  
  // GET PROFILE
  

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const response = await api.get("/auth/profile");

      console.log("PROFILE:", response.data);

      const profileUser = response.data.user;

      setUser(profileUser);

      // Edit form values
      setEmail(profileUser.email || "");
      setMobile(profileUser.mobile || "");
      setAddress(profileUser.address || "");

      // Load profile photo
      await loadProfilePhoto();

    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

   
  // LOAD PROFILE PHOTO
   

  const loadProfilePhoto = async () => {
    try {
      const response = await api.get(
        "/auth/profile/photo",
        {
          responseType: "blob",
        }
      );

      const imageUrl = URL.createObjectURL(response.data);

      setProfilePhoto(imageUrl);

    } catch (error) {
      console.log("Profile photo not found");

      setProfilePhoto(null);
    }
  };

   
  // SELECT PHOTO
   

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    // Check image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // 5 MB check
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB");
      return;
    }

    await uploadProfilePhoto(file);

    // Input reset
    e.target.value = "";
  };

   
  // UPLOAD PROFILE PHOTO
  

  const uploadProfilePhoto = async (file) => {
    try {
      setPhotoLoading(true);

      const formData = new FormData();

      formData.append("profilePhoto", file);

      const response = await api.post(
        "/auth/profile/photo",
        formData
      );

      console.log(
        "PHOTO UPLOAD:",
        response.data
      );

      // Immediately show selected photo
      const imageUrl = URL.createObjectURL(file);

      setProfilePhoto(imageUrl);

      // User object update
      setUser((prev) => ({
        ...prev,
        profilePhoto: true,
      }));

      alert(
        response.data.message ||
        "Profile photo uploaded successfully"
      );

    } catch (error) {

      console.error(
        "PHOTO UPLOAD ERROR:",
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.message ||
        "Failed to upload profile photo"
      );

    } finally {

      setPhotoLoading(false);

    }
  };

  
  // OPEN CAMERA
  

  const openCamera = async () => {
    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      setCameraOpen(true);

      // Video element render hone ke baad stream attach
      setTimeout(() => {

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

      }, 100);

    } catch (error) {

      console.error(
        "CAMERA ERROR:",
        error
      );

      alert(
        "Camera permission denied or camera is not available"
      );

    }
  };

   
  // CAPTURE PHOTO
   

  const capturePhoto = () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      alert("Camera is not ready. Please wait.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context =
      canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {

        if (!blob) {
          alert("Failed to capture photo");
          return;
        }

        const file = new File(
          [blob],
          "profile-photo.jpg",
          {
            type: "image/jpeg",
          }
        );

        await uploadProfilePhoto(file);

        closeCamera();

      },
      "image/jpeg",
      0.9
    );
  };

   
  // CLOSE CAMERA
   

  const closeCamera = () => {

    if (
      videoRef.current &&
      videoRef.current.srcObject
    ) {

      const tracks =
        videoRef.current.srcObject.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

 
  // UPDATE PROFILE
   

  const handleUpdateProfile = async (e) => {

    e.preventDefault();

    setProfileMessage("");

    if (!email) {
      setProfileMessage(
        "Email is required"
      );
      return;
    }

    if (!mobile) {
      setProfileMessage(
        "Mobile number is required"
      );
      return;
    }

    if (!address) {
      setProfileMessage(
        "Address is required"
      );
      return;
    }

    try {

      setProfileLoading(true);

      const response =
        await api.put(
          "/auth/profile",
          {
            email,
            mobile,
            address,
          }
        );

      console.log(
        "PROFILE UPDATED:",
        response.data
      );

      setProfileMessage(
        response.data.message ||
        "Profile updated successfully"
      );

      setEditProfile(false);

      await getProfile();

    } catch (error) {

      console.error(
        "UPDATE PROFILE ERROR:",
        error.response?.data ||
        error.message
      );

      setProfileMessage(
        error.response?.data?.message ||
        "Failed to update profile"
      );

    } finally {

      setProfileLoading(false);

    }
  };

   
  // SET TRANSACTION PIN
   

  const handleSetPin = async (e) => {

    e.preventDefault();

    setPinMessage("");

    if (!/^\d{4}$/.test(pin)) {
      setPinMessage(
        "PIN must be exactly 4 digits"
      );
      return;
    }

    if (pin !== confirmPin) {
      setPinMessage(
        "PINs do not match"
      );
      return;
    }

    try {

      setPinLoading(true);

      const response =
        await api.post(
          "/auth/set-pin",
          {
            pin,
            confirmPin,
          }
        );

      console.log(
        "SET PIN:",
        response.data
      );

      setPinMessage(
        response.data.message
      );

      setPin("");
      setConfirmPin("");

      setShowPinForm(false);

      await getProfile();

    } catch (error) {

      console.error(
        "SET PIN ERROR:",
        error.response?.data ||
        error.message
      );

      setPinMessage(
        error.response?.data?.message ||
        "Failed to set PIN"
      );

    } finally {

      setPinLoading(false);

    }
  };

  // =========================
  // CLEANUP CAMERA
  // =========================

  useEffect(() => {

    return () => {

      if (
        videoRef.current &&
        videoRef.current.srcObject
      ) {

        const tracks =
          videoRef.current.srcObject.getTracks();

        tracks.forEach((track) => {
          track.stop();
        });

      }

    };

  }, []);

  
  // LOADING
  

  if (loading) {
    return (
      <div className="profile-loading">
        <h2>Loading Profile...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-loading">
        <h2>Profile not found</h2>
      </div>
    );
  }

   
  // UI
  

  return (

    <div className="profile-container">

      <div className="profile-card">

        
            {/* PROFILE PHOTO */}
         

        <div className="profile-image">

          {profilePhoto ? (

            <img
              src={profilePhoto}
              alt="Profile"
            />

          ) : (

            <div className="default-profile">

              {user.name
                ?.charAt(0)
                .toUpperCase()}

            </div>

          )}

        </div>


        {/* =========================
            PHOTO BUTTONS
        ========================= */}

        {!cameraOpen && (

          <div className="photo-actions">

            {/* Choose Photo */}

            <label className="photo-btn">

              📁 Choose Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                hidden
              />

            </label>


            {/* Take Photo */}

            <button
              type="button"
              className="camera-btn"
              onClick={openCamera}
              disabled={photoLoading}
            >
              📷 Take Photo
            </button>

          </div>

        )}


        {/* =========================
            CAMERA
        ========================= */}

        {cameraOpen && (

          <div className="camera-container">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />

            <canvas
              ref={canvasRef}
              hidden
            />

            <div className="camera-actions">

              <button
                type="button"
                className="capture-btn"
                onClick={capturePhoto}
                disabled={photoLoading}
              >
                📸 Capture
              </button>


              <button
                type="button"
                className="cancel-btn"
                onClick={closeCamera}
              >
                Cancel
              </button>

            </div>

          </div>

        )}


        {photoLoading && (

          <p className="photo-message">
            Uploading photo...
          </p>

        )}


        <h2>{user.name}</h2>


        {/* =========================
            PROFILE DETAILS
        ========================= */}

        {!editProfile ? (

          <div className="profile-details">

            <div className="profile-item">

              <span>Email</span>

              <p>{user.email}</p>

            </div>


            <div className="profile-item">

              <span>Mobile</span>

              <p>
                {user.mobile ||
                  "Not Added"}
              </p>

            </div>


            <div className="profile-item">

              <span>Address</span>

              <p>
                {user.address ||
                  "Not Added"}
              </p>

            </div>


            <button
              className="edit-profile-btn"
              onClick={() => {

                setEmail(
                  user.email || ""
                );

                setMobile(
                  user.mobile || ""
                );

                setAddress(
                  user.address || ""
                );

                setProfileMessage("");

                setEditProfile(true);

              }}
            >
              ✏️ Edit Profile
            </button>

          </div>

        ) : (

          /* =========================
             EDIT PROFILE FORM
          ========================= */

          <form
            className="profile-edit-form"
            onSubmit={handleUpdateProfile}
          >

            <label>Email</label>

            <input
              type="email"
              value={email}
              placeholder="Enter email"
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />


            <label>Mobile</label>

            <input
              type="tel"
              value={mobile}
              placeholder="Enter mobile number"
              maxLength="10"
              onChange={(e) =>
                setMobile(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10)
                )
              }
            />


            <label>Address</label>

            <textarea
              value={address}
              placeholder="Enter your address"
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
              rows="3"
            />


            <div className="profile-actions">

              <button
                type="submit"
                disabled={profileLoading}
                className="save-profile-btn"
              >

                {profileLoading
                  ? "Saving..."
                  : "💾 Save Changes"}

              </button>


              <button
                type="button"
                className="cancel-btn"
                onClick={() => {

                  setEditProfile(false);

                  setProfileMessage("");

                }}
              >
                Cancel
              </button>

            </div>

          </form>

        )}


        {profileMessage && (

          <p className="profile-message">
            {profileMessage}
          </p>

        )}


        {/* =========================
            TRANSACTION PIN
        ========================= */}

        <div className="pin-section">

          <h3>Transaction PIN</h3>

          <p>
            Your transaction PIN is required
            for money transfer.
          </p>


          {!showPinForm && (

            <button
              className="pin-btn"
              onClick={() =>
                setShowPinForm(true)
              }
            >
              🔐 Set Transaction PIN
            </button>

          )}


          {showPinForm && (

            <form onSubmit={handleSetPin}>

              <input
                type="password"
                placeholder="Enter 4 digit PIN"
                value={pin}
                onChange={(e) =>
                  setPin(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4)
                  )
                }
                maxLength="4"
                inputMode="numeric"
              />


              <input
                type="password"
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4)
                  )
                }
                maxLength="4"
                inputMode="numeric"
              />


              <div className="pin-actions">

                <button
                  type="submit"
                  disabled={pinLoading}
                  className="pin-btn"
                >

                  {pinLoading
                    ? "Setting..."
                    : "Set PIN"}

                </button>


                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {

                    setShowPinForm(false);

                    setPin("");

                    setConfirmPin("");

                    setPinMessage("");

                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          )}


          {pinMessage && (

            <p className="pin-message">
              {pinMessage}
            </p>

          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
