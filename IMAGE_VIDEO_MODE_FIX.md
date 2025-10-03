# Image vs Video Mode Fix - Advanced Tab

## Issue
User reported: "even if I choose image template, generate now or refine with agent just goes to video studio"

## Problem Analysis

### Root Cause:
The `PromptManagementTab` component (Advanced mode) was hardcoded to show "Video Studio" heading and video-specific controls, regardless of whether the user selected an image or video template.

### Issues Found:
1. **Heading always said "Video Studio"** - Even when `showImageTools` was true
2. **Video templates always displayed** - Cinematic templates shown in image mode
3. **Prompt field was for video** - Used `prompt` instead of `imagePrompt` in image mode
4. **Cinematography controls shown** - Visual Style and Camera Movement shown for images
5. **Generate button said "Create Product Video"** - Even when generating images

## Solution Implemented

### Dynamic Content Based on Mode

The PromptManagementTab now adapts completely based on `showImageTools` prop:

#### 1. Dynamic Heading
```typescript
<h2 className="text-3xl font-bold text-gray-900 mb-2">
  {showImageTools ? "Image Studio" : "Video Studio"}
</h2>
<p className="text-gray-600">
  {showImageTools 
    ? "Generate professional product images with AI" 
    : "Transform your product images into dynamic showcase videos"
  }
</p>
```

#### 2. Conditional Template Section
```typescript
{/* Quick Templates - Only show for video mode */}
{!showImageTools && (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">🎬 Cinematic Templates</h3>
    {/* Video templates */}
  </div>
)}
```

#### 3. Dynamic Prompt Field
```typescript
<h3 className="text-lg font-semibold text-gray-900 mb-4">
  ✨ {showImageTools ? "Image Description" : "Video Description"}
</h3>
<textarea
  value={showImageTools ? imagePrompt : prompt}
  onChange={(e) => showImageTools ? setImagePrompt(e.target.value) : setPrompt(e.target.value)}
  placeholder={showImageTools 
    ? "Describe the image you want to generate. E.g., 'Professional studio photograph...'"
    : "Create a dynamic video showcasing the product. E.g., 'Smooth 360-degree rotation...'"
  }
  // ...
/>
```

#### 4. Conditional Cinematography Controls
```typescript
{/* Visual Style & Camera Movement - Only for video */}
{!showImageTools && (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎥 Cinematography</h3>
    {/* Visual Style and Camera Movement selects */}
  </div>
)}
```

#### 5. Dynamic Generate Button
```typescript
{showImageTools ? (
  <button
    onClick={generateWithImagen}
    disabled={!imagePrompt || imagenBusy}
    // ...
  >
    {imagenBusy ? (
      <>
        <Clock className="w-5 h-5 animate-spin" />
        Generating Image...
      </>
    ) : (
      <>
        <Wand2 className="w-5 h-5" />
        Generate Image
      </>
    )}
  </button>
) : (
  <button
    onClick={startGeneration}
    disabled={!canStart || isGenerating}
    // ...
  >
    {isGenerating ? (
      <>
        <Clock className="w-5 h-5 animate-spin" />
        Creating Video...
      </>
    ) : (
      <>
        <ArrowRight className="w-5 h-5" />
        Create Product Video
      </>
    )}
  </button>
)}
```

#### 6. Dynamic Helper Text
```typescript
{!isGenerating && !imagenBusy && canStart && (
  <div className="text-center text-sm text-gray-500 mt-3">
    ✨ {showImageTools 
      ? "Your image will be generated and displayed" 
      : "Will automatically switch to Review tab to show your video"
    }
  </div>
)}
```

## User Experience Flow

### Image Template Flow:
```
1. User clicks "Classic Studio" template
2. Dialog appears → User clicks "Generate Now"
3. Advanced mode opens showing:
   ✅ "Image Studio" heading
   ✅ "Generate professional product images with AI"
   ✅ No video templates section
   ✅ "Image Description" field with image-specific placeholder
   ✅ No Cinematography controls
   ✅ "Generate Image" button (not "Create Product Video")
   ✅ Image Reference section visible and active
```

### Video Template Flow:
```
1. User clicks "Luxury Atelier" template
2. Dialog appears → User clicks "Generate Now"
3. Advanced mode opens showing:
   ✅ "Video Studio" heading
   ✅ "Transform your product images into dynamic showcase videos"
   ✅ Cinematic Templates section
   ✅ "Video Description" field with video-specific placeholder
   ✅ Cinematography controls (Visual Style, Camera Movement)
   ✅ "Create Product Video" button
   ✅ Image Reference section (optional)
```

## Complete Changes List

### PromptManagementTab.tsx Changes:

1. **Line ~172**: Dynamic heading (Image Studio vs Video Studio)
2. **Line ~177**: Dynamic description text
3. **Line ~182**: Wrapped video templates in conditional `{!showImageTools && (...}`
4. **Line ~221**: Dynamic prompt heading (Image vs Video Description)
5. **Line ~223**: Dynamic textarea value (imagePrompt vs prompt)
6. **Line ~224**: Dynamic onChange handler
7. **Line ~225**: Dynamic placeholder text
8. **Line ~233**: Wrapped Cinematography section in `{!showImageTools && (...)`
9. **Line ~387**: Added conditional generate button (image vs video)
10. **Line ~431**: Dynamic helper text based on mode

## Benefits

### 1. **Clear Context**
- Users immediately know if they're generating images or videos
- Heading and description match the task

### 2. **Relevant Controls**
- Image mode: Only shows image-relevant controls
- Video mode: Shows cinematography controls
- No confusion about what settings apply

### 3. **Correct Actions**
- Generate button calls the right function
- Button text matches the action
- Loading states are specific to the task

### 4. **Consistent Experience**
- Template selection → Dialog → Mode-specific interface
- Predictable workflow
- Professional appearance

## Testing

### Test Image Mode:
1. ✅ Create tab → Templates → Click "Classic Studio"
2. ✅ Dialog → Click "Generate Now"
3. ✅ Should see "Image Studio" heading
4. ✅ Should NOT see Cinematic Templates section
5. ✅ Should see "Image Description" field
6. ✅ Should NOT see Cinematography controls
7. ✅ Should see "Generate Image" button
8. ✅ Click Generate → Should call generateWithImagen

### Test Video Mode:
1. ✅ Create tab → Templates → Click "Luxury Atelier"
2. ✅ Dialog → Click "Generate Now"
3. ✅ Should see "Video Studio" heading
4. ✅ Should see Cinematic Templates section
5. ✅ Should see "Video Description" field
6. ✅ Should see Cinematography controls
7. ✅ Should see "Create Product Video" button
8. ✅ Click Generate → Should call startGeneration

### Test Mode Switching:
1. ✅ In Video mode → Click "Add Image" button
2. ✅ Should update to Image Studio heading
3. ✅ Should hide Cinematography controls
4. ✅ Button should change to "Generate Image"
5. ✅ Click "Hide Image" → Should revert to Video Studio

## Files Modified

**File:** `components/ui/PromptManagementTab.tsx`

**Lines Changed:** ~10 sections modified
**Complexity:** Medium
**Breaking Changes:** None
**Backward Compatible:** Yes

---

**Status:** ✅ Fixed
**Date:** October 3, 2025
**Impact:** Major UX fix - Image and video modes now completely separate and clear
**User Feedback:** Addressed reported issue
