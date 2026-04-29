import React, { useState, useRef } from 'react';
import { Camera, Info, Dog, X, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Actually saves the file for the backend
  const [resultImage, setResultImage] = useState(null);   // Stores the AI image with bounding boxes
  const [predictions, setPredictions] = useState([]);     // Stores the breed text
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file); // Save the actual file!
      
      // Clear any previous results when a new image is uploaded
      setResultImage(null);
      setPredictions([]);
    } else {
      alert("Please upload a valid JPG or PNG image.");
    }
  };

  const triggerFileInput = () => {
    if (!selectedImage && !loading) {
      fileInputRef.current.click();
    }
  };

  const clearImage = (e) => {
    e.stopPropagation(); 
    setSelectedImage(null);
    setSelectedFile(null);
    setResultImage(null);
    setPredictions([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // THE AI CONNECTION MAGIC
  const handleDetectBreed = async (e) => {
    e.stopPropagation(); 
    if (!selectedFile) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Set the AI image and the text predictions to state!
        setResultImage(`data:image/jpeg;base64,${data.image_base64}`);
        setPredictions(data.predictions);
      } else {
        alert("Error from server: " + data.error);
      }
    } catch (error) {
      console.error("Error connecting to AI:", error);
      alert("Could not connect to the backend. Make sure your Flask server is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans overflow-hidden">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-[-2] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80')",
        }}
      />
      {/* Faded overlay */}
      <div className="absolute inset-0 z-[-1] bg-[#f8f5eb] opacity-85" />

      {/* Header */}
      <header className="p-6 flex items-center w-full">
        <div className="flex items-center gap-2">
          <div className="bg-red-50 p-2 rounded-full flex items-center justify-center">
            <Dog className="w-5 h-5 text-red-400" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">BreedSnap</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 w-full">
        
        <h1 className="text-4xl md:text-5xl font-serif text-[#38332c] mb-3 text-center">
          Discover Your Dog's Breed
        </h1>
        <p className="text-[#6d6761] text-sm md:text-base mb-10 text-center">
          Snap a photo and let AI identify the breed in seconds.
        </p>

        {/* Interactive Drop Zone */}
        <div 
          onClick={triggerFileInput}
          className={`w-full max-w-2xl min-h-[300px] bg-[#fffbf7]/90 border-2 border-dashed border-[#d8b89e] rounded-3xl p-8 flex flex-col items-center justify-center transition-colors duration-200 shadow-sm relative ${!selectedImage ? 'cursor-pointer hover:bg-white' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/jpeg, image/png" 
            className="hidden" 
          />

          {selectedImage ? (
            <div className="w-full flex flex-col items-center gap-6 relative mt-4">
              {/* Delete Button */}
              <button 
                onClick={clearImage}
                className="absolute -top-6 -right-2 md:right-4 bg-white shadow-md text-gray-600 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors z-10"
                title="Remove image"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Image Preview (Shows AI Result if it exists, otherwise shows user upload) */}
              <img 
                src={resultImage ? resultImage : selectedImage} 
                alt="Uploaded dog" 
                className="max-h-[350px] w-auto object-contain rounded-xl shadow-sm border border-gray-100" 
              />

              {/* The Detection Results / Detect Button */}
              {predictions.length > 0 ? (
                <div className="w-full mt-4 bg-white p-6 rounded-2xl shadow-sm border border-[#e7e1da]">
                  <h3 className="text-xl font-bold text-[#2a2623] mb-4 text-center">AI Detection Results</h3>
                  <ul className="space-y-3">
                    {predictions.map((dog, index) => (
                      <li key={index} className="flex justify-between items-center bg-[#f8f5eb] p-4 rounded-xl">
                        <span className="font-semibold text-lg text-[#38332c] capitalize">{dog.breed.replace(/_/g, ' ')}</span>
                        <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-sm">
                          {dog.confidence}% Match
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <button 
                  onClick={handleDetectBreed}
                  disabled={loading}
                  className={`px-8 py-3.5 rounded-full font-medium text-lg flex items-center gap-2 transition-transform shadow-lg ${loading ? 'bg-[#88837e] text-white cursor-not-allowed' : 'bg-[#38332c] hover:bg-[#2a2623] text-white hover:scale-105 active:scale-95'}`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      Detect Breed
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="bg-[#e7e1da] p-4 rounded-full mb-4 flex items-center justify-center">
                <Camera className="w-6 h-6 text-[#534f4b]" />
              </div>
              <h2 className="font-bold text-[#2a2623] text-lg mb-1">
                Drop your dog photo here
              </h2>
              <p className="text-[#88837e] text-xs">
                or click to browse · JPG, PNG up to 10MB
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mt-6 text-[#88837e] text-xs font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>Powered by YOLOv8 Vision AI</span>
        </div>

      </main>
    </div>
  );
}