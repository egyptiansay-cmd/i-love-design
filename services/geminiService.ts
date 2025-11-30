import { GoogleGenAI, Modality } from "@google/genai";

const compressImage = async (file: File, aggressive: boolean = false): Promise<{ data: string; mimeType: string }> => {
  // Stricter limits if aggressive mode is on (e.g. for dual image uploads)
  // Tweak: Allow slightly larger inputs for 'aggressive' to improve merging quality
  const MAX_SIZE_MB = aggressive ? 0.8 : 1.5; 
  const MAX_DIMENSION = aggressive ? 1024 : 1536; 

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        // Check if resizing or compression is needed
        const needsResize = width > MAX_DIMENSION || height > MAX_DIMENSION;
        const needsCompression = file.size > MAX_SIZE_MB * 1024 * 1024;

        if (needsResize || needsCompression) {
          // Calculate new dimensions maintaining aspect ratio
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({
              data: (event.target?.result as string).split(',')[1],
              mimeType: file.type
            });
            return;
          }

          // Draw image on white background (handles PNG transparency becoming black in JPEG)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with quality setting
          const quality = aggressive ? 0.7 : 0.85;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            data: dataUrl.split(',')[1],
            mimeType: 'image/jpeg'
          });
        } else {
          // File is small enough, send as is
          const result = event.target?.result as string;
          resolve({
            data: result.split(',')[1],
            mimeType: file.type
          });
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const fileToGenerativePart = async (file: File, aggressiveCompression: boolean = false) => {
  const { data, mimeType } = await compressImage(file, aggressiveCompression);
  return {
    inlineData: { data, mimeType },
  };
};

const getEnhancePrompt = (style: string, quality: string, model: string): string => {
    const stylePrompts: { [key: string]: string } = {
        auto: "As a professional photo editor, enhance this image with superior quality. Improve resolution, clarity, and color balance.",
        upscale: "As a specialist in image super-resolution, your only task is to upscale the image while strictly preserving the original colors, lighting, and artistic intent. Do not shift the tone or add filters. Focus purely on increasing pixel density, sharpness, and resolving fine details to make the image look crisp at high resolutions.",
        lighting: "As a professional photo editor, correct the lighting and color balance of this image. Make the colors vibrant and natural, and adjust exposure and contrast for a polished look.",
        sharpen: "As a professional photo editor, sharpen the details and textures in this image. Increase clarity and definition without introducing artifacts or over-sharpening.",
        artistic: "As a professional photo editor, transform this image with an artistic, dramatic touch. Enhance it with a cinematic feel, boosting colors and contrast for a high-impact look.",
        restore: "As an expert in digital photo restoration, meticulously restore this old photograph. Repair any damage such as scratches, tears, and fading. Reduce noise and grain while preserving the original details and character. Improve contrast and sharpness to bring the photo back to life.",
        colorize: "As a specialist in photo colorization, add realistic and vibrant colors to this black and white image. Pay close attention to historical accuracy, natural skin tones, and context-appropriate colors for the environment and clothing. The final result should be a believable and beautifully colorized photograph.",
    };

    const qualityPrompts: { [key: string]: string } = {
        hd: "Upscale the image to high-definition (HD), ensuring clarity and sharpness.",
        '4k': "Upscale the image to stunning 4K resolution. Focus on creating ultra-sharp details and vibrant textures suitable for high-resolution displays.",
        '8k': "Upscale the image to breathtaking 8K cinematic resolution. Meticulously enhance every detail, texture, and color gradient to achieve a photorealistic and professional-grade result.",
    };
    
    const modelPrompts: { [key: string]: string } = {
        'realesrgan': "Simulate the enhancement style of Real-ESRGAN, known for its powerful general-purpose image restoration capabilities.",
        'gfpgan': "Simulate the enhancement style of GFPGAN, specializing in restoring old photos and enhancing facial details with remarkable clarity and realism.",
        'codeformer': "Simulate the enhancement style of Codeformer, which is excellent at face restoration and handling low-quality images, producing natural-looking results.",
    };

    const selectedStylePrompt = stylePrompts[style] || stylePrompts['auto'];
    const selectedQualityPrompt = qualityPrompts[quality] || qualityPrompts['hd'];
    const selectedModelPrompt = modelPrompts[model] || modelPrompts['realesrgan'];


    return `${selectedStylePrompt} Emulate the results of an advanced AI enhancement model, specifically: ${selectedModelPrompt}. ${selectedQualityPrompt} Output ONLY the enhanced image, without any additional text, captions, or explanations.`;
}

export const enhanceImage = async (imageFile: File, style: string, quality: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = getEnhancePrompt(style, quality, 'realesrgan');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imageResponsePart && imageResponsePart.inlineData) {
    const { data, mimeType } = imageResponsePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  } else {
    const textResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    const modelMessage = textResponsePart?.text || "لم يقم النموذج بإنشاء صورة. قد تكون الاستجابة محظورة أو لا تحتوي على محتوى صالح.";
    throw new Error(modelMessage);
  }
};

const getExpandPrompt = (userPrompt: string, aspectRatio: string, quality: string): string => {
    const finalUserPrompt = (userPrompt && userPrompt.trim() !== '')
        ? `Creative direction for the expanded areas: "${userPrompt}"`
        : "Expand the image with a natural continuation of the existing scene.";

    let ratioInstruction = "Keep the aspect ratio of the original image.";
    if (aspectRatio !== 'original') {
        ratioInstruction = `Transform the composition to fit a ${aspectRatio} aspect ratio. Crop or expand the canvas intelligently to fit this ratio while keeping the main subject centered and intact.`;
    }

    const qualityInstruction = quality === '8k' 
        ? "Upscale the final output to breathtaking 8K resolution with photorealistic details." 
        : quality === '4k' 
        ? "Upscale the final output to 4K resolution with sharp details."
        : quality === 'hd'
        ? "Ensure the output is high-definition (HD)."
        : "Maintain the visual quality of the original image.";

    return `Your primary task is photorealistic outpainting and zooming out.
1.  **Zoom Out & Re-compose**: You must virtually "zoom out" of the original image. Place the original image in the center of a new, larger canvas.
2.  **Aspect Ratio**: ${ratioInstruction}
3.  **Generate Environment**: Fill the new empty space around the original image by generating a seamless, contextually consistent environment. The new details must match the lighting, shadows, perspective, and style of the original.
4.  **Quality & Resolution**: ${qualityInstruction}
5.  **User Direction**: ${finalUserPrompt}
6.  **Output**: Your output must be ONLY the final, expanded image. Do not include any text, descriptions, or any other content.`;
}

export const expandImage = async (imageFile: File, userPrompt: string, aspectRatio: string = 'original', quality: string = '8k'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = getExpandPrompt(userPrompt, aspectRatio, quality);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imageResponsePart && imageResponsePart.inlineData) {
    const { data, mimeType } = imageResponsePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  } else {
    const textResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    const modelMessage = textResponsePart?.text || "لم يقم النموذج بإنشاء صورة. قد تكون الاستجابة محظورة أو لا تحتوي على محتوى صالح.";
    throw new Error(modelMessage);
  }
};

const getRemoveBackgroundPrompt = (mode: string, customPrompt: string, enhanceSubject: boolean): string => {
    let subjectDefinition = "";
    let negativeConstraint = "";

    // 1. Define what to KEEP and what to REMOVE based on mode
    if (mode === 'strict') {
        // Strict Mode: Isolate product/person ONLY.
        subjectDefinition = "the SINGLE main physical product or person";
        negativeConstraint = "REMOVE the background, AND REMOVE all text, logos, watermarks, and floating graphics. The result should be just the object.";
    } else if (mode === 'standard') {
        // Standard Mode: Keep Product + Text + Logos. Remove only the environment.
        subjectDefinition = "the main subject AND all accompanying text, logos, and graphic overlays";
        negativeConstraint = "REMOVE ONLY the environmental background (walls, floors, scenery, solid colors). KEEP all text, logos, and branding elements intact.";
    } else if (mode === 'custom' && customPrompt.trim() !== '') {
        subjectDefinition = `the subject described as: "${customPrompt}"`;
        negativeConstraint = "Remove everything not matching the description.";
    } else {
         // Fallback
        subjectDefinition = "the main foreground subject";
        negativeConstraint = "Remove the background.";
    }

    // 2. Define Processing Logic (Enhance vs Fidelity)
    let processingInstruction = "";
    if (enhanceSubject) {
        if (mode === 'standard') {
             // Enhance in standard mode must be careful with text
            processingInstruction = "ENHANCE the image resolution and clarity. You may redraw the main subject to look better, but you MUST preserve the legibility and shape of any text or logos EXACTLY as they are.";
        } else {
            // Enhance in strict mode can be more aggressive on the subject
            processingInstruction = "ENHANCE the subject details. You may redraw textures and lighting to make it look high-quality, creating a professional product shot look.";
        }
    } else {
        // No Enhance: Pure Pixel Fidelity
        processingInstruction = "STRICT PIXEL FIDELITY. Do NOT redraw. Do NOT alter the look of the subject or text. Simply generate a precise transparency mask.";
    }

    return `TASK: Generate a Transparent PNG Cutout.

1.  **Identify Subject**: Identify ${subjectDefinition}.
2.  **Action**: ${negativeConstraint}
3.  **Transparency**: The background MUST be 100% transparent (Alpha Channel = 0).
4.  **Processing**: ${processingInstruction}
5.  **Output**: Return ONLY the resulting image with a transparent background.`;
}

export const removeBackground = async (imageFile: File, mode: string = 'strict', customPrompt: string = '', enhanceSubject: boolean = false): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = getRemoveBackgroundPrompt(mode, customPrompt, enhanceSubject);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imageResponsePart && imageResponsePart.inlineData) {
    const { data, mimeType } = imageResponsePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  } else {
    const textResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    const modelMessage = textResponsePart?.text || "لم يقم النموذج بإنشاء صورة. قد تكون الاستجابة محظورة أو لا تحتوي على محتوى صالح.";
    throw new Error(modelMessage);
  }
};

const getMockupPrompt = (theme: string, customPrompt: string): string => {
    const themePrompts: { [key: string]: string } = {
        modern_studio: "A clean, modern studio setting with soft, diffused lighting. Neutral background colors (soft grey, white, or pastel).",
        podium: "A 3D geometric podium display. Minimalist style with strong directional lighting.",
        luxury: "A high-end luxury environment. Darker tones, perhaps marble textures, gold accents, or dramatic mood lighting.",
        nature: "A natural outdoor setting with sunlight, greenery, or a blue sky background. Fresh and organic feel.",
        lifestyle_home: "A cozy home or office environment. Placed on a wooden table or desk with blurred lifestyle elements in the background.",
        cyberpunk: "A futuristic, cyberpunk aesthetic with neon lights (blue/pink) and a tech-inspired background.",
        water: "A refreshing scene involving water, splash effects, or ice. Cool tones.",
    };

    const selectedTheme = themePrompts[theme] || themePrompts['modern_studio'];
    const additionalInstructions = customPrompt ? `Additional User Details: ${customPrompt}` : "";

    return `Act as a world-class Product Photographer and Ad Designer.
Task: Analyze the input subject and composite it into a professional advertisement background.

1.  **Analyze Subject**: First, identify the object in the input image (e.g., perfume, shoe, watch, person). Understand its material (glass, leather, skin) and how light should interact with it.
2.  **Adapt Scene**: Use the theme: "${selectedTheme}". IMPORTANT: Customize this theme to specifically fit the detected object category. (e.g., if it's a coffee cup, add steam or beans; if it's a shoe, make the surface rugged or sporty).
3.  **Composite**: Place the subject seamlessly into this environment.
4.  **Integration**: Generate realistic shadows, reflections, and color bleeding on the surface where the subject sits. Match the lighting of the subject to the new background.
5.  **User Overrides**: ${additionalInstructions}
6.  **Constraints**: NO TEXT. NO LOGOS.
7.  **Quality**: Output a photorealistic, high-resolution image.`;
};

export const generateMockup = async (imageFile: File, theme: string, customPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = getMockupPrompt(theme, customPrompt);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imageResponsePart && imageResponsePart.inlineData) {
    const { data, mimeType } = imageResponsePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  } else {
    const textResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    const modelMessage = textResponsePart?.text || "لم يقم النموذج بإنشاء صورة. قد تكون الاستجابة محظورة أو لا تحتوي على محتوى صالح.";
    throw new Error(modelMessage);
  }
};

export const generateTemplateMerge = async (subjectFile: File, templateFile: File, mode: string, customPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Use standard compression (aggressive=false) to get better quality details for blending
  const subjectPart = await fileToGenerativePart(subjectFile, false);
  const templatePart = await fileToGenerativePart(templateFile, false);

  let specificInstructions = "";

  if (mode === 'replace') {
      // Advanced SWAP Instructions with Emphasis on Re-lighting
      specificInstructions = `
      MODE: PROFESSIONAL OBJECT REPLACEMENT (Seamless In-painting)
      1.  **Identify & Swap**: Locate the main subject in Input 2 (Reference Image). COMPLETELY REMOVE IT. Insert the subject from Input 1 (Source) in its place.
      2.  **Match Perspective**: Transform the Source Object's perspective to match the camera angle of the Reference Image perfectly.
      3.  **RE-LIGHTING (Critical)**: You MUST change the lighting of the Source Object to match the environment of Input 2.
          - If Input 2 has warm sunset light from the left, the Source Object must be lit from the left with warm light.
          - If Input 2 is dark and moody, the Source Object must be darkened.
          - Cast realistic shadows on the floor/surface based on the scene's light sources.
      4.  **Reflections**: If the surface is reflective, generate a reflection of the new object.
      5.  **Color Grading**: Apply the color grade/filter of the Reference Image to the new object so they look like they were shot together.
      `;
  } else {
      // Advanced Placement Instructions
      specificInstructions = `
      MODE: HIGH-END SCENE COMPOSITION
      1.  **Analyze Scene**: Look at Input 2 (Reference). Find the focal point or surface where a product/person belongs naturally.
      2.  **Integrate**: Place the subject from Input 1 into that space.
      3.  **Physical Grounding**: The object MUST NOT look floating. Generate ambient occlusion (contact shadows) where it touches the surface.
      4.  **Environmental Influence**: 
          - The object should reflect the colors of the surroundings.
          - Match the blur/depth-of-field. If the background is blurry, the edges of the object should blend naturally, not be razor sharp cutouts.
      5.  **Lighting Match**: Re-render the object's illumination to match the scene's light direction and intensity.
      `;
  }

  const prompt = `Act as a World-Class Digital Artist and Professional Retoucher.
  Your goal is to create an Award-Winning Commercial Image by seamlessly merging two inputs.
  
  Input 1: The Hero Subject (Product/Person).
  Input 2: The Background/Context Image.

  ${specificInstructions}

  User Additional Instructions: ${customPrompt}
  
  CRITICAL OUTPUT RULES:
  - The result must be PHOTOREALISTIC.
  - NO "sticker effect" (where the object looks pasted on top).
  - Seamless blending of edges, lighting, and colors is required.
  - Output ONLY the final composited image.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        subjectPart, // Image 1
        templatePart, // Image 2
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imageResponsePart && imageResponsePart.inlineData) {
    const { data, mimeType } = imageResponsePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  } else {
    const textResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    const modelMessage = textResponsePart?.text || "لم يقم النموذج بإنشاء صورة. قد تكون الاستجابة محظورة أو لا تحتوي على محتوى صالح.";
    throw new Error(modelMessage);
  }
};


export const enhancePrompt = async (userPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a creative assistant and an expert prompt engineer. Output MUST be the prompt text only.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Enhance this image generation prompt: "${userPrompt}"`,
    config: {
      systemInstruction: systemInstruction,
    },
  });
  
  const enhancedPromptText = response.text?.trim();
  
  if (enhancedPromptText) {
    return enhancedPromptText;
  } else {
    throw new Error("Failed to get an enhanced prompt from the model.");
  }
};