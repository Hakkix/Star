/**
 * Screenshot Utility (UX-5.2)
 *
 * Utilities for capturing the AR canvas view and sharing/downloading screenshots.
 */

/**
 * Captures the current canvas as an image
 * @returns Promise<Blob | null> - The captured image as a blob, or null if capture fails
 */
export async function captureCanvas(): Promise<Blob | null> {
  try {
    // Find the canvas element (R3F creates a canvas)
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.error('Canvas not found');
      return null;
    }

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Failed to capture canvas:', error);
    return null;
  }
}

/**
 * Downloads a blob as a file
 * @param blob - The blob to download
 * @param filename - The filename to save as
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Shares a file using the Web Share API
 * Falls back to download if Web Share API is not supported
 * @param blob - The blob to share
 * @param filename - The filename
 * @param title - The share title
 * @param text - The share text
 * @returns Promise<boolean> - True if shared successfully, false otherwise
 */
export async function shareFile(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<boolean> {
  // Check if Web Share API is supported
  if (!navigator.share || !navigator.canShare) {
    // Fallback to download
    downloadBlob(blob, filename);
    return false;
  }

  try {
    const file = new File([blob], filename, { type: 'image/png' });
    const shareData = {
      files: [file],
      title,
      text,
    };

    // Check if sharing files is supported
    if (!navigator.canShare(shareData)) {
      // Fallback to download
      downloadBlob(blob, filename);
      return false;
    }

    await navigator.share(shareData);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Failed to share:', error);
    }
    return false;
  }
}

/**
 * Captures the AR view and downloads it
 * @param filename - Optional filename (defaults to timestamp)
 * @returns Promise<boolean> - True if successful
 */
export async function captureAndDownload(filename?: string): Promise<boolean> {
  const blob = await captureCanvas();
  if (!blob) {
    return false;
  }

  const defaultFilename = `star-ar-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
  downloadBlob(blob, filename || defaultFilename);
  return true;
}

/**
 * Captures the AR view and shares it
 * @param title - Share title
 * @param text - Share text
 * @returns Promise<boolean> - True if shared (not downloaded)
 */
export async function captureAndShare(
  title: string = 'Star AR Screenshot',
  text: string = 'Check out this view from Star AR!'
): Promise<boolean> {
  const blob = await captureCanvas();
  if (!blob) {
    return false;
  }

  const filename = `star-ar-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
  return await shareFile(blob, filename, title, text);
}
