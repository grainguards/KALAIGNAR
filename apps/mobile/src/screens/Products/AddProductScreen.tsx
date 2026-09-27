import React, { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, TextInput, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageOption } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { useCatalogStore } from '../../store/catalogStore';
import { useAuthStore } from '../../store/authStore';
import ProfitShieldModal, { useProfitShield } from './ProfitShieldModal';
import { enhanceStudioImage, ImageMetrics, executeProductPipeline, PipelineResponse } from '../../services/imageStudio';

// Fallback catalog templates if AI detection fails
const FALLBACK_CATALOGS: Record<string, any> = {
  saree: { title: 'Handwoven Traditional Saree', descriptionEn: 'Exquisite handwoven saree with traditional patterns.', descriptionHi: 'पारंपरिक पैटर्न वाली खूबसूरत हथकरघा साड़ी।', suggestedPriceMin: 1800, suggestedPriceMax: 2200, tags: 'Handmade, Saree, Traditional', material: 'Cotton/Silk', category: 'Textiles', craftOrigin: 'India', dimensions: '5.5m x 1.15m', weight: '350g', breakdown: [['Material', '₹800'], ['Labor', '₹600'], ['Packaging', '₹100'], ['Margin', '₹400']], sellingPrice: '₹2,000' },
  pottery: { title: 'Handcrafted Pottery', descriptionEn: 'Hand-shaped pottery with traditional motifs.', descriptionHi: 'पारंपरिक रूपांकनों वाली मिट्टी की कलाकृति।', suggestedPriceMin: 500, suggestedPriceMax: 1500, tags: 'Pottery, Handmade, Clay', material: 'Clay/Ceramic', category: 'Pottery', craftOrigin: 'India', dimensions: '20cm x 15cm', weight: '800g', breakdown: [['Material', '₹200'], ['Labor', '₹400'], ['Kiln', '₹150'], ['Margin', '₹250']], sellingPrice: '₹1,000' },
  jewelry: { title: 'Handmade Jewelry', descriptionEn: 'Traditional handmade jewelry with intricate metalwork.', descriptionHi: 'जटिल धातु कला वाला पारंपरिक आभूषण।', suggestedPriceMin: 800, suggestedPriceMax: 3000, tags: 'Jewelry, Handmade, Traditional', material: 'Metal/Silver', category: 'Jewelry', craftOrigin: 'India', dimensions: 'Varies', weight: '50-200g', breakdown: [['Material', '₹600'], ['Labor', '₹800'], ['Polish', '₹200'], ['Margin', '₹400']], sellingPrice: '₹2,000' },
  woodcraft: { title: 'Hand-Carved Woodcraft', descriptionEn: 'Beautifully carved wooden piece.', descriptionHi: 'सुंदर नक्काशीदार लकड़ी की कलाकृति।', suggestedPriceMin: 1000, suggestedPriceMax: 4000, tags: 'Woodcraft, Hand-Carved, Wood', material: 'Teak/Sheesham', category: 'Woodcraft', craftOrigin: 'India', dimensions: '30x20x15cm', weight: '1.2kg', breakdown: [['Material', '₹500'], ['Carving', '₹1200'], ['Polish', '₹200'], ['Margin', '₹600']], sellingPrice: '₹2,500' },
  other: { title: 'Handcrafted Product', descriptionEn: 'Unique handcrafted item by skilled artisans.', descriptionHi: 'कुशल कारीगरों द्वारा बना अद्वितीय हस्तशिल्प।', suggestedPriceMin: 500, suggestedPriceMax: 2000, tags: 'Handmade, Artisan, Craft', material: 'Mixed', category: 'Handicraft', craftOrigin: 'India', dimensions: 'Varies', weight: 'Varies', breakdown: [['Material', '₹300'], ['Labor', '₹500'], ['Finishing', '₹100'], ['Margin', '₹350']], sellingPrice: '₹1,250' },
};

const CATEGORIES = [
  { key: 'saree', label: 'Saree / Dupatta', icon: '👗' },
  { key: 'pottery', label: 'Pottery / Ceramic', icon: '🏺' },
  { key: 'jewelry', label: 'Jewelry', icon: '💍' },
  { key: 'woodcraft', label: 'Woodcraft', icon: '🪵' },
  { key: 'other', label: 'Other Craft', icon: '🎨' },
];

export default function AddProductScreen({ navigation, route }: any) {
  const { t, lang } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [isWebCameraOpen, setIsWebCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');

  const { daysSpent, setDaysSpent, hoursPerDay, setHoursPerDay, showWarning, setShowWarning, floorPrice, checkPrice } = useProfitShield();
  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [originalRawImage, setOriginalRawImage] = useState<string | null>(null);
  const [studioPreset, setStudioPreset] = useState<'transparent' | 'studio-white' | 'artisan-warmth' | 'studio-gray' | 'original-enhanced'>('transparent');
  const [showOriginal, setShowOriginal] = useState(false);
  const [detectedMetrics, setDetectedMetrics] = useState<ImageMetrics | null>(null);
  const [isStudioProcessing, setIsStudioProcessing] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceStatus, setEnhanceStatus] = useState('');
  const [aiDetected, setAiDetected] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newMaterial, setNewMaterial] = useState("");
  const [newTag, setNewTag] = useState("");
  const [generateStatus, setGenerateStatus] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [videoUri, setVideoUri] = useState<string|null>(null);
  const [catalog, setCatalog] = useState<any>(null);
  const [aiCatalog, setAiCatalog] = useState<any>(route?.params?.product || null); // Stores Gemini result
  const [pipelineData, setPipelineData] = useState<PipelineResponse | null>(null);
  const [voiceLang, setVoiceLang] = useState<string>(lang || 'en');
  const [detectedSpeechLang, setDetectedSpeechLang] = useState<LanguageOption | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<string>(lang || 'en');
  const [isManualSelectMode, setIsManualSelectMode] = useState(false);
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number }>({ width: 400, height: 400 });
  const [viewComparisonMode, setViewComparisonMode] = useState<'isolated' | 'original' | 'side-by-side'>('isolated');

  React.useEffect(() => {
    if (lang) {
      setVoiceLang(lang);
      setActiveLangTab(lang);
    }
  }, [lang]);
  
  React.useEffect(() => {
    if (route?.params?.product) {
      setStep(2);
      setAiCatalog(route.params.product);
      setImage(route.params.product.imageUri || route.params.product.imageUrl || null);
    }
  }, [route?.params?.product]);

  const getBase64 = async (uri: string, providedBase64?: string) => {
    let base64 = providedBase64 || '';
    if (!base64) {
      if (uri.startsWith('data:')) {
        base64 = uri.split(',')[1];
      } else if (Platform.OS === 'web') {
        const res = await fetch(uri);
        const blob = await res.blob();
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.includes(',') ? result.split(',')[1] : result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const fileData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        base64 = fileData;
      }
    }
    return base64;
  };

  const applyStudioEnhancement = async (
    rawSrc: string,
    preset: 'transparent' | 'studio-white' | 'artisan-warmth' | 'studio-gray' | 'original-enhanced'
  ) => {
    setIsStudioProcessing(true);
    setStudioPreset(preset);
    try {
      // If we already have the pipeline result, toggle between transparent and studio presentation instantly
      if (pipelineData) {
        if (preset === 'transparent') {
          setImage(pipelineData.extracted_product);
          if (aiCatalog) setAiCatalog({ ...aiCatalog, imageUri: pipelineData.extracted_product });
        } else {
          // Request new studio backdrop for this preset
          const res = await axios.post(`${API_URL}/product/enhance`, {
            imageBase64: rawSrc,
            preset: preset === 'artisan-warmth' ? 'light-neutral' : preset === 'studio-gray' ? 'soft-studio' : 'studio-white',
          });
          if (res.data?.enhanced_image) {
            setImage(res.data.enhanced_image);
            if (aiCatalog) setAiCatalog({ ...aiCatalog, imageUri: res.data.enhanced_image });
          }
        }
      } else {
        const res = await enhanceStudioImage(rawSrc, {
          preset,
          enhanceClarity: true,
          addStudioShadow: preset !== 'transparent',
        });
        setImage(res.enhancedUrl);
        setDetectedMetrics(res.metrics);
        if (aiCatalog) {
          setAiCatalog((prev: any) => (prev ? { ...prev, imageUri: res.enhancedUrl } : prev));
        }
      }
    } catch (e) {
      console.warn('Studio enhancement error:', e);
    } finally {
      setIsStudioProcessing(false);
    }
  };

  const runPipelineOnImage = async (rawUri: string, pointPrompt?: [number, number], presetOverride?: string) => {
    setOriginalRawImage(rawUri);
    setShowOriginal(false);
    setIsStudioProcessing(true);
    setIsEnhancing(true);

    const presetToUse = presetOverride || studioPreset;

    try {
      // Step 1: Finding your product...
      setEnhanceStatus(t('ai.findingProduct'));
      await new Promise(r => setTimeout(r, 250));

      // Step 2: Removing background...
      setEnhanceStatus(t('ai.removingBackground'));
      const base64Data = await getBase64(rawUri);

      // Execute unified AI pipeline
      const pRes = await executeProductPipeline({
        imageBase64: base64Data,
        preset: presetToUse === 'original-enhanced' ? 'studio-white' : presetToUse,
        pointPrompt: pointPrompt,
        voice_description: customName,
        language: lang || voiceLang || 'en',
        apiKey: geminiApiKey,
      });

      // Step 3: Improving product photo...
      setEnhanceStatus(t('ai.improvingQuality'));
      await new Promise(r => setTimeout(r, 200));

      // Step 4: Creating your catalog...
      setEnhanceStatus(t('ai.generatingCatalog'));
      await new Promise(r => setTimeout(r, 200));

      setPipelineData(pRes);
      const displayImg = presetToUse === 'transparent' ? pRes.extracted_product : pRes.enhanced_image;
      setImage(displayImg);
      setStudioPreset(presetToUse as any);

      const analysis = pRes.analysis || {};
      const cat = pRes.catalog || {};
      const pricing = pRes.pricing || {};

      setAiCatalog({
        title: cat.title || `${analysis.material || t('catalog.productName')} ${analysis.product_type || ''}`,
        title_hi: cat.title_hi || '',
        title_ta: cat.title_ta || '',
        category: analysis.category || selectedCategory || t('catalog.category'),
        product_type: analysis.product_type || t('catalog.craftType'),
        material: analysis.material || t('catalog.material'),
        materials: analysis.material ? [analysis.material] : [t('catalog.material')],
        craft_type: analysis.craft_type || t('catalog.craftType'),
        color: analysis.color || t('catalog.colour'),
        shape: analysis.shape || 'Traditional',
        pattern: analysis.pattern || 'Artisan',
        style: analysis.style || 'Heritage',
        usage: analysis.usage || 'Home & Utility',
        visible_attributes: analysis.visible_attributes || [],
        short_description: cat.short_description || '',
        short_description_hi: cat.short_description_hi || '',
        short_description_ta: cat.short_description_ta || '',
        editorialDescription: cat.description || cat.short_description || '',
        descriptionEn: cat.description || cat.short_description || '',
        descriptionHi: cat.description_hi || cat.short_description_hi || '',
        descriptionTa: cat.description_ta || cat.short_description_ta || '',
        suggestedPrice: pricing.suggested_price || 1500,
        priceMin: pricing.estimated_min || 1200,
        priceMax: pricing.estimated_max || 1800,
        pricingConfidence: pricing.confidence || 'medium',
        pricingFactors: pricing.factors || [],
        monthlyCapacity: 25,
        craftOrigin: 'India',
        searchTags: cat.keywords || ['#Handmade', '#ArtisanCraft'],
        imageUri: displayImg,
        extractedProductUri: pRes.extracted_product,
        enhancedStudioUri: pRes.enhanced_image,
        confidence: pRes.segmentation?.confidence || 0.94,
      });

      // Step 5: Product ready!
      setEnhanceStatus(t('ai.productReady'));
      setTimeout(() => {
        setIsEnhancing(false);
        setIsStudioProcessing(false);
        setEnhanceStatus('');
        setStep(2);
      }, 500);
    } catch (err: any) {
      console.warn('Pipeline error, falling back locally:', err?.message || err);
      try {
        const res = await enhanceStudioImage(rawUri, {
          preset: presetToUse as any,
          enhanceClarity: true,
          addStudioShadow: presetToUse !== 'transparent',
        });
        setImage(res.enhancedUrl);
        setDetectedMetrics(res.metrics);
        setAiCatalog({
          title: customName || 'Handcrafted Heritage Craft',
          category: selectedCategory || 'Handicrafts',
          suggestedPrice: 1850,
          priceMin: 1400,
          priceMax: 2400,
          monthlyCapacity: 20,
          editorialDescription: 'Artisan handcrafted product.',
          descriptionHi: 'कुशल कारीगरों द्वारा तैयार किया गया प्रामाणिक हस्तशिल्प।',
          descriptionTa: 'பாரம்பரிய கைவினைஞர்களால் உருவாக்கப்பட்ட கைவினைப் பொருள்.',
          materials: ['Natural Materials'],
          searchTags: ['#Handmade', '#Artisan'],
          craftOrigin: 'India',
          imageUri: res.enhancedUrl,
        });
        setStep(2);
      } catch (localErr) {
        setImage(rawUri);
        setStep(2);
      } finally {
        setIsEnhancing(false);
        setIsStudioProcessing(false);
        setEnhanceStatus('');
      }
    }
  };

  const handleImageLoaded = async (rawUri: string) => {
    await runPipelineOnImage(rawUri);
  };

  const handleManualObjectSelect = (evt: any) => {
    if (!isManualSelectMode || !originalRawImage) return;
    const { locationX, locationY } = evt.nativeEvent;
    const normX = Math.max(0, Math.min(1, locationX / Math.max(1, imageLayout.width)));
    const normY = Math.max(0, Math.min(1, locationY / Math.max(1, imageLayout.height)));
    setIsManualSelectMode(false);
    runPipelineOnImage(originalRawImage, [normX, normY]);
  };

  const analyzeWithAI = async (base64Str: string) => {
    const cat = (selectedCategory || "").toLowerCase();
    let title = customName || "Handcrafted Heritage Product";
    let materials = ["Natural Materials"];
    let price = 1850;
    let tags = ["#Handmade", "#Artisan"];
    
    if (detectedMetrics?.isEarthTone || cat.includes("pottery")) {
      title = "Hand-Molded Terracotta Clay Earthenware";
      materials = ["Natural Riverbed Clay", "Organic Slip", "Wood-fired Kiln Finish"];
      price = 850;
      tags = ["#Terracotta", "#ClayPottery", "#Handmade"];
    } else if (detectedMetrics?.isMetallic || cat.includes("metal")) {
      title = "Authentic Dhokra Lost-Wax Cast Brass Figurine";
      materials = ["Pure Brass Alloy", "Beeswax Matrix", "Clay Mold Core"];
      price = 2800;
      tags = ["#Dhokra", "#TribalBrass", "#LostWax"];
    } else if (detectedMetrics?.isWoodTone || cat.includes("wood")) {
      title = "Hand-Carved Sheesham Wood Floral Jali Craft";
      materials = ["Seasoned Sheesham Wood", "Natural Beeswax Polish"];
      price = 1950;
      tags = ["#Woodcraft", "#HandCarved", "#SheeshamWood"];
    } else if (cat.includes("textile") || detectedMetrics?.isVibrantTextile) {
      title = "Handloom Woven Traditional Silk & Zari Craft";
      materials = ["Pure Natural Silk", "Metallic Zari Thread"];
      price = 2850;
      tags = ["#HandloomSilk", "#VaranasiWeave", "#KanchipuramArtisan"];
    }

    return {
      title,
      productDetected: title,
      category: selectedCategory || (detectedMetrics?.isEarthTone ? "Pottery & Ceramics" : detectedMetrics?.isMetallic ? "Metal Crafts" : "Textiles & Handlooms"),
      editorialDescription: `A masterfully crafted ${title.toLowerCase()} featuring traditional motifs, organic dyes, and generational craftsmanship.`,
      descriptionEn: `A masterfully crafted ${title.toLowerCase()} featuring traditional motifs, organic dyes, and generational craftsmanship.`,
      descriptionHi: `कुशल कारीगरों द्वारा पारंपरिक तकनीक से तैयार किया गया प्रामाणिक हस्तशिल्प।`,
      suggestedPrice: price,
      priceMin: price - 350,
      priceMax: price + 550,
      monthlyCapacity: 25,
      materials,
      searchTags: tags,
      craftOrigin: "India",
      dimensions: "Varies",
      weight: "Varies",
    };
  };

  const processImage = async (targetImg?: string) => {
    const imgToUse = targetImg || image || originalRawImage;
    if (!imgToUse) return;

    setIsEnhancing(true);
    setEnhanceStatus("AI Studio: Isolating subject & balancing lighting...");

    try {
      const base64Data = await getBase64(imgToUse);
      
      setEnhanceStatus("AI Vision: Identifying craft technique & details...");

      let aiResult: any = null;
      try {
        const resp = await axios.post(`${API_URL}/ai/analyze`, {
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
          colorMetrics: detectedMetrics,
          customPrompt: customName,
          categoryHint: selectedCategory,
          apiKey: geminiApiKey,
        }, { timeout: 25000 });

        if (resp.data) {
          aiResult = resp.data;
        }
      } catch (err: any) {
        console.warn("Backend AI analyze error, falling back locally:", err?.message);
        aiResult = await analyzeWithAI(base64Data);
      }

      if (aiResult) {
        setEnhanceStatus(`Identified: ${aiResult.productDetected || aiResult.title}`);
        setTimeout(() => {
          setIsEnhancing(false);
          setEnhanceStatus("");
          setAiCatalog({
            ...aiResult,
            suggestedPrice: aiResult.suggestedPrice || 2400,
            priceMin: aiResult.suggestedPriceMin || (aiResult.suggestedPrice ? aiResult.suggestedPrice - 400 : 1800),
            priceMax: aiResult.suggestedPriceMax || (aiResult.suggestedPrice ? aiResult.suggestedPrice + 600 : 3200),
            materials: aiResult.materials || (aiResult.material ? String(aiResult.material).split(/,\s*/) : ["Natural Sustainable Materials"]),
            searchTags: aiResult.searchTags || (aiResult.tags ? String(aiResult.tags).split(/,\s*/).map((t: string) => t.startsWith('#') ? t : `#${t}`) : ["#Handmade", "#Artisan"]),
            editorialDescription: aiResult.editorialDescription || aiResult.descriptionEn || aiResult.description || "",
          });
          if (aiResult.category) setSelectedCategory(aiResult.category);
          setStep(2);
        }, 600);
      }
    } catch (err) {
      console.log("Studio Error:", err);
      setIsEnhancing(false);
      setEnhanceStatus("");
      setAiCatalog({ title: customName || "Handcrafted Product", suggestedPrice: 1000, monthlyCapacity: 10, materials: ["Mixed"], searchTags: ["#Handmade"] });
      setStep(2);
    }
  };

  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startWebCamera = async (facing: 'user' | 'environment' = 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
        streamRef.current = null;
      }
      setIsWebCameraOpen(true);
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
        } catch {
          // Fallback if requested facingMode is unavailable
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        alert('Camera is not supported on this browser.');
        setIsWebCameraOpen(false);
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      alert('Could not access camera: ' + (err?.message || 'Permission denied or no camera device found.'));
      setIsWebCameraOpen(false);
    }
  };

  const stopWebCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    setIsWebCameraOpen(false);
  };

  const captureWebPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (cameraFacing === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopWebCamera();
        handleImageLoaded(dataUrl);
      }
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startWebCamera(nextFacing);
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      startWebCamera(cameraFacing);
    } else {
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'We need camera permission to take product photos.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const raw = asset.base64 ? ('data:image/jpeg;base64,' + asset.base64) : asset.uri;
          handleImageLoaded(raw);
        }
      } catch (err) {
        console.error('Camera error:', err);
      }
    }
  };

  const pickVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], allowsEditing: true, quality: 0.8 });
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.log("Video error:", err);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true });
      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const raw = asset.base64 ? ('data:image/jpeg;base64,' + asset.base64) : asset.uri;
        handleImageLoaded(raw);
      }
    } catch (err) {
      console.log("Gallery error:", err);
      if (Platform.OS === "web") window.alert("Failed to open gallery.");
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
    } else {
      if (Platform.OS === 'web' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        setIsRecording(true);
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        const langMap: Record<string, string> = {
          en: 'en-IN',
          English: 'en-IN',
          ta: 'ta-IN',
          Tamil: 'ta-IN',
          hi: 'hi-IN',
          Hindi: 'hi-IN',
          bn: 'bn-IN',
          Bengali: 'bn-IN',
          te: 'te-IN',
          Telugu: 'te-IN',
          mr: 'mr-IN',
          Marathi: 'mr-IN',
          gu: 'gu-IN',
          Gujarati: 'gu-IN',
          kn: 'kn-IN',
          Kannada: 'kn-IN',
          ml: 'ml-IN',
          Malayalam: 'ml-IN',
          pa: 'pa-IN',
          Punjabi: 'pa-IN',
        };

        const targetLocale = langMap[voiceLang] || 'en-IN';
        recognition.lang = targetLocale;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setCustomName(currentTranscript);

          // Language detection confirmation
          const currentLangInfo = SUPPORTED_LANGUAGES.find(
            (l) => l.code === voiceLang || l.name === voiceLang
          );
          if (currentLangInfo && !detectedSpeechLang) {
            setDetectedSpeechLang(currentLangInfo);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          if (isRecording) {
            setIsRecording(false);
          }
        };

        recognition.start();
        (window as any).currentRecognition = recognition;
      } else {
        Alert.alert('Not Supported', 'Speech recognition is not supported in this browser.');
      }
    }
  };

  const generateCatalog = () => {
    // If we have a voice transcript in customName, pass it to AI?
    // For now, we will simulate the generation with the transcript if Gemini isn't called yet
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    
    setIsGenerating(true);
    setGenerateStatus('Understanding your product...');
    setTimeout(() => setGenerateStatus('Creating professional listing...'), 800);
    setTimeout(() => setGenerateStatus('Analyzing market pricing...'), 1600);
    setTimeout(() => setGenerateStatus('Generating catalog...'), 2400);
    setTimeout(() => {
      let finalCatalog;
      if (aiCatalog) {
        // Use the AI-detected catalog from Gemini
        finalCatalog = { ...aiCatalog };
      } else {
        // Fallback to manual category selection
        finalCatalog = { ...FALLBACK_CATALOGS[selectedCategory || 'other'] };
      }
      if (customName.trim()) finalCatalog.title = customName.trim();
      setCatalog(finalCatalog);
      setIsGenerating(false);
      setGenerateStatus('');
      setStep(5);
    }, 3000);
  };

  const resetFlow = () => {
    setStep(1); setImage(null); setCatalog(null); setAiCatalog(null);
    setSelectedCategory(null); setCustomName(''); setIsRecording(false);
    setAiDetected(null);
  };


  const getQuickSuggestions = () => {
    const text = (customName || "").toLowerCase();
    const cat = (selectedCategory || "").toLowerCase();
    
    if (text.includes("phone") || text.includes("case") || text.includes("cover")) {
      return ["Hand-painted design", "Sustainable materials", "Protective coating"];
    }
    if (cat.includes("textile") || text.includes("saree") || text.includes("fabric")) {
      return ["100% Organic Cotton", "Hand-woven on traditional pit loom", "Natural vegetable dyes"];
    }
    if (cat.includes("metal") || cat.includes("dhokra")) {
      return ["Lost-wax brass casting", "4000-year-old technique", "Polished bronze finish"];
    }
    if (cat.includes("pottery") || cat.includes("clay") || cat.includes("ceramic")) {
      return ["Natural Riverbed Clay", "Wood Fired", "Hand-thrown on wheel"];
    }
    if (cat.includes("wood") || cat.includes("bamboo")) {
      return ["Sourced from sustainable forests", "Hand-carved detailing", "Natural lacquer finish"];
    }
    if (cat.includes("leather") || cat.includes("painting")) {
      return ["Cruelty-free materials", "Hand-tooled patterns", "Traditional block printed"];
    }
    
    return ["Locally sourced materials", "Eco-friendly production", "100% Handmade by artisans"];
  };

  const appendSuggestion = (sug: string) => {
    const current = customName || "";
    if (current.trim().length === 0) {
      setCustomName(sug);
    } else {
      setCustomName(current + (current.endsWith(" ") ? "" : " ") + sug);
    }
  };

  return (
    <ScrollView style={[s.pageBg, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}>
      
      {/* Top Header matching AI Smart Catalog Studio */}
      <View style={[s.studioHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.studioTitle, { color: colors.text }]}>{t('studio.title') || 'AI Smart Catalog Studio'}</Text>
          <Text style={[s.studioSubtitle, { color: colors.textSecondary }]}>
            {t('studio.subtitle') || 'Upload a photo and tell your craft story. AI transforms it into a professional, structured catalog entry.'}
          </Text>
        </View>
      </View>

      <View style={[s.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {step === 1 && (
          <View style={s.twoColLayout}>
            {/* Left Col - Photo */}
            <View style={s.leftCol}>
              <View style={s.sectionHeader}>
                <View>
                  <Text style={s.sectionTitle}>Product Photo</Text>
                  <Text style={s.sectionSub}>High quality craft image</Text>
                </View>
              </View>
              {image ? (
                <View style={s.previewCard}>
                  {/* Photo container with optional processing overlay */}
                  <View style={[{ position: 'relative', overflow: 'hidden' }, studioPreset === 'transparent' && !showOriginal && s.checkerboardBg]}>
                    <Image
                      source={{ uri: showOriginal && originalRawImage ? originalRawImage : image }}
                      style={s.imagePreview}
                    />

                    {studioPreset === 'transparent' && !showOriginal && (
                      <View style={s.transparentCutoutBadge}>
                        <Ionicons name="cut" size={12} color="#F9FAFB" />
                        <Text style={s.transparentCutoutBadgeText}>Background Removed (Only Product Visible)</Text>
                      </View>
                    )}

                    {isStudioProcessing && (
                      <View style={s.studioProcessingOverlay}>
                        <ActivityIndicator size="small" color="#C36F50" />
                        <Text style={s.studioProcessingText}>{enhanceStatus || 'AI Studio: Isolating craft & balancing lighting...'}</Text>
                      </View>
                    )}
                  </View>

                  {/* Studio Status & Before/After Toggle */}
                  <View style={s.studioHeaderBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="sparkles" size={15} color="#C36F50" />
                      <Text style={s.studioBadgeTitle}>
                        {showOriginal ? 'Original Camera Shot' : 'AI Studio: Enhanced & Isolated'}
                      </Text>
                    </View>
                    {Boolean(originalRawImage) ? (
                      <TouchableOpacity
                        style={s.compareBtn}
                        onPress={() => setShowOriginal(!showOriginal)}
                      >
                        <Ionicons name="swap-horizontal" size={13} color="#C36F50" />
                        <Text style={s.compareBtnText}>
                          {showOriginal ? 'View Enhanced' : 'Compare Original'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Studio Presets: Transparent, Studio White, Warm Ivory, Soft Gray, Original Enhanced */}
                  <View style={s.presetSelectorRow}>
                    <Text style={s.presetLabel}>Studio Lighting & Backdrop:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      <TouchableOpacity
                        style={[s.presetChip, studioPreset === 'transparent' && s.presetChipActive]}
                        onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'transparent')}
                      >
                        <Ionicons name="cut-outline" size={13} color={studioPreset === 'transparent' ? '#C36F50' : '#4B5563'} />
                        <Text style={[s.presetChipText, studioPreset === 'transparent' && s.presetChipTextActive]}>Transparent Cutout</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.presetChip, studioPreset === 'studio-white' && s.presetChipActive]}
                        onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'studio-white')}
                      >
                        <View style={[s.presetDot, { backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', borderWidth: 1 }]} />
                        <Text style={[s.presetChipText, studioPreset === 'studio-white' && s.presetChipTextActive]}>Studio White</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.presetChip, studioPreset === 'artisan-warmth' && s.presetChipActive]}
                        onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'artisan-warmth')}
                      >
                        <View style={[s.presetDot, { backgroundColor: '#FDFBF7', borderColor: '#D1D5DB', borderWidth: 1 }]} />
                        <Text style={[s.presetChipText, studioPreset === 'artisan-warmth' && s.presetChipTextActive]}>Artisan Ivory</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.presetChip, studioPreset === 'studio-gray' && s.presetChipActive]}
                        onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'studio-gray')}
                      >
                        <View style={[s.presetDot, { backgroundColor: '#F4F4F5' }]} />
                        <Text style={[s.presetChipText, studioPreset === 'studio-gray' && s.presetChipTextActive]}>Soft Gray</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.presetChip, studioPreset === 'original-enhanced' && s.presetChipActive]}
                        onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'original-enhanced')}
                      >
                        <Ionicons name="color-wand-outline" size={13} color="#4B5563" />
                        <Text style={[s.presetChipText, studioPreset === 'original-enhanced' && s.presetChipTextActive]}>Lighting Only</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Actions: Retake, Browse, Remove */}
                  <View style={s.previewOverlayBar}>
                    <TouchableOpacity style={s.overlayBtn} onPress={handleTakePhoto}>
                      <Ionicons name="camera" size={15} color="#374151" />
                      <Text style={s.overlayBtnText}>Retake Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.overlayBtn} onPress={pickImage}>
                      <Ionicons name="folder-open-outline" size={15} color="#374151" />
                      <Text style={s.overlayBtnText}>Browse Files</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.overlayBtn, s.deleteBtn]} onPress={() => { setImage(null); setOriginalRawImage(null); }}>
                      <Ionicons name="trash-outline" size={15} color="#DC2626" />
                      <Text style={[s.overlayBtnText, { color: '#DC2626' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={s.uploadBox}>
                  <View style={{ alignItems: 'center', padding: 16 }}>
                    <View style={s.iconCircle}><Ionicons name="camera-outline" size={28} color="#C36F50" /></View>
                    <Text style={s.uploadTextBold}>Add Product Photo</Text>
                    <Text style={s.uploadTextSub}>Take a live photo with camera or browse files (PNG, JPG, WebP up to 10MB)</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                      <TouchableOpacity style={s.cameraBtn} onPress={handleTakePhoto}>
                        <Ionicons name="camera" size={18} color="white" />
                        <Text style={s.cameraBtnText}>Take Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.browseBtn} onPress={pickImage}>
                        <Ionicons name="folder-open-outline" size={18} color="#374151" />
                        <Text style={s.browseBtnText}>Browse Files</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              <Text style={[s.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>Craft Category (Select best match)</Text>
   
              <View style={[s.pickerOutline, { paddingVertical: 0, paddingHorizontal: 0, zIndex: 10 }]}>
                <TextInput
                  style={Platform.OS === "web" ? { flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: "#111827", fontSize: 14, outlineStyle: "none" } as any : { flex: 1, paddingHorizontal: 16, paddingVertical: 14, color: "#111827", fontSize: 14 }}
                  placeholder="Type custom or select..."
                  placeholderTextColor="#9CA3AF"
                  value={selectedCategory || ''}
                  onChangeText={(text) => {
                    setSelectedCategory(text);
                    setShowCategories(true);
                  }}
                  onFocus={() => setShowCategories(true)}
                  onBlur={() => setTimeout(() => setShowCategories(false), 200)}
                />
                <TouchableOpacity onPress={() => setShowCategories(!showCategories)} style={{ padding: 14 }}>
                  <Ionicons name={showCategories ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {showCategories && (
                <View style={[s.categoryDropdown, { position: Platform.OS === "web" ? "absolute" : "relative", top: Platform.OS === "web" ? 72 : 0, left: 0, right: 0, zIndex: 20, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: {height: 4, width: 0} }]}>
                  {["Textiles & Handlooms", "Metal Crafts (Dhokra, Brass)", "Pottery & Ceramics", "Wood & Bamboo", "Jewelry", "Leather & Painting"]
                    .filter(cat => !selectedCategory || cat.toLowerCase().includes(selectedCategory.toLowerCase()))
                    .map((cat, _i) => (
                    <TouchableOpacity key={_i} style={s.categoryOption} onPress={() => { setSelectedCategory(cat); setShowCategories(false); }}>
                      <Text style={s.categoryOptionText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={s.optionalVid}>
                <Text style={s.sectionTitle}>Craft Video <Text style={s.optionalTag}>Optional</Text></Text>
                <Text style={s.sectionSub}>Short video showcasing movement, texture, or craftsmanship details...</Text>
                <TouchableOpacity style={s.vidBtn} onPress={pickVideo}>
                  <Ionicons name={videoUri ? "checkmark-circle" : "cloud-upload-outline"} size={16} color={videoUri ? "#10B981" : "#374151"} />
                  <Text style={s.vidBtnText}>{videoUri ? "Video Selected" : "Select Video (MP4, MOV)"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Col - Story */}
            <View style={s.rightCol}>
              <View style={s.sectionHeader}>
                <View>
                  <Text style={s.sectionTitle}>Craft Story & Tradition</Text>
                  <Text style={s.sectionSub}>(Type or Speak in your voice)</Text>
                </View>
                <TouchableOpacity style={s.speakBtn} onPress={handleRecord}>
                  <Ionicons name={isRecording ? "stop-circle" : "mic"} size={18} color="#991B1B" />
                  <Text style={s.speakBtnText}>{isRecording ? "Listening..." : "Speak Story"}</Text>
                </TouchableOpacity>
              </View>
                <View style={{ marginBottom: 12 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                    {SUPPORTED_LANGUAGES.map((l) => {
                      const isSelected = voiceLang === l.code || voiceLang === l.name;
                      return (
                        <TouchableOpacity
                          key={l.code}
                          style={[
                            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardSecondary },
                            isSelected && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                          ]}
                          onPress={() => {
                            setVoiceLang(l.code);
                            setDetectedSpeechLang(null);
                          }}
                        >
                          <Text style={[{ fontSize: 12, fontWeight: '500', color: colors.textSecondary }, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                            {l.nativeName} {l.name !== l.nativeName ? "($l.name)" : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              
              

              {/* Automatic Language Detection & Confirmation Banner */}
              {detectedSpeechLang && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isDark ? '#2D2013' : '#FEF3C7',
                    borderWidth: 1,
                    borderColor: isDark ? '#78350F' : '#FDE68A',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    <Ionicons name="sparkles" size={16} color="#D97706" />
                    <Text style={{ fontSize: 12, color: isDark ? '#FDE68A' : '#92400E' }}>
                      {t('studio.detected_lang') || 'Detected'}: <Text style={{ fontWeight: '700' }}>{detectedSpeechLang.nativeName} ({detectedSpeechLang.name})</Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#D97706',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                      onPress={() => {
                        setVoiceLang(detectedSpeechLang.code);
                        setDetectedSpeechLang(null);
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                        {t('studio.use_lang') || 'Use This Language'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDetectedSpeechLang(null)}>
                      <Ionicons name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TextInput 
                style={s.storyInput} 
                multiline 
                placeholder="e.g. Made from natural red riverbed clay from Gorakhpur. Hand-molded with traditional bell patterns..." 
                value={customName}
                onChangeText={setCustomName}
              />
              
              <View style={s.suggestionsRow}>
                <Text style={s.suggestionsLabel}>Quick suggestions:</Text>
                {getQuickSuggestions().map((sug, i) => (
                  <TouchableOpacity key={i} style={s.sugChip} onPress={() => appendSuggestion(sug)}>
                    <Text style={s.sugText}>+ {sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.disclaimerBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#4B5563" />
                <View style={{marginLeft: 10, flex: 1}}>
                  <Text style={s.discTitle}>Artisan Dignity & Control</Text>
                  <Text style={s.discText}>AI extracts the heritage narrative, materials, and tags, but YOU will review and approve everything before it goes live. AI never publishes automatically.</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[s.synthesizeBtn, (!image || isEnhancing) && s.btnDisabled]} 
                onPress={() => {
                  if (image) {
                    processImage(image);
                  }
                }}
                disabled={!image || isEnhancing}
              >
                {isEnhancing ? <ActivityIndicator color="white" /> : <Ionicons name="sparkles" size={18} color="white" />}
                <Text style={s.synthesizeBtnText}>{isEnhancing && enhanceStatus ? enhanceStatus : 'Synthesize with AI'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, paddingVertical: 4 }}
                onPress={() => setShowApiKeyModal(!showApiKeyModal)}
              >
                <Ionicons name="key-outline" size={14} color="#6B7280" />
                <Text style={{ fontSize: 13, color: '#6B7280', marginLeft: 6, fontWeight: '500' }}>
                  {geminiApiKey ? 'Gemini 2.0 Flash Vision (Connected)' : 'Optional: Set Custom Gemini API Key'}
                </Text>
              </TouchableOpacity>

              {showApiKeyModal && (
                <View style={{ marginTop: 10, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 12, color: '#374151', marginBottom: 6, fontWeight: '600' }}>Google Gemini API Key</Text>
                  <TextInput
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 }}
                    placeholder="Paste AIzaSy... key (optional)"
                    placeholderTextColor="#9CA3AF"
                    value={geminiApiKey}
                    onChangeText={setGeminiApiKey}
                    secureTextEntry
                  />
                  <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                    Leave blank to use built-in Smart Craft AI engine with zero setup.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {step === 2 && aiCatalog && (
          <View style={{ width: '100%' }}>
            {/* Top Auto-Detection & Control Banner */}
            <View style={s.detectedBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="sparkles" size={18} color="#991B1B" />
                  <Text style={s.detectedBannerTitle}>
                    Auto-Detected: {aiCatalog.productDetected || aiCatalog.title || 'Handcrafted Craft'}
                  </Text>
                </View>
                <View style={s.aiVerifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#15803D" />
                  <Text style={s.aiVerifiedText}>AI Studio Enhanced & Isolated</Text>
                </View>
              </View>
              <Text style={s.detectedBannerSub}>
                Background completely removed so only your product is visible. You have full artisan dignity and control: review and edit any title, description, price, dimensions, or materials below.
              </Text>
            </View>

            <View style={s.twoColLayout}>
              {/* Left Col - Overview, Lift Subject Presentation & Pricing */}
              <View style={s.leftCol}>
                
                {/* View Mode Bar: 1:1 Studio, Original Shot, Side-by-Side */}
                <View style={s.viewModeBar}>
                  <TouchableOpacity
                    style={[s.viewModeBtn, viewComparisonMode === 'isolated' && s.viewModeBtnActive]}
                    onPress={() => { setViewComparisonMode('isolated'); setShowOriginal(false); }}
                  >
                    <Ionicons name="sparkles" size={13} color={viewComparisonMode === 'isolated' ? '#991B1B' : '#6B7280'} />
                    <Text style={[s.viewModeText, viewComparisonMode === 'isolated' && s.viewModeTextActive]}>1:1 Studio Output</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.viewModeBtn, viewComparisonMode === 'original' && s.viewModeBtnActive]}
                    onPress={() => { setViewComparisonMode('original'); setShowOriginal(true); }}
                  >
                    <Ionicons name="image-outline" size={13} color={viewComparisonMode === 'original' ? '#991B1B' : '#6B7280'} />
                    <Text style={[s.viewModeText, viewComparisonMode === 'original' && s.viewModeTextActive]}>Original Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.viewModeBtn, viewComparisonMode === 'side-by-side' && s.viewModeBtnActive]}
                    onPress={() => setViewComparisonMode('side-by-side')}
                  >
                    <Ionicons name="swap-horizontal" size={13} color={viewComparisonMode === 'side-by-side' ? '#991B1B' : '#6B7280'} />
                    <Text style={[s.viewModeText, viewComparisonMode === 'side-by-side' && s.viewModeTextActive]}>Before | After</Text>
                  </TouchableOpacity>
                </View>

                {/* Manual Correction Mode Trigger (Section 4) */}
                <TouchableOpacity
                  style={[s.manualSelectBtn, isManualSelectMode && s.manualSelectBtnActive]}
                  onPress={() => setIsManualSelectMode(!isManualSelectMode)}
                >
                  <Ionicons name={isManualSelectMode ? "finger-print" : "locate-outline"} size={16} color="#92400E" />
                  <Text style={s.manualSelectBtnText}>
                    {isManualSelectMode ? 'Cancel Manual Selection' : 'Edit Selection (Tap to Pick Desired Object)'}
                  </Text>
                </TouchableOpacity>

                {isManualSelectMode && (
                  <View style={s.manualInstructionBox}>
                    <Ionicons name="information-circle" size={18} color="#D97706" />
                    <Text style={s.manualInstructionText}>
                      Tap directly on your craft product in the photo below to re-isolate it. This distinguishes your product from hands, tables, or other background items.
                    </Text>
                  </View>
                )}

                {/* Image Display Area */}
                {viewComparisonMode === 'side-by-side' ? (
                  <View style={s.sideBySideBox}>
                    <View style={s.sideBySideCol}>
                      <Image source={{ uri: originalRawImage || image || '' }} style={s.sideBySideImg} />
                      <Text style={s.sideBySideLabel}>Before (Original)</Text>
                    </View>
                    <View style={[s.sideBySideCol, studioPreset === 'transparent' && s.checkerboardBg]}>
                      <Image source={{ uri: image || aiCatalog.imageUri || '' }} style={s.sideBySideImg} />
                      <Text style={s.sideBySideLabel}>After (AI Lifted)</Text>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={isManualSelectMode ? 0.85 : 1}
                    onPress={handleManualObjectSelect}
                    onLayout={(e) => setImageLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
                    style={[{ position: 'relative', overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: isManualSelectMode ? '#D97706' : '#E5E7EB', marginBottom: 12 }, studioPreset === 'transparent' && viewComparisonMode !== 'original' && s.checkerboardBg]}
                  >
                    <Image
                      source={{ uri: viewComparisonMode === 'original' && originalRawImage ? originalRawImage : (image || aiCatalog.imageUri || '') }}
                      style={s.previewImg}
                    />

                    {studioPreset === 'transparent' && viewComparisonMode !== 'original' && (
                      <View style={s.transparentCutoutBadge}>
                        <Ionicons name="cut" size={12} color="#F9FAFB" />
                        <Text style={s.transparentCutoutBadgeText}>Background Removed (Only Product Visible)</Text>
                      </View>
                    )}

                    {isStudioProcessing && (
                      <View style={s.studioProcessingOverlay}>
                        <ActivityIndicator size="small" color="#C36F50" />
                        <Text style={s.studioProcessingText}>{enhanceStatus || 'Processing studio presentation...'}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}

                {/* Backdrop preset switcher (Section 9) */}
                <View style={[s.presetSelectorRow, { borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 }]}>
                  <Text style={s.presetLabel}>Studio Lighting & Backdrop:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[s.presetChip, studioPreset === 'studio-white' && s.presetChipActive]}
                      onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'studio-white')}
                    >
                      <View style={[s.presetDot, { backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', borderWidth: 1 }]} />
                      <Text style={[s.presetChipText, studioPreset === 'studio-white' && s.presetChipTextActive]}>Studio White</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.presetChip, studioPreset === 'artisan-warmth' && s.presetChipActive]}
                      onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'artisan-warmth')}
                    >
                      <View style={[s.presetDot, { backgroundColor: '#FAF7F2', borderColor: '#D1D5DB', borderWidth: 1 }]} />
                      <Text style={[s.presetChipText, studioPreset === 'artisan-warmth' && s.presetChipTextActive]}>Artisan Ivory</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.presetChip, studioPreset === 'studio-gray' && s.presetChipActive]}
                      onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'studio-gray')}
                    >
                      <View style={[s.presetDot, { backgroundColor: '#F4F4F5' }]} />
                      <Text style={[s.presetChipText, studioPreset === 'studio-gray' && s.presetChipTextActive]}>Soft Gray</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[s.presetChip, studioPreset === 'transparent' && s.presetChipActive]}
                      onPress={() => originalRawImage && applyStudioEnhancement(originalRawImage, 'transparent')}
                    >
                      <Ionicons name="cut-outline" size={12} color={studioPreset === 'transparent' ? '#C36F50' : '#4B5563'} />
                      <Text style={[s.presetChipText, studioPreset === 'transparent' && s.presetChipTextActive]}>Transparent</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Structured Visual Attributes Card (Section 10) */}
                <View style={s.attrCard}>
                  <Text style={s.attrCardTitle}>AI-Extracted Craft Attributes</Text>
                  <View style={s.attrGrid}>
                    <View style={s.attrPill}>
                      <Text style={s.attrLabelSmall}>Category</Text>
                      <Text style={s.attrValSmall}>{aiCatalog.category || 'Handicrafts'}</Text>
                    </View>
                    <View style={s.attrPill}>
                      <Text style={s.attrLabelSmall}>Product Type</Text>
                      <Text style={s.attrValSmall}>{aiCatalog.product_type || aiCatalog.title || 'Craft'}</Text>
                    </View>
                    <View style={s.attrPill}>
                      <Text style={s.attrLabelSmall}>Material</Text>
                      <Text style={s.attrValSmall}>{aiCatalog.material || (aiCatalog.materials && aiCatalog.materials[0]) || 'Natural'}</Text>
                    </View>
                    <View style={s.attrPill}>
                      <Text style={s.attrLabelSmall}>Craft Technique</Text>
                      <Text style={s.attrValSmall}>{aiCatalog.craft_type || 'Handcrafted'}</Text>
                    </View>
                    <View style={s.attrPill}>
                      <Text style={s.attrLabelSmall}>Color</Text>
                      <Text style={s.attrValSmall}>{aiCatalog.color || 'Authentic Tone'}</Text>
                    </View>
                    <View style={s.attrPill}>
                      <Text style={s.attrLabelSmall}>Style</Text>
                      <Text style={s.attrValSmall}>{aiCatalog.style || 'Traditional'}</Text>
                    </View>
                  </View>
                </View>

                {/* Market-Based Pricing Module (Section 13) */}
                <View style={s.commercialBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="pricetag-outline" size={17} color="#991B1B" />
                      <Text style={s.commercialTitle}>Marketplace Pricing Appraisal</Text>
                    </View>
                    <View style={s.pricingConfidenceBadge}>
                      <Text style={s.pricingConfidenceText}>Confidence: {aiCatalog.pricingConfidence || 'Medium'}</Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldLabel}>{t('pricing.daysSpent')}</Text>
                      <TextInput
                        style={s.priceInput}
                        value={daysSpent}
                        keyboardType="numeric"
                        onChangeText={setDaysSpent}
                        placeholder="e.g. 5"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldLabel}>{t('pricing.hoursPerDay')}</Text>
                      <TextInput
                        style={s.priceInput}
                        value={hoursPerDay}
                        keyboardType="numeric"
                        onChangeText={setHoursPerDay}
                        placeholder="e.g. 8"
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={s.fieldLabel}>Suggested Selling Price (₹ INR)</Text>
                    <Text style={s.fieldValueHighlight}>₹{aiCatalog.suggestedPrice || '1,500'}</Text>
                  </View>
                  <TextInput
                    style={s.priceInput}
                    value={String(aiCatalog.suggestedPrice ?? '')}
                    keyboardType="numeric"
                    onChangeText={(val) => setAiCatalog({ ...aiCatalog, suggestedPrice: val })}
                    placeholder="Enter selling price..."
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={s.aiBenchmark}>
                    Fair-trade benchmark: ₹{aiCatalog.priceMin || '1,200'} – ₹{aiCatalog.priceMax || '1,800'}
                  </Text>

                  {/* Pricing Factors Breakdown */}
                  <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#FEE2E2' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#7F1D1D', marginBottom: 4 }}>Price Factors & Reasoning:</Text>
                    {(aiCatalog.pricingFactors && aiCatalog.pricingFactors.length > 0 ? aiCatalog.pricingFactors : [
                      'Material authenticity & physical sourcing valuation',
                      'Intricacy of manual craft technique & artisan labor',
                      'Comparable marketplace benchmarks for Indian handicrafts'
                    ]).map((fac: string, fi: number) => (
                      <View key={fi} style={s.pricingFactorRow}>
                        <View style={s.pricingFactorDot} />
                        <Text style={s.pricingFactorText}>{fac}</Text>
                      </View>
                    ))}
                    <Text style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 8 }}>
                      * Note: You have full dignity and authority to set your final price.
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 }}>
                    <Text style={s.fieldLabel}>Monthly Production Capacity</Text>
                    <Text style={s.fieldValueDark}>{aiCatalog.monthlyCapacity || '25'} units/mo</Text>
                  </View>
                  <TextInput
                    style={s.priceInput}
                    value={String(aiCatalog.monthlyCapacity ?? '')}
                    keyboardType="numeric"
                    onChangeText={(val) => setAiCatalog({ ...aiCatalog, monthlyCapacity: val })}
                    placeholder="e.g. 25"
                    placeholderTextColor="#9CA3AF"
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 }}>
                    <Text style={s.fieldLabel}>Craft Heritage Origin / Region</Text>
                  </View>
                  <TextInput
                    style={s.priceInput}
                    value={aiCatalog.craftOrigin || ''}
                    onChangeText={(val) => setAiCatalog({ ...aiCatalog, craftOrigin: val })}
                    placeholder="e.g. Varanasi, UP or Bastar, CG"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity
                  style={s.retakeBtn}
                  onPress={() => setStep(1)}
                >
                  <Ionicons name="arrow-back-outline" size={16} color="#6B7280" />
                  <Text style={s.retakeBtnText}>Change or Retake Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Right Col - Multilingual AI Cataloger & Editable Fields */}
              <View style={s.rightCol}>
                
                {/* Multilingual Copywriting Tabs (Section 11 & 12) */}
                

                {/* PRODUCT TITLE */}
                <Text style={s.fieldLabelUppercase}>
                  {t('review.product_title') || 'PRODUCT TITLE'} ({SUPPORTED_LANGUAGES.find(l => l.code === activeLangTab)?.nativeName || 'English'})
                </Text>
                <TextInput
                  style={s.formInput}
                  value={
                    activeLangTab === 'en'
                      ? (aiCatalog.title || '')
                      : (aiCatalog[`title_${activeLangTab}`] || aiCatalog.title_localized || aiCatalog.title || '')
                  }
                  onChangeText={t => {
                    if (activeLangTab === 'en') {
                      setAiCatalog({ ...aiCatalog, title: t });
                    } else {
                      setAiCatalog({ ...aiCatalog, [`title_${activeLangTab}`]: t, title_localized: t });
                    }
                  }}
                  placeholder="Professional e-commerce title..."
                  placeholderTextColor="#9CA3AF"
                />

                {/* SHORT DESCRIPTION (1-2 sentences) */}
                <Text style={s.fieldLabelUppercase}>
                  {t('review.short_desc') || 'SHORT DESCRIPTION (1-2 SENTENCES)'}
                </Text>
                <TextInput
                  style={[s.formInput, { height: 75, textAlignVertical: 'top', lineHeight: 20 }]}
                  multiline
                  value={
                    activeLangTab === 'en'
                      ? (aiCatalog.short_description || '')
                      : (aiCatalog[`short_description_${activeLangTab}`] || aiCatalog.short_description_localized || aiCatalog.short_description || '')
                  }
                  onChangeText={t => {
                    if (activeLangTab === 'en') {
                      setAiCatalog({ ...aiCatalog, short_description: t });
                    } else {
                      setAiCatalog({ ...aiCatalog, [`short_description_${activeLangTab}`]: t, short_description_localized: t });
                    }
                  }}
                  placeholder="Concise 1-2 sentence overview..."
                  placeholderTextColor="#9CA3AF"
                />
                
                {/* DETAILED MARKETPLACE DESCRIPTION */}
                <Text style={s.fieldLabelUppercase}>
                  {t('review.detailed_desc') || 'DETAILED MARKETPLACE DESCRIPTION'} ({SUPPORTED_LANGUAGES.find(l => l.code === activeLangTab)?.nativeName || 'English'})
                </Text>
                <TextInput
                  style={[s.formInput, { height: 110, textAlignVertical: 'top', lineHeight: 22 }]}
                  multiline
                  value={
                    activeLangTab === 'en'
                      ? (aiCatalog.editorialDescription || aiCatalog.descriptionEn || aiCatalog.description || '')
                      : (aiCatalog[`description_${activeLangTab}`] || aiCatalog.description_localized || (activeLangTab === 'hi' ? aiCatalog.descriptionHi : activeLangTab === 'ta' ? aiCatalog.descriptionTa : '') || aiCatalog.editorialDescription || aiCatalog.descriptionEn || aiCatalog.description || '')
                  }
                  onChangeText={t => {
                    if (activeLangTab === 'en') {
                      setAiCatalog({ ...aiCatalog, editorialDescription: t, descriptionEn: t });
                    } else {
                      const update: any = { [`description_${activeLangTab}`]: t, description_localized: t };
                      if (activeLangTab === 'hi') update.descriptionHi = t;
                      if (activeLangTab === 'ta') update.descriptionTa = t;
                      setAiCatalog({ ...aiCatalog, ...update });
                    }
                  }}
                  placeholder="Complete artisan heritage narrative..."
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={s.fieldLabelUppercase}>CRAFT CATEGORY</Text>
                <TextInput
                  style={s.formInput}
                  value={aiCatalog.category || ''}
                  onChangeText={t => setAiCatalog({ ...aiCatalog, category: t })}
                  placeholder="Craft Category (e.g. Pottery, Textiles, Woodcraft)"
                  placeholderTextColor="#9CA3AF"
                />

                <Text style={s.fieldLabelUppercase}>MATERIALS & INGREDIENTS</Text>
                <View style={s.tagContainer}>
                  {(aiCatalog.materials || []).map((m: string, i: number) => (
                    <View key={i} style={s.tagPill}>
                      <Text style={s.tagText}>{m}</Text>
                      <TouchableOpacity onPress={() => {
                        const arr = [...(aiCatalog.materials || [])];
                        arr.splice(i, 1);
                        setAiCatalog({ ...aiCatalog, materials: arr });
                      }}>
                        <Ionicons name="close" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput 
                    style={s.tagInputBox} 
                    placeholder="Add material and press Enter" 
                    value={newMaterial}
                    onChangeText={setNewMaterial}
                    onSubmitEditing={() => {
                      const val = newMaterial.trim();
                      if (val) {
                        setAiCatalog({ ...aiCatalog, materials: [...(aiCatalog.materials || []), val] });
                        setNewMaterial("");
                      }
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 4 }}>
                  <Text style={[s.fieldLabelUppercase, { marginTop: 0, marginBottom: 0 }]}>PRODUCT DIMENSIONS</Text>
                  <View style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#4B5563" }}>Optional</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>Dimensions are editable. Update with exact craft dimensions if known.</Text>
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 6 }}>LENGTH</Text>
                    <TextInput 
                      style={[s.formInput, { marginBottom: 0 }]} 
                      keyboardType="numeric" 
                      value={String(aiCatalog.length || "")} 
                      onChangeText={t => setAiCatalog({ ...aiCatalog, length: t })} 
                      placeholder="L"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 6 }}>BREADTH</Text>
                    <TextInput 
                      style={[s.formInput, { marginBottom: 0 }]} 
                      keyboardType="numeric" 
                      value={String(aiCatalog.breadth || "")} 
                      onChangeText={t => setAiCatalog({ ...aiCatalog, breadth: t })} 
                      placeholder="B"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 6 }}>HEIGHT</Text>
                    <TextInput 
                      style={[s.formInput, { marginBottom: 0 }]} 
                      keyboardType="numeric" 
                      value={String(aiCatalog.height || "")} 
                      onChangeText={t => setAiCatalog({ ...aiCatalog, height: t })} 
                      placeholder="H"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 6 }}>UNIT</Text>
                    <TextInput 
                      style={[s.formInput, { marginBottom: 0 }]} 
                      value={aiCatalog.unit || "cm"} 
                      onChangeText={t => setAiCatalog({ ...aiCatalog, unit: t })} 
                      placeholder="cm"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                {Boolean(aiCatalog.length || aiCatalog.breadth || aiCatalog.height) ? (
                  <Text style={{ fontSize: 13, color: "#92400E", marginTop: 8, fontWeight: "500" }}>
                    Preview: {aiCatalog.length || "0"} x {aiCatalog.breadth || "0"} x {aiCatalog.height || "0"} {aiCatalog.unit || "cm"}
                  </Text>
                ) : null}

                <Text style={[s.fieldLabelUppercase, { marginTop: 24 }]}>SEARCH TAGS & KEYWORDS</Text>
                <View style={s.tagContainer}>
                  {(aiCatalog.searchTags || aiCatalog.tags || []).map((t: string, i: number) => (
                    <View key={i} style={s.searchTagPill}>
                      <Text style={s.searchTagText}>{t}</Text>
                      <TouchableOpacity onPress={() => {
                        const arr = [...(aiCatalog.searchTags || aiCatalog.tags || [])];
                        arr.splice(i, 1);
                        setAiCatalog({ ...aiCatalog, searchTags: arr });
                      }}>
                        <Ionicons name="close" size={14} color="#B45309" style={{ marginLeft: 6 }} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput 
                    style={s.tagInputBox} 
                    placeholder="Add tag (e.g. #Brass) and press Enter" 
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={() => {
                      let val = newTag.trim();
                      if (val) {
                        if (!val.startsWith("#")) val = "#" + val;
                        setAiCatalog({ ...aiCatalog, searchTags: [...(aiCatalog.searchTags || aiCatalog.tags || []), val] });
                        setNewTag("");
                      }
                    }}
                  />
                </View>
                
                <TouchableOpacity
                  style={[s.publishBtn, { marginTop: 32 }]}
                  onPress={() => {
                    const currentPrice = parseFloat(aiCatalog?.suggestedPrice || aiCatalog?.sellingPrice || aiCatalog?.price || '0');
                    if (checkPrice(currentPrice)) {
                      const payload = {
                        ...aiCatalog,
                        name: aiCatalog.title || aiCatalog.name || 'Draft Product',
                        price: currentPrice.toString(),
                        description: aiCatalog.editorialDescription || aiCatalog.descriptionEn || aiCatalog.description || '',
                        imageUri: image || aiCatalog.imageUri || '',
                      };
                      if (route?.params?.product?.id) {
                        useCatalogStore.getState().updateProduct(route.params.product.id, payload);
                      } else {
                        useCatalogStore.getState().addProduct(payload);
                      }
                      setStep(3);
                    }
                  }}
                >
                  <Text style={s.publishBtnText}>{t('catalog.publishProduct')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={s.successContainer}>
            <View style={s.successCircle}><Ionicons name="checkmark" size={32} color="#15803D" /></View>
            <Text style={s.successTitle}>{t('catalog.productPublished')}</Text>
            <Text style={s.successDesc}>{aiCatalog?.title}</Text>
            
            <View style={{flexDirection: 'row', gap: 12, marginTop: 32}}>
              <TouchableOpacity style={s.viewMarketBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Products' })}>
                <Ionicons name="eye-outline" size={16} color="white" />
                <Text style={s.viewMarketText}>{t('marketplace.viewProduct')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.checkRfqBtn} onPress={() => navigation.navigate('Opportunities')}>
                <Ionicons name="layers-outline" size={16} color="#4B5563" />
                <Text style={s.checkRfqText}>{t('nav.opportunities')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>

      <ProfitShieldModal
        visible={showWarning}
        onClose={() => setShowWarning(false)}
        daysSpent={parseFloat(daysSpent) || 0}
        hoursPerDay={parseFloat(hoursPerDay) || 0}
        currentPrice={parseFloat(aiCatalog?.suggestedPrice || aiCatalog?.sellingPrice || '0')}
        onAcceptFloorPrice={(newFloorPrice: number) => {
          setAiCatalog({ ...aiCatalog, suggestedPrice: newFloorPrice.toString() });
        }}
        onKeepPrice={() => {
          // Proceed with publishing using the old price
          const payload = {
            ...aiCatalog,
            name: aiCatalog.title || aiCatalog.name || 'Draft Product',
            price: (aiCatalog.suggestedPrice || aiCatalog.sellingPrice || aiCatalog.price || 0).toString(),
            description: aiCatalog.editorialDescription || aiCatalog.descriptionEn || aiCatalog.description || '',
            imageUri: image || aiCatalog.imageUri || '',
          };
          if (route?.params?.product?.id) {
            useCatalogStore.getState().updateProduct(route.params.product.id, payload);
          } else {
            useCatalogStore.getState().addProduct(payload);
          }
          setStep(3);
        }}
      />

      {/* Live Camera Viewfinder Modal */}
      {isWebCameraOpen && (
        <View style={s.cameraModalOverlay}>
          <View style={s.cameraModalContent}>
            <View style={s.cameraModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="camera" size={20} color="#C36F50" />
                <Text style={s.cameraModalTitle}>{t('capture.takePhoto')}</Text>
              </View>
              <TouchableOpacity onPress={stopWebCamera} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={s.cameraViewfinder}>
              {React.createElement('video', {
                ref: (el: any) => {
                  videoRef.current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(() => {});
                  }
                },
                autoPlay: true,
                playsInline: true,
                muted: true,
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                },
              })}
            </View>

            <View style={s.cameraControlsBar}>
              <TouchableOpacity style={s.cameraActionBtn} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse-outline" size={24} color="white" />
                <Text style={s.cameraActionText}>{t('common.actions')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.shutterBtn} onPress={captureWebPhoto} activeOpacity={0.8}>
                <View style={s.shutterInner} />
              </TouchableOpacity>

              <TouchableOpacity style={s.cameraActionBtn} onPress={stopWebCamera}>
                <Ionicons name="close-circle-outline" size={24} color="#F87171" />
                <Text style={[s.cameraActionText, { color: '#F87171' }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pageBg: { flex: 1, backgroundColor: '#FAF9F7' },
  studioHeader: { width: '100%', maxWidth: 1100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
  heroBadge: { backgroundColor: '#FCE7F3', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 12 },
  heroBadgeText: { color: '#9D174D', fontSize: 13, fontWeight: 'bold' },
  studioTitle: { fontSize: 36, fontWeight: 'bold', color: '#111827', fontFamily: 'serif', marginBottom: 8 },
  studioSubtitle: { fontSize: 16, color: '#4B5563', maxWidth: 600 },
  stepIndicator: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  stepText: { fontSize: 14, color: '#4B5563' },
  stepTextBold: { fontWeight: 'bold', color: '#111827' },
  
  mainCard: { width: '100%', maxWidth: 1100, backgroundColor: 'white', borderRadius: 16, padding: 32, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, marginBottom: 40 },
  twoColLayout: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 48 },
  leftCol: { flex: 1 },
  rightCol: { flex: 1.2 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  sectionSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  
  uploadBox: { height: 280, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTextBold: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  uploadTextSub: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  browseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  browseBtnText: { fontSize: 13, fontWeight: '600', color: '#374151', marginLeft: 6 },
  
  pickerOutline: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryDropdown: { borderWidth: 1, borderColor: '#D1D5DB', borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: 'white', overflow: 'hidden' },
  categoryOption: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  categoryOptionText: { fontSize: 14, color: '#374151' },
  
  optionalVid: { marginTop: 24 },
  optionalTag: { fontSize: 11, backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  vidBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingVertical: 12, marginTop: 12, borderStyle: 'dashed' },
  vidBtnText: { marginLeft: 8, fontSize: 14, fontWeight: '500', color: '#374151' },

  speakBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  speakBtnText: { fontSize: 14, fontWeight: 'bold', color: '#991B1B', marginLeft: 6 },
  
  storyInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16, height: 180, padding: 16, fontSize: 15, color: '#111827', textAlignVertical: 'top', lineHeight: 22 },
  
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 16, gap: 8 },
  suggestionsLabel: { fontSize: 13, color: '#6B7280' },
  sugChip: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  sugText: { fontSize: 13, color: '#4B5563' },
  
  disclaimerBox: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, marginTop: 32, marginBottom: 32 },
  discTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 4 },
  discText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  
  synthesizeBtn: { backgroundColor: '#C36F50', borderRadius: 8, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  synthesizeBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  btnDisabled: { opacity: 0.6 },
  
  fieldLabelUppercase: { fontSize: 12, fontWeight: 'bold', color: '#4B5563', letterSpacing: 1, marginBottom: 8, marginTop: 24 },
  previewImg: { width: '100%', height: 320, borderRadius: 12, resizeMode: 'cover', marginBottom: 24 },
  commercialBox: { backgroundColor: '#FAFAF9', borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 12, padding: 24 },
  commercialTitle: { fontSize: 16, fontWeight: 'bold', color: '#292524', marginLeft: 8 },
  fieldLabel: { fontSize: 14, color: '#57534E', fontWeight: '500' },
  fieldValueHighlight: { fontSize: 15, fontWeight: 'bold', color: '#991B1B' },
  fieldValueDark: { fontSize: 15, fontWeight: 'bold', color: '#292524' },
  priceInput: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontWeight: '600' },
  aiBenchmark: { fontSize: 13, color: '#78716A', marginTop: 6 },
  
  formInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#111827', backgroundColor: 'white' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  tagPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  tagText: { fontSize: 14, color: '#374151' },
  tagInputBox: { flex: 1, minWidth: 200, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  searchTagPill: { backgroundColor: '#FEF9C3', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  searchTagText: { fontSize: 13, color: '#854D0E', fontWeight: '500' },
  
  publishBtn: { backgroundColor: '#C36F50', borderRadius: 8, paddingVertical: 16, alignItems: 'center', elevation: 2 },
  publishBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  successContainer: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 32, fontWeight: 'bold', color: '#111827', fontFamily: 'serif', marginBottom: 16 },
  successDesc: { fontSize: 16, color: '#4B5563', textAlign: 'center', maxWidth: 520, lineHeight: 24 },
  viewMarketBtn: { backgroundColor: '#C36F50', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, marginTop: 12 },
  viewMarketText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 15 },
  checkRfqBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, marginTop: 12 },
  checkRfqText: { color: '#374151', fontWeight: 'bold', marginLeft: 8, fontSize: 15 },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C36F50',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#C36F50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  previewCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#000',
  },
  imagePreview: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  previewOverlayBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  overlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overlayBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 5,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  cameraModalOverlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraModalContent: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cameraModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cameraModalTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraViewfinder: {
    width: '100%',
    height: 380,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraControlsBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    backgroundColor: '#1E1E1E',
  },
  shutterBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C36F50',
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  cameraActionBtn: {
    alignItems: 'center',
    padding: 8,
  },
  cameraActionText: {
    color: '#E5E7EB',
    fontSize: 12,
    marginTop: 4,
  },
  studioProcessingOverlay: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 10,
  },
  studioProcessingText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#C36F50',
    textAlign: 'center',
  },
  studioHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FAF5EF',
    borderTopWidth: 1,
    borderTopColor: '#EEDDC8',
  },
  studioBadgeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#C36F50',
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C36F50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  compareBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C36F50',
    marginLeft: 4,
  },
  presetSelectorRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#C36F50',
  },
  presetDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    marginLeft: 4,
  },
  presetChipTextActive: {
    color: '#C36F50',
    fontWeight: '700',
  },
  checkerboardBg: {
    backgroundColor: '#F3F4F6',
  },
  transparentCutoutBadge: {
    position: 'absolute' as any,
    top: 10,
    left: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 5,
  },
  transparentCutoutBadgeText: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '600',
  },
  detectedBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detectedBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
  },
  detectedBannerSub: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 18,
    marginTop: 4,
  },
  aiVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  aiVerifiedText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 14,
  },
  retakeBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  viewModeBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewModeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  manualSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 6,
  },
  manualSelectBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  manualSelectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  manualInstructionBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualInstructionText: {
    fontSize: 12,
    color: '#78350F',
    flex: 1,
    lineHeight: 16,
  },
  sideBySideBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sideBySideCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  sideBySideImg: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
  },
  sideBySideLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    textTransform: 'uppercase',
  },
  attrCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  attrCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  attrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attrPill: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 90,
  },
  attrLabelSmall: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  attrValSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 1,
  },
  langTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  langTabItem: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  langTabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  langTabItemTextActive: {
    color: '#991B1B',
    fontWeight: '700',
  },
  pricingConfidenceBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pricingConfidenceText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pricingFactorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    gap: 6,
  },
  pricingFactorDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C36F50',
    marginTop: 5,
  },
  pricingFactorText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
    lineHeight: 16,
  },
});



