import React from "react";
import styles from "@styles/components/ImageFileInput.module.css";

export interface ImageFileInputProp {
  onFileChange: (file: File) => void;
}

/**
 * File selector only for images.
 */
export function ImageFileInput(prop: ImageFileInputProp) {
  /**
   * Handle input file change.
   */
  const handleSelectFile = (e: React.FormEvent<EventTarget>) => {
    const target = e.target as HTMLInputElement;
    if (!target.files[0]) return;

    const file = target.files[0];
    prop.onFileChange(file);
  };

  return (
    <>
      <label htmlFor="imageFileInput" className={styles.inputLabel}>
        🎨 Image File
      </label>
      <input
        type="file"
        id="imageFileInput"
        className={styles.inputFile}
        onChange={handleSelectFile}
        accept="image/*"
      />
    </>
  );
}
